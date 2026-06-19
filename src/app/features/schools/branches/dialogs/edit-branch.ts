import { ChangeDetectionStrategy, Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { BranchesService } from '../services/branches';
import { BranchResponse, UpdateBranchRequest } from '../models/branch';
import { AppDialog } from '../../../../shared/ui';

const CODE_PATTERN = /^[A-Z0-9-]+$/;

@Component({
  selector: 'app-edit-branch',
  imports: [ReactiveFormsModule, AppDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog title="Editar Sede" confirmLabel="Guardar" cancelLabel="Cancelar"
      [loading]="loading()" [(visible)]="visible" (confirm)="onSubmit()" (cancel)="visible.set(false)">
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <div class="form-field">
            <label>Nombre <span class="required">*</span></label>
            <input type="text" formControlName="name" placeholder="Nombre" />
          </div>
          <div class="form-field">
            <label>Código <span class="required">*</span></label>
            <input type="text" formControlName="code" placeholder="Código" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Nombre Corto <span class="required">*</span></label>
            <input type="text" formControlName="shortName" placeholder="Nombre corto" />
          </div>
          <div class="form-field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="email@ejemplo.com" />
          </div>
        </div>
        <div class="form-field">
          <label>Descripción</label>
          <textarea formControlName="description" placeholder="Descripción" rows="2"></textarea>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Teléfono</label>
            <input type="text" formControlName="phone" placeholder="+57 300 123 4567" />
          </div>
          <div class="form-field">
            <label>Dirección <span class="required">*</span></label>
            <input type="text" formControlName="address" placeholder="Dirección" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Ciudad</label>
            <input type="text" formControlName="city" placeholder="Ciudad" />
          </div>
          <div class="form-field">
            <label>País</label>
            <input type="text" formControlName="country" placeholder="País" />
          </div>
        </div>
        @if (errorMessage()) { <div class="field-error">{{ errorMessage() }}</div> }
      </form>
    </app-dialog>
  `,
  styles: `
    .dialog-form { display: flex; flex-direction: column; gap: 14px; }
    .form-row { display: flex; gap: 12px; }
    .form-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .form-field label { font-size: 13px; font-weight: 500; color: #374151; }
    .required { color: #ef4444; }
    .form-field input, .form-field textarea {
      padding: 0 12px; border: 1.5px solid #d1d5db; border-radius: 10px;
      font-family: Roboto, sans-serif; font-size: 14px; color: #111827; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-field input { height: 40px; }
    .form-field textarea { padding: 8px 12px; resize: vertical; min-height: 60px; }
    .form-field input:focus, .form-field textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .field-error { background: #fef2f2; color: #dc2626; padding: 8px 12px; border-radius: 8px; font-size: 13px; }
  `,
})
export class EditBranch {
  private readonly branchesService = inject(BranchesService);
  private readonly fb = inject(FormBuilder);

  readonly visible = model(false);
  readonly branchData = input.required<BranchResponse>();
  readonly saved = output<BranchResponse>();

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required, Validators.pattern(CODE_PATTERN)]],
    shortName: ['', [Validators.required]],
    description: [''],
    email: [''],
    phone: [''],
    address: ['', [Validators.required]],
    city: [''],
    country: [''],
  });

  constructor() {
    effect(() => {
      const b = this.branchData();
      this.patchForm(b);
    });
  }

  private patchForm(b: BranchResponse): void {
    this.form.patchValue({
      name: b.name,
      code: b.code,
      shortName: b.shortName,
      description: b.description || '',
      email: b.email || '',
      phone: b.phone || '',
      address: b.address,
      city: b.city || '',
      country: b.country || '',
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const b = this.branchData();
    if (!b) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload: UpdateBranchRequest = {
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
      const result = await firstValueFrom(this.branchesService.update(b.schoolId, b.id, payload));
      this.visible.set(false);
      this.saved.emit(result);
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
