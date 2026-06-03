import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderResponse } from '../../models/purchase-cart.model';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-orders.component.html',
})
export class CustomerOrdersComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';

  showCancelModal = false;
  selectedOrderToCancel?: OrderResponse;

  orders: OrderResponse[] = [];

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.errorMessage = err.error?.message || 'Failed to load your orders.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  canCancel(order: OrderResponse): boolean {
    return order.orderStatus === 'PENDING_PAYMENT';
  }

  openCancelModal(order: OrderResponse): void {
    this.selectedOrderToCancel = order;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.selectedOrderToCancel = undefined;
    this.showCancelModal = false;
  }

  confirmCancelOrder(): void {
    if (!this.selectedOrderToCancel) return;

    const order = this.selectedOrderToCancel;

    this.orderService.cancelOrder(order.orderId).subscribe({
      next: (updatedOrder) => {
        this.orders = this.orders.map((item) =>
          item.orderId === updatedOrder.orderId ? updatedOrder : item,
        );

        this.successMessage = `Order ${updatedOrder.orderNumber} cancelled successfully.`;
        this.closeCancelModal();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to cancel order', err);
        this.errorMessage = err.error?.message || 'Failed to cancel order.';
        this.closeCancelModal();
        this.cdr.detectChanges();
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DISPATCHED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  removeFromHistory(order: OrderResponse): void {
    const confirmed = confirm(`Remove ${order.orderNumber} from your order history?`);

    if (!confirmed) return;

    this.orderService.hideOrder(order.orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter((item) => item.orderId !== order.orderId);

        this.successMessage = `${order.orderNumber} removed from your order history.`;

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to remove order from history.';
        this.cdr.detectChanges();
      },
    });
  }
  showRemoveModal = false;
selectedOrderToRemove?: OrderResponse;

openRemoveModal(order: OrderResponse): void {
  this.selectedOrderToRemove = order;
  this.showRemoveModal = true;
}

closeRemoveModal(): void {
  this.selectedOrderToRemove = undefined;
  this.showRemoveModal = false;
}

confirmRemoveOrder(): void {
  if (!this.selectedOrderToRemove) return;

  const order = this.selectedOrderToRemove;

  this.orderService.hideOrder(order.orderId).subscribe({
    next: () => {
      this.orders = this.orders.filter((item) => item.orderId !== order.orderId);
      this.successMessage = `${order.orderNumber} removed from your order history.`;
      this.closeRemoveModal();

      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 3000);

      this.cdr.detectChanges();
    },
    error: (err) => {
      this.errorMessage =
        err.error?.message || 'Failed to remove order from history.';
      this.closeRemoveModal();
      this.cdr.detectChanges();
    },
  });
}
}
