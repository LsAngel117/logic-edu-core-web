import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { computed, signal } from '@angular/core';
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
      imports: [LoginComponent],
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

  // --- Task 1: Form field rendering ---
  it('should render form with email and password fields', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');
    const button = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Iniciar sesión');
  });

  // --- Task 2: Validation errors ---
  it('should show validation errors when fields are empty and submitted', async () => {
    setupComponent();
    const fixture = await createFixture();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('.field-error');
    expect(errors.length).toBeGreaterThan(0);
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  // --- Task 3: Successful login call ---
  it('should call AuthService.login() on valid submit', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');
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

  // --- Task 4: Error message display ---
  it('should show error message when login fails with 401', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');
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

    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Credenciales inválidas');
  });

  // --- Task 5: Navigation on success ---
  it('should navigate to /dashboard on successful login', async () => {
    setupComponent();
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');
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

  // --- Task 6: Disabled button while loading ---
  it('should disable submit button while loading', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');

    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    let resolveLogin!: (value: void | PromiseLike<void>) => void;
    authServiceMock.login.mockReturnValue(new Promise<void>((resolve) => { resolveLogin = resolve; }));

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);

    resolveLogin();
    await fixture.whenStable();
  });

  // --- Task 7: Already authenticated redirect ---
  it('should redirect to /dashboard when already authenticated', async () => {
    setupComponent(true);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
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

  // --- Task 8: Network error message ---
  it('should show network error message on connection failure', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');
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

    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Error de conexión');
  });

  // --- Task 9: Error clears on typing ---
  it('should clear error message when user starts typing after a failed login', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');
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

    expect(fixture.nativeElement.querySelector('.error-message')).toBeTruthy();

    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error-message')).toBeNull();
  });

  // --- Task 10: Password visibility toggle ---
  it('should toggle password visibility when clicking the toggle icon', async () => {
    setupComponent();
    const fixture = await createFixture();

    const passwordInput = fixture.nativeElement.querySelector(
      '[formControlName="password"]',
    ) as HTMLInputElement;
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.type).toBe('password');

    // Find the visibility toggle button
    const toggleButton = fixture.nativeElement.querySelector(
      '.toggle-visibility',
    ) as HTMLButtonElement;
    expect(toggleButton).toBeTruthy();

    // Click to show password
    toggleButton.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');

    // Click again to hide password
    toggleButton.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('password');
  });

  // --- Task 11: Remember me checkbox ---
  it('should have a remember me checkbox', async () => {
    setupComponent();
    const fixture = await createFixture();

    const checkbox = fixture.nativeElement.querySelector('.custom-checkbox');
    expect(checkbox).toBeTruthy();
  });

  // --- Task 12: Loading text ---
  it('should display "Iniciando sesión..." while submitting', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('[formControlName="password"]');

    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    let resolveLogin!: (value: void | PromiseLike<void>) => void;
    authServiceMock.login.mockReturnValue(new Promise<void>((resolve) => { resolveLogin = resolve; }));

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.textContent).toContain('Iniciando sesión');

    resolveLogin();
    await fixture.whenStable();
  });

  // --- Task 13: Hero section exists ---
  it('should render the hero section with brand and title', async () => {
    setupComponent();
    const fixture = await createFixture();

    const heroSection = fixture.nativeElement.querySelector('.login-left');
    expect(heroSection).toBeTruthy();

    const branding = heroSection.querySelector('.branding');
    expect(branding).toBeTruthy();
    expect(branding.textContent).toContain('LogicEdu');

    const welcomeHeading = heroSection.querySelector('h1');
    expect(welcomeHeading).toBeTruthy();
    expect(welcomeHeading.textContent).toContain('Bienvenido');
  });

  // --- Task 14: Auth card structure ---
  it('should render auth card with title and icon', async () => {
    setupComponent();
    const fixture = await createFixture();

    const cardTitle = fixture.nativeElement.querySelector('.auth-title');
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.textContent).toContain('Iniciar sesión');

    const lockIcon = fixture.nativeElement.querySelector('.icon-circle svg[lucideLock]');
    expect(lockIcon).toBeTruthy();
  });

  // --- Task 15: Footer text ---
  it('should display copyright footer', async () => {
    setupComponent();
    const fixture = await createFixture();

    const footer = fixture.nativeElement.querySelector('.login-footer');
    expect(footer).toBeTruthy();
    expect(footer.textContent).toContain('© 2026 LogosSystemsIT');
  });

  // --- Task 16: Password toggle icon (TRIANGULATE) ---
  it('should toggle between eye-off and eye icons', async () => {
    setupComponent();
    const fixture = await createFixture();

    const toggleButton = fixture.nativeElement.querySelector('.toggle-visibility');
    expect(toggleButton).toBeTruthy();

    // Default: password hidden → eye-off icon present, eye absent
    const eyeOff = toggleButton.querySelector('svg[lucideEyeOff]');
    const eyeVisible = toggleButton.querySelector('svg[lucideEye]');
    expect(eyeOff).toBeTruthy();
    expect(eyeVisible).toBeNull();

    toggleButton.click();
    fixture.detectChanges();

    // After toggle: password visible → eye icon present, eye-off absent
    const eyeNow = toggleButton.querySelector('svg[lucideEye]');
    const eyeOffNow = toggleButton.querySelector('svg[lucideEyeOff]');
    expect(eyeNow).toBeTruthy();
    expect(eyeOffNow).toBeNull();

    toggleButton.click();
    fixture.detectChanges();

    // Back to hidden
    const eyeOffBack = toggleButton.querySelector('svg[lucideEyeOff]');
    expect(eyeOffBack).toBeTruthy();
  });

  // --- Task 17: Forgot password link (TRIANGULATE) ---
  it('should render forgot password link', async () => {
    setupComponent();
    const fixture = await createFixture();

    const forgotLink = fixture.nativeElement.querySelector('.forgot-link');
    expect(forgotLink).toBeTruthy();
    expect(forgotLink.textContent).toContain('Olvidaste');
    expect(forgotLink.getAttribute('href')).toBe('#');
  });

  // --- Task 18: Form field prefix icons (TRIANGULATE) ---
  it('should have Lucide prefix icons next to inputs', async () => {
    setupComponent();
    const fixture = await createFixture();

    const inputGroups = fixture.nativeElement.querySelectorAll('.input-group');
    expect(inputGroups.length).toBeGreaterThanOrEqual(2);

    // Each input-group should contain an .input-icon svg
    const prefixIcons = fixture.nativeElement.querySelectorAll('.input-icon');
    expect(prefixIcons.length).toBeGreaterThanOrEqual(2);
  });

  // --- Task 19: Hero subtitle text ---
  it('should render hero subtitle with platform description', async () => {
    setupComponent();
    const fixture = await createFixture();

    const subtitle = fixture.nativeElement.querySelector('.hero-subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain('Plataforma integral');
  });
});
