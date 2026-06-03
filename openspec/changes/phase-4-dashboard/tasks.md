# Tasks: Phase 4 — Dashboard & Navigation Layout

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1065 (19 create, 7 modify, 1 delete) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 5 chained PRs (feature-branch-chain) |
| Delivery strategy | ask-always |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Base Boundary | Files | ~Lines |
|------|------|---------------|-------|--------|
| 1 | Nav config + Sidebar + global styles | `feature/phase-4-dashboard` | nav-items.ts, sidebar (4), styles.scss | ~285 |
| 2 | Header + AppLayout shell | PR #1 branch | header (4), app-layout (4) | ~340 |
| 3 | Routes + App wiring | PR #2 branch | app.routes.ts, app.ts, app.spec.ts, app.routes.spec.ts, .gitkeep delete | ~100 |
| 4 | Dashboard page rewrite | `feature/phase-4-dashboard` | dashboard.ts/html/scss/spec (indep. of routing) | ~220 |
| 5 | PlatformAdmin navbar + final cleanup | PR #3 branch | platform-navbar (4) | ~160 |

## Phase 1: Nav Config & Sidebar

- [ ] 1.1 Create `core/layouts/nav-items.ts` — `NavItem` interface + `NAV_ITEMS` const array with role filters per item
- [ ] 1.2 Add layout CSS tokens to `styles.scss` (`--sidebar-width`, `--sidebar-collapsed`, `--sidebar-bg`)
- [ ] 1.3 Create `sidebar.ts`/`.html`/`.scss` — role-filtered `@if`, collapse toggle (64px/260px), 3px active border (#4F46E5), tooltip on hover
- [ ] 1.4 Write `sidebar.spec.ts` — 5 role variants (PLATFORM_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, empty), collapse states, active border, tooltip

## Phase 2: Header & AppLayout Shell

- [x] 2.1 Create `header.ts`/`.html`/`.scss` — hamburger toggle, `user().fullName`/fallback, avatar placeholder, logout via `AuthService.logout()`
- [x] 2.2 Write `header.spec.ts` — user display, logout triggers AuthService+Router, null user fallback
- [x] 2.3 Create `app-layout.ts`/`.html`/`.scss` — `mat-sidenav-container`, collapsed signal (input to children), responsive breakpoints (≤768 overlay, 768-1024 collapsed, ≥1024 expanded)
- [x] 2.4 Write `app-layout.spec.ts` — renders sidebar+header+outlet, responsive modes via BreakpointObserver mock

## Phase 3: Routes & App Wiring

- [ ] 3.1 Restructure `app.routes.ts` — layout parent route with `authGuard`, flat `/auth/login`, children via `loadChildren`
- [ ] 3.2 Simplify `app.ts` template to `<router-outlet />` — remove mat-toolbar import and template
- [ ] 3.3 Update `app.spec.ts` — remove toolbar assertions, verify router-outlet renders
- [ ] 3.4 Rewrite `app.routes.spec.ts` — layout inheritance, unauthenticated redirect, login flat, lazy loading preserved
- [ ] 3.5 Delete `core/layouts/.gitkeep`

## Phase 4: Dashboard Page

- [ ] 4.1 Rewrite `dashboard.ts` — inject AuthService, welcome heading `Bienvenido, {fullName}` with email fallback, static stat cards, quick links
- [ ] 4.2 Create `dashboard.html` — welcome message, 3 stat cards (Usuarios/Instituciones/Sedes), RouterLink cards to /users and /schools
- [ ] 4.3 Create `dashboard.scss` — stat card grid, responsive column layout
- [ ] 4.4 Rewrite `dashboard.spec.ts` — welcome with name + fallback, stat cards rendered, quick link navigation

## Phase 5: Platform Admin Navbar

- [ ] 5.1 Create `platform-navbar.ts`/`.html`/`.scss` — horizontal nav, module chips (Usuarios/Instituciones/Control Académico), global search input, gated by `@if user().roles.includes('PLATFORM_ADMIN')`
- [ ] 5.2 Write `platform-navbar.spec.ts` — renders chips+search for PLATFORM_ADMIN, empty DOM for other roles, reactive update on `user()` signal change

## Phase 6: Integration Verification

- [ ] 6.1 Run `bun ng test` — all unit tests pass (14 reqs, 28 scenarios)
- [ ] 6.2 Run `bun ng build` — production build succeeds
- [ ] 6.3 Manual verification: responsive behavior, logout flow, role gating, route guard, all layouts
