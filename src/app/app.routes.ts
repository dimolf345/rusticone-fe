import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './core/constants/routes.constant';
import { isAdminGuard, isNotLoggedGuard } from './core/guards';
import { Layout } from './core/layout/layout';

export const routes: Routes = [
  {
    path: ROUTE_SEGMENTS.ROOT,
    redirectTo: ROUTE_SEGMENTS.LANDING,
    pathMatch: 'full',
  },
  {
    path: ROUTE_SEGMENTS.LANDING,
    loadComponent: () => import('./features/landing/landing'),
  },
  {
    path: ROUTE_SEGMENTS.LOGIN,
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
    canActivate: [isNotLoggedGuard]
  },
  {
    path: ROUTE_SEGMENTS.REGISTER,
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: ROUTE_SEGMENTS.DASHBOARD,
    component: Layout,
    canActivate: [], // place authGuard here
    children: [
      {
        path: ROUTE_SEGMENTS.ADMIN,
        canActivate: [isAdminGuard],
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
          },
          {
            path: ROUTE_SEGMENTS.MENU,
            loadComponent: () => import('./features/admin/admin-menu/admin-menu')
          },
          {
            path: ROUTE_SEGMENTS.QUOTES,
            loadComponent: () => import('./features/admin/admin-quotes/admin-quotes')
          }
        ]
      },
      {
        path: ROUTE_SEGMENTS.CUSTOMER,
        loadComponent: () =>
          import('./features/customer/customer-dashboard.component').then((m) => m.CustomerDashboardComponent),
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component')
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component'),
  },
];

