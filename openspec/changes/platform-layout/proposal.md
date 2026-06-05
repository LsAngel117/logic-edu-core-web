# Proposal: Platform Layout — Navigation Separation

## Intent

Current `AppLayout` mixes platform-admin (hybrid nav) and academic (sidebar-only) contexts in one component. Every role sees the same structure. As we add admin sections (Users, Schools, Branches, Memberships) the hybrid nav pattern needs its own layout. This change introduces a Layout Router that dispatches to `PlatformLayout` or `AppLayout` based on role, refactors Sidebar to accept `navItems` input, and replaces the chip-based `PlatformNavbar` with a proper `TopNavBar`.

## Scope

### In Scope

1. **Layout Router**: Wrapper component reads `user().roles`, renders `PlatformLayout` (PLATFORM_ADMIN/SUPER_ADMIN) or `AppLayout` (SCHOOL_ADMIN, BRANCH_ADMIN, TEACHER). Existing route config unchanged.
2. **Sidebar refactor**: Accept `navItems: NavItem[]` as `input()` instead of computing internally from `NAV_ITEMS`.
3. **TopNavBar**: New horizontal navbar component replacing `PlatformNavbar` (chips). Renders functional-group tabs (Dashboard, Administración) with active state.
4. **2 groups functional**: Dashboard + Administración (Users, Schools, Branches, Memberships). Remaining sections as placeholders.
5. **PlatformLayout**: Hybrid shell — sidebar + TopNavBar + `<router-outlet>` for admin users.

### Out of Scope

- Full admin section pages (Users, Schools, Branches, Memberships content — already exist)
- Academic layout changes (AppLayout stays as-is)
- Notification system, real-time updates, theme toggle
- Non-admin group items beyond the 2 functional groups

## Capabilities

### New Capabilities

- `platform-layout`: Hybrid layout shell with sidebar + TopNavBar for admin roles
- `top-nav-bar`: Horizontal tab navigation replacing chip-based PlatformNavbar
- `layout-router`: Role-based layout dispatcher wrapping route children

### Modified Capabilities

- `layout-shell`: Sidebar now receives `navItems` via input; behavior otherwise preserved
- `role-navigation`: Role filtering moves from Sidebar internal logic to Layout Router; filtered items passed as input
- `route-restructure`: Authenticated parent route uses Layout Router instead of direct AppLayout
- `platform-admin-nav`: Replaced by `top-nav-bar` — spec superseded

## Approach

| Layer | Implementation |
|-------|---------------|
| **Layout Router** | `core/layouts/layout-router.ts` — reads `user().roles`, renders `PlatformLayout` or `AppLayout` via `@if` |
| **PlatformLayout** | `core/layouts/platform-layout.ts` — sidebar + TopNavBar + `<router-outlet>` |
| **Sidebar** | Refactor `navItems` from internal `computed` → `input<NavItem[]>()`. Consumers pass filtered items. |
| **TopNavBar** | New component under `core/layouts/top-nav-bar.ts`. Lucide icons, `activeGroup` signal, emits `(groupChange)`. |
| **Nav items** | Extend `NAV_ITEMS` with admin sections. `filterByRole` moves to Layout Router or a shared utility. |
| **Routes** | Existing layout parent `component: AppLayout` → `component: LayoutRouter`. Children untouched. |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `core/layouts/layout-router.ts` | New | Role-based layout dispatcher |
| `core/layouts/platform-layout.ts` | New | Hybrid admin layout shell |
| `core/layouts/top-nav-bar.ts` | New | Horizontal tab navigation replacing PlatformNavbar |
| `core/layouts/sidebar.ts` | Modified | `navItems` becomes `input()` |
| `core/layouts/platform-navbar.ts` | Removed | Replaced by TopNavBar |
| `core/layouts/nav-items.ts` | Modified | Extend with admin groups; `filterByRole` signature changes |
| `app.routes.ts` | Modified | Layout parent component → LayoutRouter |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sidebar refactor breaks existing tests | Med | Keep internal API stable; update `sidebar.spec.ts` to pass navItems explicitly |
| Role logic duplicated (sidebar + layout router) | Med | Single `filterByRole` in shared utility; Layout Router passes result to sidebar |
| PLATFORM_ADMIN + SUPER_ADMIN share same layout — edge role not handled | Low | Treat both as admin roles; same LayoutRouter condition |

## Rollback Plan

Revert `app.routes.ts` to `component: AppLayout`. Remove Layout Router files. Sidebar keeps `navItems` input but AppLayout reverts to internal computation. PlatformNavbar restored from git.

## Dependencies

- Phases 1–4 complete (auth, users, schools, dashboard, layout shell)
- `openspec/specs/layout-shell/spec.md` — current sidebar spec
- `openspec/specs/role-navigation/spec.md` — role-filtering spec

## Success Criteria

- [ ] PLATFORM_ADMIN sees PlatformLayout with TopNavBar + sidebar; SCHOOL_ADMIN sees AppLayout without TopNavBar
- [ ] Sidebar accepts `navItems` as input; all existing scenarios pass
- [ ] TopNavBar renders Dashboard + Administración tabs; clicking filters sidebar content
- [ ] PlatformNavbar component removed — no remaining imports
- [ ] Existing route config unchanged; children lazy-loaded as before
- [ ] `bun ng test` and `bun ng build` pass
