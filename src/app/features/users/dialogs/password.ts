import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { ChangePasswordPayload } from '../models/user-profile';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPass = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPass && confirm && newPass !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-password-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './password.html',
  styleUrl: './password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent {
  private readonly usersService = inject(UsersService);
  private readonly dialogRef = inject(MatDialogRef<PasswordDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly data: { userId: string } = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form: FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  constructor() {
    this.form = this.fb.nonNullable.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload: ChangePasswordPayload = {
      currentPassword: raw.currentPassword,
      newPassword: raw.newPassword,
    };

    try {
      await firstValueFrom(
        this.usersService.changePassword(this.data.userId, payload)
      );
      this.dialogRef.close(true);
    } catch (err: unknown) {
      const e = err as { error?: { message?: string }; message?: string };
      this.errorMessage.set(
        e.error?.message || e.message || 'Failed to change password'
      );
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
