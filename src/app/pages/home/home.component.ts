import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private router: Router, private auth: AuthService) {}

  handleRentNow() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/rentals'], { queryParams: { intent: 'rent' } });
    } else {
      this.router.navigate(['/auth-intent'], { queryParams: { intent: 'rent', returnUrl: '/rentals', cta: 'signup' } });
    }
  }
}