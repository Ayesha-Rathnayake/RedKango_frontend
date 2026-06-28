import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { RentalBookingService } from '../../services/rental-booking.service';
import { RentalBooking } from '../../models/rental.model';
import { PaymentService } from '../../services/payment.service';
import { PayHereInitResponse } from '../../models/payment.model';


@Component({
  selector: 'app-customer-rentals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-rentals.component.html',
})
export class CustomerRentalsComponent implements OnInit {
  rentals: RentalBooking[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  showCancelModal = false;
  selectedRentalToCancel?: RentalBooking;
payingBookingId: number | null = null;

  constructor(
    private rentalBookingService: RentalBookingService,
        private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRentals();
  }

  loadRentals(): void {
    this.loading = true;

    this.rentalBookingService.getMyBookings().subscribe({
      next: (data) => {
        this.rentals = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load rental bookings.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
payNow(rental: RentalBooking): void {
  this.payingBookingId = rental.bookingId;
  this.errorMessage = '';

  this.paymentService.initRentalPayHerePayment({ bookingId: rental.bookingId }).subscribe({
    next: (payment) => {
      this.payingBookingId = null;
      this.redirectToPayHere(payment);
    },
    error: (err) => {
      this.payingBookingId = null;
      this.errorMessage = err.error?.message || 'Failed to initiate payment. Please try again.';
      this.cdr.detectChanges();
    },
  });
}

private redirectToPayHere(payment: PayHereInitResponse): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payment.checkoutUrl;

  const fields: Record<string, string> = {
    merchant_id: payment.merchantId,
    return_url: payment.returnUrl,
    cancel_url: payment.cancelUrl,
    notify_url: payment.notifyUrl,
    order_id: payment.orderId,
    items: payment.items,
    currency: payment.currency,
    amount: payment.amount,
    first_name: payment.firstName,
    last_name: payment.lastName,
    email: payment.email,
    phone: payment.phone,
    address: payment.address,
    city: payment.city,
    country: payment.country,
    hash: payment.hash,
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value || '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}


  // ── Cancel ───────────────────────────────────────────────────

  canCancel(rental: RentalBooking): boolean {
    return rental.bookingStatus === 'PENDING_PAYMENT' ||
           rental.bookingStatus === 'CONFIRMED';
  }


  openCancelModal(rental: RentalBooking): void {
    this.selectedRentalToCancel = rental;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.selectedRentalToCancel = undefined;
    this.showCancelModal = false;
  }

  confirmCancelRental(): void {
    if (!this.selectedRentalToCancel) return;

    const rental = this.selectedRentalToCancel;

    
this.rentalBookingService.cancelBooking(rental.bookingId).subscribe({
  next: (updated) => {
    this.rentals = this.rentals.map((r) =>
      r.bookingId === updated.bookingId ? updated : r
    );
        this.successMessage = `Booking ${updated.bookingNumber} cancelled successfully.`;
        this.closeCancelModal();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to cancel booking.';
        this.closeCancelModal();
        this.cdr.detectChanges();
      },
    });
  }

  // ── Status class ─────────────────────────────────────────────

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CONFIRMED':
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'DISPATCHED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RENTED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'RETURNED':
      case 'COMPLETED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }
}