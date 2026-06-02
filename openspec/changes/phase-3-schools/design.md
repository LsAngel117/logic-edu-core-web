# Design: Phase 3 — Schools & Branches

## Technical Approach

Two lazy-loaded feature modules mirroring the Phase 2 users pattern: `features/schools/` with a `branches/` sub-directory. Schools list at `/schools` with Material table + search/filter + status toggle. Branches list at `/schools/:schoolId/branches` with school-scoped CRUD. Signal-based services call REST endpoints. Components own data via `signal()` + `effect()` — no shared store. Branches have no standalone route; always contextual to a school (same pattern as memberships-to-user).

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|---|---|---|---|
| Feature structure | `features/schools/` with `branches/` sub-directory | Matches `users/memberships/` pattern; branches always contextual to school | **Sub-directory** |
| (alt) | Separate `features/branches/` | Extra feature module with parameterized route — unnecessary indirection | Rejected |
| Branch count source | From school response (`branchCount` field) | Spec says "from the response"; backend provides it on list | **School model optional field** |
| (alt) | Derived from `GET /api/v1/branches?schoolId=:id` call per row | N+1 requests for list page; breaks pagination | Rejected |
| Self-school identification | Derive admin school IDs from `MembershipsService.getByUser()` | Existing service; membership scope identifies school affiliation | **MembershipsService** |
| (alt) | Add schoolId to AuthService user model | Augments JWT payload; requires backend change — out of scope | Rejected |
| Status toggle cascade warning | Show active branch count in confirm dialog | Spec requires "This school has {n} active branches" warning | **branchCount from school response** |
| (alt) | Separate endpoint for active branch count | Extra network call; branchCount already on school object | Rejected |
| Table strategy | `mat-table` + `MatSort` + `MatPaginator` (follows Phase 2) | Server-side sort/filter; consistent with users page | **mat-table** |
| (alt) | Simple list with frontend sort | No pagination; breaks with >20 schools | Rejected |
| State management | Local `signal()` per component, service methods return `Observable` | Follows Phase 2; each component owns its data independently | **Local signals** |
| (alt) | `signalStore` / NgRx | Over-engineering for 2 routes with independent data needs | Rejected |

## Data Flow

```
SchoolsPage ──effect()──► SchoolsService.list(q?, status?) ──► GET /api/v1/schools
     │ click row "Branches"
     ▼
Router ──► BranchesPage ──effect()──► BranchesService.list(schoolId, q?, status?)
     │                                    ──► GET /api/v1/branches?schoolId=
     │
     └──effect()──► MembershipsService.getByUser(userId)
                    ──► derive adminSchoolIds (signal) for self-school protection

SchoolCreate dialog ──submit()──► SchoolsService.create(payload) ──► POST /api/v1/schools
                     ◄── close + refresh ◄──

SchoolEdit dialog ──submit()──► SchoolsService.update(id, payload) ──► PUT /api/v1/schools/:id
                   ◄── close + refresh ◄──

SchoolStatus dialog ──confirm()──► SchoolsService.updateStatus(id, status)
                     ◄── update row ◄──     ──► PATCH /api/v1/schools/:id/status

BranchCreate dialog ──submit()──► BranchesService.create(payload) ──► POST /api/v1/branches
                     ◄── close + refresh ◄──

BranchEdit dialog ──submit()──► BranchesService.update(id, payload) ──► PUT /api/v1/branches/:id
                   ◄── close + refresh ◄──

BranchStatus dialog ──confirm()──► BranchesService.updateStatus(id, status)
                     ◄── update row ◄──     ──► PATCH /api/v1/branches/:id/status
```

## Route Configuration

```typescript
// app.routes.ts (add entry)
{
  path: 'schools',
  loadChildren: () => import('./features/schools/routes'),
  canActivate: [authGuard],
}

// features/schools/routes.ts (new)
export default [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: SchoolsPage },
      {
        path: ':schoolId/branches',
        loadChildren: () => import('./branches/routes'),
      },
    ],
  },
] satisfies Routes;

// features/schools/branches/routes.ts (new)
export default [
  {
    path: '',
    children: [
      { path: '', component: BranchesPage },
    ],
  },
] satisfies Routes;
```

## Models

```typescript
// features/schools/models/school.ts
interface School {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  address?: string;
  branchCount?: number;
  createdAt: string;
}
interface CreateSchoolPayload { name: string; code: string; address?: string; }
interface UpdateSchoolPayload { name: string; code?: string; address?: string; }

// features/schools/branches/models/branch.ts
interface Branch {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  address?: string;
  schoolId: string;
  createdAt: string;
}
interface CreateBranchPayload { name: string; code: string; address?: string; schoolId: string; }
interface UpdateBranchPayload { name: string; code?: string; address?: string; }
```

## Self-School Protection

`SchoolsPage` loads current user's memberships via `MembershipsService.getByUser(userId)` in an `effect()`. It derives `adminSchoolIds: Signal<string[]>` by filtering memberships with `role === 'SCHOOL_ADMIN'` and extracting scope identifiers. PLATFORM_ADMIN sees no restriction. The computed set is passed as dialog data to `SchoolStatusDialogComponent`, which disables deactivation toggle when `school.id` is in `adminSchoolIds`, showing tooltip "Cannot deactivate your own school".

## File Manifest

| File | Action | Description |
|---|---|---|
| `src/app/features/schools/models/school.ts` | Create | `School`, `CreateSchoolPayload`, `UpdateSchoolPayload` |
| `src/app/features/schools/services/schools.ts` | Create | `SchoolsService`: list/get/create/update/updateStatus |
| `src/app/features/schools/services/schools.spec.ts` | Create | Service tests (HttpTestingController) |
| `src/app/features/schools/schools-page.ts` | Create | List page: mat-table, search, status filter, `branchCount` column |
| `src/app/features/schools/schools-page.html` | Create | Template for list page |
| `src/app/features/schools/schools-page.scss` | Create | Styles |
| `src/app/features/schools/schools-page.spec.ts` | Create | Component tests |
| `src/app/features/schools/dialogs/school-create.ts` | Create | Create dialog: name, code (format-validated), address |
| `src/app/features/schools/dialogs/school-create.spec.ts` | Create | Dialog tests |
| `src/app/features/schools/dialogs/school-edit.ts` | Create | Edit dialog: pre-filled, code read-only with warning |
| `src/app/features/schools/dialogs/school-edit.spec.ts` | Create | Dialog tests |
| `src/app/features/schools/dialogs/school-status.ts` | Create | Status toggle: cascade warning with branch count |
| `src/app/features/schools/dialogs/school-status.spec.ts` | Create | Dialog tests |
| `src/app/features/schools/routes.ts` | Create | Lazy routes: `/schools`, `/schools/:schoolId/branches` |
| `src/app/features/schools/branches/models/branch.ts` | Create | `Branch`, `CreateBranchPayload`, `UpdateBranchPayload` |
| `src/app/features/schools/branches/services/branches.ts` | Create | `BranchesService`: list/get/create/update/updateStatus |
| `src/app/features/schools/branches/services/branches.spec.ts` | Create | Service tests |
| `src/app/features/schools/branches/branches-page.ts` | Create | Branches list per school: mat-table, search, status filter, back nav |
| `src/app/features/schools/branches/branches-page.html` | Create | Template with breadcrumb |
| `src/app/features/schools/branches/branches-page.scss` | Create | Styles |
| `src/app/features/schools/branches/branches-page.spec.ts` | Create | Component tests |
| `src/app/features/schools/branches/dialogs/branch-create.ts` | Create | Create dialog: name, code, address, auto schoolId from route |
| `src/app/features/schools/branches/dialogs/branch-create.spec.ts` | Create | Dialog tests |
| `src/app/features/schools/branches/dialogs/branch-edit.ts` | Create | Edit dialog: pre-filled, code read-only |
| `src/app/features/schools/branches/dialogs/branch-edit.spec.ts` | Create | Dialog tests |
| `src/app/features/schools/branches/dialogs/branch-status.ts` | Create | Status toggle with confirmation |
| `src/app/features/schools/branches/dialogs/branch-status.spec.ts` | Create | Dialog tests |
| `src/app/features/schools/branches/routes.ts` | Create | Lazy sub-routes under `branches/` |
| `src/app/app.routes.ts` | Modify | Add `/schools` lazy route with `authGuard` |

**Create**: 27, **Modify**: 1, **Delete**: 0.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| `SchoolsService` | CRUD + status + query params | `TestBed.inject()` + `HttpTestingController`; verify `?q=` and `?status=` |
| `BranchesService` | CRUD + status + schoolId filter | Same pattern; verify `?schoolId=` query param |
| `SchoolsPage` | Table renders, search debounce, status filter chips, branch count column, 403/error banners, self-school disable | `TestBed.createComponent()`, mock services, assert DOM and signals |
| `SchoolCreate/Edit/Status` | Validation, submit calls service, 409/404/422 handling, cascade warning on deactivate | Mock `MatDialogRef` + `MAT_DIALOG_DATA`, verify payload and dialog state |
| `BranchesPage` | School-scoped list, search + filter, breadcrumb nav, back button, school 404 | Mock `BranchesService` + `ActivatedRoute` with param, assert DOM |
| `BranchCreate/Edit/Status` | Auto schoolId, validation, submit, duplicate/error handling | Mock dialog ref + service, verify `schoolId` in payload |

Test runner: `bun ng test` (Vitest). TDD enforced per `config.yaml`.

## Code Conventions

Follow Phase 1/2 conventions: `OnPush`, `inject()`, `effect()` for data loading, ReactiveForms for all forms, signals for state, no file suffixes, no lifecycle hooks. `MatDialog` for all dialogs; `MatSnackBar` for success/error feedback. Error handling: services throw `HttpErrorResponse`; components catch via `firstValueFrom().catch()` and set local `errorMessage` signals. Inline templates/styles in dialogs (as in EditUser). Separate `.html` + `.scss` files for page components (as in UsersPage).

## Open Questions

- [ ] Backend school list response: does it include `branchCount` or separate endpoint? Design assumes `branchCount` on `School`.
- [ ] School code format: what exact regex? Design uses alphanumeric + hyphens + uppercase client-side validation.

## Rollout

No migration. Additive change. Remove route entry in `app.routes.ts` and `features/schools/` directory to revert.
