# Design: Phase 1 — Authentication

## Technical Approach

JWT auth pipeline: signal-based `AuthService` with synchronous localStorage rehydration (constructor), functional `HttpInterceptorFn` for Bearer injection, functional `CanActivateFn` guard, and a `ReactiveForms` login component. All services use `inject()`, all components use `OnPush`, no lifecycle hooks.

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|---|---|---|---|
| Session rehydration | `AuthService` constructor | Sync read of localStorage; no DI config; runs before routing resolves | **constructor** |
| (alt) | `APP_INITIALIZER` | Blocks app until promise resolves; localStorage is sync, so init is wasted | Rejected |
| (alt) | `effect()` in `App` | Runs after first paint → flash of unauthenticated state before redirect | Rejected |
| JWT decode | Manual `atob` + `JSON.parse` | Zero dependencies, ~12 lines, handles base64url conversion | **Manual** |
| (alt) | `jwt-decode` package | ~2 KB dependency; unjustified for extracting 4 claims | Rejected |
| Token storage | `localStorage` | Persists across tabs/refresh; matches spec and proposal | **localStorage** |
| (alt) | `sessionStorage` | Cleared on tab close; user re-logins per tab | Rejected |
| Login form | `ReactiveFormsModule` | Typed `FormControl`, `Validators`, native `mat-form-field` binding | **ReactiveForms** |
| (alt) | Template-driven | No compile-time safety; `ngModel` is untyped | Rejected |
| (alt) | Signals-based forms | Immature; no Angular Material integration | Rejected |

## Data Flow

```
LoginComponent        AuthService          HttpClient        Backend
     │                    │                    │                │
     ├─ onSubmit() ──────►│                    │                │
     │                    ├─ POST /auth/login ─►───────────────►│
     │                    │◄─────── JWT ────────┤                │
     │                    ├─ localStorage.setItem()              │
     │                    ├─ user.set(response)                  │
     │◄── navigate('/dashboard') ───────────────┤                │
     │                                               │            │
     │  [subsequent requests]                        │            │
     │                    AuthInterceptor ◄──────────┤            │
     │                    ├─ inject(AuthService)     │            │
     │                    ├─ token = user().token    │            │
     │                    ├─ clone + Bearer ────────►───────────►│
     │                    │                    │                │
     │                    │  [on 401]          │                │
     │                    ├─ auth.logout()     │                │
```

**Guard flow**: Router → `canActivate: [authGuard]` → `inject(AuthService).isAuthenticated()` → `true` / `UrlTree('/auth/login')`.

**Bootstrap flow**: `bootstrapApplication(App)` → DI tree constructed → `AuthService` constructor → `restore()` reads localStorage → decodes JWT → sets `_user` signal → routing begins → guard reads signal.

## File Manifest

| File | Action | Description |
|---|---|---|
| `src/app/core/auth/user.ts` | Create | `User` interface (id, email, displayName, roles, token) |
| `src/app/core/auth/auth.ts` | Create | `AuthService`: login/logout, signals, localStorage, token decode |
| `src/app/core/auth/index.ts` | Create | Barrel re-exporting `User`, `AuthService` |
| `src/app/core/interceptors/auth.ts` | Create | `authInterceptor: HttpInterceptorFn` — Bearer header, 401→logout |
| `src/app/core/guards/auth.ts` | Create | `authGuard: CanActivateFn` — reads `isAuthenticated()`, returns `UrlTree` |
| `src/app/core/auth/auth.spec.ts` | Create | Service tests (mock HttpClient) |
| `src/app/core/interceptors/auth.spec.ts` | Create | Interceptor tests (`HttpTestingController`) |
| `src/app/core/guards/auth.spec.ts` | Create | Guard tests (mock AuthService) |
| `src/app/features/auth/login.ts` | Modify | Full ReactiveForms login: email+password fields, error display, loading state |
| `src/app/features/auth/login.spec.ts` | Modify | Full component tests: validation, success, error, redirect |
| `src/app/app.routes.ts` | Modify | Add `canActivate: [authGuard]` to `/dashboard` lazy route |
| `src/app/app.config.ts` | Modify | Add `withInterceptors([authInterceptor])` to `provideHttpClient()` |

**Create**: 8, **Modify**: 4, **Delete**: 0.

## Route Configuration

```typescript
// app.routes.ts (modified)
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadChildren: () => import('./features/auth/routes'),  // public — no guard
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/routes'),
    canActivate: [authGuard],  // ← added
  },
];
```

`authGuard` is applied at the parent lazy route to prevent loading dashboard code before auth check.

## Interfaces

```typescript
// user.ts
interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  token: string;        // raw JWT for interceptor use
}

// /auth/login POST body
interface LoginRequest {
  email: string;
  password: string;
}
```

## Testing Strategy

| Layer | Test | Approach |
|---|---|---|
| `AuthService` | login success stores token + sets signal | `TestBed.inject()` + mocked `HttpClient` (`HttpTestingController`) |
| `AuthService` | login 401 propagates error without mutating state | Mock 401 response |
| `AuthService` | logout clears storage + nulls signal | Call `logout()`, assert `localStorage` empty |
| `AuthService` | constructor restores from stored JWT | `localStorage.setItem()` before `TestBed.inject()` |
| `AuthService` | expired/invalid token cleared on restore | Store bad token, assert cleared |
| `authInterceptor` | adds Bearer when authenticated | `HttpTestingController`, mock `AuthService` with token |
| `authInterceptor` | passes through when not authenticated | mock `AuthService` without token |
| `authInterceptor` | 401 triggers `logout()` | Mock `next()` returning `HttpErrorResponse(401)` |
| `authGuard` | returns `true` when authenticated | Mock `isAuthenticated()` → `true` |
| `authGuard` | returns `UrlTree` when not | Mock `isAuthenticated()` → `false` |
| `LoginComponent` | empty form → validation errors shown | Fill nothing, click submit, assert `mat-error` |
| `LoginComponent` | successful login → navigates to `/dashboard` | Mock `AuthService.login()` returning `of(user)` |
| `LoginComponent` | 401 error → error message, no navigation | Mock `AuthService.login()` throwing `HttpErrorResponse` |
| `LoginComponent` | already authenticated → redirect to `/dashboard` | Mock `isAuthenticated()` → `true`, assert router state |

Test runner: `bun ng test` (Vitest via Angular builder). TDD flow enforced.

## Code Conventions

| Convention | How Applied |
|---|---|
| No `.component`/`.service` suffixes | `core/auth/auth.ts` not `auth.service.ts`; directory provides context |
| `inject()` over constructor DI | All services, interceptors, guards use `inject()` |
| `OnPush` | Every component (`login.ts` already has it) |
| No lifecycle hooks | Only `constructor` + `effect()` when reactivity needed |
| Signals | `user()` = `Signal<User | null>`, `isAuthenticated()` = `computed` |
| Standalone | All components remain standalone (Angular 21 default) |
| Feature-first structure | New code under `core/auth/`, `core/interceptors/`, `core/guards/` |

## Open Questions

None — all decisions resolved. Backend response shape will be adapted against actual endpoint when integrated.

## Rollout

No migration required. Additive change — remove `authGuard` from routes and `withInterceptors` from config to revert.
