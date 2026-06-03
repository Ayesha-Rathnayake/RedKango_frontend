import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { RentalBookingService } from '../../services/rental-booking.service';
import { RentalAvailability } from '../../models/rental.model';

type RentalStockLabel = 'Available' | 'Running Out' | 'Unavailable';
type SortOption = 'default' | 'price-low' | 'price-high' | 'name' | 'stock';

interface RentalCartItem extends Product {
  quantity: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  availableUnitsForDates: number;
}

@Component({
  selector: 'app-rentals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rentals.component.html',
})
export class RentalsComponent implements OnInit {
  startDate = '';
  endDate = '';
  searchTerm = '';
  sortBy: SortOption = 'default';

  loading = false;
  checkingAvailability = false;

  errorMessage = '';
  successMessage = '';
  dateError = '';

  showAuthRequiredModal = false;

  rentalProducts: Product[] = [];
  filteredProducts: Product[] = [];
  originalProducts: Product[] = [];

  availabilityMap: Record<number, number> = {};
  availabilityChecked = false;

  selectedProduct: Product | null = null;
  rentalCartItems: RentalCartItem[] = [];
  isRentalCartOpen = false;

  // ── Pagination ──────────────────────────────────────────────
  readonly pageSize = 4;
  visibleCount = this.pageSize;
  // ────────────────────────────────────────────────────────────

  constructor(
    private productService: ProductService,
    private rentalBookingService: RentalBookingService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRentalProducts();
    this.loadRentalCart();
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

  loadRentalProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        const rentals = products.filter((product) => product.type === 'RENTAL');

        this.originalProducts = [...rentals];
        this.rentalProducts = [...rentals];
        this.filteredProducts = [...rentals];
        this.visibleCount = this.pageSize; // reset on load

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load rental products. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  checkAvailability(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateDates()) return;

    this.checkingAvailability = true;
    this.availabilityChecked = false;

    this.rentalBookingService.checkAvailability(this.startDate, this.endDate).subscribe({
      next: (response: RentalAvailability[]) => {
        this.availabilityMap = {};

        response.forEach((item) => {
          this.availabilityMap[item.productId] = item.availableUnits;
        });

        this.availabilityChecked = true;
        this.checkingAvailability = false;
        this.successMessage = 'Availability checked for the selected rental dates.';

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);

        this.cdr.detectChanges();
      },
      error: () => {
        this.checkingAvailability = false;
        this.errorMessage = 'Failed to check rental availability.';
        this.cdr.detectChanges();
      },
    });
  }

  getRentalStockLabel(product: Product): RentalStockLabel {
    if (!this.availabilityChecked) return 'Unavailable';

    const available = this.getAvailableUnits(product);

    if (available <= 0) return 'Unavailable';
    if (available <= 2) return 'Running Out';

    return 'Available';
  }

  isRentalAvailable(product: Product): boolean {
    return this.availabilityChecked && this.getAvailableUnits(product) > 0;
  }

  getAvailableUnits(product: Product): number {
    return this.availabilityMap[product.id] ?? 0;
  }

  getProductImage(product: Product): string {
    return product.imageUrl?.trim() || 'images/products/placeholder.png';
  }

  getRentalDays(): number {
    if (!this.startDate || !this.endDate) return 0;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    const diffTime = end.getTime() - start.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return days > 0 ? days : 0;
  }

  validateDates(): boolean {
    this.dateError = '';

    if (!this.startDate || !this.endDate) {
      this.dateError = 'Please select start date and end date to check rental availability.';
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (start < today) {
      this.dateError = 'Start date cannot be in the past.';
      return false;
    }

    if (end < start) {
      this.dateError = 'End date cannot be before start date.';
      return false;
    }

    return true;
  }

  onDateChange(): void {
    this.dateError = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.availabilityChecked = false;
    this.availabilityMap = {};
    this.rentalCartItems = [];
    this.saveRentalCart();
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
    this.sortProducts();
  }

  sortProducts(): void {
    if (this.sortBy === 'default') {
      this.filterWithoutSorting();
      this.visibleCount = this.pageSize; // reset pagination on sort
      this.cdr.detectChanges();
      return;
    }

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
        this.filteredProducts.sort(
          (a, b) => this.getAvailableUnits(b) - this.getAvailableUnits(a)
        );
        break;
    }

    this.visibleCount = this.pageSize; // reset pagination on sort
    this.cdr.detectChanges();
  }

  private filterWithoutSorting(): void {
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
  }

  quickView(product: Product): void {
    this.selectedProduct = product;
  }

  closeQuickView(): void {
    this.selectedProduct = null;
  }

  addToRentalCart(product: Product): void {
    this.errorMessage = '';

    if (!this.authService.isLoggedIn()) {
      this.showAuthRequiredModal = true;
      return;
    }

    if (!this.validateDates()) return;

    if (!this.availabilityChecked) {
      this.errorMessage = 'Please check availability before adding rental items.';
      return;
    }

    const availableUnits = this.getAvailableUnits(product);

    if (availableUnits <= 0) {
      this.errorMessage = 'This item is unavailable for the selected dates.';
      return;
    }

    const totalDays = this.getRentalDays();

    const existingItem = this.rentalCartItems.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= availableUnits) {
        this.errorMessage = `Only ${availableUnits} unit(s) available for selected dates.`;
        return;
      }

      existingItem.quantity++;
      existingItem.totalPrice = existingItem.quantity * existingItem.price * existingItem.totalDays;
    } else {
      this.rentalCartItems.push({
        ...product,
        quantity: 1,
        startDate: this.startDate,
        endDate: this.endDate,
        totalDays,
        totalPrice: product.price * totalDays,
        availableUnitsForDates: availableUnits,
      });
    }

    this.saveRentalCart();
    this.isRentalCartOpen = true;
  }

  toggleRentalCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.showAuthRequiredModal = true;
      return;
    }

    this.isRentalCartOpen = !this.isRentalCartOpen;
  }

  removeFromRentalCart(item: RentalCartItem): void {
    this.rentalCartItems = this.rentalCartItems.filter((cartItem) => cartItem.id !== item.id);
    this.saveRentalCart();
  }

  incrementQuantity(item: RentalCartItem): void {
    if (item.quantity >= item.availableUnitsForDates) {
      this.errorMessage = `Only ${item.availableUnitsForDates} unit(s) available for selected dates.`;
      return;
    }

    item.quantity++;
    item.totalPrice = item.quantity * item.price * item.totalDays;
    this.saveRentalCart();
  }

  decrementQuantity(item: RentalCartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      item.totalPrice = item.quantity * item.price * item.totalDays;
      this.saveRentalCart();
      return;
    }

    this.removeFromRentalCart(item);
  }

  getRentalCartSubtotal(): number {
    return this.rentalCartItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  getRentalCartDeliveryCharge(): number {
    return this.rentalCartItems.length > 0 ? 1000 : 0;
  }

  getRentalCartAdvance(): number {
    return this.getRentalCartSubtotal() * 0.5;
  }

  getAmountPayNow(): number {
    return this.getRentalCartAdvance() + this.getRentalCartDeliveryCharge();
  }

  getRemainingBalance(): number {
    return this.getRentalCartSubtotal() - this.getRentalCartAdvance();
  }

  proceedToBooking(): void {
    if (!this.authService.isLoggedIn()) {
      this.showAuthRequiredModal = true;
      return;
    }

    if (!this.rentalCartItems.length) return;

    this.router.navigate(['/rental-checkout']);
  }

  closeAuthModal(): void {
    this.showAuthRequiredModal = false;
  }

  goToLogin(): void {
    this.showAuthRequiredModal = false;

    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: '/rentals',
        intent: 'rental',
      },
    });
  }

  goToSignup(): void {
    this.showAuthRequiredModal = false;

    this.router.navigate(['/signup'], {
      queryParams: {
        returnUrl: '/rentals',
        intent: 'rental',
      },
    });
  }

  private saveRentalCart(): void {
    localStorage.setItem('rentalCart', JSON.stringify(this.rentalCartItems));
    window.dispatchEvent(new Event('storage'));
  }

  private loadRentalCart(): void {
    const savedCart = localStorage.getItem('rentalCart');

    if (!savedCart) return;

    try {
      this.rentalCartItems = JSON.parse(savedCart) as RentalCartItem[];
    } catch {
      this.rentalCartItems = [];
    }
  }
}