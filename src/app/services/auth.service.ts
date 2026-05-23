import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { APP_CONFIG } from '../config/app-config.token';
import { tap, finalize } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  email: string;
  fullName: string;
    roles: string[]; 
};

/** ---- Inline JWT helpers (expiry-aware isLoggedIn) ---- */
function getJwtPayload(token: string): any | null {
  try {
    const payloadBase64 = token.split('.')[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function isJwtValid(token: string, skewSeconds = 10): boolean {
  const p = getJwtPayload(token);
  if (!p || typeof p.exp !== 'number') return false;
  const now = Math.floor(Date.now() / 1000);
  return p.exp > (now + skewSeconds);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private cfg = inject(APP_CONFIG);

  /** True only if access token exists AND not expired */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token && isJwtValid(token);
  }

login(email: string, password: string, rememberMe = false) {
  return this.http
    .post<AuthResponse>(`${this.cfg.apiBaseUrl}/api/auth/login`, { email, password, rememberMe })
    .pipe(tap(res => this.saveSession(res)));
}

private saveSession(res: AuthResponse) {
  localStorage.setItem('accessToken',  res.accessToken);
  localStorage.setItem('refreshToken', res.refreshToken);
  localStorage.setItem('roles', JSON.stringify(res.roles ?? []));  // ← add this line
  localStorage.setItem('user', JSON.stringify({ email: res.email, name: res.fullName }));
}


  signup(body: { firstName: string; lastName: string; email: string; phone: string; password: string }) {
    return this.http.post<{ message: string }>(`${this.cfg.apiBaseUrl}/api/auth/register`, body);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.cfg.apiBaseUrl}/api/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.cfg.apiBaseUrl}/api/auth/reset-password`, { token, newPassword });
  }

  verify(token: string) {
    const params = new HttpParams().set('token', token);
    return this.http.get<{ message: string }>(`${this.cfg.apiBaseUrl}/api/auth/verify`, { params });
  }

  /** Revoke this session’s refresh token on the backend */
  backendLogout(): Observable<{ message: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of({ message: 'No refresh token' });
    return this.http.post<{ message: string }>(`${this.cfg.apiBaseUrl}/api/auth/logout`, { refreshToken });
  }

  /** Clear local storage and (optionally) redirect to /login */
  clearLocalAndRedirect(redirectToLogin = true) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
      localStorage.removeItem('roles');
    localStorage.removeItem('user');
    if (redirectToLogin) {
      window.location.href = '/login';
    }
  }

  /** Logout this device: revoke refresh on server, then clear local */
  logout(redirectToLogin = true) {
    this.backendLogout()
      .pipe(finalize(() => this.clearLocalAndRedirect(redirectToLogin)))
      .subscribe({ error: () => {/* ignore: still clear locally */} });
  }

  /** (Optional) Logout all devices for this user (if you added /logout-all) */
  logoutAll(redirectToLogin = true) {
    this.http.post<{ message: string }>(`${this.cfg.apiBaseUrl}/api/auth/logout-all`, {})
      .pipe(finalize(() => this.clearLocalAndRedirect(redirectToLogin)))
      .subscribe({ error: () => this.clearLocalAndRedirect(redirectToLogin) });
  }
}