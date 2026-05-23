import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email          = '';
  password       = '';
  rememberMe     = false;
  showPassword   = false;
  loading        = false;
  errorMessage   = '';
  successMessage = '';

  // ── Resend verification state ─────────────────────────────────────────────
  showResendForm = false;
  resendEmail    = '';
  resendLoading  = false;
  resendError    = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route:  ActivatedRoute,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap;

    if (p.get('verified')) {
      this.successMessage = 'Email verified! You can now log in.';
    }

    if (p.get('verifyError') === 'expired') {
      this.errorMessage   = 'Your verification link has expired.';
      this.showResendForm = true;
      this.resendEmail    = p.get('email') ?? '';   // pre-filled from redirect URL
    } else if (p.get('verifyError')) {
      this.errorMessage   = 'Verification link is invalid or already used.';
      this.showResendForm = true;
    }

    if (p.get('passwordReset')) {
      this.successMessage = 'Password reset successful. Please log in.';
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  login(form: NgForm): void {
    this.errorMessage   = '';
    this.successMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login(this.email, this.password, this.rememberMe).subscribe({

      next: (res) => {
        this.loading = false;
        const roles: string[] = res.roles ?? [];

        if (roles.includes('ROLE_ADMIN')) {
          window.location.href = 'http://localhost:4201';
        } else if (roles.includes('ROLE_CUSTOMER')) {
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = 'Unknown role. Please contact support.';
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        this.loading = false;
        const status = err.status;
        const msg: string = err.error?.message ?? '';

        if (status === 401) {
          if (msg === 'Account not verified') {
            this.errorMessage   = 'Your account is not verified. Please check your email or resend the link below.';
            this.showResendForm = true;
            this.resendEmail    = this.email;   // pre-fill from what they typed
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

        this.cdr.detectChanges();
      }
    });
  }

  // ── Resend verification email ─────────────────────────────────────────────

  resendVerification(): void {
    this.resendError = '';

    if (!this.resendEmail || !this.resendEmail.includes('@')) {
      this.resendError = 'Please enter a valid email address.';
      return;
    }

    this.resendLoading = true;
    this.cdr.detectChanges();

    fetch('http://localhost:8080/api/auth/resend-verification', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: this.resendEmail })
    })
    .then(async res => {
      this.resendLoading = false;
      const data: any = await res.json().catch(() => ({}));

      if (res.ok) {
        this.showResendForm = false;
        this.errorMessage   = '';
        this.successMessage = `A new verification email has been sent to ${this.resendEmail}. Please check your inbox.`;
      } else if (res.status === 400 && data?.message?.includes('already verified')) {
        this.resendError = 'This account is already verified. You can log in directly.';
      } else {
        this.resendError = data?.message || 'Failed to send. Please try again.';
      }
      this.cdr.detectChanges();
    })
    .catch(() => {
      this.resendLoading = false;
      this.resendError   = 'Cannot reach the server. Please check your connection.';
      this.cdr.detectChanges();
    });
  }

  toggleResendForm(): void {
    this.showResendForm = !this.showResendForm;
    this.resendError    = '';
    if (this.showResendForm && !this.resendEmail) {
      this.resendEmail = this.email;  // auto-fill from login email field
    }
  }
}