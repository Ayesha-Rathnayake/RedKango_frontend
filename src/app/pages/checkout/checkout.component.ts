import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
  type = ''; name = ''; price = 0; from = ''; to = '';
  nights = 1; subtotal = 0; serviceFee = 0; total = 0;

  constructor(private route: ActivatedRoute) {
    const qp = this.route.snapshot.queryParamMap;
    this.type = qp.get('type') || 'tent';
    this.name = qp.get('name') || '';
    this.price = +(qp.get('price') || 0);
    this.from = qp.get('from') || '';
    this.to = qp.get('to') || '';
    this.compute();
  }

  private compute() {
    if (this.from && this.to) {
      const a = new Date(this.from), b = new Date(this.to);
      const ms = Math.max(0, b.getTime() - a.getTime());
      this.nights = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
      this.subtotal = this.nights * this.price;
      this.serviceFee = Math.round(this.subtotal * 0.05); // Example 5%
      this.total = this.subtotal + this.serviceFee;
    }
  }

  pay() {
    // TODO: integrate Stripe Checkout via backend session creation
    alert('Redirecting to payment gateway...');
  }
}