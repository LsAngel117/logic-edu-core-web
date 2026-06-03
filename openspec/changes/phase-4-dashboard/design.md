# Design: Phase 4 — Dashboard & Navigation Layout

## Technical Approach

Replace the bare `<mat-toolbar>` in `app.ts` with a route-driven layout shell. `app.ts` template becomes `<router-outlet />` only. A new layout parent route wraps all authenticated pages; `/auth/login` stays outside (flat route). Login's `:host { position: fixed; z-index: 100 }` covers everything including the layout when active — no conditional rendering needed.

The layout uses `mat-sidenav-container` for mobile overlay behavior, fully customized with project palette (no Material aesthetics). Sidebar nav items are filtered by `user().roles` via `@if` in template. Dashboard home replaces the stub with static welcome + stat cards + quick links (no API calls).

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|---|---|---|---|
| Layout architecture | Route config parent component | Conditional `*ngIf` in template couples app.ts to auth state; harder to test | **Route config parent** |
| Sidebar skeleton | `mat-sidenav` customized | Custom div requires reimplementing mobile overlay, backdrop, focus trap | **mat-sidenav, stripped styling** |
| Sidebar collapse state | Signal in AppLayout → input to children | Service adds indirection for 2-child component tree | **Parent signal + input()** |
| Dashboard content | Static with hardcoded zeros | Live API adds network dependency for a landing page; future phase will populate | **Static, no API calls** |
| Platform admin nav | Separate component, `@if` role-gated | Inline in header bloats template; separate component is clean and independently testable | **Standalone component, role-gated** |
| Nav item config | `NAV_ITEMS` const array with `roles` filter | Hardcoding in template loses type-safety and makes role changes harder | **Typed config array** |

## Component Tree

```
App (app.ts)
 └─ <router-outlet />
      ├─ AuthLoginComponent          (path: /auth/login, flat — no layout)
      └─ AppLayout                   (path: '', wraps all authenticated routes)
           ├─ <mat-sidenav-container>
           │    ├─ <mat-sidenav>      ← SidebarComponent
           │    │    ├─ Branding (logo + name)
           │    │    ├─ NavItems (role-filtered via @if)
           │    │    ├─ Collapse toggle
           │    │    └─ Footer (version)
           │    └─ <mat-sidenav-content>
           │         ├─ HeaderComponent
           │         │    ├─ Hamburger (mobile toggle)
           │         │    ├─ User name + avatar placeholder
           │         │    └─ Logout button (Lucide log-out)
           │         ├─ PlatformNavbarComponent (@if PLATFORM_ADMIN)
           │         └─ <router-outlet />
           │              ├─ DashboardComponent    /dashboard
           │              ├─ UsersPage             /users
           │              └─ SchoolsPage           /schools
```

## Data Flow

```
AuthService.user().roles ──► Sidebar.navItems (computed filter)
AuthService.user().fullName ──► Header.displayName
AuthService.user().roles ──► AppLayout.showAdminNav (computed)
AuthService.logout() ◄── Header.onLogout()
                         └── Router.navigate(['/auth/login'])

AppLayout.collapsed ──input()──► Sidebar.collapsed  (width: 64px | 260px)
AppLayout.collapsed ──input()──► Header.showToggle

DashboardComponent
  user().fullName ──► "Bienvenido, {name}" heading
  static stats:     [Usuarios: 0] [Instituciones: 0] [Sedes: 0]
  quick links:      RouterLink to /users, /schools
```

## Route Configuration

```typescript
// app.routes.ts — restructured
export const routes: Routes = [
  { path: 'auth/login', loadChildren: () => import('./features/auth/routes') },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/routes') },
      { path: 'users', loadChildren: () => import('./features/users/routes') },
      { path: 'schools', loadChildren: () => import('./features/schools/routes') },
    ],
  },
];
```

`app.ts` template becomes `<router-outlet />` (no toolbar, no layout import).

## File Manifest

| File | Action | Description |
|---|---|---|
| `core/layouts/nav-items.ts` | Create | `NavItem` interface + `NAV_ITEMS` const array |
| `core/layouts/app-layout.ts` | Create | Layout shell: mat-sidenav-container + sidebar + header + outlet |
| `core/layouts/app-layout.html` | Create | Layout template |
| `core/layouts/app-layout.scss` | Create | Layout grid, responsive breakpoints |
| `core/layouts/app-layout.spec.ts` | Create | Tests: renders sidebar+header+outlet, responsive modes |
| `core/layouts/sidebar.ts` | Create | Sidebar: role-filtered nav, collapse, active indicator |
| `core/layouts/sidebar.html` | Create | Sidebar template with Lucide icons |
| `core/layouts/sidebar.scss` | Create | Sidebar styles: 260px/64px, #111827 bg, active border |
| `core/layouts/sidebar.spec.ts` | Create | Tests: role filter, collapse, tooltip, active route |
| `core/layouts/header.ts` | Create | Header: hamburger, user info, logout |
| `core/layouts/header.html` | Create | Header template |
| `core/layouts/header.scss` | Create | Header styles: 64px, white bg, border-bottom |
| `core/layouts/header.spec.ts` | Create | Tests: user display, logout triggers AuthService+Router |
| `core/layouts/platform-navbar.ts` | Create | Admin top nav: module chips + search, role-gated |
| `core/layouts/platform-navbar.html` | Create | Template with Lucide icons |
| `core/layouts/platform-navbar.scss` | Create | Styles: 64px, white bg, sticky |
| `core/layouts/platform-navbar.spec.ts` | Create | Tests: renders only for PLATFORM_ADMIN |
| `features/dashboard/dashboard.html` | Create | Dashboard template: welcome, stats, quick links |
| `features/dashboard/dashboard.scss` | Create | Dashboard styles |
| `app.ts` | Modify | Remove mat-toolbar; template → `<router-outlet />` |
| `app.routes.ts` | Modify | Restructure: layout parent + children, single canActivate |
| `features/dashboard/dashboard.ts` | Modify | Rewrite stub: AuthService injection, welcome heading, stat cards |
| `features/dashboard/dashboard.spec.ts` | Modify | Update tests: welcome message, stats, quick links |
| `app.spec.ts` | Modify | Rewrite tests: remove mat-toolbar assertions, test router-outlet |
| `app.routes.spec.ts` | Modify | Add layout parent tests; verify child route inheritance |
| `styles.scss` | Modify | Add layout-level CSS variables (sidebar-width, colors) |
| `core/layouts/.gitkeep` | Delete | Replaced by actual layout files |

**Create**: 19, **Modify**: 7, **Delete**: 1.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Sidebar | Role filtering (5 roles), collapse toggle, active-route border, tooltip on hover | `TestBed.createComponent()`, mock `AuthService.user()`, assert DOM |
| Header | User display, logout triggers `AuthService.logout()` + `Router.navigate()` | Mock `AuthService` + `Router`, verify calls |
| PlatformNavbar | Renders chips/search for PLATFORM_ADMIN, empty DOM for other roles | Mock `AuthService.user().roles()`, assert child presence |
| AppLayout | Responsive modes (mobile overlay, tablet collapsed, desktop expanded) | Mock `BreakpointObserver`, assert mat-sidenav `mode` |
| Dashboard | Welcome uses `fullName`, fallback to `username`, stat cards render, quick links navigate | Mock `AuthService`, `RouterLink` presence |
| Routes | Unauthenticated redirect, layout parent inheritance, login stays flat | `TestBed.inject(Router)` + mock `AuthService` |

Runner: `bun ng test` (Vitest). TDD enforced per `config.yaml`. Snapshot tests for sidebar + header templates to catch regressions.

## Open Questions

None. All design decisions resolved in the proposal and confirmed against the codebase.
