import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html'
})
export class SignupComponent {

  constructor(
    private router: Router,
    private cdr:    ChangeDetectorRef
  ) {}

  form = { firstName: '', lastName: '', email: '', phone: '', password: '' };

  confirmPassword     = '';
  agree               = false;
  showPassword        = false;
  showConfirmPassword = false;
  loading             = false;

  errorMessage      = '';
  successMessage    = '';
  emailTakenError   = '';
  passwordMismatch  = false;
  serverFieldErrors: Record<string, string> = {};

  passwordStrength  = 0;
  get strengthLabel():      string { return ['','Weak','Fair','Good','Strong'][this.passwordStrength] || ''; }
  get strengthColorClass(): string { return ['','text-red-500','text-yellow-500','text-blue-500','text-green-600'][this.passwordStrength] || ''; }
  get strengthBarClass():   string { return ['','bg-red-400','bg-yellow-400','bg-blue-400','bg-green-500'][this.passwordStrength] || ''; }

  continueWithGoogle()   { window.location.href = 'http://localhost:8080/oauth2/authorization/google'; }
  continueWithFacebook() { window.location.href = 'http://localhost:8080/oauth2/authorization/facebook'; }

  onPasswordInput() {
    const pw = this.form.password;
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    this.passwordStrength = s;
    if (this.confirmPassword) this.passwordMismatch = pw !== this.confirmPassword;
  }

  onConfirmInput() {
    this.passwordMismatch = !!this.confirmPassword && this.form.password !== this.confirmPassword;
  }

  onEmailInput() {
    this.emailTakenError = '';
    delete this.serverFieldErrors['email'];
  }

  signup(form: NgForm): void {
    this.errorMessage      = '';
    this.successMessage    = '';
    this.emailTakenError   = '';
    this.serverFieldErrors = {};
    this.passwordMismatch  = false;

    if (form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }
    if (this.form.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
    if (!this.agree) {
      this.errorMessage = 'You must agree to the Terms & Conditions to continue.';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const payload = { ...this.form };

    fetch('http://localhost:8080/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    .then(async res => {
      let data: any = {};
      try { data = await res.json(); } catch { /* empty */ }

      if (res.ok) {
        this.loading        = false;
        this.successMessage = data?.message || 'Account created! Please check your email to verify your account.';
        this.confirmPassword  = '';
        this.passwordStrength = 0;
        this.agree            = false;
        this.cdr.detectChanges();
        form.resetForm();
        return;
      }

      const msg: string = data?.message ?? '';
      this.loading = false;

      if (res.status === 409) {
        this.emailTakenError = 'This email is already registered. Try logging in instead.';
      } else if (res.status === 400 && data?.errors) {
        this.serverFieldErrors = data.errors as Record<string, string>;
        this.errorMessage = 'Please fix the highlighted errors below.';
      } else if (res.status >= 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = msg || 'Registration failed. Please try again.';
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