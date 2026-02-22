import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email          = '';
  password       = '';
  showPassword   = false;
  loading        = false;
  errorMessage   = '';
  successMessage = '';

  constructor(
    private router: Router,
    private route:  ActivatedRoute,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap;
    if (p.get('verified'))      this.successMessage = 'Email verified! You can now log in.';
    if (p.get('verifyError'))   this.errorMessage   = 'Verification link is invalid or expired.';
    if (p.get('passwordReset')) this.successMessage = 'Password reset successful. Please log in.';
  }

  login(form: NgForm): void {
    this.errorMessage   = '';
    this.successMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    fetch('http://localhost:8080/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: this.email, password: this.password }),
    })
    .then(async res => {
      let data: any = {};
      try { data = await res.json(); } catch { /* empty */ }

      if (res.ok) {
        localStorage.setItem('accessToken',  data.accessToken  ?? '');
        localStorage.setItem('refreshToken', data.refreshToken ?? '');
        localStorage.setItem('user', JSON.stringify({ email: data.email, name: data.fullName }));
        this.loading = false;
        this.cdr.detectChanges();
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
        return;
      }

      const msg: string = data?.message ?? '';
      this.loading = false;
      if (res.status === 401) {
        this.errorMessage = msg === 'Account not verified'
          ? 'Your account is not verified. Please check your email.'
          : msg === 'Account locked'
          ? 'Your account has been locked. Please contact support.'
          : 'Invalid email or password. Please try again.';
      } else if (res.status >= 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = msg || 'Login failed. Please try again.';
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