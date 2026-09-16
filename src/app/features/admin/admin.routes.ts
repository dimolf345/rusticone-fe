import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../../core/constants/routes.constant';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: ROUTE_SEGMENTS.MENU,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./admin-menu/admin-menu'),
      },
      {
        path: ROUTE_SEGMENTS.NEW,
        loadComponent: () => import('./admin-menu/add-product/add-product'),
      },
    ],
  },
  {
    path: ROUTE_SEGMENTS.QUOTES,
    loadComponent: () => import('./admin-quotes/admin-quotes'),
  },
];

export default ADMIN_ROUTES;
