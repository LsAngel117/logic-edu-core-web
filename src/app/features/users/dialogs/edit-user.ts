import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { UserProfile } from '../models/user-profile';

@Component({
  selector: 'app-edit-user',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatProgressSpinner,
    MatError,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Edit User</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-user-form">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
          @if (form.controls.email.hasError('required')) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.controls.email.hasError('email')) {
            <mat-error>Invalid email format</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Display Name</mat-label>
          <input matInput formControlName="displayName" />
          @if (form.controls.displayName.hasError('required')) {
            <mat-error>Display name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Roles (comma-separated)</mat-label>
          <input matInput formControlName="roles" />
          @if (form.controls.roles.hasError('required')) {
            <mat-error>At least one role is required</mat-error>
          }
        </mat-form-field>

        @if (errorMessage()) {
          <p class="error-message">{{ errorMessage() }}</p>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="loading()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="form.invalid || loading()"
      >
        @if (loading()) {
          <mat-spinner diameter="20" />
        } @else {
          Save
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .edit-user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 320px;
      padding-top: 8px;
    }
    .error-message {
      color: var(--mat-sys-error);
      margin: 0;
    }
  `,
})
export class EditUser {
  private readonly usersService = inject(UsersService);
  private readonly dialogRef = inject(MatDialogRef<EditUser>);
  private readonly data: UserProfile = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = inject(FormBuilder).group({
    email: [this.data.email, [Validators.required, Validators.email]],
    displayName: [this.data.displayName, Validators.required],
    roles: [this.data.roles.join(', '), Validators.required],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.form.getRawValue() as { email: string; displayName: string; roles: string };
      const payload = {
        email: formValue.email,
        displayName: formValue.displayName,
        roles: formValue.roles.split(',').map((r) => r.trim()).filter(Boolean),
      };
      const updated = await firstValueFrom(this.usersService.update(this.data.id, payload));
      this.dialogRef.close(updated);
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error.status === 409) {
        this.errorMessage.set('A user with this email already exists.');
      } else if (error.status === 404) {
        this.errorMessage.set('User no longer exists.');
      } else {
        this.errorMessage.set('Failed to update user. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
