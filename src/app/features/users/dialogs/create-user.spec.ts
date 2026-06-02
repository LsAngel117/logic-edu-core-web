import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UsersService } from '../services/users';
import { UserProfile, CreateUserPayload } from '../models/user-profile';
import { CreateUserDialogComponent } from './create-user';

describe('CreateUserDialogComponent', () => {
  let usersServiceMock: { create: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  function setupComponent() {
    usersServiceMock = { create: vi.fn() };
    dialogRefMock = { close: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreateUserDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(CreateUserDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  const mockCreatedUser: UserProfile = {
    id: 'new1',
    email: 'charlie@logicedu.com',
    displayName: 'Charlie',
    status: 'active',
    roles: ['teacher'],
    createdAt: '2026-03-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with email, name, password, and roles fields', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="displayName"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(emailInput).toBeTruthy();
    expect(nameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

  it('should show validation errors when form is submitted empty', async () => {
    setupComponent();
    const fixture = await createFixture();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    expect(errors.length).toBeGreaterThan(0);
    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });

  it('should show email format error for invalid email', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'not-an-email';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Fill other required fields
    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="displayName"]');
    nameInput.value = 'Test';
    nameInput.dispatchEvent(new Event('input'));
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const emailErrors = fixture.nativeElement.querySelectorAll('mat-error');
    expect(emailErrors.length).toBeGreaterThan(0);
    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });

  it('should call UsersService.create and close dialog on valid submit', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(of(mockCreatedUser));
    const fixture = await createFixture();

    // Fill form
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'charlie@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="displayName"]');
    nameInput.value = 'Charlie';
    nameInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();

    expect(usersServiceMock.create).toHaveBeenCalledWith({
      email: 'charlie@logicedu.com',
      displayName: 'Charlie',
      password: 'password123',
      roles: [],
    } as CreateUserPayload);
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockCreatedUser);
  });

  it('should show error message when service returns 409 conflict', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(throwError(() => ({ status: 409 })));
    const fixture = await createFixture();

    // Fill form with valid data
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'existing@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="displayName"]');
    nameInput.value = 'Existing User';
    nameInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Email already in use');
  });

  it('should show error message for 403 forbidden', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(throwError(() => ({ status: 403 })));
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="displayName"]');
    nameInput.value = 'Test';
    nameInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Insufficient permissions');
  });

  it('should close dialog without result on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    expect(cancelButton).toBeTruthy();
    cancelButton.click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });

  it('should show password length error when password is too short', async () => {
    setupComponent();
    const fixture = await createFixture();

    const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
    emailInput.value = 'test@logicedu.com';
    emailInput.dispatchEvent(new Event('input'));

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="displayName"]');
    nameInput.value = 'Test';
    nameInput.dispatchEvent(new Event('input'));

    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    passwordInput.value = '123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    const passwordError = Array.from(errors as Element[]).find(
      (e) => e.textContent?.includes('at least 8')
    );
    expect(passwordError).toBeTruthy();
    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });
});
