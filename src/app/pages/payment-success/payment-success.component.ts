import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent implements OnInit {
  orderId: string | null = null;
  bookingId: string | null = null;
  paymentType = 'order';

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.bookingId = this.route.snapshot.queryParamMap.get('bookingId');
    this.paymentType = this.route.snapshot.queryParamMap.get('type') || 'order';
  }

  ngOnInit(): void {
    // Clear cart
    if (this.paymentType === 'rental') {
      localStorage.removeItem('rentalCart');
    } else {
      localStorage.removeItem('cart');
    }
    window.dispatchEvent(new Event('storage'));

    // Confirm payment and trigger email
    if (this.paymentType === 'rental' && this.bookingId) {
      this.paymentService.confirmRentalPayment(+this.bookingId).subscribe({
        next: () => console.log('Rental payment confirmed'),
        error: (err) => console.error('Rental confirm failed', err)
      });
    } else if (this.orderId) {
      this.paymentService.confirmOrderPayment(+this.orderId).subscribe({
        next: () => console.log('Order payment confirmed'),
        error: (err) => console.error('Order confirm failed', err)
      });
    }
  }

  get isRentalPayment(): boolean {
    return this.paymentType === 'rental';
  }
}
