import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth';
import { AppLayout } from '../app-layout';
import { PlatformLayout } from '../platform-layout/platform-layout';

@Component({
  selector: 'app-layout-router',
  imports: [AppLayout, PlatformLayout],
  template: `
    @if (isPlatformAdmin()) {
      <app-platform-layout />
    } @else {
      <app-layout />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutRouter {
  private readonly auth = inject(AuthService);

  readonly isPlatformAdmin = computed(() =>
    this.auth.user()?.roles?.includes('PLATFORM_ADMIN') ?? false
  );
}
