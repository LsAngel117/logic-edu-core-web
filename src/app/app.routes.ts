import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth';
import { LayoutRouter } from './core/layouts/layout-router/layout-router';

export const routes: Routes = [
  // Login — outside layout, no guard (auth check is in LoginComponent effect)
  {
    path: 'auth/login',
    loadChildren: () => import('./features/auth/routes'),
  },
  // Authenticated routes — wrapped in LayoutRouter
  {
    path: '',
    component: LayoutRouter,
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
