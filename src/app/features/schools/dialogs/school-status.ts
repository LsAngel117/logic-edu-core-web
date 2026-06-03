import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { SchoolsService } from '../services/schools';
import { AuthService } from '../../../core/services/auth';
import { MembershipsService } from '../../users/memberships/services/memberships';
import { School } from '../models/school';

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
  private readonly membershipsService = inject(MembershipsService);
  private readonly dialogRef = inject(MatDialogRef<SchoolStatusDialogComponent>);
  readonly data: School = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly isSelfSchool = signal(false);

  constructor() {
    const user = this.authService.user();
    if (user) {
      this.membershipsService.getByUser(user.id).subscribe({
        next: (memberships) => {
          const belongsToSchool = memberships.some((m) => m.scopeRefId === this.data.id);
          this.isSelfSchool.set(belongsToSchool);
        },
        error: () => {
          this.isSelfSchool.set(false);
        },
      });
    }
  }

  isToggled(): boolean {
    return this.data.status === 'INACTIVE';
  }

  async onConfirm(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const result = await firstValueFrom(
        this.schoolsService.updateStatus(this.data.id)
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
