import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AppDialog } from '../../../../shared/ui';
import { MembershipsService } from '../services/memberships';
import { AssignMembershipRequest } from '../models/membership';

const AVAILABLE_ROLES = ['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'] as const;
const AVAILABLE_SCOPE_TYPES = ['GLOBAL', 'SCHOOL', 'BRANCH'] as const;

@Component({
  selector: 'app-add-membership',
  standalone: true,
  imports: [ReactiveFormsModule, AppDialog],
  template: `
    <app-dialog
      title="Agregar Membresía"
      confirmLabel="Agregar"
      cancelLabel="Cancelar"
      [loading]="loading()"
      [(visible)]="visible"
      (confirm)="onSubmit()"
      (cancel)="visible.set(false)"
    >
      <form [formGroup]="form" class="dialog-form">
        <div class="form-field">
          <label>Rol <span class="required">*</span></label>
          <select formControlName="role" class="form-select">
            <option value="" disabled>Seleccionar rol</option>
            @for (r of roles; track r) {
              <option [value]="r">{{ r }}</option>
            }
          </select>
          @if (form.controls.role.touched && form.controls.role.hasError('required')) {
            <span class="field-error">El rol es requerido</span>
          }
        </div>
        <div class="form-field">
          <label>Alcance <span class="required">*</span></label>
          <select formControlName="scopeType" class="form-select">
            <option value="" disabled>Seleccionar alcance</option>
            @for (s of scopeTypes; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
          @if (form.controls.scopeType.touched && form.controls.scopeType.hasError('required')) {
            <span class="field-error">El alcance es requerido</span>
          }
        </div>
        <div class="form-field">
          <label>ID de Referencia <span class="required">*</span></label>
          <input
            type="text"
            formControlName="scopeRefId"
            placeholder="Ej: school-123"
          />
          @if (form.controls.scopeRefId.touched && form.controls.scopeRefId.hasError('required')) {
            <span class="field-error">El ID de referencia es requerido</span>
          }
        </div>
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
    .form-field input,
    .form-select {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;
      background: #fff;
      font-family: inherit;
    }
    .form-field input:focus,
    .form-select:focus {
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
export class AddMembershipDialogComponent {
  private readonly membershipsService = inject(MembershipsService);
  private readonly fb = inject(FormBuilder);

  readonly roles = AVAILABLE_ROLES;
  readonly scopeTypes = AVAILABLE_SCOPE_TYPES;
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly visible = model(false);
  readonly userId = input.required<string>();
  readonly created = output<void>();

  readonly form: FormGroup<{
    role: FormControl<string>;
    scopeType: FormControl<string>;
    scopeRefId: FormControl<string>;
  }>;

  constructor() {
    this.form = this.fb.nonNullable.group({
      role: ['', [Validators.required]],
      scopeType: ['', [Validators.required]],
      scopeRefId: ['', [Validators.required]],
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
    const payload: AssignMembershipRequest = {
      userId: this.userId(),
      role: raw.role,
      scopeType: raw.scopeType,
      scopeRefId: raw.scopeRefId,
    };

    try {
      await firstValueFrom(this.membershipsService.assign(payload));
      this.created.emit();
      this.visible.set(false);
      this.form.reset();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        this.errorMessage.set('Esta membresía ya existe');
      } else if (status === 403) {
        this.errorMessage.set('Permisos insuficientes');
      } else {
        this.errorMessage.set('Error al agregar membresía');
      }
      this.loading.set(false);
    }
  }
}
