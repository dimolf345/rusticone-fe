import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../../core/constants/routes.constant';
import { isNotLoggedGuard } from '../../core/guards';

export const AUTH_ROUTES: Routes = [
  {
    path: ROUTE_SEGMENTS.LOGIN,
    loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
    canActivate: [isNotLoggedGuard],
  },
  {
    path: ROUTE_SEGMENTS.REGISTER,
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent),
  },
];

export default AUTH_ROUTES;
