# Design: Shared UI Components

## Technical Approach

8 standalone OnPush components under `src/app/shared/ui/`, each using signals (input/output/model), SCSS with CSS custom properties, Lucide icons, no file suffixes. Dialogs reuse existing MatDialog pattern. DataTable is custom HTML (no MatTable). ChartCard wraps already-installed ng-apexcharts v2.4.0.

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|----------|--------|----------|--------|
| Directory | `shared/ui/` or `shared/components/` | `ui/` matches docs; `components/` exists empty | `shared/ui/` — proposal + design-system.md convention |
| Dialog base | MatDialog or pure overlay | Pure overlay is simpler; MatDialog already used by create-user/edit-user dialogs | MatDialog — consistency, a11y, focus trap |
| ConfirmationDialog | Inherit AppDialog or composition | Angular templates can't be inherited cleanly; DI coupling | Composition — AppDialog opened with preset danger inputs |
| Table | Custom `<table>` or MatTable | MatTable forces Material aesthetics (banned); custom gives full style control | Custom — matches design system (minimal lines, soft hover) |
| Sort | Client-side or emit-only | 10–50 row pages fit in memory; server-side needed later | Client-side via signal, `sortChange` output for future server |
| Tokens | CSS custom properties or SCSS vars | Custom properties enable runtime context theming | CSS custom properties — `--primary`, `--radius-card`, etc. |
| Naming | Suffix or no suffix | Project convention: `create-user.ts`, no `.component.ts` | No suffix — follow existing convention |

## Data Flow

```
Parent CRUD Page ──signal inputs──→ all 8 components
                                      │
PageHeader ←──ng-content actions slot
StatCard   ←──value+trend computation (pure pipe in template)
ChartCard  ←──[(activePeriod)] model() two-way ──→ period chips
DataTable  ──(sortChange)→ (pageChange)→ (rowAction)→ parent
AppDialog/ConfirmationDialog ←──MatDialog.open()── from parent
EmptyState ←──(action) output if CTA supplied
```

## File Changes

All CREATE — 32 files, 0 modify, 0 delete:

| Component | Path | Files |
|-----------|------|-------|
| PageHeader | `shared/ui/page-header/` | ts, html, scss, spec.ts |
| StatCard | `shared/ui/stat-card/` | ts, html, scss, spec.ts |
| DashboardCard | `shared/ui/dashboard-card/` | ts, html, scss, spec.ts |
| ChartCard | `shared/ui/chart-card/` | ts, html, scss, spec.ts |
| DataTable | `shared/ui/data-table/` | ts, html, scss, spec.ts |
| AppDialog | `shared/ui/app-dialog/` | ts, html, scss, spec.ts |
| EmptyState | `shared/ui/empty-state/` | ts, html, scss, spec.ts |
| ConfirmationDialog | `shared/ui/confirmation-dialog/` | ts, html, scss, spec.ts |

## Interfaces

```typescript
interface TableColumn<T = any> { key: string; label: string; sortable?: boolean; }
interface TableAction { icon: string; label: string; action: string; }
interface SortEvent { column: string; direction: 'asc' | 'desc'; }
interface PageEvent { page: number; pageSize: number; }
interface RowActionEvent<T = any> { action: string; row: T; }
```

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | Each component: input rendering, output emissions, conditionals | Vitest + TestBed, `setupComponent()`/`createFixture()` pattern |
| Unit | DataTable sort/paginate logic | Manipulate signals directly, assert rendered rows |
| Unit | Dialogs | Mock `MatDialogRef`, assert close() calls |
| Coverage | 32 test cases (~4 per component) | All Given/When/Then scenarios from spec.md |

## Migration / Rollout

No migration — net-new components. Rollback: delete `shared/ui/`. No existing imports.

## Open Questions

None. ng-apexcharts already installed. Arch pattern matches codebase conventions.
