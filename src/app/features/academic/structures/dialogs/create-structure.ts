import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { StructuresService } from '../services/structures';
import { CreateAcademicStructureRequest } from '../models/structure';
import { AppDialog } from '../../../../shared/ui/app-dialog/app-dialog';
import { ToastService } from '../../../../core/services/toast';

@Component({
  selector: 'app-create-structure',
  imports: [ReactiveFormsModule, AppDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog
      title="Nueva Estructura Académica"
      confirmLabel="Crear"
      cancelLabel="Cancelar"
      [loading]="loading()"
      [(visible)]="visible"
      (confirm)="onSubmit()"
      (cancel)="visible.set(false)"
    >
      <form [formGroup]="form" class="dialog-form">
        <div class="form-field">
          <label>Tipo <span class="required">*</span></label>
          <select formControlName="structureType">
            <option value="">Seleccionar tipo...</option>
            <option value="PRIMARIA">Primaria</option>
            <option value="SECUNDARIA">Secundaria</option>
            <option value="MEDIA">Media</option>
            <option value="UNIVERSITARIA">Universitaria</option>
            <option value="PERSONALIZADA">Personalizada</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Niveles <span class="required">*</span></label>
            <input type="number" formControlName="levelsCount" min="1" max="20" placeholder="Ej: 6" />
          </div>
          <div class="form-field">
            <label>Períodos por Nivel <span class="required">*</span></label>
            <input type="number" formControlName="periodsPerLevel" min="1" max="12" placeholder="Ej: 4" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Cortes por Período <span class="required">*</span></label>
            <input type="number" formControlName="evaluationPeriodsPerPeriod" min="1" max="6" placeholder="Ej: 3" />
          </div>
          <div class="form-field">
            <label>Materias por Período <span class="required">*</span></label>
            <input type="number" formControlName="subjectsPerPeriod" min="1" max="20" placeholder="Ej: 8" />
          </div>
        </div>
        <div class="form-field">
          <label>Horas por Materia <span class="required">*</span></label>
          <input type="number" formControlName="hoursPerSubject" min="1" max="12" placeholder="Ej: 2" />
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
    .form-field input, .form-field select, .form-field textarea {
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
    .form-field select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 32px;
    }
    .form-field textarea {
      height: auto;
      padding: 8px 12px;
      resize: vertical;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
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
export class CreateStructureDialogComponent {
  private readonly structuresService = inject(StructuresService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly schoolId = input.required<string>();
  readonly visible = model(false);
  readonly created = output<any>();

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    structureType: ['', Validators.required],
    levelsCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    periodsPerLevel: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
    evaluationPeriodsPerPeriod: [1, [Validators.required, Validators.min(1), Validators.max(6)]],
    subjectsPerPeriod: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    hoursPerSubject: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload: CreateAcademicStructureRequest = {
      structureType: raw.structureType,
      levelsCount: raw.levelsCount,
      periodsPerLevel: raw.periodsPerLevel,
      evaluationPeriodsPerPeriod: raw.evaluationPeriodsPerPeriod,
      subjectsPerPeriod: raw.subjectsPerPeriod,
      hoursPerSubject: raw.hoursPerSubject,
    };

    try {
      const result = await firstValueFrom(this.structuresService.create(this.schoolId(), payload));
      this.visible.set(false);
      this.created.emit(result);
      this.toast.success('Estructura académica creada exitosamente');
    } catch (err: unknown) {
      this.errorMessage.set((err as Error).message || 'Error al crear la estructura');
    } finally {
      this.loading.set(false);
    }
  }
}
