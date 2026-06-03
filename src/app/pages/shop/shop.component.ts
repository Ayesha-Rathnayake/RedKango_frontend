import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { PurchaseCartService } from '../../services/purchase-cart.service';
import { PurchaseCartItem } from '../../models/purchase-cart.model';

type StockLabel = 'In Stock' | 'Running Out' | 'Out of Stock';
type SortOption = 'default' | 'price-low' | 'price-high' | 'name' | 'stock';
type PendingAction = 'cart' | 'checkout' | null;

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
})
export class ShopComponent implements OnInit, OnDestroy {
  searchTerm = '';
  sortBy: SortOption = 'default';

  loading = false;
  errorMessage = '';
  successMessage = '';

  isCartOpen = false;
  showAuthRequiredModal = false;
  pendingAction: PendingAction = null;

  selectedProduct: Product | null = null;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  originalProducts: Product[] = [];
  cartItems: PurchaseCartItem[] = [];

  // ── Pagination ──────────────────────────────────────────────
  readonly pageSize = 4;
  visibleCount = this.pageSize;
  // ────────────────────────────────────────────────────────────

  private cartSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private purchaseCartService: PurchaseCartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    this.cartSubscription = this.purchaseCartService.cart$.subscribe((cart) => {
      this.cartItems = cart;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  // ── Pagination helpers ───────────────────────────────────────
  get visibleProducts(): Product[] {
    return this.filteredProducts.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.filteredProducts.length;
  }

  get hasLess(): boolean {
    return this.visibleCount > this.pageSize;
  }

  showMore(): void {
    this.visibleCount = Math.min(
      this.visibleCount + this.pageSize,
      this.filteredProducts.length
    );
    this.cdr.detectChanges();
  }

  showLess(): void {
    this.visibleCount = this.pageSize;
    this.cdr.detectChanges();
  }
  // ────────────────────────────────────────────────────────────

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        const saleProducts = products.filter((product) => product.type === 'SALE');

        this.originalProducts = [...saleProducts];
        this.products = [...saleProducts];
        this.filteredProducts = [...saleProducts];
        this.visibleCount = this.pageSize; // reset on load
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Failed to load products', error);
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStockLabel(product: Product): StockLabel {
    if (product.stockStatus === 'OUT_OF_STOCK') return 'Out of Stock';
    if (product.stockStatus === 'LOW_STOCK') return 'Running Out';
    return 'In Stock';
  }

  isProductInStock(product: Product): boolean {
    return product.stockStatus !== 'OUT_OF_STOCK' && product.availableUnits > 0;
  }

  getProductImage(product: Product | PurchaseCartItem): string {
    return product.imageUrl?.trim() || 'images/products/placeholder.png';
  }

  filterProducts(): void {
    let filtered = [...this.originalProducts];

    if (this.searchTerm.trim()) {
      const query = this.searchTerm.toLowerCase();

      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(query) ||
          product.productId.toLowerCase().includes(query) ||
          (product.description || '').toLowerCase().includes(query)
      );
    }

    this.filteredProducts = [...filtered];
    this.visibleCount = this.pageSize; // reset pagination on filter

    if (this.sortBy !== 'default') {
      this.applySortOnly();
    }

    this.cdr.detectChanges();
  }

  sortProducts(): void {
    if (this.sortBy === 'default') {
      this.filterProducts();
      return;
    }

    this.applySortOnly();
    this.visibleCount = this.pageSize; // reset pagination on sort
    this.cdr.detectChanges();
  }

  private applySortOnly(): void {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'stock':
        this.filteredProducts.sort((a, b) => b.stockPercentage - a.stockPercentage);
        break;
      case 'default':
        break;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterProducts();
  }

  addToCart(product: Product): void {
    if (!this.isProductInStock(product)) return;

    if (!this.isLoggedIn()) {
      this.pendingAction = 'cart';
      this.showAuthRequiredModal = true;
      return;
    }

    if (product.type !== 'SALE') return;

    this.purchaseCartService.addToCart({
      productId: product.id,
      productCode: product.productId,
      productName: product.productName,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: 1,
      availableUnits: product.availableUnits,
    });

    this.successMessage = `${product.productName} added to cart.`;
    this.isCartOpen = true;

    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 2500);
  }

  removeFromCart(item: PurchaseCartItem): void {
    this.purchaseCartService.remove(item.productId);
  }

  incrementQuantity(item: PurchaseCartItem): void {
    this.purchaseCartService.increase(item.productId);
  }

  decrementQuantity(item: PurchaseCartItem): void {
    this.purchaseCartService.decrease(item.productId);
  }

  getCartTotal(): number {
    return this.purchaseCartService.getSubtotal();
  }

  toggleCart(): void {
    if (!this.isLoggedIn()) {
      this.pendingAction = 'cart';
      this.showAuthRequiredModal = true;
      return;
    }

    this.isCartOpen = !this.isCartOpen;
  }

  quickView(product: Product): void {
    this.selectedProduct = product;
  }

  closeQuickView(): void {
    this.selectedProduct = null;
  }

  checkout(): void {
    if (!this.isLoggedIn()) {
      this.pendingAction = 'checkout';
      this.showAuthRequiredModal = true;
      return;
    }

    if (this.cartItems.length === 0) return;

    this.isCartOpen = false;
    this.router.navigate(['/checkout']);
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.pendingAction === 'checkout' ? '/checkout' : '/shop',
      },
    });
  }

  goToSignup(): void {
    this.router.navigate(['/signup'], {
      queryParams: {
        returnUrl: this.pendingAction === 'checkout' ? '/checkout' : '/shop',
      },
    });
  }

  closeAuthModal(): void {
    this.showAuthRequiredModal = false;
    this.pendingAction = null;
  }

  private isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}