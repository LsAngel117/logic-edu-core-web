# Tasks: Phase 1 — Authentication

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~630 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Infrastructure) → PR 3 (Login UI) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | User model + AuthService + tests | PR 1 | Base = `main`. Testable in isolation. |
| 2 | Interceptor + Guard + route/config wiring + tests | PR 2 | Base = `main`. Depends on AuthService (PR 1). |
| 3 | Login component rewrite + tests | PR 3 | Base = `main`. Depends on AuthService (PR 1). |

## Phase 1: Foundation

- [x] 1.1 Create `src/app/core/auth/user.ts` — `User` interface (id, email, displayName, roles, token) and `LoginRequest` interface
- [x] 1.2 Create `src/app/core/auth/auth.ts` — `AuthService` with `login()`, `logout()`, `user()` signal, `isAuthenticated()` computed, constructor rehydration, manual `atob` JWT decode
- [x] 1.3 Create `src/app/core/auth/index.ts` — barrel re-exporting `User`, `AuthService` (implemented via models/ and services/ per orchestrator)
- [x] 1.4 Write `src/app/core/auth/auth.spec.ts` — 5 scenarios: login success (token store + signal), login 401 (no mutation), login network error, logout (clear + null), constructor restore from valid/expired/missing JWT

## Phase 2: Infrastructure

- [x] 2.1 Create `src/app/core/interceptors/auth.ts` — `authInterceptor: HttpInterceptorFn` injecting `AuthService`, adding Bearer header, calling `logout()` on 401
- [x] 2.2 Write `src/app/core/interceptors/auth.spec.ts` — 3 scenarios: adds Bearer when authenticated, passes through unauthenticated, 401 triggers logout
- [x] 2.3 Create `src/app/core/guards/auth.ts` — `authGuard: CanActivateFn` returning `true` or `UrlTree('/auth/login')`
- [x] 2.4 Write `src/app/core/guards/auth.spec.ts` — 2 scenarios: authenticated returns true, unauthenticated returns UrlTree
- [x] 2.5 Modify `src/app/app.routes.ts` — add `canActivate: [authGuard]` to dashboard lazy route
- [x] 2.6 Modify `src/app/app.config.ts` — add `withInterceptors([authInterceptor])` to `provideHttpClient()`

## Phase 3: Login UI

- [x] 3.1 Rewrite `src/app/features/auth/login.ts` — `ReactiveForms` email + password form, Material fields, validation errors, loading state, calls `AuthService.login()`, navigates on success, redirects if already authenticated
- [x] 3.2 Rewrite `src/app/features/auth/login.spec.ts` — 5 scenarios: empty form validation, login success (navigates to dashboard), 401 error displayed, network error displayed, authenticated redirect

## Phase 4: Verify

- [ ] 4.1 `bun ng test` — all tests pass across all changed files
- [ ] 4.2 `bun ng build` — production build succeeds with no type errors
