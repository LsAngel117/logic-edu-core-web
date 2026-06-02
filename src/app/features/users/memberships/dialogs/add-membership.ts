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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { MembershipsService } from '../services/memberships';
import { AddMembershipPayload } from '../models/membership';

const AVAILABLE_ROLES = ['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'] as const;
const AVAILABLE_SCOPES = ['GLOBAL', 'SCHOOL', 'BRANCH'] as const;

@Component({
  selector: 'app-add-membership',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './add-membership.html',
  styleUrl: './add-membership.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMembershipDialogComponent {
  private readonly membershipsService = inject(MembershipsService);
  private readonly dialogRef = inject(MatDialogRef<AddMembershipDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly data: { userId: string } = inject(MAT_DIALOG_DATA);

  readonly roles = AVAILABLE_ROLES;
  readonly scopes = AVAILABLE_SCOPES;
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form: FormGroup<{
    role: FormControl<string>;
    scope: FormControl<string>;
  }>;

  constructor() {
    this.form = this.fb.nonNullable.group({
      role: ['', [Validators.required]],
      scope: ['', [Validators.required]],
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
    const payload: AddMembershipPayload = {
      role: raw.role,
      scope: raw.scope,
    };

    try {
      const result = await firstValueFrom(
        this.membershipsService.add(this.data.userId, payload)
      );
      this.dialogRef.close(result);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        this.errorMessage.set('This membership already exists');
      } else if (status === 403) {
        this.errorMessage.set('Insufficient permissions');
      } else {
        this.errorMessage.set('Failed to add membership');
      }
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
