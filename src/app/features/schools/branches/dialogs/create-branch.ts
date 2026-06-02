import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { BranchesService } from '../services/branches';
import { CreateBranchPayload } from '../models/branch';

const CODE_PATTERN = /^[A-Z0-9-]+$/;

@Component({
  selector: 'app-create-branch',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './create-branch.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBranchDialogComponent {
  private readonly branchesService = inject(BranchesService);
  private readonly dialogRef = inject(MatDialogRef<CreateBranchDialogComponent>);
  private readonly schoolId: string = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form: FormGroup<{
    name: FormControl<string>;
    code: FormControl<string>;
    address: FormControl<string>;
  }>;

  constructor() {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required, Validators.pattern(CODE_PATTERN)]],
      address: ['', [Validators.required]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload: CreateBranchPayload = {
      schoolId: this.schoolId,
      name: raw.name,
      code: raw.code,
      address: raw.address,
    };

    try {
      const result = await firstValueFrom(this.branchesService.create(payload));
      this.dialogRef.close(result);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        this.errorMessage.set('A branch with this code already exists in this school');
      } else {
        this.errorMessage.set('An error occurred');
      }
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
