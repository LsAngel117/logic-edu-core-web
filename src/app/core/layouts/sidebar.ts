import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideBuilding2,
  LucideChevronLeft,
  LucideChevronRight,
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth';
import { NAV_ITEMS, filterByRole } from './nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    LucideLayoutDashboard,
    LucideUsers,
    LucideBuilding2,
    LucideChevronLeft,
    LucideChevronRight,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly collapsed = input(false);
  readonly toggleCollapsed = output<void>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = computed(() => {
    const roles = this.auth.user()?.roles ?? [];
    return filterByRole(NAV_ITEMS, roles);
  });

  readonly activeRoute = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.activeRoute.set(e.urlAfterRedirects);
      });
  }

  readonly isActive = (route: string): boolean => {
    return this.activeRoute().startsWith(route);
  };

  toggle(): void {
    this.toggleCollapsed.emit();
  }
}
