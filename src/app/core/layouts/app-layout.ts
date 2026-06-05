import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { AuthService } from '../../core/services/auth';
import { NAV_ITEMS, filterByRole } from './nav-items';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatSidenavModule, Sidebar, Header],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly auth = inject(AuthService);

  readonly collapsed = signal(false);
  readonly isMobile = signal(false);
  readonly sidenavMode = signal<'side' | 'over'>('side');
  readonly sidenavOpened = signal(true);

  readonly navItems = computed(() => {
    const roles = this.auth.user()?.roles ?? [];
    return filterByRole(NAV_ITEMS, roles);
  });

  constructor() {
    this.breakpoint.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).subscribe((result) => {
      const mobile = result.matches;
      this.isMobile.set(mobile);
      if (mobile) {
        this.sidenavMode.set('over');
        this.sidenavOpened.set(false);
        this.collapsed.set(false);
      } else {
        this.sidenavMode.set('side');
        this.sidenavOpened.set(true);
      }
    });
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.sidenavOpened.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
    }
  }
}
