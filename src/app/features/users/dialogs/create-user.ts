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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { CreateUserPayload } from '../models/user-profile';

@Component({
  selector: 'app-create-user',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
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

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form: FormGroup<{
    username: FormControl<string>;
    email: FormControl<string>;
    fullName: FormControl<string>;
    password: FormControl<string>;
  }>;

  constructor() {
    this.form = this.fb.nonNullable.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
      username: raw.username,
      email: raw.email,
      fullName: raw.fullName,
      password: raw.password,
    };

    try {
      const result = await firstValueFrom(this.usersService.create(payload));
      this.dialogRef.close(result);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        this.errorMessage.set('Email or username already in use');
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
