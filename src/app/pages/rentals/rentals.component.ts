import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rentals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rentals.component.html'
})
export class RentalsComponent {
  checkIn = '';
  checkOut = '';

  tents = [
    { name: '2-Person Dome Tent', price: 2500, available: true, img: 'images/tent1.png' },
    { name: '4-Person Family Tent', price: 4500, available: true, img: 'images/tent2.png' },
    { name: '6-Person Group Tent', price: 6500, available: false, img: 'images/tent3.png' }
  ];

  constructor(private router: Router, private auth: AuthService) {}

  search() {
    if (!this.checkIn || !this.checkOut) {
      alert('Please select Start date and End date');
    }
  }

  bookTent(tent: any) {
    if (!tent.available) return;
    if (!this.checkIn || !this.checkOut) {
      alert('Please select Start date and End date');
      return;
    }

    const params = {
      type: 'tent',
      name: tent.name,
      price: tent.price,
      from: this.checkIn,
      to: this.checkOut
    };

    if (!this.auth.isLoggedIn()) {
      // Ask user to auth, then return to checkout with preserved details
      const returnUrl = `/checkout?type=${params.type}&name=${encodeURIComponent(params.name)}&price=${params.price}&from=${params.from}&to=${params.to}`;
      this.router.navigate(['/auth-intent'], { queryParams: { returnUrl, intent: 'book' } });
      return;
    }

    this.router.navigate(['/checkout'], { queryParams: params });
  }
}