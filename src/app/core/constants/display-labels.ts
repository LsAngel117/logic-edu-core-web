/** Status display names — Spanish UI, API values unchanged. */
export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  BLOCKED: 'Bloqueado',
};

export function statusLabel(status: string | undefined | null): string {
  if (!status) return '—';
  return STATUS_LABELS[status] ?? status;
}

/** Branch type display names — Spanish UI. */
export const BRANCH_TYPE_LABELS: Record<string, string> = {
  MAIN: 'Principal',
  SECONDARY: 'Secundaria',
  VIRTUAL: 'Virtual',
  TEMPORARY: 'Temporal',
};

export function branchTypeLabel(type: string | undefined | null): string {
  if (!type) return '—';
  return BRANCH_TYPE_LABELS[type] ?? type;
}
