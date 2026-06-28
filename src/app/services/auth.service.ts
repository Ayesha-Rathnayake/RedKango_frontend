import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { APP_CONFIG } from '../config/app-config.token';
import {
  ApiMessage,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  JwtPayload,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
} from '../models/auth.model';
import { TermsCondition } from '../models/terms.model';

function getJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function isJwtValid(token: string, skewSeconds = 10): boolean {
  const payload = getJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now + skewSeconds;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private cfg = inject(APP_CONFIG);

  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token && isJwtValid(token);
  }

  login(email: string, password: string, rememberMe = false): Observable<AuthResponse> {
    const body: LoginRequest = { email, password, rememberMe };

    return this.http
      .post<AuthResponse>(`${this.cfg.apiBaseUrl}/api/auth/login`, body)
      .pipe(tap((res) => this.saveSession(res)));
  }

  signup(body: RegisterRequest): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${this.cfg.apiBaseUrl}/api/auth/register`, body);
  }

  forgotPassword(email: string): Observable<ApiMessage> {
    const body: ForgotPasswordRequest = { email };

    return this.http.post<ApiMessage>(
      `${this.cfg.apiBaseUrl}/api/auth/forgot-password`,
      body
    );
  }

  resetPassword(token: string, newPassword: string): Observable<ApiMessage> {
    const body: ResetPasswordRequest = { token, newPassword };

    return this.http.post<ApiMessage>(
      `${this.cfg.apiBaseUrl}/api/auth/reset-password`,
      body
    );
  }

  resendVerification(email: string): Observable<ApiMessage> {
    const body: ResendVerificationRequest = { email };

    return this.http.post<ApiMessage>(
      `${this.cfg.apiBaseUrl}/api/auth/resend-verification`,
      body
    );
  }

  verify(token: string): Observable<ApiMessage> {
    const params = new HttpParams().set('token', token);

    return this.http.get<ApiMessage>(`${this.cfg.apiBaseUrl}/api/auth/verify`, {
      params,
    });
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    const body: RefreshRequest = { refreshToken };

    return this.http
      .post<AuthResponse>(`${this.cfg.apiBaseUrl}/api/auth/refresh`, body)
      .pipe(tap((res) => this.saveSession(res)));
  }

  getActiveTerms(): Observable<TermsCondition> {
    return this.http.get<TermsCondition>(`${this.cfg.apiBaseUrl}/api/terms/active`);
  }

  backendLogout(): Observable<ApiMessage> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return of({ message: 'No refresh token' });
    }

    const body: RefreshRequest = { refreshToken };

    return this.http.post<ApiMessage>(`${this.cfg.apiBaseUrl}/api/auth/logout`, body);
  }

  logout(redirectToLogin = true): void {
    this.backendLogout()
      .pipe(finalize(() => this.clearLocalAndRedirect(redirectToLogin)))
      .subscribe({ error: () => {} });
  }

  clearLocalAndRedirect(redirectToLogin = true): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('roles');
    localStorage.removeItem('user');

    if (redirectToLogin) {
      window.location.href = '/login';
    }
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('roles', JSON.stringify(res.roles ?? []));
    localStorage.setItem(
      'user',
      JSON.stringify({
        email: res.email,
        name: res.fullName,
      })
    );
  }

}
