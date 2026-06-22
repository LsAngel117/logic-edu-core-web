import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SchoolsService } from '../services/schools';
import { CreateSchoolPayload } from '../models/school';
import { AppDialog } from '../../../shared/ui/app-dialog/app-dialog';
import { ToastService } from '../../../core/services/toast';

const CODE_PATTERN = /^[A-Z0-9-]+$/;

@Component({
  selector: 'app-create-school',
  imports: [ReactiveFormsModule, AppDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog
      title="Nueva Institución"
      confirmLabel="Crear"
      cancelLabel="Cancelar"
      [loading]="loading()"
      [(visible)]="visible"
      (confirm)="onSubmit()"
      (cancel)="visible.set(false)"
    >
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <div class="form-field">
            <label>Nombre <span class="required">*</span></label>
            <input type="text" formControlName="name" placeholder="Nombre de la institución" />
          </div>
          <div class="form-field">
            <label>Código <span class="required">*</span></label>
            <input type="text" formControlName="code" placeholder="Ej: COL-001" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Nombre Corto <span class="required">*</span></label>
            <input type="text" formControlName="shortName" placeholder="Sigla o abreviatura" />
          </div>
          <div class="form-field">
            <label>Teléfono</label>
            <input type="text" formControlName="phone" placeholder="+57 601 2345678" />
          </div>
        </div>
        <div class="form-field">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="info@institucion.edu.co" />
        </div>
        <div class="form-field">
          <label>Dirección <span class="required">*</span></label>
          <input type="text" formControlName="address" placeholder="Dirección física" />
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Ciudad</label>
            <input type="text" formControlName="city" placeholder="Ej: Medellín" />
          </div>
          <div class="form-field">
            <label>País</label>
            <input type="text" formControlName="country" placeholder="Ej: Colombia" />
          </div>
        </div>
        <div class="form-field">
          <label>Descripción</label>
          <textarea formControlName="description" placeholder="Descripción de la institución (opcional)" rows="2"></textarea>
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
      gap: 14px;
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .form-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-field label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    .required { color: #ef4444; }
    .form-field input, .form-field textarea {
      height: 40px;
      padding: 0 12px;
      border: 1.5px solid #d1d5db;
      border-radius: 10px;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: #111827;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-field textarea {
      height: auto;
      padding: 8px 12px;
      resize: vertical;
    }
    .form-field input:focus, .form-field textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .field-error {
      background: #fef2f2;
      color: #dc2626;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
    }
  `,
})
export class CreateSchoolDialogComponent {
  private readonly schoolsService = inject(SchoolsService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly visible = model(false);
  readonly created = output<any>();

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: ['', [Validators.required, Validators.pattern(CODE_PATTERN)]],
    shortName: ['', Validators.required],
    description: [''],
    email: [''],
    phone: [''],
    address: ['', Validators.required],
    city: [''],
    country: [''],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload: CreateSchoolPayload = {
      name: raw.name,
      code: raw.code,
      shortName: raw.shortName,
      description: raw.description || undefined,
      email: raw.email || undefined,
      phone: raw.phone || undefined,
      address: raw.address,
      city: raw.city || undefined,
      country: raw.country || undefined,
    };

    try {
      const result = await firstValueFrom(this.schoolsService.create(payload));
      this.visible.set(false);
      this.created.emit(result);
      this.toast.success('Institución creada exitosamente');
    } catch (err: unknown) {
      this.errorMessage.set((err as Error).message || 'Error al crear la institución');
    } finally {
      this.loading.set(false);
    }
  }
}
