import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError } from 'rxjs';
import { UsersService } from '../services/users';
import { UserProfile, CreateUserPayload } from '../models/user-profile';
import { CreateUserDialogComponent } from './create-user';

describe('CreateUserDialogComponent', () => {
  let usersServiceMock: { create: ReturnType<typeof vi.fn> };

  function setupComponent() {
    usersServiceMock = { create: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreateUserDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
      ],
    });
  }

  async function createFixture(visible = true) {
    const fixture = await TestBed.createComponent(CreateUserDialogComponent);
    fixture.componentRef.setInput('visible', visible);
    fixture.detectChanges();
    return fixture;
  }

  const mockCreatedUser: UserProfile = {
    id: 'new1',
    username: 'charlie',
    email: 'charlie@logicedu.com',
    fullName: 'Charlie Brown',
    status: 'ACTIVE',
    createdAt: '2026-03-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields when visible', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const nameInput = fixture.nativeElement.querySelector('input[placeholder="Nombre y apellido"]');
    const usernameInput = fixture.nativeElement.querySelector('input[placeholder="nombre.usuario"]');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(nameInput).toBeTruthy();
    expect(usernameInput).toBeTruthy();
  });

  it('should not render form when not visible', async () => {
    setupComponent();
    const fixture = await createFixture(false);

    const overlay = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]');
    expect(overlay).toBeNull();
  });

  it('should show validation error when fields are empty and submit clicked', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('requeridos');
    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });

  it('should call UsersService.create and emit created on valid submit', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(of(mockCreatedUser));
    const fixture = await createFixture(true);

    // Fill form
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'charlie@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));

    const usernameInput = fixture.nativeElement.querySelector('input[placeholder="nombre.usuario"]');
    usernameInput.value = 'charlie';
    usernameInput.dispatchEvent(new Event('input'));

    const nameInput = fixture.nativeElement.querySelector('input[placeholder="Nombre y apellido"]');
    nameInput.value = 'Charlie Brown';
    nameInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();

    await fixture.whenStable();

    expect(usersServiceMock.create).toHaveBeenCalledWith({
      username: 'charlie',
      email: 'charlie@logicedu.com',
      fullName: 'Charlie Brown',
      password: 'password123',
    } as CreateUserPayload);
  });

  it('should show error message on 409 conflict', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(throwError(() => ({ status: 409 })));
    const fixture = await createFixture(true);

    // Fill form
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'existing@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));

    const usernameInput = fixture.nativeElement.querySelector('input[placeholder="nombre.usuario"]');
    usernameInput.value = 'existing';
    usernameInput.dispatchEvent(new Event('input'));

    const nameInput = fixture.nativeElement.querySelector('input[placeholder="Nombre y apellido"]');
    nameInput.value = 'Existing';
    nameInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();

    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('ya en uso');
  });

  it('should emit cancel on cancel click', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    let cancelled = false;
    fixture.componentInstance.cancel.subscribe(() => { cancelled = true; });

    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]');
    cancelBtn.click();

    expect(cancelled).toBe(true);
  });

  it('should show password length error', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));

    const usernameInput = fixture.nativeElement.querySelector('input[placeholder="nombre.usuario"]');
    usernameInput.value = 'test';
    usernameInput.dispatchEvent(new Event('input'));

    const nameInput = fixture.nativeElement.querySelector('input[placeholder="Nombre y apellido"]');
    nameInput.value = 'Test';
    nameInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = '123';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('8 caracteres');
  });
});
