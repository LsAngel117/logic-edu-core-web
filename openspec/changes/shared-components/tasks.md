# Tasks: Shared UI Components

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900–1100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Static Display) → PR 2 (Dialogs) → PR 3 (Complex Widgets) |
| Delivery strategy | ask-always |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Static Display: PageHeader, StatCard, DashboardCard, EmptyState | PR 1 | Base = tracker branch; ~300 lines — simplest, no dependencies |
| 2 | Dialogs: AppDialog + ConfirmationDialog | PR 2 | Base = PR 1 branch; ~235 lines — AppDialog first, ConfirmationDialog depends |
| 3 | Complex Widgets: DataTable + ChartCard | PR 3 | Base = PR 2 branch; ~360 lines — heaviest, DataTable needs full sort/page logic |

## Phase 1: Foundation

- [x] 1.1 Create `shared/ui/` dir, remove `.gitkeep` from `shared/components/`, add barrel `shared/ui/index.ts`
- [x] 1.2 Define shared interfaces in `shared/ui/models.ts`: `TableColumn<T>`, `TableAction`, `SortEvent`, `PageEvent`, `RowActionEvent<T>`
- [x] 1.3 Verify `ng-apexcharts` + `apexcharts` in `package.json`; run `bun install` if missing (confirmed present)

## Phase 2: Static Display Components (PR 1)

- [x] 2.1 Create `shared/ui/page-header/` — title `input<string>`, desc `input<string>`, action ng-content; render h1 32px/700, optional desc, right-aligned slot; spec.ts covers 5 scenarios
- [x] 2.2 Create `shared/ui/stat-card/` — icon `input<string>`, label, value, trend `input<number>`; render trend green (#10B981) / red (#EF4444); spec.ts covers 5 scenarios
- [x] 2.3 Create `shared/ui/dashboard-card/` — white card r16 + soft shadow, title `input<string>`, action ng-content, content projection; spec.ts covers 4 scenarios
- [x] 2.4 Create `shared/ui/empty-state/` — centered icon, title, desc, optional CTA `input<string>` with `action` output; spec.ts covers 7 scenarios

## Phase 3: Dialog Components (PR 2)

- [x] 3.1 Create `shared/ui/app-dialog/` — signal-based modal (not MatDialog), title `input<string>`, confirmLabel `input<string>`, loading `input<boolean>` disables confirm + spinner; confirm/cancel outputs; 7 tests
- [x] 3.2 Create `shared/ui/confirmation-dialog/` — independent modal with LucideTriangleAlert icon, message `input<string>`, danger confirm (#EF4444); 7 tests

## Phase 4: Complex Widgets (PR 3)

- [ ] 4.1 Create `shared/ui/data-table/` — custom HTML table, signal-based sort/pagination, columns `input<TableColumn[]>`, data `input<T[]>`, actions `input<TableAction[]>`, empty state when `data=[]`; outputs: sortChange, pageChange, rowAction; spec.ts covers 5 scenarios
- [ ] 4.2 Create `shared/ui/chart-card/` — card + title + period selector (week/month/year), `activePeriod` as `model()`, projected ApexCharts ng-content; spec.ts covers 3 scenarios

## Phase 5: Verification

- [ ] 5.1 Run `bun ng test` — confirm all 200+ existing + 32 new tests pass
- [ ] 5.2 CSS audit — verify no Material default aesthetics, custom properties match palette
