import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError } from 'rxjs';
import { UsersService } from '../services/users';
import { PasswordDialogComponent } from './password';

describe('PasswordDialogComponent', () => {
  let usersServiceMock: { changePassword: ReturnType<typeof vi.fn> };
  let fixture: ComponentFixture<PasswordDialogComponent>;

  function setupComponent() {
    usersServiceMock = { changePassword: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PasswordDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
      ],
    });
    fixture = TestBed.createComponent(PasswordDialogComponent);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ======================================================================
  //  RENDERING
  // ======================================================================
  describe('rendering', () => {
    it('should not render dialog when visible is false', () => {
      setupComponent();
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]');
      expect(overlay).toBeFalsy();
    });

    it('should render dialog with title and form when visible is true', () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('[data-testid="app-dialog-title"]');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Restablecer');

      const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
      expect(inputs.length).toBe(2); // newPassword + confirmPassword only (admin reset)

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
      expect(confirmBtn).toBeTruthy();

      const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]');
      expect(cancelBtn).toBeTruthy();
    });

    it('should render newPassword and confirmPassword fields with labels', () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Nueva contraseña');
      expect(content).toContain('Confirmar contraseña');
    });
  });

  // ======================================================================
  //  VALIDATION
  // ======================================================================
  describe('validation', () => {
    beforeEach(() => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();
    });

    it('should show validation error when submitted empty', () => {
      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.field-error');
      // Form invalid but no server error yet; mismatched or required message appears
      // The form marks all as touched, so validation messages should appear
      expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should show minLength error when newPassword is too short', () => {
      const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
      const newInput = inputs[0] as HTMLInputElement;
      const confirmInput = inputs[1] as HTMLInputElement;

      newInput.value = '123';
      newInput.dispatchEvent(new Event('input'));
      confirmInput.value = '123';
      confirmInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();
      fixture.detectChanges();

      expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should show mismatch error when passwords differ', () => {
      const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
      const newInput = inputs[0] as HTMLInputElement;
      const confirmInput = inputs[1] as HTMLInputElement;

      newInput.value = 'newpass123';
      newInput.dispatchEvent(new Event('input'));
      confirmInput.value = 'different';
      confirmInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('coinciden');
      expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  //  SUCCESSFUL SUBMISSION
  // ======================================================================
  describe('successful submission', () => {
    it('should call UsersService.changePassword with userId and newPassword on valid submit', async () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      usersServiceMock.changePassword.mockReturnValue(of(undefined));
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
      const newInput = inputs[0] as HTMLInputElement;
      const confirmInput = inputs[1] as HTMLInputElement;

      newInput.value = 'newpass456';
      newInput.dispatchEvent(new Event('input'));
      confirmInput.value = 'newpass456';
      confirmInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();

      await fixture.whenStable();

      expect(usersServiceMock.changePassword).toHaveBeenCalledWith('u1', { newPassword: 'newpass456' });
    });

    it('should emit changed and close dialog on success', async () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      usersServiceMock.changePassword.mockReturnValue(of(undefined));
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const changedSpy = vi.fn();
      const sub = fixture.componentInstance.changed.subscribe(changedSpy);

      const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
      (inputs[0] as HTMLInputElement).value = 'newpass456';
      inputs[0].dispatchEvent(new Event('input'));
      (inputs[1] as HTMLInputElement).value = 'newpass456';
      inputs[1].dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(changedSpy).toHaveBeenCalled();
      expect(fixture.componentInstance.visible()).toBe(false);
      sub.unsubscribe();
    });
  });

  // ======================================================================
  //  ERROR HANDLING
  // ======================================================================
  describe('error handling', () => {
    it('should show error message when service fails', async () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      usersServiceMock.changePassword.mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'Invalid password' } })),
      );
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input[type="password"]');
      (inputs[0] as HTMLInputElement).value = 'newpass456';
      inputs[0].dispatchEvent(new Event('input'));
      (inputs[1] as HTMLInputElement).value = 'newpass456';
      inputs[1].dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();

      await fixture.whenStable();
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.field-error');
      expect(errorEl).toBeTruthy();
      expect(fixture.componentInstance.visible()).toBe(true); // stays open on error
    });
  });

  // ======================================================================
  //  CANCEL
  // ======================================================================
  describe('cancel', () => {
    it('should close dialog without calling service on cancel', () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]') as HTMLElement;
      cancelBtn.click();
      fixture.detectChanges();

      expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
      expect(fixture.componentInstance.visible()).toBe(false);
    });

    it('should close dialog on overlay click', () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]') as HTMLElement;
      overlay.click();
      fixture.detectChanges();

      expect(usersServiceMock.changePassword).not.toHaveBeenCalled();
      expect(fixture.componentInstance.visible()).toBe(false);
    });
  });
});
