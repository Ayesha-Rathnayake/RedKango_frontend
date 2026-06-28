import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  showResendForm = false;
  resendEmail = '';
  resendLoading = false;
  resendError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    if (params.get('verified')) {
      this.successMessage = 'Email verified! You can now log in.';
    }

    if (params.get('verifyError') === 'expired') {
      this.errorMessage = 'Your verification link has expired.';
      this.showResendForm = true;
      this.resendEmail = params.get('email') ?? '';
    } else if (params.get('verifyError')) {
      this.errorMessage = 'Verification link is invalid or already used.';
      this.showResendForm = true;
    }

    if (params.get('passwordReset')) {
      this.successMessage = 'Password reset successful. Please log in.';
    }
  }

  login(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.loading = true;

    this.authService.login(this.email.trim(), this.password, this.rememberMe).subscribe({
      next: (res) => {
        this.loading = false;

        const roles = res.roles ?? [];

        if (roles.includes('ROLE_ADMIN')) {
          window.location.href = 'http://localhost:4201';
        } else if (roles.includes('ROLE_CUSTOMER')) {
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = 'Unknown role. Please contact support.';
        }

        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.loading = false;

        if (err instanceof HttpErrorResponse) {
          const status = err.status;
          const msg: string = err.error?.message ?? '';

          if (status === 401) {
            if (msg === 'Account not verified') {
              this.errorMessage =
                'Your account is not verified. Please check your email or resend the link below.';
              this.showResendForm = true;
              this.resendEmail = this.email;
            } else if (msg === 'Account locked') {
              this.errorMessage = 'Your account has been locked. Please contact support.';
            } else {
              this.errorMessage = 'Invalid email or password. Please try again.';
            }
          } else if (status >= 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = msg || 'Login failed. Please try again.';
          }
        } else {
          this.errorMessage = 'Cannot reach the server. Please check your connection.';
        }

        this.cdr.detectChanges();
      },
    });
  }

  resendVerification(): void {
    this.resendError = '';

    if (!this.resendEmail || !this.resendEmail.includes('@')) {
      this.resendError = 'Please enter a valid email address.';
      return;
    }

    this.resendLoading = true;

    this.authService.resendVerification(this.resendEmail.trim()).subscribe({
      next: (res) => {
        this.resendLoading = false;
        this.showResendForm = false;
        this.errorMessage = '';
        this.successMessage =
          res.message || `A new verification email has been sent to ${this.resendEmail}.`;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.resendLoading = false;

        if (err instanceof HttpErrorResponse) {
          const msg: string = err.error?.message ?? '';

          if (err.status === 400 && msg.includes('already verified')) {
            this.resendError = 'This account is already verified. You can log in directly.';
          } else {
            this.resendError = msg || 'Failed to send. Please try again.';
          }
        } else {
          this.resendError = 'Cannot reach the server. Please check your connection.';
        }

        this.cdr.detectChanges();
      },
    });
  }

  toggleResendForm(): void {
    this.showResendForm = !this.showResendForm;
    this.resendError = '';

    if (this.showResendForm && !this.resendEmail) {
      this.resendEmail = this.email;
    }
  }
}