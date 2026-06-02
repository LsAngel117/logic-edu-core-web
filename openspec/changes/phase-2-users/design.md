# Design: Phase 2 — Users & Memberships

## Technical Approach

Two lazy-loaded feature routes (`/users`, `/users/:id`) with signal-based services calling REST endpoints. Components own data via `signal()` + `effect()` — no cross-component store. Material table with server-side sort/filter, ReactiveForms dialogs for CRUD, inline status toggle with confirmation. Memberships live under `features/users/memberships/` (no standalone route; always contextual to a user). Follows Phase 1 conventions: `OnPush`, `inject()`, no lifecycle hooks, no file suffixes.

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|---|---|---|---|
| Feature structure | `features/users/` with `memberships/` sub-directory | Memberships have no independent route; always contextual to user detail | **Sub-directory** |
| (alt) | Separate `features/memberships/` | Extra feature module with zero routes — unnecessary indirection | Rejected |
| Memberships endpoint | `MembershipsService` calls `GET /api/v1/memberships?userId=`, `POST`, `DELETE` | Flat endpoints per proposal; filtering via query param | **Per proposal** |
| (alt) | Nest under user (`/api/v1/users/:id/memberships`) | Simpler URL but mixes concerns in backend | Rejected (proposal canonical) |
| Table strategy | `mat-table` + `MatSort` + `MatPaginator` | Server-side sort/filter; matches spec requirement for sortable columns | **mat-table** |
| (alt) | Simple list with frontend sort | No pagination; breaks with >20 users | Rejected |
| State management | Local `signal()` per component, service methods return `Promise` | No shared store; each component owns its data independently | **Local signals** |
| (alt) | `signalStore` / NgRx | Over-engineering for 2 routes with independent data needs | Rejected |
| Service split | `UsersService` + `MembershipsService` | Each maps to a distinct backend resource; clear separation | **Two services** |
| (alt) | Single `UsersService` | Eventually grows too large; memberships have dedicated endpoints | Rejected |

## Data Flow

```
UsersList ──effect()──► UsersService.list() ──► GET /api/v1/users
     │ click row
     ▼
Router ──► UserDetail ──effect()──► UsersService.get(id) ──► GET /api/v1/users/:id
                │
                └──effect()──► MembershipsService.list(userId) ──► GET /api/v1/memberships?userId=

UserCreate dialog ──submit()──► UsersService.create(payload) ──► POST /api/v1/users
                   ◄── close + refresh signal ◄──

Status toggle ──confirm()──► UsersService.patchStatus(id, status) ──► PATCH /api/v1/users/:id/status
              ◄── update local signal ◄──

MembershipAdd dialog ──submit()──► MembershipsService.create(payload) ──► POST /api/v1/memberships
                     ◄── refresh panel signal ◄──

MembershipRemove chip ──confirm()──► MembershipsService.delete(id) ──► DELETE /api/v1/memberships/:id
                      ◄── remove from panel signal ◄──
```

## Route Configuration

```typescript
// app.routes.ts (added)
{
  path: 'users',
  loadChildren: () => import('./features/users/routes'),
  canActivate: [authGuard],
}

// features/users/routes.ts (new)
export default [
  { path: '', component: UsersList },
  { path: ':id', component: UserDetail },
] as Routes;
```

## Models

```typescript
// features/users/models/user-profile.ts
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  status: 'active' | 'inactive';
  createdAt: string;       // ISO date
}
// Note: distinct from core User (no token; adds status, createdAt)

// features/users/models/payloads.ts
interface CreateUserPayload {
  email: string;
  displayName: string;
  password: string;
  roles: string[];
}
interface UpdateUserPayload {
  email: string;
  displayName: string;
  roles: string[];
}
interface ChangePasswordPayload {
  newPassword: string;
}

// features/users/memberships/models/membership.ts
interface Membership {
  id: string;
  userId: string;
  role: string;
  scope: string;
  effectivePermissions: string[];
}
interface AddMembershipPayload {
  userId: string;
  role: string;
  scope: string;
}
```

## File Manifest

| File | Action | Description |
|---|---|---|
| `src/app/features/users/models/user-profile.ts` | Create | `UserProfile` interface |
| `src/app/features/users/models/payloads.ts` | Create | `CreateUserPayload`, `UpdateUserPayload`, `ChangePasswordPayload` |
| `src/app/features/users/services/users.ts` | Create | `UsersService`: list/get/create/update/patchStatus/changePassword |
| `src/app/features/users/services/users.spec.ts` | Create | Service tests (mock HttpClient) |
| `src/app/features/users/users-list.ts` | Create | List page: mat-table, sort, search, status toggle inline |
| `src/app/features/users/users-list.html` | Create | Template for list page |
| `src/app/features/users/users-list.scss` | Create | Styles for list page |
| `src/app/features/users/users-list.spec.ts` | Create | Component integration tests |
| `src/app/features/users/user-create.ts` | Create | Create user dialog (ReactiveForms) |
| `src/app/features/users/user-create.spec.ts` | Create | Dialog tests |
| `src/app/features/users/user-edit.ts` | Create | Edit user dialog (pre-filled ReactiveForms) |
| `src/app/features/users/user-edit.spec.ts` | Create | Dialog tests |
| `src/app/features/users/user-password.ts` | Create | Change password dialog |
| `src/app/features/users/user-password.spec.ts` | Create | Dialog tests |
| `src/app/features/users/user-detail.ts` | Create | Detail page: profile card + memberships panel |
| `src/app/features/users/user-detail.html` | Create | Template for detail page |
| `src/app/features/users/user-detail.scss` | Create | Styles for detail page |
| `src/app/features/users/user-detail.spec.ts` | Create | Component tests |
| `src/app/features/users/routes.ts` | Create | Lazy routes: `/users`, `/users/:id` |
| `src/app/features/users/memberships/models/membership.ts` | Create | `Membership`, `AddMembershipPayload` |
| `src/app/features/users/memberships/services/memberships.ts` | Create | `MembershipsService`: list/create/delete |
| `src/app/features/users/memberships/services/memberships.spec.ts` | Create | Service tests |
| `src/app/features/users/memberships/memberships-panel.ts` | Create | Panel: membership chips, add/remove |
| `src/app/features/users/memberships/memberships-panel.html` | Create | Template for panel |
| `src/app/features/users/memberships/memberships-panel.spec.ts` | Create | Component tests |
| `src/app/features/users/memberships/membership-add.ts` | Create | Add membership dialog |
| `src/app/features/users/memberships/membership-add.spec.ts` | Create | Dialog tests |
| `src/app/app.routes.ts` | Modify | Add `/users` lazy route with `authGuard` |

**Create**: 26, **Modify**: 1, **Delete**: 0.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| `UsersService` | CRUD + status + password endpoints | `TestBed.inject()` + `HttpTestingController`, mock each HTTP verb, verify body/URL |
| `MembershipsService` | list/create/delete endpoints | Same pattern; verify `userId` query param on list |
| `UsersList` | Table renders, sort triggers API, search debounces, status toggle with confirm, error banner | `TestBed.createComponent()`, mock services, `fixture.detectChanges()`, assert DOM |
| `UserCreate` / `UserEdit` / `UserPassword` | Validation, submit calls service, error display (409, 403, 422), dialog closes on success | Mock `MatDialogRef`, inject mock service, trigger submit, assert dialog state |
| `UserDetail` | Loads user profile, renders memberships panel, handles 404 | Mock both services, verify panel integration |
| `MembershipsPanel` | Chip rendering, add button, remove confirm, loading/error/empty states | Mock `MembershipsService`, `MatDialog`, assert chip count and text |
| `MembershipAdd` | Role/scope selection, submit, duplicate 409, 403 | Mock dialog ref + service, verify payload |

Test runner: `bun ng test` (Vitest). TDD enforced per `config.yaml`.

## Code Conventions

Same as Phase 1: `OnPush`, `inject()`, `effect()` for data loading, ReactiveForms for all forms, signals for state, no file suffixes, no lifecycle hooks. `MatDialog` for all dialogs; `MatSnackBar` for success/error feedback. Error handling: services throw `HttpErrorResponse`; components catch in try/catch and set local `error` signals.

## Open Questions

- [ ] Role/scope reference data (dropdown options for create/edit dialogs) — assume hardcoded enums for Phase 2, backend-driven in Phase 2+
- [ ] Memberships effective permissions tooltip content — assume `effectivePermissions` string array from backend

## Rollout

No migration. Additive change. Remove route entry and `features/users/` directory to revert.
