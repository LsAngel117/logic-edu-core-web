import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AppDialog } from '../../../../shared/ui';
import { ToastService } from '../../../../core/services/toast';
import { roleLabel as getRoleLabel } from '../../../../core/constants/role-labels';
import { MembershipsService } from '../services/memberships';
import { UsersService } from '../../services/users';
import { SchoolsService } from '../../../schools/services/schools';
import { BranchesService } from '../../../schools/branches/services/branches';
import { AssignMembershipRequest } from '../models/membership';

/** Each role has an intrinsic scope type (backend domain rule). */
const ROLE_SCOPE: Record<string, string> = {
  PLATFORM_ADMIN: 'PLATFORM',
  SCHOOL_ADMIN: 'SCHOOL',
  BRANCH_ADMIN: 'BRANCH',
  TEACHER: 'COURSE',
  STUDENT: 'COURSE',
};

@Component({
  selector: 'app-add-membership',
  standalone: true,
  imports: [ReactiveFormsModule, AppDialog],
  template: `
    <app-dialog title="Agregar Membresía" confirmLabel="Agregar" cancelLabel="Cancelar"
      [loading]="loading()" [(visible)]="visible" (confirm)="onSubmit()" (cancel)="visible.set(false)">
      <form [formGroup]="form" class="dialog-form">
        <!-- User selector — only when adding from memberships page (no userId provided) -->
        @if (!userId()) {
          <div class="form-field">
            <label>Usuario <span class="required">*</span></label>
            <div class="search-wrapper">
              <input type="text" class="search-input" [value]="userSearch()" (input)="userSearch.set($any($event.target).value)"
                placeholder="Buscar por nombre, email o documento..." />
            </div>
            @if (selectedUserId()) {
              <p class="scope-hint">Seleccionado: <strong>{{ selectedUserLabel() }}</strong></p>
            }
            <div class="user-list">
              @for (u of filteredUsers(); track u.id) {
                <button type="button" class="user-option" [class.active]="u.id === selectedUserId()" (click)="selectedUserId.set(u.id)">
                  <span class="user-option-name">{{ u.fullName }}</span>
                  <span class="user-option-email">{{ u.email }}</span>
                </button>
              }
              @if (filteredUsers().length === 0 && userSearch()) {
                <p class="scope-hint">No se encontraron usuarios</p>
              }
            </div>
          </div>
        }

        <!-- Role selector -->
        <div class="form-field">
          <label>Rol <span class="required">*</span></label>
          <select formControlName="role" class="form-select">
            <option value="" disabled>Seleccionar rol</option>
            @for (r of roles; track r) { <option [value]="r">{{ roleLabel(r) }}</option> }
          </select>
        </div>

        <!-- Scope hint (derived from role) -->
        @if (scopeType(); as s) {
          <p class="scope-hint">Alcance: <strong>{{ s }}</strong>{{ s === 'PLATFORM' ? ' (sin restricción)' : '' }}</p>
        }

        <!-- SCHOOL_ADMIN: select school -->
        @if (scopeType() === 'SCHOOL') {
          <div class="form-field">
            <label>Institución <span class="required">*</span></label>
            <select formControlName="scopeRefId" class="form-select">
              <option value="" disabled>Seleccionar institución</option>
              @for (s of schools(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
            </select>
          </div>
        }

        <!-- BRANCH_ADMIN: select branch -->
        @if (scopeType() === 'BRANCH') {
          <div class="form-field">
            <label>Sede <span class="required">*</span></label>
            <select formControlName="scopeRefId" class="form-select">
              <option value="" disabled>Seleccionar sede</option>
              @for (b of branches(); track b.id) { <option [value]="b.id">{{ b.name }}</option> }
            </select>
          </div>
        }

        <!-- TEACHER/STUDENT (COURSE): text input for group ID -->
        @if (scopeType() === 'COURSE') {
          <div class="form-field">
            <label>ID del Grupo <span class="required">*</span></label>
            <input type="text" formControlName="scopeRefId" placeholder="Identificador del grupo" />
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
    .form-field input, .form-select { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 14px; outline: none; background: #fff; font-family: Roboto, sans-serif; transition: border-color 0.15s, box-shadow 0.15s; }
    .form-field input:focus, .form-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .field-error { font-size: 12px; color: #ef4444; margin-top: 2px; }
    .scope-hint { font-size: 13px; color: #6b7280; margin: 0; padding: 4px 0; }
    .search-wrapper { margin-bottom: 4px; }
    .search-input { width: 100%; padding: 8px 12px; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 13px; outline: none; font-family: Roboto, sans-serif; }
    .search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .user-list { max-height: 180px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
    .user-option { display: flex; flex-direction: column; align-items: flex-start; width: 100%; padding: 8px 12px; border: none; background: none; cursor: pointer; text-align: left; font-family: Roboto, sans-serif; border-bottom: 1px solid #f3f4f6; }
    .user-option:last-child { border-bottom: none; }
    .user-option:hover { background: #f9fafb; }
    .user-option.active { background: rgba(37,99,235,.06); }
    .user-option-name { font-size: 13px; font-weight: 500; color: #111827; }
    .user-option-email { font-size: 12px; color: #6b7280; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMembershipDialogComponent {
  private readonly membershipsService = inject(MembershipsService);
  private readonly toast = inject(ToastService);
  private readonly usersService = inject(UsersService);
  private readonly schoolsService = inject(SchoolsService);
  private readonly branchesService = inject(BranchesService);
  private readonly fb = inject(FormBuilder);

  readonly roles = Object.keys(ROLE_SCOPE);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly visible = model(false);
  readonly userId = input('');
  readonly selectedUserId = signal('');
  readonly userSearch = signal('');
  readonly created = output<void>();

  readonly users = signal<{ id: string; fullName: string; email: string; username: string; documentValue?: string }[]>([]);

  readonly filteredUsers = computed(() => {
    const s = this.userSearch().toLowerCase().trim();
    if (!s) return this.users().slice(0, 20);
    return this.users().filter(u =>
      u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.username.toLowerCase().includes(s) || (u.documentValue ?? '').toLowerCase().includes(s)
    ).slice(0, 20);
  });

  readonly selectedUserLabel = computed(() => {
    const u = this.users().find(u => u.id === this.selectedUserId());
    return u ? `${u.fullName} (${u.email})` : '';
  });

  readonly schools = signal<{ id: string; name: string }[]>([]);
  readonly branches = signal<{ id: string; name: string }[]>([]);

  readonly form = this.fb.nonNullable.group({
    role: ['', Validators.required],
    scopeRefId: [''],
  });

  /** Scope type is derived from role — no independent selector needed */
  readonly scopeType = signal('');

  readonly needsRef = computed(() => {
    const s = this.scopeType();
    return s !== 'PLATFORM' && s !== '';
  });

  roleLabel(role: string | undefined): string {
    return getRoleLabel(role);
  }

  constructor() {
    this.form.controls.role.valueChanges.subscribe((role) => {
      this.scopeType.set(ROLE_SCOPE[role] ?? '');
      this.form.controls.scopeRefId.reset();
    });
    // Load users for the dropdown
    this.usersService.getAll().subscribe((list) => this.users.set(list.map(u => ({ id: u.id, fullName: u.fullName, email: u.email, username: u.username, documentValue: u.documentValue }))));
    this.schoolsService.getAll().subscribe((list) => this.schools.set(list.map(s => ({ id: s.id, name: s.name }))));
    this.schoolsService.getAll().subscribe((schools) => {
      schools.forEach((s) => this.branchesService.getBySchool(s.id).subscribe((list) => {
        const cur = this.branches();
        list.forEach((b: any) => cur.push({ id: b.id, name: b.name }));
        this.branches.set([...cur]);
      }));
    });
  }

  async onSubmit(): Promise<void> {
    const uid = this.userId() || this.selectedUserId();
    if (!uid) { this.errorMessage.set('Selecciona un usuario'); return; }
    const role = this.form.controls.role.value;
    const ref = this.form.controls.scopeRefId.value;
    const scope = this.scopeType();

    if (!role) { this.form.markAllAsTouched(); return; }
    if (this.needsRef() && !ref) {
      this.errorMessage.set('La referencia es requerida para este alcance');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const payload: AssignMembershipRequest = {
      userId: uid,
      role,
      scopeType: scope,
      scopeRefId: scope === 'PLATFORM' ? '' : ref,
    };

    try {
      await firstValueFrom(this.membershipsService.assign(payload));
      this.created.emit();
      this.visible.set(false);
      this.toast.success('Membresía asignada exitosamente');
      this.form.reset();
    } catch (err: unknown) {
      const s = (err as { status?: number }).status;
      this.errorMessage.set(s === 409 ? 'Esta membresía ya existe' : s === 403 ? 'Permisos insuficientes' : 'Error al agregar membresía');
      this.loading.set(false);
    }
  }
}
