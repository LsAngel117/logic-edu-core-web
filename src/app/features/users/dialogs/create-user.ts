import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../services/users';
import { CreateUserPayload } from '../models/user-profile';
import { AppDialog } from '../../../shared/ui';

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

  readonly username = signal('');
  readonly email = signal('');
  readonly fullName = signal('');
  readonly password = signal('');

  readonly created = output<void>();
  readonly cancel = output<void>();

  updateField(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    switch (field) {
      case 'username':
        this.username.set(input.value);
        break;
      case 'email':
        this.email.set(input.value);
        break;
      case 'fullName':
        this.fullName.set(input.value);
        break;
      case 'password':
        this.password.set(input.value);
        break;
    }
  }

  async onSubmit(): Promise<void> {
    const u = this.username().trim();
    const e = this.email().trim();
    const n = this.fullName().trim();
    const p = this.password();

    if (!u || !e || !n || !p) {
      this.errorMessage.set('Todos los campos son requeridos');
      return;
    }
    if (!e.includes('@')) {
      this.errorMessage.set('Formato de email inválido');
      return;
    }
    if (p.length < 8) {
      this.errorMessage.set('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const payload: CreateUserPayload = {
      username: u,
      email: e,
      fullName: n,
      password: p,
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
    this.username.set('');
    this.email.set('');
    this.fullName.set('');
    this.password.set('');
    this.errorMessage.set('');
  }
}
