import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_PATHS } from '../constants/routes.constant';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  return user ? true : router.createUrlTree([APP_PATHS.LOGIN]);
};

export const isNotLoggedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const user = authService.currentUser();
  if (!user) {
    return true;
  } else {
    return authService.redirectUserByRole();
  }
};

export const isAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAdmin = authService.isAdmin();

  return isAdmin || router.createUrlTree(['/not-found']);
};
