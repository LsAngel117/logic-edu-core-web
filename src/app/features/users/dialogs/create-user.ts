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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { CreateUserPayload } from '../models/user-profile';

const AVAILABLE_ROLES = ['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'] as const;

@Component({
  selector: 'app-create-user',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserDialogComponent {
  private readonly usersService = inject(UsersService);
  private readonly dialogRef = inject(MatDialogRef<CreateUserDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly roles = AVAILABLE_ROLES;
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form: FormGroup<{
    email: FormControl<string>;
    displayName: FormControl<string>;
    password: FormControl<string>;
    roles: FormControl<string[]>;
  }>;

  constructor() {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roles: [[] as string[]],
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
    const payload: CreateUserPayload = {
      email: raw.email,
      displayName: raw.displayName,
      password: raw.password,
      roles: raw.roles ?? [],
    };

    try {
      const result = await firstValueFrom(this.usersService.create(payload));
      this.dialogRef.close(result);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        this.errorMessage.set('Email already in use');
      } else if (status === 403) {
        this.errorMessage.set('Insufficient permissions');
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
