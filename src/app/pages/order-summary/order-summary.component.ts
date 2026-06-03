import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderResponse } from '../../models/purchase-cart.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-summary.component.html',
})
export class OrderSummaryComponent implements OnInit {
  loading = true;
  errorMessage = '';
  order?: OrderResponse;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));

    if (!orderId) {
      this.loading = false;
      this.errorMessage = 'Order not found.';
      this.cdr.detectChanges();
      return;
    }

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load order', err);
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Failed to load order summary.';
        this.cdr.detectChanges();
      },
    });
  }
}