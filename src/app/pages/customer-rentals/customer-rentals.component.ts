import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RentalBookingService } from '../../services/rental-booking.service';
import { RentalBooking } from '../../models/rental.model';

@Component({
  selector: 'app-customer-rentals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-rentals.component.html',
})
export class CustomerRentalsComponent implements OnInit {
  rentals: RentalBooking[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private rentalBookingService: RentalBookingService
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
      },
      error: () => {
        this.errorMessage = 'Failed to load rental bookings.';
        this.loading = false;
      },
    });
  }
}