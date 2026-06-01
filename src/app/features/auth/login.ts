import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
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
      const message = err instanceof Error ? err.message : 'Error de conexión';
      this.errorMessage.set(message);
      this.loading.set(false);
    }
  }
}
