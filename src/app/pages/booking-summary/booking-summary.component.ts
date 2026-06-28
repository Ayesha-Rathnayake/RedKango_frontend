import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RentalBookingService } from '../../services/rental-booking.service';
import { RentalBooking } from '../../models/rental.model';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-summary.component.html',
})
export class BookingSummaryComponent implements OnInit {
  loading = true;
  errorMessage = '';
  booking?: RentalBooking;

  constructor(
    private route: ActivatedRoute,
    private rentalBookingService: RentalBookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));

    if (!bookingId) {
      this.loading = false;
      this.errorMessage = 'Booking not found.';
      this.cdr.detectChanges();
      return;
    }

    this.rentalBookingService.getMyBookings().subscribe({
      next: (bookings) => {
        this.booking = bookings.find((b) => b.bookingId === bookingId);
        this.loading = false;
        if (!this.booking) {
          this.errorMessage = 'Booking not found.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load booking summary.';
        this.cdr.detectChanges();
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':       return 'bg-green-100 text-green-700';
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-700';
      case 'DISPATCHED':      return 'bg-blue-100 text-blue-700';
      case 'RENTED':          return 'bg-purple-100 text-purple-700';
      case 'RETURNED':        return 'bg-orange-100 text-orange-700';
      case 'COMPLETED':       return 'bg-teal-100 text-teal-700';
      case 'CANCELLED':       return 'bg-red-100 text-red-700';
      default:                return 'bg-gray-100 text-gray-700';
    }
  }
}
