import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest, ApiErrorResponse } from '../../../models/auth.model';
import { TermsCondition } from '../../../models/terms.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  form: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  };

  confirmPassword = '';
  agree = false;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;

  errorMessage = '';
  successMessage = '';
  emailTakenError = '';
  passwordMismatch = false;
  serverFieldErrors: Record<string, string> = {};

  showTermsModal = false;
  termsLoading = false;
  activeTerms: TermsCondition | null = null;
  termsError = '';

  passwordStrength = 0;

  get strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength] || '';
  }

  get strengthColorClass(): string {
    return (
      ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600'][
        this.passwordStrength
      ] || ''
    );
  }

  get strengthBarClass(): string {
    return (
      ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][this.passwordStrength] ||
      ''
    );
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  continueWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  continueWithFacebook(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
  }

  onPasswordInput(): void {
    const pw = this.form.password;
    let score = 0;

    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    this.passwordStrength = score;

    if (this.confirmPassword) {
      this.passwordMismatch = pw !== this.confirmPassword;
    }
  }

  onConfirmInput(): void {
    this.passwordMismatch = !!this.confirmPassword && this.form.password !== this.confirmPassword;
  }

  onEmailInput(): void {
    this.emailTakenError = '';
    delete this.serverFieldErrors['email'];
  }

  openTermsModal(): void {
    this.termsError = '';
    this.termsLoading = true;
    this.showTermsModal = true;

    this.authService.getActiveTerms().subscribe({
      next: (res) => {
        this.activeTerms = res;
        this.termsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.termsError = 'Terms & Conditions are not available right now.';
        this.termsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }

  signup(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.emailTakenError = '';
    this.serverFieldErrors = {};
    this.passwordMismatch = false;

    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
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

    this.authService.signup(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage =
          res.message || 'Account created! Please check your email to verify your account.';

        this.confirmPassword = '';
        this.passwordStrength = 0;
        this.agree = false;

        form.resetForm();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.loading = false;

        if (err instanceof HttpErrorResponse) {
          const errorBody = err.error as ApiErrorResponse;
          const msg = errorBody?.message ?? '';

          if (err.status === 409) {
            this.emailTakenError = 'This email is already registered. Try logging in instead.';
          } else if (err.status === 400 && errorBody?.errors) {
            this.serverFieldErrors = errorBody.errors;
            this.errorMessage = 'Please fix the highlighted errors below.';
          } else if (err.status >= 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = msg || 'Registration failed. Please try again.';
          }
        } else {
          this.errorMessage = 'Cannot reach the server. Please check your connection.';
        }

        this.cdr.detectChanges();
      },
    });
  }
}
