import { Injectable } from '@angular/core';
import { RentalCartItem } from '../models/rental.model';

@Injectable({
  providedIn: 'root',
})
export class RentalCartService {
  private readonly storageKey = 'rentalCart';

  getCart(): RentalCartItem[] {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) return [];

    try {
      const cart = JSON.parse(saved) as RentalCartItem[];
      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }

  addItem(item: RentalCartItem): void {
    const cart = this.getCart();

    const existing = cart.find(
      (cartItem) => cartItem.productId === item.productId
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }

    this.save(cart);
  }

  updateQuantity(productId: number, quantity: number): void {
    const cart = this.getCart();

    const updated = cart
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
      .filter((item) => item.quantity > 0);

    this.save(updated);
  }

  removeItem(productId: number): void {
    const cart = this.getCart().filter((item) => item.productId !== productId);
    this.save(cart);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
    window.dispatchEvent(new Event('storage'));
  }

  getCount(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  }

  private save(cart: RentalCartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }
}