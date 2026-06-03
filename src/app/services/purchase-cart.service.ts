import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PurchaseCartItem } from '../models/purchase-cart.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseCartService {
  private readonly storageKey = 'redkango_purchase_cart';

  private cartSubject = new BehaviorSubject<PurchaseCartItem[]>(this.getCart());
  cart$ = this.cartSubject.asObservable();

  getCart(): PurchaseCartItem[] {
    const cart = localStorage.getItem(this.storageKey);
    return cart ? JSON.parse(cart) as PurchaseCartItem[] : [];
  }

  addToCart(item: PurchaseCartItem): void {
    const cart = this.getCart();
    const existing = cart.find(i => i.productId === item.productId);

    if (existing) {
      if (existing.quantity < existing.availableUnits) {
        existing.quantity += 1;
      }
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    this.save(cart);
  }

  increase(productId: number): void {
    const cart = this.getCart();
    const item = cart.find(i => i.productId === productId);

    if (item && item.quantity < item.availableUnits) {
      item.quantity += 1;
      this.save(cart);
    }
  }

  decrease(productId: number): void {
    const cart = this.getCart();
    const item = cart.find(i => i.productId === productId);

    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.save(cart);
    }
  }

  remove(productId: number): void {
    const cart = this.getCart().filter(i => i.productId !== productId);
    this.save(cart);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
    this.cartSubject.next([]);
  }

  getSubtotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  private save(cart: PurchaseCartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }
}