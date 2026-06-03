import { Routes } from '@angular/router';

export default [
  {
    path: '',
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
