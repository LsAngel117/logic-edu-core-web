# Proposal: Shared UI Components

## Intent

`shared/` directory is empty. Design system mandates 8 reusable components shared across all contexts (Platform Admin, School Admin, Branch Admin, Teacher). Every CRUD page, dashboard, and dialog depends on this layer. Without it, each module duplicates markup and styles — exactly what the Scope Rule (R3) and design system forbid.

## Scope

### In Scope
- **PageHeader** — title + description + optional action slot. Top of every CRUD page.
- **StatCard** — icon, label, value, trend indicator. Dashboard KPIs.
- **DashboardCard** — card wrapper with title, content projection, optional action.
- **ChartCard** — ApexCharts card with title, period selector, content slot.
- **DataTable** — sortable, paginated table with Lucide row actions.
- **AppDialog** — base dialog: title, projected content, confirm/cancel.
- **EmptyState** — icon + message + optional CTA. Used when lists are empty.
- **ConfirmationDialog** — confirm/cancel for destructive actions (extends AppDialog).

### Out of Scope
- Individual chart components (area, line, bar, donut, radial) — separate change
- Filter bar, search input, drawer patterns — consumed by CRUD pages later
- Skeleton loaders, toast notifications — deferred to UX optimization phase (Fase 7)

## Capabilities

### New Capabilities
- `shared-ui`: Foundational shared UI component library — 8 components used across all modules. Each component MUST follow design-system.md visual tokens, OnPush, signals, NO Material defaults, file naming without suffixes.

### Modified Capabilities
- None — existing specs (`dashboard-home`, `user-management`, `school-management`, etc.) describe behavior, not implementation. Specs remain valid; components become the concrete implementation.

## Approach

1. **Each component**: standalone Angular 21, `OnPush`, signals + `effect()`, SCSS with CSS custom properties for design tokens, Lucide icons.
2. **Style**: white cards, radius 16px, soft shadows, Roboto weights 400/500/600/700. No Material default aesthetics.
3. **DataTable**: in-memory sorting/pagination via signal inputs; action column with Lucide icon buttons.
4. **Dialogs**: `AppDialog` as base (uses Angular CDK dialog under the hood); `ConfirmationDialog` extends it with preset danger styling.
5. **ChartCard**: wraps `ng-apexcharts`, injects global chart theme, exposes period selector.
6. **Each component** gets `.ts` + `.html` + `.scss` + `.spec.ts` — no file suffixes in names.
7. Implement in order: PageHeader → StatCard → DashboardCard → EmptyState → DataTable → AppDialog → ConfirmationDialog → ChartCard.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/shared/ui/page-header/` | New | 4 files (ts, html, scss, spec.ts) |
| `src/app/shared/ui/stat-card/` | New | 4 files |
| `src/app/shared/ui/dashboard-card/` | New | 4 files |
| `src/app/shared/ui/chart-card/` | New | 4 files |
| `src/app/shared/ui/data-table/` | New | 4 files |
| `src/app/shared/ui/app-dialog/` | New | 4 files |
| `src/app/shared/ui/empty-state/` | New | 4 files |
| `src/app/shared/ui/confirmation-dialog/` | New | 4 files |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| DataTable complexity exceeds 400-line budget | Medium | Split to chained PR: (1) basic table + pagination, (2) sorting + actions |
| ChartCard depends on `ng-apexcharts` (may not be installed) | Low | Add to `package.json` in this change; verify `bun install` |
| AppDialog vs ConfirmationDialog overlap | Low | AppDialog owns base structure; ConfirmationDialog is a thin wrapper with danger preset — tests prove separation |
| Existing CRUD pages need migration to use new components | High | **Deferred** — this change only creates components. Migration to shared components is a separate follow-up per module |

## Rollback Plan

- Revert `shared/ui/` directory entirely — no existing code depends on these components yet
- Remove `ng-apexcharts` from `package.json` if added
- Verify no imports from `shared/ui/` exist elsewhere

## Dependencies

- `ng-apexcharts` and `apexcharts` (add to package.json)
- Angular CDK dialog module (already in stack)

## Success Criteria

- [ ] 8 components created, each with passing unit tests
- [ ] Each component uses OnPush, signals, standalone — no NgModule declarations
- [ ] No Material default styles visible (verified visually or via CSS audit)
- [ ] Design tokens match palette: primary #2563EB, secondary #3B82F6, accent #60A5FA
- [ ] All existing tests pass after change (`bun ng test` — 200+ existing)
