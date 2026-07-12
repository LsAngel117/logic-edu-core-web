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
      {
        path: 'branches',
        loadComponent: () => import('./features/schools/branches/branches-list').then(m => m.BranchesListComponent),
      },
      {
        path: 'branches/:id',
        loadComponent: () => import('./features/schools/branches/branch-detail').then(m => m.BranchDetailComponent),
      },
      {
        path: 'memberships',
        loadComponent: () => import('./features/users/memberships/memberships-page').then(m => m.MembershipsPageComponent),
      },
      {
        path: 'academic/structures',
        loadComponent: () => import('./features/academic/structures/structures-page').then(m => m.StructuresPageComponent),
      },
    ],
  },
];
