import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  CreateRentalBookingRequest,
  DispatchRentalRequest,
  RentalAvailability,
  RentalBooking,
} from '../models/rental.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RentalBookingService {
  private readonly apiUrl = 'http://localhost:8080/api/rental-bookings';

  constructor(private http: HttpClient) {}

  checkAvailability(
    startDate: string,
    endDate: string
  ): Observable<RentalAvailability[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<RentalAvailability[]>(
      `${this.apiUrl}/availability`,
      { params }
    );
  }

  createBooking(
    request: CreateRentalBookingRequest
  ): Observable<RentalBooking> {
    return this.http.post<RentalBooking>(this.apiUrl, request);
  }

  markAdvancePaid(bookingId: number): Observable<RentalBooking> {
    return this.http.put<RentalBooking>(
      `${this.apiUrl}/${bookingId}/advance-paid`,
      {}
    );
  }

  getMyBookings(): Observable<RentalBooking[]> {
    return this.http.get<RentalBooking[]>(`${this.apiUrl}/my-bookings`);
  }

  cancelBooking(bookingId: number): Observable<RentalBooking> {
    return this.http.put<RentalBooking>(
      `${this.apiUrl}/${bookingId}/cancel`,
      {}
    );
  }

  getAllBookingsForAdmin(): Observable<RentalBooking[]> {
    return this.http.get<RentalBooking[]>(`${this.apiUrl}/admin/all`);
  }

  dispatchBooking(
    bookingId: number,
    request: DispatchRentalRequest
  ): Observable<RentalBooking> {
    return this.http.put<RentalBooking>(
      `${this.apiUrl}/admin/${bookingId}/dispatch`,
      request
    );
  }

  markAsRented(bookingId: number): Observable<RentalBooking> {
    return this.http.put<RentalBooking>(
      `${this.apiUrl}/admin/${bookingId}/rented`,
      {}
    );
  }

  markAsReturned(bookingId: number): Observable<RentalBooking> {
    return this.http.put<RentalBooking>(
      `${this.apiUrl}/admin/${bookingId}/returned`,
      {}
    );
  }

  completeBooking(bookingId: number): Observable<RentalBooking> {
    return this.http.put<RentalBooking>(
      `${this.apiUrl}/admin/${bookingId}/complete`,
      {}
    );
  }
}