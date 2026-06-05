// Shared UI barrel — re-export all components and interfaces

// Interfaces
export type { TableColumn, TableAction, SortEvent, PageEvent, RowActionEvent } from './models';

// Components
export { PageHeader } from './page-header/page-header';
export { StatCard } from './stat-card/stat-card';
export { DashboardCard } from './dashboard-card/dashboard-card';
export { EmptyState } from './empty-state/empty-state';
export { AppDialog } from './app-dialog/app-dialog';
export { ConfirmationDialog } from './confirmation-dialog/confirmation-dialog';
