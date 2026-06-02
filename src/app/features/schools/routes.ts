import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth';

export default [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./schools-page').then(m => m.SchoolsPageComponent),
      },
      {
        path: ':schoolId/branches',
        loadComponent: () => import('./branches-placeholder').then(m => m.BranchesPlaceholderComponent),
      },
    ],
  },
] satisfies Routes;
