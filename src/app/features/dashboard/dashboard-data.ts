import type { TableColumn } from '../../shared/ui/models';

/** Stat data for StatCard components */
export interface StatData {
  icon: string;
  label: string;
  value: number;
  trend: number;
}

/** User growth data for area chart */
export interface UserGrowthData {
  series: { name: string; data: number[] }[];
  categories: string[];
}

/** Institution distribution data for donut chart */
export interface InstitutionDistribution {
  series: number[];
  labels: string[];
}

/** Recent activity row for data table */
export type ActivityRow = {
  user: string;
  action: string;
  target: string;
  date: string;
} & Record<string, unknown>;

/** Returns KPIs for the dashboard StatCards */
export function getStats(): StatData[] {
  return [
    { icon: 'school', label: 'Total Schools', value: 12, trend: 2 },
    { icon: 'users', label: 'Active Users', value: 248, trend: 15 },
    { icon: 'git-branch', label: 'Total Branches', value: 36, trend: 3 },
    { icon: 'book-open', label: 'Active Memberships', value: 189, trend: 8 },
  ];
}

/** Returns monthly user growth data for the last 6 months */
export function getUserGrowthData(): UserGrowthData {
  return {
    series: [
      { name: 'Active Users', data: [180, 195, 210, 225, 238, 248] },
      { name: 'New Users', data: [15, 18, 22, 20, 25, 28] },
    ],
    categories: ['January', 'February', 'March', 'April', 'May', 'June'],
  };
}

/** Returns institution distribution data for donut chart */
export function getInstitutionDistribution(): InstitutionDistribution {
  return {
    series: [8, 3, 1],
    labels: ['Active', 'Inactive', 'Pending'],
  };
}

/** Returns recent activity data for DataTable */
export function getRecentActivity(): ActivityRow[] {
  return [
    { user: 'María García', action: 'Created school', target: 'Colegio San Marcos', date: '2025-06-05' },
    { user: 'Carlos López', action: 'Added user', target: 'Ana Martínez', date: '2025-06-04' },
    { user: 'María García', action: 'Created branch', target: 'Sede Norte', date: '2025-06-03' },
    { user: 'Elena Rojas', action: 'Updated school', target: 'Instituto Central', date: '2025-06-02' },
    { user: 'Carlos López', action: 'Removed user', target: 'Pedro Sánchez', date: '2025-06-01' },
    { user: 'María García', action: 'Created membership', target: 'Plan Premium', date: '2025-05-30' },
    { user: 'Elena Rojas', action: 'Updated branch', target: 'Sede Sur', date: '2025-05-29' },
    { user: 'Carlos López', action: 'Added user', target: 'Lucía Fernández', date: '2025-05-28' },
  ];
}

/** Columns definition for the activity DataTable */
export const activityColumns: TableColumn<ActivityRow>[] = [
  { key: 'user', label: 'User', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'target', label: 'Target', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
];
