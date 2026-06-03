# Proposal: Phase 4 — Dashboard & Layout Shell

## Intent

Replace the bare `<mat-toolbar>LogicEdu</mat-toolbar>` with a proper navigation shell so the 3 CRUD modules (users, schools, branches) are accessible. The current dashboard is a stub — no layout, no sidebar, no role-based navigation.

## Scope

### In Scope
1. Vertical sidebar (260px, collapsible to icon-only) with active-route indicator
2. Header bar with user name, avatar placeholder, logout
3. Dashboard home page with welcome + quick stats + role-based blocks
4. Route restructuring — layout wraps all authenticated routes, auth/login stays independent
5. Role-based sidebar items (filter nav by user roles)
6. Platform admin top navbar (horizontal, white, sticky) — only for PLATFORM_ADMIN
7. Responsive: hamburger menu on mobile, collapsible on tablet

### Out of Scope
- Full shared component extraction (triggers Scope Rule when 2+ features need same widget)
- Notification system or real-time updates
- Theme toggle (dark/light) — deferred to Phase 7
- Skeleton loaders — deferred to Phase 7

## Capabilities

### New Capabilities
- `app-layout`: Main shell with sidebar + header + responsive behavior
- `dashboard`: Home page with welcome message, quick stats, role-aware content blocks
- `platform-admin-nav`: Top horizontal navbar for PLATFORM_ADMIN module switching

### Modified Capabilities
- `user-auth`: No spec changes. AuthService already exposes `user().roles` — consumed by layout for role gating. Route guard remains unchanged.

## Approach

| Layer | Implementation |
|-------|----------------|
| **Layout** | `core/layouts/` — `app-layout.ts` wraps `<router-outlet>` with sidebar + header. Sidebar is a standalone component. |
| **Sidebar** | Lucide icon list, nav items from config, filtered by `user().roles`. Active route via `RouterLinkActive`. |
| **Header** | Read `user().fullName` and `user().email` from AuthService. Lucide `log-out` icon triggers `AuthService.logout()`. |
| **Dashboard** | `features/dashboard/` — expand stub with stats cards, role-based blocks, quick links to `/users`, `/schools`. |
| **Routes** | New parent route with layout component. `/auth/login` stays flat. Authenticated routes nest under layout. |
| **PLATFORM_ADMIN nav** | Separate `platform-admin-nav.ts` component, conditionally rendered above content area when role matches. |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `core/layouts/` | New | App layout shell, sidebar, admin nav components |
| `features/dashboard/dashboard.ts` | Modified | Replace stub with real dashboard content |
| `features/dashboard/dashboard.spec.ts` | Modified | Update tests for new dashboard |
| `app.ts` | Modified | Remove inline toolbar, use layout wrapper |
| `app.routes.ts` | Modified | Restructure routes under layout parent |
| `styles.scss` | Modified | Layout-level variables and sidebar tokens |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| File size > 400 lines per PR | High | Use feature-branch-chain strategy; split sidebar, header, dashboard, routes into separate PRs |
| PLATFORM_ADMIN nav adds complexity | Medium | Implement as optional component gated by role; no role = no DOM |
| Responsive breakpoints conflict with existing login | Low | Layout uses different selectors and z-index stack |

## Rollback Plan

Revert `app.ts`, `app.routes.ts`, `styles.scss`. Delete `core/layouts/`. Dashboard falls back to its current stub. Auth and other features are unaffected.

## Dependencies

- Fase 1 (auth) — complete, AuthService provides `user().roles`
- Fase 2 (users/memberships) — complete, routes exist
- Fase 3 (schools/branches) — complete, routes exist

## Success Criteria

- [ ] Authenticated users see sidebar + header instead of bare toolbar
- [ ] Sidebar shows only nav items the user's roles allow
- [ ] Dashboard page displays stats and role-based blocks
- [ ] PLATFORM_ADMIN sees top horizontal nav; other roles don't
- [ ] Logout clears session and redirects to login
- [ ] Mobile sidebar collapses to hamburger, tablet collapses to icons
- [ ] `bun ng test` and `bun ng build` pass
