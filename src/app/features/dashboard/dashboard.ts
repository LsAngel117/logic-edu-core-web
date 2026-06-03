import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  LucideUsers,
  LucideBuilding2,
  LucideGitBranch,
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth';

interface StatCard {
  icon: string;
  value: number;
  label: string;
  desc: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterModule,
    LucideUsers,
    LucideBuilding2,
    LucideGitBranch,
  ],
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

  protected readonly stats = signal<StatCard[]>([
    { icon: 'users', value: 0, label: 'Usuarios', desc: 'Usuarios registrados' },
    { icon: 'building-2', value: 0, label: 'Instituciones', desc: 'Instituciones activas' },
    { icon: 'git-branch', value: 0, label: 'Sedes', desc: 'Sedes registradas' },
  ]);
}
