import { Routes } from '@angular/router';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./schools-page').then(m => m.SchoolsPageComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./school-detail').then(m => m.SchoolDetail),
      },
      {
        path: ':schoolId/branches',
        loadComponent: () => import('./branches/branches-page').then(m => m.BranchesPage),
      },
      {
        path: ':schoolId/branches/:id',
        loadComponent: () => import('./branches/branch-detail').then(m => m.BranchDetailComponent),
      },
    ],
  },
] satisfies Routes;
