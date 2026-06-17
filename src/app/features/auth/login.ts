import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LucideLock, LucideMail, LucideEye, LucideEyeOff } from '@lucide/angular';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    LucideLock,
    LucideMail,
    LucideEye,
    LucideEyeOff,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly hidePassword = signal(true);
  readonly rememberMe = signal(false);

  constructor() {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    });

    this.form.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.loading.set(true);

    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      // Error message comes pre-translated from ErrorInterceptor
      const message = err instanceof Error ? err.message : 'Error de conexión';
      this.errorMessage.set(message);
      this.loading.set(false);
    }
  }
}
