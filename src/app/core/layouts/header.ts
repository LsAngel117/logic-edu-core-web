import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideMenu,
  LucideLogOut,
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-header',
  imports: [
    LucideMenu,
    LucideLogOut,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly collapsed = input(false);
  readonly toggleCollapsed = output<void>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly userName = computed(() => this.auth.user()?.fullName ?? '');

  readonly userInitials = computed(() => {
    const name = this.auth.user()?.fullName?.trim();
    if (!name) return '';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  });

  onToggle(): void {
    this.toggleCollapsed.emit();
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
