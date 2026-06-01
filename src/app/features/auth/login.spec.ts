import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let router: Router;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    user: ReturnType<typeof signal<User | null>>;
    isAuthenticated: ReturnType<typeof computed<boolean>>;
  };

  function setupComponent(isAuth: boolean = false) {
    authServiceMock = {
      login: vi.fn(),
      user: signal(isAuth ? mockUser : null),
      isAuthenticated: computed(() => isAuth),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    router = TestBed.inject(Router);
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture;
  }

  const mockUser: User = {
    id: 'usr_test123',
    email: 'test@logicedu.com',
    displayName: 'Test User',
    roles: ['teacher'],
    token: 'test.jwt.token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with email and password fields', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const button = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Iniciar sesión');
  });

  it('should show validation errors when fields are empty and submitted', async () => {
    setupComponent();
    const fixture = await createFixture();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    expect(errors.length).toBeGreaterThan(0);
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call AuthService.login() on valid submit', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const form = fixture.nativeElement.querySelector('form');

    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    authServiceMock.login.mockResolvedValue(undefined);

    form.dispatchEvent(new Event('submit'));

    expect(authServiceMock.login).toHaveBeenCalledWith('test@logicedu.com', 'password123');
  });

  it('should show error message when login fails with 401', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const form = fixture.nativeElement.querySelector('form');

    emailInput.value = 'wrong@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'badpass1';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    authServiceMock.login.mockRejectedValue(new Error('Credenciales inválidas'));

    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.login-error');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Credenciales inválidas');
  });

  it('should navigate to /dashboard on successful login', async () => {
    setupComponent();
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const form = fixture.nativeElement.querySelector('form');

    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    authServiceMock.login.mockResolvedValue(undefined);

    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should disable submit button while loading', async () => {
    setupComponent();
    const fixture = await createFixture();

    // Fill in valid data to enable the button
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');

    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Make login hang to observe loading state
    let resolveLogin!: (value: void | PromiseLike<void>) => void;
    authServiceMock.login.mockReturnValue(new Promise<void>((resolve) => { resolveLogin = resolve; }));

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);

    // Clean up
    resolveLogin();
    await fixture.whenStable();
  });

  it('should redirect to /dashboard when already authenticated', async () => {
    const navigateSpy = vi.fn();
    setupComponent(true);

    // Override router navigate to track calls
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    const r = TestBed.inject(Router);
    const navSpy = vi.spyOn(r, 'navigate');
    await TestBed.createComponent(LoginComponent);
    TestBed.flushEffects();

    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show network error message on connection failure', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const form = fixture.nativeElement.querySelector('form');

    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    authServiceMock.login.mockRejectedValue(new Error('Error de conexión'));

    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.login-error');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Error de conexión');
  });

  it('should clear error message when user starts typing after a failed login', async () => {
    setupComponent();
    const fixture = await createFixture();

    // First, trigger an error
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const form = fixture.nativeElement.querySelector('form');

    emailInput.value = 'wrong@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'badpas1';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    authServiceMock.login.mockRejectedValue(new Error('Credenciales inválidas'));

    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.login-error')).toBeTruthy();

    // Now type a character — error should clear
    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.login-error')).toBeNull();
  });
});
