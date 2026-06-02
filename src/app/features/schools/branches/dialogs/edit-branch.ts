import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { BranchesService } from '../services/branches';
import { Branch } from '../models/branch';

const CODE_PATTERN = /^[A-Z0-9-]+$/;

@Component({
  selector: 'app-edit-branch',
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
    <h2 mat-dialog-title>Edit Branch</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-branch-form">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
          @if (form.controls.name.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" />
          @if (form.controls.code.hasError('required')) {
            <mat-error>Code is required</mat-error>
          }
          @if (form.controls.code.hasError('pattern')) {
            <mat-error>Invalid code format. Use uppercase letters, numbers, and hyphens.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="3"></textarea>
          @if (form.controls.address.hasError('required')) {
            <mat-error>Address is required</mat-error>
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
    .edit-branch-form {
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
export class EditBranchDialogComponent {
  private readonly branchesService = inject(BranchesService);
  private readonly dialogRef = inject(MatDialogRef<EditBranchDialogComponent>);
  private readonly data: Branch = inject(MAT_DIALOG_DATA);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = inject(FormBuilder).group({
    name: [this.data.name, [Validators.required]],
    code: [this.data.code, [Validators.required, Validators.pattern(CODE_PATTERN)]],
    address: [this.data.address, [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.form.getRawValue() as { name: string; code: string; address: string };
      const payload = {
        name: formValue.name,
        code: formValue.code,
        address: formValue.address,
      };
      const updated = await firstValueFrom(this.branchesService.update(this.data.id, payload));
      this.dialogRef.close(updated);
    } catch (err: unknown) {
      const error = err as { status?: number };
      if (error.status === 409) {
        this.errorMessage.set('A branch with this code already exists in this school.');
      } else if (error.status === 404) {
        this.errorMessage.set('Branch no longer exists.');
      } else {
        this.errorMessage.set('Failed to update branch. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
