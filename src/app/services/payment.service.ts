import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PayHereInitRequest,
  PayHereInitResponse,
  PayHereRentalInitRequest,
} from '../models/payment.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  initPayHerePayment(request: PayHereInitRequest): Observable<PayHereInitResponse> {
    return this.http.post<PayHereInitResponse>(
      `${this.apiUrl}/payhere/init`,
      request
    );
  }

  initRentalPayHerePayment(
    request: PayHereRentalInitRequest
  ): Observable<PayHereInitResponse> {
    return this.http.post<PayHereInitResponse>(
      `${this.apiUrl}/payhere/rental/init`,
      request
    );
  }

  confirmOrderPayment(orderId: number): Observable<void> {
  return this.http.post<void>(
    `${this.apiUrl}/confirm-order/${orderId}`, {}
  );
}

confirmRentalPayment(bookingId: number): Observable<void> {
  return this.http.post<void>(
    `${this.apiUrl}/confirm-rental/${bookingId}`, {}
  );
}

}