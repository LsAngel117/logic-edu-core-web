import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth';

export default [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./users-page').then(m => m.UsersPageComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./user-detail').then(m => m.UserDetailComponent),
      },
    ],
  },
] satisfies Routes;
