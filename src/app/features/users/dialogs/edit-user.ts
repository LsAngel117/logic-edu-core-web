import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
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
    <app-dialog
      title="Editar Usuario"
      confirmLabel="Guardar"
      cancelLabel="Cancelar"
      [loading]="loading()"
      [(visible)]="visible"
      (confirm)="onSubmit()"
      (cancel)="visible.set(false)"
    >
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <div class="form-field">
            <label>Email <span class="required">*</span></label>
            <input type="email" formControlName="email" placeholder="email@ejemplo.com" />
          </div>
          <div class="form-field">
            <label>Nombre completo <span class="required">*</span></label>
            <input type="text" formControlName="fullName" placeholder="Nombre completo" />
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
        @if (errorMessage()) {
          <div class="field-error">{{ errorMessage() }}</div>
        }
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
    .form-field input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
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
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', Validators.required],
    phone: [''],
    address: [''],
    city: [''],
    country: [''],
  });

  constructor() {
    // Patch form when userData changes
    const u = this.userData();
    if (u) this.patchForm(u);
  }

  private patchForm(u: UserProfile): void {
    this.form.patchValue({
      email: u.email,
      fullName: u.fullName,
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
      email: raw.email, fullName: raw.fullName,
      phone: raw.phone || undefined, address: raw.address || undefined,
      city: raw.city || undefined, country: raw.country || undefined,
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
