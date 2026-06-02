import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { AuthService } from '../../../core/services/auth';
import { UserProfile, UpdateStatusPayload } from '../models/user-profile';

@Component({
  selector: 'app-user-status',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSlideToggleModule,
  ],
  templateUrl: './user-status.html',
  styleUrl: './user-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatusDialogComponent {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<UserStatusDialogComponent>);
  readonly data: UserProfile = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly isSelf = computed(() => {
    const currentUser = this.authService.user();
    return currentUser !== null && currentUser.id === this.data.id;
  });

  isToggled(): boolean {
    return this.data.status === 'inactive';
  }

  async onConfirm(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    const newStatus: UpdateStatusPayload = {
      status: this.data.status === 'active' ? 'inactive' : 'active',
    };

    try {
      const result = await firstValueFrom(
        this.usersService.updateStatus(this.data.id, newStatus)
      );
      this.dialogRef.close(result);
    } catch (err: unknown) {
      const error = err as Error;
      this.errorMessage.set(error.message || 'Failed to update status');
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
