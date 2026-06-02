import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UsersService } from '../services/users';
import { PasswordDialogComponent } from './password';

describe('PasswordDialogComponent', () => {
  let usersServiceMock: { changePassword: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const dialogData = { userId: 'u1' };

  function setupComponent() {
    usersServiceMock = { changePassword: vi.fn() };
    dialogRefMock = { close: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PasswordDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(PasswordDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with current password, new password, and confirm password fields', async () => {
    setupComponent();
    const fixture = await createFixture();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBe(3);

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();

    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    expect(cancelButton).toBeTruthy();
  });

  it('should show validation errors when form is submitted empty', async () => {
    setupComponent();
    const fixture = await createFixture();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    expect(errors.length).toBeGreaterThan(0);
    expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
  });

  it('should show mismatch error when new password and confirm password differ', async () => {
    setupComponent();
    const fixture = await createFixture();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
    const currentInput = inputs[0];
    const newInput = inputs[1];
    const confirmInput = inputs[2];

    currentInput.value = 'oldpass123';
    currentInput.dispatchEvent(new Event('input'));
    newInput.value = 'newpass123';
    newInput.dispatchEvent(new Event('input'));
    confirmInput.value = 'different';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    const mismatchError = Array.from(errors as Element[]).find(
      (e) => e.textContent?.includes('match')
    );
    expect(mismatchError).toBeTruthy();
    expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
  });

  it('should show minLength error when new password is too short', async () => {
    setupComponent();
    const fixture = await createFixture();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
    const currentInput = inputs[0];
    const newInput = inputs[1];
    const confirmInput = inputs[2];

    currentInput.value = 'oldpass123';
    currentInput.dispatchEvent(new Event('input'));
    newInput.value = '123';
    newInput.dispatchEvent(new Event('input'));
    confirmInput.value = '123';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    const lengthError = Array.from(errors as Element[]).find(
      (e) => e.textContent?.includes('at least 8')
    );
    expect(lengthError).toBeTruthy();
    expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
  });

  it('should call UsersService.changePassword with userId and payload on valid submit', async () => {
    setupComponent();
    usersServiceMock.changePassword.mockReturnValue(of(undefined));
    const fixture = await createFixture();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
    const currentInput = inputs[0];
    const newInput = inputs[1];
    const confirmInput = inputs[2];

    currentInput.value = 'oldpass123';
    currentInput.dispatchEvent(new Event('input'));
    newInput.value = 'newpass456';
    newInput.dispatchEvent(new Event('input'));
    confirmInput.value = 'newpass456';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();

    expect(usersServiceMock.changePassword).toHaveBeenCalledWith('u1', {
      currentPassword: 'oldpass123',
      newPassword: 'newpass456',
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should show error message when service fails', async () => {
    setupComponent();
    usersServiceMock.changePassword.mockReturnValue(
      throwError(() => ({ status: 400, error: { message: 'Invalid current password' } }))
    );
    const fixture = await createFixture();

    const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
    const currentInput = inputs[0];
    const newInput = inputs[1];
    const confirmInput = inputs[2];

    currentInput.value = 'wrongpass';
    currentInput.dispatchEvent(new Event('input'));
    newInput.value = 'newpass456';
    newInput.dispatchEvent(new Event('input'));
    confirmInput.value = 'newpass456';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
  });

  it('should close dialog without changes on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    cancelButton.click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
  });

  it('should display dialog title', async () => {
    setupComponent();
    const fixture = await createFixture();

    const title = fixture.nativeElement.querySelector('h2[mat-dialog-title]');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Change Password');
  });
});
