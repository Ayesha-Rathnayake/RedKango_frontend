import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  badge?: 'Best Seller' | 'Available' | 'Out of Stock';
  category: string;
  rating: number;   // average rating 1..5
  reviews: number;  // number of reviews
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html'
})
export class ShopComponent implements OnInit {
  searchTerm = '';
  selectedCategory = 'all';
  sortBy = 'default';

  isCartOpen = false;
  selectedProduct: Product | null = null;

  products: Product[] = [
    { id: 1,  name: 'Butane Gas Canister',      price:  850,  image: 'images/products/gas-canister.png',  badge: 'Best Seller', category: 'cooking',  rating: 5, reviews: 124, inStock: true },
    { id: 2,  name: 'Waterproof Gas Stove',     price: 2600,  image: 'images/products/gas-stove.png',     badge: 'Available',   category: 'cooking',  rating: 4, reviews:  87, inStock: true },
    { id: 3,  name: 'Hiking Rope',              price:  360,  image: 'images/products/rope.png',          badge: 'Best Seller', category: 'tools',    rating: 5, reviews: 203, inStock: true },
    { id: 4,  name: 'Portable Water Can',       price:  900,  image: 'images/products/water-can.png',     badge: 'Available',   category: 'tools',    rating: 4, reviews:  56, inStock: true },
    { id: 5,  name: 'Air Pump',                 price: 1500,  image: 'images/products/air-pump.png',      badge: 'Available',   category: 'tools',    rating: 4, reviews:  92, inStock: true },
    { id: 6,  name: 'Rain Coat',                price: 1500,  image: 'images/products/raincoat.png',      badge: 'Available',   category: 'clothing', rating: 5, reviews: 145, inStock: true },
    { id: 7,  name: 'Rechargeable LED Light',   price: 1600,  image: 'images/products/led-light.png',     badge: 'Available',   category: 'lighting', rating: 5, reviews: 178, inStock: true },
    { id: 8,  name: 'Folding Chair',            price: 4500,  image: 'images/products/folding-chair.png', badge: 'Best Seller', category: 'shelter',  rating: 5, reviews: 234, inStock: true },
    { id: 9,  name: 'Hiking Stick',             price: 4900,  image: 'images/products/hiking-stick.png',  badge: 'Available',   category: 'tools',    rating: 4, reviews: 112, inStock: true },
    { id: 10, name: 'Heavy Backpack',           price:10000,  image: 'images/products/backpack.png',      badge: 'Available',   category: 'tools',    rating: 5, reviews: 289, inStock: true },
    { id: 11, name: 'Camping Cookware',         price:11500,  image: 'images/products/cookware.png',      badge: 'Available',   category: 'cooking',  rating: 5, reviews: 167, inStock: true },
    { id: 12, name: 'Sleeping Bag',             price: 5900,  image: 'images/products/sleeping-bag.png',  badge: 'Best Seller', category: 'shelter',  rating: 5, reviews: 341, inStock: true }
  ];

  filteredProducts: Product[] = [];
  cartItems: CartItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredProducts = [...this.products];
    this.loadCartFromStorage();
  }

  // ------------------------------
  // Filtering & Sorting
  // ------------------------------
  filterProducts() {
    let filtered = [...this.products];

    // Search
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts = filtered;
    this.sortProducts(); // always sort after filtering
  }

  /**
   * Weighted rating sort (Bayesian average)
   * Prevents a product with few reviews from outranking one with many.
   */
  private getGlobalMean(): number {
    if (!this.products.length) return 0;
    const sum = this.products.reduce((s, p) => s + p.rating, 0);
    return sum / this.products.length;
  }

  private weightedRating(p: Product, C: number, m = 10): number {
    // R = product rating, v = number of reviews, C = global mean, m = minimum reviews
    const R = p.rating;
    const v = Math.max(0, p.reviews || 0);
    return (v / (v + m)) * R + (m / (v + m)) * C;
  }

  sortProducts() {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating': {
        const C = this.getGlobalMean();
        this.filteredProducts.sort((a, b) => this.weightedRating(b, C) - this.weightedRating(a, C));
        break;
      }
      default:
        // keep original order
        break;
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterProducts();
  }

  clearCategory() {
    this.selectedCategory = 'all';
    this.filterProducts();
  }

  // ------------------------------
  // Cart
  // ------------------------------
  addToCart(product: Product) {
    if (!product.inStock) return;

    const existing = this.cartItems.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }

    this.saveCartToStorage();
    this.isCartOpen = true;
  }

  removeFromCart(item: CartItem) {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.saveCartToStorage();
  }

  incrementQuantity(item: CartItem) {
    item.quantity++;
    this.saveCartToStorage();
  }

  decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCartToStorage();
    } else {
      this.removeFromCart(item);
    }
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  quickView(product: Product) {
    this.selectedProduct = product;
  }

  closeQuickView() {
    this.selectedProduct = null;
  }

  // ------------------------------
  // Checkout (auth-gated)
  // ------------------------------
  checkout() {
    const loggedIn = localStorage.getItem('accessToken'); // use token presence
    if (!loggedIn) {
      this.isCartOpen = false;
      this.router.navigate(['/auth-intent'], { queryParams: { intent: 'checkout', returnUrl: '/checkout' } });
      return;
    }
    // Navigate to your checkout page (you can carry cart total via state or queryParams)
    alert(`Proceeding to checkout with ${this.cartItems.length} items. Total: LKR ${this.getCartTotal()}`);
  }

  // ------------------------------
  // Storage
  // ------------------------------
  private saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  private loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        this.cartItems = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading cart from storage', e);
      }
    }
  }
}