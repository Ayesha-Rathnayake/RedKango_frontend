import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent {
  orderId: string | null = null;
  bookingId: string | null = null;
  paymentType = 'order';

  constructor(private route: ActivatedRoute) {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.bookingId = this.route.snapshot.queryParamMap.get('bookingId');
    this.paymentType = this.route.snapshot.queryParamMap.get('type') || 'order';
  }

  get isRentalPayment(): boolean {
    return this.paymentType === 'rental';
  }
}