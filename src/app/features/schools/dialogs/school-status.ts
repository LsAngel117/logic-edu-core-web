import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { SchoolsService } from '../services/schools';
import { AuthService } from '../../../core/services/auth';
import { School, UpdateSchoolStatusPayload } from '../models/school';

@Component({
  selector: 'app-school-status',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSlideToggleModule,
  ],
  templateUrl: './school-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolStatusDialogComponent {
  private readonly schoolsService = inject(SchoolsService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<SchoolStatusDialogComponent>);
  readonly data: School = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly hasBranches = computed(() => (this.data.branchCount ?? 0) > 0);

  readonly isSelfSchool = computed(() => {
    const currentUser = this.authService.user();
    // Self-school protection: simplified check via user ID match.
    // Full implementation uses MembershipsService to derive admin school IDs.
    return currentUser !== null && currentUser.id === this.data.id;
  });

  isToggled(): boolean {
    return this.data.status === 'inactive';
  }

  async onConfirm(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    const newStatus: UpdateSchoolStatusPayload = {
      status: this.data.status === 'active' ? 'inactive' : 'active',
    };

    try {
      const result = await firstValueFrom(
        this.schoolsService.updateStatus(this.data.id, newStatus)
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
