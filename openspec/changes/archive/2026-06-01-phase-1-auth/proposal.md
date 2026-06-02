# Proposal: Phase 1 — Authentication

## Intent

Connect the frontend with backend JWT auth. Login stub renders "login works" — no form, no token exchange, no route protection. No authenticated API calls are possible. This phase delivers the auth pipeline end-to-end.

## Scope

### In Scope
- Login screen with Material form (email, password) calling POST /auth/login
- AuthService: login, logout, token persistence, user signals
- JWT storage in localStorage
- HTTP interceptor: adds `Authorization: Bearer` to every request
- Route guard: protects /dashboard, redirects unauthenticated to /auth/login
- Session rehydration from localStorage on page refresh
- User identity from JWT payload or /auth/me

### Out of Scope
- Role/scope-based visual authorization (Phase 2)
- Dynamic menu rendering by membership
- Token refresh flow
- Registration or password recovery
- Any backend API changes

## Capabilities

### New Capabilities
- `user-auth`: Login form, credential submission, JWT lifecycle, session state, route protection, logout

### Modified Capabilities
None

## Approach

1. **AuthService** (`core/auth/`): `login()` calls POST /`auth/login`, stores JWT in localStorage, exposes `user()` and `isAuthenticated()` signals. `logout()` clears storage + state. On init, rehydrates from stored JWT.
2. **AuthInterceptor** (`core/interceptors/`): clones requests adding `Authorization: Bearer <token>`. On 401, triggers logout.
3. **AuthGuard** (`core/guards/`): functional guard checking `isAuthenticated()`, returns `UrlTree` to `/auth/login` if absent.
4. **LoginComponent** (`features/auth/`): Material form, calls `AuthService.login()`, navigates to `/dashboard` on success.
5. **Routes**: dashboard gets `canActivate: [authGuard]`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `core/auth/auth.service.ts` | New | Auth logic + signals |
| `core/auth/user.ts` | New | User model |
| `core/auth/index.ts` | New | Barrel export |
| `core/interceptors/auth.interceptor.ts` | New | JWT injection |
| `core/guards/auth.guard.ts` | New | Route protection |
| `features/auth/login.ts` | Modified | Full form replacing stub |
| `features/auth/login.spec.ts` | Modified | Login component tests |
| `app.routes.ts` | Modified | Add canActivate to dashboard |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend response shape unknown | Medium | Define `User` interface from plan; adapt on integration |
| JWT decode without library | Low | Use `jwt-decode` or manual base64 parse |
| localStorage XSS vector | Medium | Store only non-sensitive claims; backend enforces real auth |

## Rollback Plan

Revert git changes. Auth stack is additive — no migrations, no database changes. Remove `AuthService` from providers and `authGuard` from routes to restore prior state.

## Dependencies

- Backend `POST /auth/login` returning JWT + user profile
- Backend `GET /auth/me` (or JWT payload) with userId, roles
- `jwt-decode` for token parsing (add to package.json)

## Success Criteria

- [ ] Login submits credentials, receives JWT, redirects to /dashboard
- [ ] Protected route redirects unauthenticated users to /auth/login
- [ ] HTTP interceptor adds Bearer token to every request
- [ ] Page refresh restores session without re-login
- [ ] Logout clears token and navigates to /auth/login
- [ ] `bun ng test` passes all new and existing tests
