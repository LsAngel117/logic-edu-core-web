import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth';
import { AppLayout } from './core/layouts/app-layout';

export const routes: Routes = [
  // Login — outside layout, no guard (auth check is in LoginComponent effect)
  {
    path: 'auth/login',
    loadChildren: () => import('./features/auth/routes'),
  },
  // Authenticated routes — wrapped in AppLayout
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/routes'),
      },
      {
        path: 'schools',
        loadChildren: () => import('./features/schools/routes'),
      },
    ],
  },
];
