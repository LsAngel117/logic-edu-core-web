import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { MembershipsService } from '../services/memberships';

@Component({
  selector: 'app-remove-membership',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './remove-membership.html',
  styleUrl: './remove-membership.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoveMembershipDialogComponent {
  private readonly membershipsService = inject(MembershipsService);
  private readonly dialogRef = inject(MatDialogRef<RemoveMembershipDialogComponent>);
  readonly data: { userId: string; membershipId: string; role: string } =
    inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  async onConfirm(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await firstValueFrom(
        this.membershipsService.deactivate(this.data.membershipId)
      );
      this.dialogRef.close(true);
    } catch (err: unknown) {
      const e = err as { error?: { message?: string }; message?: string };
      this.errorMessage.set(
        e.error?.message || e.message || 'Failed to remove membership'
      );
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
