import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadChildren: () => import('./features/auth/routes'),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/routes'),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/routes'),
    canActivate: [authGuard],
  },
  {
    path: 'schools',
    loadChildren: () => import('./features/schools/routes'),
    canActivate: [authGuard],
  },
];
