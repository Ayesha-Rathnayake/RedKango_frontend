import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ── Guard 1: checks if user is logged in (valid JWT) ─────────────────────────
export const authGuard: CanActivateFn = () => {
  const router  = inject(Router);
  const auth    = inject(AuthService);

  if (auth.isLoggedIn()) return true;

  // Not logged in → redirect to login, preserve the intended URL
  const returnUrl = router.url || '/';
  return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
};

// ── Guard 2: checks if logged-in user has the required role ──────────────────
// Usage in routes:  canActivate: [authGuard, roleGuard('ROLE_ADMIN')]
export const roleGuard = (requiredRole: string): CanActivateFn => () => {
  const router = inject(Router);
  const roles: string[] = JSON.parse(localStorage.getItem('roles') ?? '[]');

  if (roles.includes(requiredRole)) return true;

  // Wrong role → redirect to unauthorized page
  return router.createUrlTree(['/unauthorized']);
};