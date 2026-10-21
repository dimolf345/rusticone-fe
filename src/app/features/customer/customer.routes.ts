import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./customer-dashboard.component').then((m) => m.CustomerDashboardComponent),
  },
];

export default CUSTOMER_ROUTES;
