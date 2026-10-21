import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './core/constants/routes.constant';
import { isAdminGuard } from './core/guards';
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
    path: '',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: ROUTE_SEGMENTS.DASHBOARD,
    component: Layout,
    canActivate: [], // place authGuard here
    children: [
      {
        path: ROUTE_SEGMENTS.ADMIN,
        canActivate: [isAdminGuard],
        loadChildren: () => import('./features/admin/admin.routes'),
      },
      {
        path: ROUTE_SEGMENTS.CUSTOMER,
        loadChildren: () => import('./features/customer/customer.routes'),
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component'),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component'),
  },
];
