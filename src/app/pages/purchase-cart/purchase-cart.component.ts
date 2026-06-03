import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PurchaseCartService } from '../../services/purchase-cart.service';
import { PurchaseCartItem } from '../../models/purchase-cart.model';

@Component({
  selector: 'app-purchase-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-cart.component.html',
})
export class PurchaseCartComponent {
  cart: PurchaseCartItem[] = [];

  constructor(private cartService: PurchaseCartService) {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }

  increase(productId: number): void {
    this.cartService.increase(productId);
  }

  decrease(productId: number): void {
    this.cartService.decrease(productId);
  }

  remove(productId: number): void {
    this.cartService.remove(productId);
  }

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}