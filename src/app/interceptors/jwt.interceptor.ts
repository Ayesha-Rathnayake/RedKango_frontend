import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, Subject, from, of, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { APP_CONFIG } from '../config/app-config.token';

let refreshing = false;
const refreshSubject = new Subject<string | null>();

const AUTH_URL_FRAGMENTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify',
  '/api/auth/logout',
];

function isAuthUrl(url: string): boolean {
  return AUTH_URL_FRAGMENTS.some(fragment => url.includes(fragment));
}

function clearLocalSession(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const cfg = inject(APP_CONFIG);

  // Auth endpoints → pass straight through, zero interception
  if (isAuthUrl(req.url)) {
    return next(req);
  }

  // Attach Bearer token to all other API calls
  const accessToken = localStorage.getItem('accessToken');
  const authedReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
      const alreadyRetried = req.headers.has('X-Refresh-Attempt');

      if (err.status === 401 && !alreadyRetried) {
        return handleRefresh(cfg.apiBaseUrl, authedReq, next, err);
      }

      return throwError(() => err);
    })
  );
};

function handleRefresh(
  apiBaseUrl: string,
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn,
  originalErr: HttpErrorResponse
): Observable<HttpEvent<unknown>> {

  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    clearLocalSession();
    window.location.href = '/login';
    return throwError(() => originalErr);
  }

  if (refreshing) {
    return refreshSubject.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap((newToken: string): Observable<HttpEvent<unknown>> => {
        const retried = originalReq.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
            'X-Refresh-Attempt': '1',
          },
        });
        return next(retried);
      })
    );
  }

  refreshing = true;

  return from(
    fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  ).pipe(
    switchMap(
      (resp: Response): Observable<any> =>
        resp.ok ? from(resp.json()) : of(null)
    ),
    tap((data: any) => {
      refreshing = false;
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        refreshSubject.next(data.accessToken);
      } else {
        clearLocalSession();
        refreshSubject.next(null);
      }
    }),
    switchMap((data: any): Observable<HttpEvent<unknown>> => {
      if (!data?.accessToken) {
        clearLocalSession();
        window.location.href = '/login';
        return throwError(() => originalErr);
      }
      const retried = originalReq.clone({
        setHeaders: {
          Authorization: `Bearer ${data.accessToken}`,
          'X-Refresh-Attempt': '1',
        },
      });
      return next(retried);
    }),
    catchError((): Observable<HttpEvent<unknown>> => {
      refreshing = false;
      clearLocalSession();
      window.location.href = '/login';
      return throwError(() => originalErr);
    })
  );
}