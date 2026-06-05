# Shared UI Specification

## Purpose

8 reusable standalone components shared across all LogicEdu contexts. Each MUST use OnPush, signals, Lucide icons, and design-system.md tokens (Roboto, primary #2563EB, r16, soft shadow).

## Requirements

### Requirement: PageHeader

PageHeader MUST render title (h1, 32px/700), description, and optional right-aligned action slot.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Title + description | title="Usuarios", desc="Administra" | rendered | h1 32px/700, description below |
| Action slot | Projected content | rendered | Slot right-aligned |
| Empty description | desc="" | rendered | Title only, no desc element |

### Requirement: StatCard

StatCard MUST render icon, label, value, optional trend. Positive trend green (#10B981), negative red (#EF4444).

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Positive trend | icon="users", value=42, trend=12 | rendered | Icon, "42", "+12%" in #10B981 |
| Negative trend | trend=-5 | rendered | "-5%" in #EF4444 |
| No trend | No trend input | rendered | No trend element |

### Requirement: DashboardCard

DashboardCard MUST render white card (r16, soft shadow) with title (18px/600), optional action slot, content projection.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Title + content | title="Resumen" | rendered | Title 18px/600, content inside card |
| Action slot | Action ng-content | rendered | Actions in top-right |

### Requirement: ChartCard

ChartCard MUST render card with title, period selector (week/month/year), projected ApexCharts. Default period "month".

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Full render | title="Ingresos", chart | rendered | Title, selector, chart displayed |
| Default period | activePeriod="month" | rendered | "month" highlighted, periodChange emits |
| Period change | User selects "year" | selected | periodChange emits "year" |

### Requirement: DataTable

DataTable MUST render sortable paginated table with columns, data, optional Lucide actions. Page size defaults to 10.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Render data | columns, 3 rows | rendered | Headers with sort icons, rows with hover |
| Column sort | Click "Nombre" | clicked | sort emits { column, direction } |
| Pagination | 50 rows, pageSize=10 | rendered | 10 rows visible, pagination controls |
| Empty data | data=[] | rendered | "No hay registros", no pagination |
| Row actions | actions=[{icon:"eye"}] | rendered | Icon button column, click emits rowAction |

### Requirement: AppDialog

AppDialog MUST render modal (r20) with title, content, confirm/cancel. Loading disables confirm with spinner.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Render | title="Crear", confirm="Guardar" | opened | Title, content, buttons visible |
| Loading | loading=true | rendered | Confirm disabled with spinner |
| Confirm | Click confirm | clicked | confirm emits |
| Cancel | Click cancel | clicked | cancel emits, dialog closes |

### Requirement: EmptyState

EmptyState MUST render centered icon, title, description, optional CTA. CTA click emits action.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Full state | icon="inbox", title="Sin registros" | rendered | Icon, title, description centered |
| With CTA | CTA "Crear" | clicked | action emits |
| Without CTA | No CTA input | rendered | Only icon, title, description |

### Requirement: ConfirmationDialog

ConfirmationDialog MUST extend AppDialog with warning icon, message, danger confirm (#EF4444).

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Destructive | title="Eliminar", message="No puede" | opened | Warning icon, danger confirm, message |
| Confirm | Click confirm | clicked | confirm emits, dialog closes |
| Cancel | Click cancel | clicked | cancel emits, dialog closes |
