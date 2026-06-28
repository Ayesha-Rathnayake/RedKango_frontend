import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderResponse
} from '../models/purchase-cart.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.apiUrl, request);
  }

  getOrder(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`);
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/my-orders`);
  }

  cancelOrder(orderId: number): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  hideOrder(orderId: number) {
  return this.http.patch<void>(`${this.apiUrl}/${orderId}/hide`, {});
}
}