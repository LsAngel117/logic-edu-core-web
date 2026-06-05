# Proposal: Admin Dashboard — Platform Overview

## Intent

Current dashboard is a static skeleton with hardcoded 0s, no charts, no activity feed, and inline-styled components. Must be rewritten using shared components (StatCard, ChartCard, DataTable, PageHeader) with ApexCharts area + donut charts per the admin spec.

## Scope

### In Scope
- 4 KPI StatCards (Total Schools, Active Users, Total Branches, Active Memberships) via shared StatCard
- Hero welcome section with gradient + user name
- User Growth area chart (70% width) + Institutions by Status donut chart (30%) in ChartCards
- Recent Activity DataTable with date/user/action/status columns + status chips
- Quick Actions 2×2 grid (Create School, User, Branch, View Reports)
- Period selectors on chart cards
- Chart theme config (`shared/ui/charts/chart-theme.ts`) with DS tokens
- Placeholder data wired to signals, ready for API swap

### Out of Scope
- Real HTTP/API integration (data stays local/signaled)
- Responsive/mobile polish beyond grid
- Other dashboards (school, teacher)
- Navigation restructuring or RBAC changes

## Capabilities

### New Capabilities
- `charts`: ApexCharts area + donut chart components with DS theme, encapsulated as shared components

### Modified Capabilities
- `dashboard-home`: Requirements expand from basic welcome + 3 stat cards to full admin dashboard with 4 stats, 2 charts, activity table, and quick actions

## Approach

1. Create `chart-theme.ts` with DS tokens (Roboto, #2563EB, tooltip #111827, grid #E5E7EB, 300ms animations)
2. Create `AreaChartComponent` + `DonutChartComponent` under `shared/ui/charts/`
3. Rewrite `dashboard.ts`: replace inline stat model with StatCard usage, add chart series/labels signals, add activity DataTable data
4. Rewrite `dashboard.html`: PageHeader → Hero gradient → StatCard row → ChartCard grid (70/30) → DataTable → Quick Actions
5. Rewrite `dashboard.scss` with DS tokens (r18 cards, #f8fafc bg, #eef2f7 borders, soft shadow)
6. Wire placeholder data in signals (ready for API DTO)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `shared/ui/charts/area-chart/` | New | Area chart component (ApexCharts) |
| `shared/ui/charts/donut-chart/` | New | Donut chart component (ApexCharts) |
| `shared/ui/charts/chart-theme.ts` | New | Global ApexCharts theme config |
| `features/dashboard/dashboard.ts` | Modified | Replace inline model, add chart/activity signals |
| `features/dashboard/dashboard.html` | Rewritten | Shared components, new layout |
| `features/dashboard/dashboard.scss` | Rewritten | DS tokens, new grid |
| `openspec/specs/dashboard-home/spec.md` | Modified | Delta spec for expanded requirements |
| `openspec/specs/charts/spec.md` | New | Full spec for chart components |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Area + donut chart components don't exist | High | Create them in this change — blocking dependency |
| ng-apexcharts wrapper typing issues | Low | Verify install; fallback to raw ApexCharts |
| Existing dashboard tests break on rewrite | Med | Keep/update dashboard-home specs |
| Spec field mismatch: admin spec shows "Crecimiento" KPI (not "Active Memberships") | Low | Align placeholder data labels to admin spec |

## Rollback Plan

Revert `dashboard.ts/html/scss` to previous commit. Chart components are additive — safe to keep or revert if unused.

## Dependencies

- ApexCharts + ng-apexcharts (already installed, `package.json`)
- Shared UI components StatCard, ChartCard, DataTable, PageHeader (all exist)

## Success Criteria

- [ ] 4 StatCards render with meaningful placeholder values
- [ ] Area chart + donut chart render inside ChartCards with period selectors
- [ ] DataTable shows recent activity with status chips (Activo/Pendiente/Completado)
- [ ] Quick Actions grid renders 4 action cards with Lucide icons
- [ ] All components use OnPush and signals
- [ ] Design system tokens applied consistently (colors, radii, shadows, typography)
