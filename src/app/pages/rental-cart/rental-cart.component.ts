import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

// This interface matches exactly what rentals.component.ts saves to localStorage
interface RentalCartItem {
  id: number;
  productId: string;
  productName: string;
  imageUrl?: string;
  price: number;           // daily rate
  quantity: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;      // price * quantity * totalDays
  availableUnitsForDates: number;
}

@Component({
  selector: 'app-rental-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rental-cart.component.html',
})
export class RentalCartComponent implements OnInit {
  cart: RentalCartItem[] = [];

  ngOnInit(): void {
    this.cart = this.loadCart();
  }

  increase(item: RentalCartItem): void {
    if (item.quantity >= item.availableUnitsForDates) return;
    item.quantity++;
    item.totalPrice = item.price * item.quantity * item.totalDays;
    this.saveCart();
  }

  decrease(item: RentalCartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      item.totalPrice = item.price * item.quantity * item.totalDays;
      this.saveCart();
    } else {
      this.remove(item);
    }
  }

  remove(item: RentalCartItem): void {
    this.cart = this.cart.filter((c) => c.id !== item.id);
    this.saveCart();
  }

  get startDate(): string { return this.cart[0]?.startDate ?? ''; }
  get endDate(): string   { return this.cart[0]?.endDate   ?? ''; }
  get totalDays(): number { return this.cart[0]?.totalDays ?? 0;  }

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  get deliveryCharge(): number { return this.cart.length > 0 ? 1000 : 0; }
  get advance(): number        { return this.subtotal * 0.5; }
  get payNow(): number         { return this.advance + this.deliveryCharge; }
  get remaining(): number      { return this.subtotal - this.advance; }

  private loadCart(): RentalCartItem[] {
    try {
      const raw = localStorage.getItem('rentalCart');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveCart(): void {
    localStorage.setItem('rentalCart', JSON.stringify(this.cart));
    window.dispatchEvent(new Event('storage'));
  }
}