import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AppDialog } from '../../../shared/ui';
import { UsersService } from '../services/users';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPass = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPass && confirm && newPass !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, AppDialog],
  template: `
    <app-dialog
      title="Restablecer Contraseña"
      confirmLabel="Cambiar"
      cancelLabel="Cancelar"
      [loading]="loading()"
      [(visible)]="visible"
      (confirm)="onSubmit()"
      (cancel)="visible.set(false)"
    >
      <form [formGroup]="form" class="dialog-form">
        <div class="form-field">
          <label>Nueva contraseña <span class="required">*</span></label>
          <input
            type="password"
            formControlName="newPassword"
            placeholder="Mínimo 8 caracteres"
          />
          @if (
            form.controls.newPassword.touched &&
            form.controls.newPassword.hasError('minlength')
          ) {
            <span class="field-error">La contraseña debe tener al menos 8 caracteres</span>
          }
          @if (
            form.controls.newPassword.touched &&
            form.controls.newPassword.hasError('required')
          ) {
            <span class="field-error">La nueva contraseña es requerida</span>
          }
        </div>
        <div class="form-field">
          <label>Confirmar contraseña <span class="required">*</span></label>
          <input
            type="password"
            formControlName="confirmPassword"
            placeholder="Repetir contraseña"
          />
          @if (
            form.controls.confirmPassword.touched &&
            form.controls.confirmPassword.hasError('required')
          ) {
            <span class="field-error">Confirmar contraseña es requerido</span>
          }
        </div>
        @if (form.hasError('mismatch') && form.touched) {
          <div class="field-error">Las contraseñas no coinciden</div>
        }
        @if (errorMessage()) {
          <div class="field-error">{{ errorMessage() }}</div>
        }
      </form>
    </app-dialog>
  `,
  styles: `
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 4px 0;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-field label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    .required {
      color: #ef4444;
    }
    .form-field input {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;
    }
    .form-field input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .field-error {
      font-size: 12px;
      color: #ef4444;
      margin-top: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  readonly visible = model(false);
  readonly userId = input.required<string>();
  readonly changed = output<void>();

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly form: FormGroup<{
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  constructor() {
    this.form = this.fb.nonNullable.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator },
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

    try {
      // Admin reset: only newPassword is sent (no currentPassword needed)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await firstValueFrom(
        this.usersService.changePassword(this.userId(), { newPassword: raw.newPassword } as any),
      );
      this.changed.emit();
      this.visible.set(false);
      this.form.reset();
    } catch (err: unknown) {
      const e = err as { error?: { message?: string }; message?: string };
      this.errorMessage.set(
        e.error?.message || e.message || 'Error al cambiar la contraseña',
      );
      this.loading.set(false);
    }
  }
}
