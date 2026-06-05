/** Shared interfaces for UI components */

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface TableAction {
  icon: string;
  label: string;
  action: string;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

export interface PageEvent {
  page: number;
  pageSize: number;
}

export interface RowActionEvent<T = unknown> {
  action: string;
  row: T;
}
