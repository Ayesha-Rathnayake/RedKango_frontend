import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PurchaseCartService } from '../../services/purchase-cart.service';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';

import { DeliveryAddress } from '../../models/purchase-cart.model';
import { PayHereInitResponse } from '../../models/payment.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  loading = false;
  errorMessage = '';
  deliveryCharge = 1000;

  address: DeliveryAddress = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
  };

  constructor(
    private cartService: PurchaseCartService,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  get cart() {
    return this.cartService.getCart();
  }

  get subtotal(): number {
    return this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  get total(): number {
    return this.subtotal + this.deliveryCharge;
  }

  placeOrder(): void {
    this.errorMessage = '';

    if (this.cart.length === 0) {
      this.errorMessage = 'Your cart is empty.';
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

    const request = {
      items: this.cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      deliveryAddress: this.address,
    };

    this.loading = true;

    this.orderService.createOrder(request).subscribe({
      next: (response) => {
        this.paymentService
          .initPayHerePayment({ orderId: response.orderId })
          .subscribe({
            next: (payment) => {
              this.cartService.clear();
              this.redirectToPayHere(payment);
            },
            error: (err) => {
              console.error('Payment initialization failed', err);
              this.loading = false;
              this.errorMessage =
                err.error?.message ||
                'Payment initialization failed. Please try again.';
            },
          });
      },
      error: (err) => {
        console.error('Order creation failed', err);
        this.loading = false;
        this.errorMessage =
          err.error?.message ||
          'Order creation failed. Please try again.';
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
}