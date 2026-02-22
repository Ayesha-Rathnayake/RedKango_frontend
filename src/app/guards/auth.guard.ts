import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  const returnUrl = router.url || '/';
  return router.createUrlTree(['/auth-intent'], { queryParams: { returnUrl } });
};