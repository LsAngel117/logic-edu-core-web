import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AppDialog } from '../../../../shared/ui';
import { MembershipsService } from '../services/memberships';
import { SchoolsService } from '../../../schools/services/schools';
import { BranchesService } from '../../../schools/branches/services/branches';
import { AssignMembershipRequest } from '../models/membership';

const ROLES = ['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'] as const;
const SCOPE_TYPES = ['PLATFORM', 'SCHOOL', 'BRANCH', 'ACADEMY', 'COURSE'] as const;

@Component({
  selector: 'app-add-membership',
  standalone: true,
  imports: [ReactiveFormsModule, AppDialog],
  template: `
    <app-dialog title="Agregar Membresía" confirmLabel="Agregar" cancelLabel="Cancelar"
      [loading]="loading()" [(visible)]="visible" (confirm)="onSubmit()" (cancel)="visible.set(false)">
      <form [formGroup]="form" class="dialog-form">
        <div class="form-field">
          <label>Rol <span class="required">*</span></label>
          <select formControlName="role" class="form-select">
            <option value="" disabled>Seleccionar rol</option>
            @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
        <div class="form-field">
          <label>Alcance <span class="required">*</span></label>
          <select formControlName="scopeType" class="form-select">
            <option value="" disabled>Seleccionar alcance</option>
            @for (s of scopeTypes; track s) { <option [value]="s">{{ s }}</option> }
          </select>
        </div>

        <!-- PLATFORM: no ref needed -->
        @if (form.controls.scopeType.value === 'PLATFORM') {
          <p class="scope-hint">El alcance PLATFORM no requiere referencia.</p>
        }

        <!-- SCHOOL: select a school -->
        @if (form.controls.scopeType.value === 'SCHOOL') {
          <div class="form-field">
            <label>Institución <span class="required">*</span></label>
            <select formControlName="scopeRefId" class="form-select">
              <option value="" disabled>Seleccionar institución</option>
              @for (s of schools(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
            </select>
          </div>
        }

        <!-- BRANCH: select a branch -->
        @if (form.controls.scopeType.value === 'BRANCH') {
          <div class="form-field">
            <label>Sede <span class="required">*</span></label>
            <select formControlName="scopeRefId" class="form-select">
              <option value="" disabled>Seleccionar sede</option>
              @for (b of branches(); track b.id) { <option [value]="b.id">{{ b.name }}</option> }
            </select>
          </div>
        }

        <!-- ACADEMY or COURSE: text input -->
        @if (form.controls.scopeType.value === 'ACADEMY' || form.controls.scopeType.value === 'COURSE') {
          <div class="form-field">
            <label>ID de Referencia <span class="required">*</span></label>
            <input type="text" formControlName="scopeRefId" placeholder="Identificador" />
          </div>
        }

        @if (errorMessage()) { <div class="field-error">{{ errorMessage() }}</div> }
      </form>
    </app-dialog>
  `,
  styles: `
    .dialog-form { display: flex; flex-direction: column; gap: 14px; padding: 4px 0; }
    .form-field { display: flex; flex-direction: column; gap: 4px; }
    .form-field label { font-size: 13px; font-weight: 500; color: #374151; }
    .required { color: #ef4444; }
    .form-field input, .form-select { padding: 10px 12px; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 14px; outline: none; background: #fff; font-family: Roboto, sans-serif; transition: border-color 0.15s, box-shadow 0.15s; }
    .form-field input:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .field-error { font-size: 12px; color: #ef4444; margin-top: 2px; }
    .scope-hint { font-size: 13px; color: #6b7280; margin: 0; padding: 4px 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMembershipDialogComponent {
  private readonly membershipsService = inject(MembershipsService);
  private readonly schoolsService = inject(SchoolsService);
  private readonly branchesService = inject(BranchesService);
  private readonly fb = inject(FormBuilder);

  readonly roles = ROLES;
  readonly scopeTypes = SCOPE_TYPES;
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly visible = model(false);
  readonly userId = input.required<string>();
  readonly created = output<void>();

  readonly schools = signal<{ id: string; name: string }[]>([]);
  readonly branches = signal<{ id: string; name: string }[]>([]);

  readonly form = this.fb.nonNullable.group({
    role: ['', Validators.required],
    scopeType: ['', Validators.required],
    scopeRefId: [''],
  });

  readonly needsRef = computed(() => {
    const t = this.form.controls.scopeType.value;
    return t !== 'PLATFORM' && t !== '';
  });

  constructor() {
    // Pre-fetch schools and branches
    this.schoolsService.getAll().subscribe((list) => this.schools.set(list.map(s => ({ id: s.id, name: s.name }))));
    // Fetch all branches across all schools
    this.schoolsService.getAll().subscribe((schools) => {
      schools.forEach((s) => this.branchesService.getBySchool(s.id).subscribe((list) => {
        const current = this.branches();
        list.forEach((b: any) => current.push({ id: b.id, name: b.name }));
        this.branches.set([...current]);
      }));
    });
  }

  async onSubmit(): Promise<void> {
    const st = this.form.controls.scopeType.value;
    const ref = this.form.controls.scopeRefId.value;

    if (!this.form.controls.role.value || !st) { this.form.markAllAsTouched(); return; }
    if (this.needsRef() && !ref) {
      this.errorMessage.set('La referencia de alcance es requerida');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const payload: AssignMembershipRequest = {
      userId: this.userId(),
      role: this.form.controls.role.value,
      scopeType: st,
      scopeRefId: st === 'PLATFORM' ? '' : ref,
    };

    try {
      await firstValueFrom(this.membershipsService.assign(payload));
      this.created.emit();
      this.visible.set(false);
      this.form.reset();
    } catch (err: unknown) {
      const s = (err as { status?: number }).status;
      this.errorMessage.set(s === 409 ? 'Esta membresía ya existe' : s === 403 ? 'Permisos insuficientes' : 'Error al agregar membresía');
      this.loading.set(false);
    }
  }
}
