import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  password            = '';
  confirmPassword     = '';
  showPassword        = false;
  showConfirmPassword = false;
  token               = '';
  tokenMissing        = false;
  successMessage      = '';
  errorMessage        = '';
  loading             = false;
  passwordMismatch    = false;
  passwordStrength    = 0;

  get strengthLabel():      string { return ['','Weak','Fair','Good','Strong'][this.passwordStrength] || ''; }
  get strengthColorClass(): string { return ['','text-red-500','text-yellow-500','text-blue-500','text-green-600'][this.passwordStrength] || ''; }
  get strengthBarClass():   string { return ['','bg-red-400','bg-yellow-400','bg-blue-400','bg-green-500'][this.passwordStrength] || ''; }

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.tokenMissing = true;
      this.errorMessage = 'No reset token found. Please request a new password reset link.';
    }
  }

  onPasswordInput() {
    const pw = this.password;
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    this.passwordStrength = s;
    if (this.confirmPassword) this.passwordMismatch = pw !== this.confirmPassword;
  }

  onConfirmInput() {
    this.passwordMismatch = !!this.confirmPassword && this.password !== this.confirmPassword;
  }

  resetPassword(form: NgForm): void {
    this.errorMessage    = '';
    this.successMessage  = '';
    this.passwordMismatch = false;

    if (form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
    if (!this.token) {
      this.errorMessage = 'Reset token is missing. Please use the link from your email.';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    fetch('http://localhost:8080/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token: this.token, newPassword: this.password }),
    })
    .then(async res => {
      let data: any = {};
      try { data = await res.json(); } catch { /* empty */ }

      this.loading = false;

      if (res.ok) {
        this.successMessage = data?.message || 'Password reset successful!';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login'], {
          queryParams: { passwordReset: 'true' }
        }), 2500);
        return;
      }

      const msg: string = data?.message ?? '';
      if (res.status === 400) {
        this.errorMessage = msg.toLowerCase().includes('expired')
          ? 'This reset link has expired. Please request a new one.'
          : msg || 'Invalid reset link. Please request a new one.';
      } else if (res.status >= 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = msg || 'Password reset failed. Please try again.';
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