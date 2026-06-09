import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { AuthService } from '../../../core/services/auth';
import { UserProfile, ChangeStatusRequest } from '../models/user-profile';
import { ConfirmationDialog } from '../../../shared/ui';

@Component({
  selector: 'app-user-status',
  standalone: true,
  imports: [ConfirmationDialog],
  templateUrl: './user-status.html',
  styleUrl: './user-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatusDialogComponent {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  readonly user = input.required<UserProfile>();
  readonly visible = model(false);

  readonly loading = signal(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly isSelf = computed(() => {
    const currentUser = this.authService.user();
    const u = this.user();
    return currentUser !== null && currentUser.id === u.id;
  });

  readonly dialogTitle = computed(() => {
    const u = this.user();
    return u.status === 'ACTIVE' ? 'Desactivar usuario' : 'Activar usuario';
  });

  readonly dialogMessage = computed(() => {
    const u = this.user();
    const action = u.status === 'ACTIVE' ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${u.fullName}?`;
  });

  readonly confirmLabel = computed(() => {
    const u = this.user();
    return u.status === 'ACTIVE' ? 'Desactivar' : 'Activar';
  });

  async onConfirm(): Promise<void> {
    if (this.isSelf()) return;

    const u = this.user();
    const newStatus: ChangeStatusRequest = {
      status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    };

    this.loading.set(true);
    try {
      await firstValueFrom(this.usersService.changeStatus(u.id, newStatus));
      this.visible.set(false);
      this.confirmed.emit();
    } catch {
      // silently fail
    } finally {
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }
}
