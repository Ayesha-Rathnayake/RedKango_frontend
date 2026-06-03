import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RentalBookingService } from '../../services/rental-booking.service';
import { PaymentService } from '../../services/payment.service';
import { PayHereInitResponse } from '../../models/payment.model';
import { CreateRentalBookingRequest, RentalDeliveryAddress } from '../../models/rental.model';

interface RentalCartItem {
  id: number;
  productId: string;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  availableUnitsForDates: number;
}

@Component({
  selector: 'app-rental-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rental-checkout.component.html',
})
export class RentalCheckoutComponent {
  loading = false;
  errorMessage = '';

  cart: RentalCartItem[] = this.getRentalCart();

  address: RentalDeliveryAddress = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
  };

  customerNote = '';

  constructor(
    private rentalBookingService: RentalBookingService,
    private paymentService: PaymentService,
  ) {}

  get startDate(): string {
    return this.cart[0]?.startDate || '';
  }

  get endDate(): string {
    return this.cart[0]?.endDate || '';
  }

  get totalDays(): number {
    return this.cart[0]?.totalDays || 0;
  }

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  get deliveryCharge(): number {
    return this.cart.length > 0 ? 1000 : 0;
  }

  get advanceAmount(): number {
    return this.subtotal * 0.5;
  }

  get amountPayNow(): number {
    return this.advanceAmount + this.deliveryCharge;
  }

  get remainingAmount(): number {
    return this.subtotal - this.advanceAmount;
  }

  placeRentalBooking(): void {
    this.errorMessage = '';

    if (this.cart.length === 0) {
      this.errorMessage = 'Your rental cart is empty.';
      return;
    }

    if (
      !this.address.fullName ||
      !this.address.phone ||
      !this.address.addressLine1 ||
      !this.address.city ||
      !this.address.district ||
      !this.address.postalCode
    ) {
      this.errorMessage = 'Please fill all required delivery details.';
      return;
    }

    const request: CreateRentalBookingRequest = {
      rentalStartDate: this.startDate,
      rentalEndDate: this.endDate,
      items: this.cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      deliveryAddress: this.address,
      customerNote: this.customerNote,
    };

    this.loading = true;

    this.rentalBookingService.createBooking(request).subscribe({
      next: (booking) => {
        this.paymentService.initRentalPayHerePayment({ bookingId: booking.bookingId }).subscribe({
          next: (payment) => {
            localStorage.removeItem('rentalCart');
            window.dispatchEvent(new Event('storage'));
            this.redirectToPayHere(payment);
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage =
              err.error?.message || 'Rental payment initialization failed. Please try again.';
          },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to create rental booking.';
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

  private getRentalCart(): RentalCartItem[] {
    const saved = localStorage.getItem('rentalCart');

    if (!saved) return [];

    try {
      const cart = JSON.parse(saved) as RentalCartItem[];
      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }
}
