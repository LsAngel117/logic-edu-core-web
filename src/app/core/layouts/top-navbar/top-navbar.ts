import { ChangeDetectionStrategy, Component, computed, HostListener, inject, input, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideSettings,
  LucideWrench,
  LucideBarChart3,
  LucideShield,
  LucideBell,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideUser,
  LucideChevronDown,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-top-navbar',
  imports: [
    LucideSettings,
    LucideWrench,
    LucideBarChart3,
    LucideShield,
    LucideBell,
    LucideLayoutDashboard,
    LucideLogOut,
    LucideUser,
    LucideChevronDown,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-navbar.html',
  styleUrl: './top-navbar.scss',
})
export class TopNavBar {
  readonly sections = input.required<{ id: string; label: string; icon: string }[]>();
  readonly activeSection = model<string>('');

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly userName = computed(() => this.auth.user()?.fullName ?? 'Usuario');
  readonly initials = computed(() => {
    const name = this.userName();
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  });

  selectSection(id: string): void {
    this.activeSection.set(id);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-testid="user-menu"]')) {
      this.closeMenu();
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
