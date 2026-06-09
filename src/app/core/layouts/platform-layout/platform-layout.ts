import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { TopNavBar } from '../top-navbar/top-navbar';
import { Sidebar } from '../sidebar';
import { NavItem } from '../nav-items';

@Component({
  selector: 'app-platform-layout',
  imports: [RouterOutlet, TopNavBar, Sidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './platform-layout.html',
  styleUrl: './platform-layout.scss',
})
export class PlatformLayout {
  private readonly auth = inject(AuthService);

  readonly collapsed = signal(false);
  readonly activeSection = signal('dashboard');

  readonly sections = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'administration', label: 'Administración', icon: 'shield' },
    { id: 'config', label: 'Configuraciones', icon: 'settings' },
    { id: 'tools', label: 'Herramientas', icon: 'wrench' },
    { id: 'reports', label: 'Reportes', icon: 'bar-chart-3' },
  ];

  readonly contextualNavItems = computed((): NavItem[] => {
    switch (this.activeSection()) {
      case 'dashboard':
        return [{ label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' }];
      case 'administration':
        return [
          { label: 'Usuarios', icon: 'users', route: '/users' },
          { label: 'Instituciones', icon: 'building-2', route: '/schools' },
        ];
      default:
        return [];
    }
  });

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }
}
