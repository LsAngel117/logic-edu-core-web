import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideBuilding2,
  LucideChevronLeft,
  LucideChevronRight,
  LucideLogOut,
  LucideUser,
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth';
import { NavItem } from './nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    LucideLayoutDashboard,
    LucideUsers,
    LucideBuilding2,
    LucideChevronLeft,
    LucideChevronRight,
    LucideLogOut,
    LucideUser,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly collapsed = input(false);
  readonly toggleCollapsed = output<void>();
  readonly navItems = input<NavItem[]>([]);
  readonly showBranding = input(true);

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly activeRoute = signal(this.router.url);
  readonly userName = computed(() => this.auth.user()?.fullName ?? 'Usuario');

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

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
