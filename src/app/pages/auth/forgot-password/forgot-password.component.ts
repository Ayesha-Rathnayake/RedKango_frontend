import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {

  email          = '';
  loading        = false;
  successMessage = '';
  errorMessage   = '';

  constructor(private cdr: ChangeDetectorRef) {}

  sendResetLink(form: NgForm): void {
    this.successMessage = '';
    this.errorMessage   = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    fetch('http://localhost:8080/api/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: this.email }),
    })
    .then(async res => {
      let data: any = {};
      try { data = await res.json(); } catch { /* empty */ }

      this.loading = false;

      if (res.ok) {
        this.successMessage = data?.message || 'Reset link sent! Please check your email.';
      } else if (res.status === 404 || res.status === 400) {
        this.errorMessage = 'No account found with that email address.';
      } else if (res.status >= 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = data?.message || 'Something went wrong. Please try again.';
      }

      this.cdr.detectChanges();
    })
    .catch(() => {
      this.loading = false;
      this.errorMessage = 'Cannot reach the server. Please check your connection.';
      this.cdr.detectChanges();
    });
  }
}