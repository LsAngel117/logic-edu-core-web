import { ChangeDetectionStrategy, Component, computed, inject, model, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { CreateUserPayload } from '../models/user-profile';
import { AppDialog } from '../../../shared/ui';

const ROLE_SCOPE: Record<string, string> = {
  PLATFORM_ADMIN: 'PLATFORM',
  SCHOOL_ADMIN: 'SCHOOL',
  BRANCH_ADMIN: 'BRANCH',
  TEACHER: 'COURSE',
  STUDENT: 'COURSE',
};

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [AppDialog],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserDialogComponent {
  private readonly usersService = inject(UsersService);

  readonly visible = model(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  // Form fields
  readonly email = signal('');
  readonly rawPassword = signal('');
  readonly firstGivenName = signal('');
  readonly secondGivenName = signal('');
  readonly firstFamilyName = signal('');
  readonly secondFamilyName = signal('');
  readonly sex = signal<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  readonly birthDate = signal('');
  readonly documentType = signal('');
  readonly documentValue = signal('');
  readonly role = signal('');
  readonly scopeRefId = signal('');
  readonly phone = signal('');
  readonly address = signal('');
  readonly city = signal('');
  readonly country = signal('');

  readonly created = output<void>();
  readonly cancel = output<void>();

  readonly roleScopeType = computed(() => ROLE_SCOPE[this.role()] ?? '');

  // Show scopeRefId when scope is not PLATFORM
  readonly showScopeRefId = computed(() => {
    const s = this.roleScopeType();
    return s !== 'PLATFORM' && s !== '';
  });

  updateTextField(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    (this as unknown as Record<string, ReturnType<typeof signal>>)[field]?.set(input.value);
  }

  updateSelectField(field: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    (this as unknown as Record<string, ReturnType<typeof signal>>)[field]?.set(select.value);
  }

  async onSubmit(): Promise<void> {
    const em = this.email().trim();
    const pwd = this.rawPassword();
    const fgn = this.firstGivenName().trim();
    const ffn = this.firstFamilyName().trim();
    const sx = this.sex();
    const bd = this.birthDate();
    const dt = this.documentType();
    const dv = this.documentValue().trim();
    const rl = this.role();
    const st = this.roleScopeType();

    // Required fields validation
    if (!em || !pwd || !fgn || !ffn || !sx || !bd || !dt || !dv || !rl || !st) {
      this.errorMessage.set('Todos los campos requeridos deben estar completos');
      return;
    }
    if (!em.includes('@')) {
      this.errorMessage.set('Formato de email inválido');
      return;
    }
    if (pwd.length < 8) {
      this.errorMessage.set('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const payload: CreateUserPayload = {
      email: em,
      rawPassword: pwd,
      firstGivenName: fgn,
      secondGivenName: this.secondGivenName().trim() || undefined,
      firstFamilyName: ffn,
      secondFamilyName: this.secondFamilyName().trim() || undefined,
      sex: sx as 'MALE' | 'FEMALE' | 'OTHER',
      birthDate: bd,
      documentType: dt,
      documentValue: dv,
      role: rl,
      scopeType: st as 'SCHOOL' | 'BRANCH' | 'ALL',
      scopeRefId: this.scopeRefId().trim() || undefined,
      phone: this.phone().trim() || undefined,
      address: this.address().trim() || undefined,
      city: this.city().trim() || undefined,
      country: this.country().trim() || undefined,
    };

    try {
      await firstValueFrom(this.usersService.create(payload));
      this.visible.set(false);
      this.created.emit();
      this.resetForm();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        this.errorMessage.set('Email o nombre de usuario ya en uso');
      } else if (status === 403) {
        this.errorMessage.set('Permisos insuficientes');
      } else {
        this.errorMessage.set('Ocurrió un error');
      }
    } finally {
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.visible.set(false);
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.email.set('');
    this.rawPassword.set('');
    this.firstGivenName.set('');
    this.secondGivenName.set('');
    this.firstFamilyName.set('');
    this.secondFamilyName.set('');
    this.sex.set('');
    this.birthDate.set('');
    this.documentType.set('');
    this.documentValue.set('');
    this.role.set('');
    this.scopeRefId.set('');
    this.phone.set('');
    this.address.set('');
    this.city.set('');
    this.country.set('');
    this.errorMessage.set('');
  }
}
