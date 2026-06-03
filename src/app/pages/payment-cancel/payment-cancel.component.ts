import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-cancel.component.html',
})
export class PaymentCancelComponent {
  orderId: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
  }
}