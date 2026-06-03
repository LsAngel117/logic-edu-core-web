import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { BranchesService } from '../services/branches';
import { BranchResponse } from '../models/branch';

@Component({
  selector: 'app-branch-status',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSlideToggleModule,
  ],
  templateUrl: './branch-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchStatusDialogComponent {
  private readonly branchesService = inject(BranchesService);
  private readonly dialogRef = inject(MatDialogRef<BranchStatusDialogComponent>);
  readonly data: BranchResponse = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  isToggled(): boolean {
    return this.data.status === 'INACTIVE';
  }

  async onConfirm(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const result = await firstValueFrom(
        this.branchesService.updateStatus(this.data.schoolId, this.data.id)
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
