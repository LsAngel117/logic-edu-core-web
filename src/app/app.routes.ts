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
];
