import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  LucideShield,
  LucideSearch,
  LucideBell,
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-platform-navbar',
  imports: [
    LucideShield,
    LucideSearch,
    LucideBell,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './platform-navbar.html',
  styleUrl: './platform-navbar.scss',
})
export class PlatformNavbar {
  private readonly auth = inject(AuthService);

  readonly isVisible = computed(() => {
    return this.auth.user()?.roles?.includes('PLATFORM_ADMIN') ?? false;
  });
}
