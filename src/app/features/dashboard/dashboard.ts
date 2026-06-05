import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { PageHeader, StatCard, ChartCard, DataTable } from '../../shared/ui';
import { AreaChart } from '../../shared/ui/charts/area-chart/area-chart';
import { DonutChart } from '../../shared/ui/charts/donut-chart/donut-chart';
import {
  getStats,
  getUserGrowthData,
  getInstitutionDistribution,
  getRecentActivity,
  activityColumns,
  type UserGrowthData,
  type InstitutionDistribution,
  type ActivityRow,
} from './dashboard-data';
import type { TableColumn } from '../../shared/ui/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeader, StatCard, ChartCard, DataTable, AreaChart, DonutChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  protected readonly userName = computed(() => {
    const u = this.auth.user();
    if (!u) return 'Usuario';
    return u.fullName || u.email || u.username || 'Usuario';
  });

  protected readonly stats = signal(getStats());
  protected readonly userGrowthData = signal<UserGrowthData>(getUserGrowthData());
  protected readonly institutionData = signal<InstitutionDistribution>(getInstitutionDistribution());
  protected readonly recentActivity = signal<ActivityRow[]>(getRecentActivity());
  protected readonly activityColumns: TableColumn<ActivityRow>[] = activityColumns;
}
