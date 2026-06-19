import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { UserProfile, UpdateUserPayload } from '../models/user-profile';
import { AppDialog } from '../../../shared/ui';

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, AppDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog title="Editar Usuario" confirmLabel="Guardar" cancelLabel="Cancelar"
      [loading]="loading()" [(visible)]="visible" (confirm)="onSubmit()" (cancel)="visible.set(false)">
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <div class="form-field">
            <label>Primer Nombre <span class="required">*</span></label>
            <input type="text" formControlName="firstGivenName" placeholder="Primer nombre" />
          </div>
          <div class="form-field">
            <label>Segundo Nombre</label>
            <input type="text" formControlName="secondGivenName" placeholder="Segundo nombre (opcional)" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Primer Apellido <span class="required">*</span></label>
            <input type="text" formControlName="firstFamilyName" placeholder="Primer apellido" />
          </div>
          <div class="form-field">
            <label>Segundo Apellido</label>
            <input type="text" formControlName="secondFamilyName" placeholder="Segundo apellido (opcional)" />
          </div>
        </div>
        <div class="form-field">
          <label>Email <span class="required">*</span></label>
          <input type="email" formControlName="email" placeholder="email@ejemplo.com" />
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Tipo Documento</label>
            <select formControlName="documentType" class="form-select">
              <option value="">Seleccionar...</option>
              <option value="CC">CC — Cédula de Ciudadanía</option>
              <option value="TI">TI — Tarjeta de Identidad</option>
              <option value="CE">CE — Cédula de Extranjería</option>
              <option value="PP">PP — Pasaporte</option>
            </select>
          </div>
          <div class="form-field">
            <label>N° Documento</label>
            <input type="text" formControlName="documentValue" placeholder="Número de documento" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Fecha Nacimiento</label>
            <input type="date" formControlName="birthDate" />
          </div>
          <div class="form-field">
            <label>Sexo</label>
            <select formControlName="sex" class="form-select">
              <option value="">Seleccionar...</option>
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Femenino</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Teléfono</label>
            <input type="text" formControlName="phone" placeholder="+57 300 123 4567" />
          </div>
          <div class="form-field">
            <label>Ciudad</label>
            <input type="text" formControlName="city" placeholder="Medellín" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>Dirección</label>
            <input type="text" formControlName="address" placeholder="Calle 123 #45-67" />
          </div>
          <div class="form-field">
            <label>País</label>
            <input type="text" formControlName="country" placeholder="Colombia" />
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
    .form-field input {
      height: 40px; padding: 0 12px; border: 1.5px solid #d1d5db; border-radius: 10px;
      font-family: Roboto, sans-serif; font-size: 14px; color: #111827; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-field input:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .form-select { height: 40px; padding: 0 12px; border: 1.5px solid #d1d5db; border-radius: 10px; font-family: Roboto, sans-serif; font-size: 14px; color: #111827; outline: none; background: #fff; cursor: pointer; }
    .field-error { background: #fef2f2; color: #dc2626; padding: 8px 12px; border-radius: 8px; font-size: 13px; }
  `,
})
export class EditUser {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  readonly visible = model(false);
  readonly userData = model<UserProfile | null>(null);
  readonly saved = output<UserProfile>();

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    firstGivenName: ['', Validators.required],
    secondGivenName: [''],
    firstFamilyName: ['', Validators.required],
    secondFamilyName: [''],
    email: ['', [Validators.required, Validators.email]],
    documentType: [''],
    documentValue: [''],
    birthDate: [''],
    sex: [''],
    phone: [''],
    address: [''],
    city: [''],
    country: [''],
  });

  constructor() {
    effect(() => {
      const u = this.userData();
      if (u) this.patchForm(u);
    });
  }

  private patchForm(u: UserProfile): void {
    const parts = (u.fullName || '').trim().split(/\s+/);
    let firstGiven = '', secondGiven = '', firstFamily = '', secondFamily = '';

    if (parts.length === 1) {
      firstGiven = parts[0];
    } else if (parts.length === 2) {
      firstGiven = parts[0];
      firstFamily = parts[1];
    } else if (parts.length === 3) {
      firstGiven = parts[0];
      secondGiven = parts[1];
      firstFamily = parts[2];
    } else {
      // 4+ parts: distribute as firstGiven, secondGiven, firstFamily, secondFamily
      firstGiven = parts[0];
      secondGiven = parts.slice(1, parts.length - 2).join(' ');
      firstFamily = parts[parts.length - 2];
      secondFamily = parts[parts.length - 1];
    }

    this.form.patchValue({
      firstGivenName: u.firstGivenName || firstGiven,
      secondGivenName: u.secondGivenName || secondGiven,
      firstFamilyName: u.firstFamilyName || firstFamily,
      secondFamilyName: u.secondFamilyName || secondFamily,
      email: u.email,
      documentType: u.documentType || '',
      documentValue: u.documentValue || '',
      birthDate: u.birthDate || '',
      sex: u.sex || '',
      phone: u.phone || '',
      address: u.address || '',
      city: u.city || '',
      country: u.country || '',
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const u = this.userData();
    if (!u) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload: UpdateUserPayload = {
      email: raw.email,
      firstGivenName: raw.firstGivenName,
      secondGivenName: raw.secondGivenName || undefined,
      firstFamilyName: raw.firstFamilyName,
      secondFamilyName: raw.secondFamilyName || undefined,
      phone: raw.phone || undefined,
      address: raw.address || undefined,
      city: raw.city || undefined,
      country: raw.country || undefined,
      documentType: raw.documentType || undefined,
      documentValue: raw.documentValue || undefined,
      birthDate: raw.birthDate || undefined,
      sex: (raw.sex as 'MALE' | 'FEMALE') || undefined,
    };

    try {
      const result = await firstValueFrom(this.usersService.update(u.id, payload));
      this.visible.set(false);
      this.saved.emit(result);
    } catch (err: unknown) {
      this.errorMessage.set((err as Error).message || 'Error al actualizar');
    } finally {
      this.loading.set(false);
    }
  }
}
