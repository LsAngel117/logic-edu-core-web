import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  function setupDialog(
    overrides: {
      title?: string;
      message?: string;
      confirmLabel?: string;
      loading?: boolean;
      visible?: boolean;
    } = {},
  ): ComponentFixture<ConfirmationDialog> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(ConfirmationDialog);
    fixtureRef.componentRef.setInput('visible', overrides.visible ?? true);
    fixtureRef.componentRef.setInput('title', overrides.title ?? 'Eliminar');
    fixtureRef.componentRef.setInput('message', overrides.message ?? 'Esta acción no se puede deshacer.');
    fixtureRef.componentRef.setInput('confirmLabel', overrides.confirmLabel ?? 'Eliminar');
    fixtureRef.componentRef.setInput('loading', overrides.loading ?? false);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render warning icon and message when visible', () => {
    const fixture = setupDialog();

    const titleEl = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-title"]',
    );
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Eliminar');

    const iconEl = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-icon"]',
    );
    expect(iconEl).toBeTruthy();

    const messageEl = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-message"]',
    );
    expect(messageEl).toBeTruthy();
    expect(messageEl.textContent.trim()).toBe('Esta acción no se puede deshacer.');
  });

  it('should render with custom title, message, and confirm label', () => {
    const fixture = setupDialog({
      title: 'Borrar curso',
      message: 'Todos los datos se perderán permanentemente.',
      confirmLabel: 'Sí, eliminar',
    });

    const titleEl = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-title"]',
    );
    expect(titleEl.textContent.trim()).toBe('Borrar curso');

    const messageEl = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-message"]',
    );
    expect(messageEl.textContent.trim()).toBe('Todos los datos se perderán permanentemente.');

    const confirmBtn = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-confirm"]',
    );
    expect(confirmBtn.textContent.trim()).toBe('Sí, eliminar');
  });

  it('should render confirm button with danger styling', () => {
    const fixture = setupDialog();

    const confirmBtn = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-confirm"]',
    ) as HTMLElement;
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.textContent.trim()).toBe('Eliminar');
    expect(confirmBtn.classList.contains('confirmation-dialog__button--danger')).toBe(true);
  });

  it('should emit confirm output when confirm button is clicked', () => {
    const fixture = setupDialog();

    let emitted = false;
    fixture.componentInstance.confirm.subscribe(() => {
      emitted = true;
    });

    const confirmBtn = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-confirm"]',
    ) as HTMLElement;
    confirmBtn.click();

    expect(emitted).toBe(true);
  });

  it('should emit cancel output when cancel button is clicked', () => {
    const fixture = setupDialog();

    let emitted = false;
    fixture.componentInstance.cancel.subscribe(() => {
      emitted = true;
    });

    const cancelBtn = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-cancel"]',
    ) as HTMLElement;
    cancelBtn.click();

    expect(emitted).toBe(true);
  });

  it('should disable confirm button and show processing text when loading', () => {
    const fixture = setupDialog({ loading: true });

    const confirmBtn = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-confirm"]',
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.disabled).toBe(true);
    expect(confirmBtn.textContent.trim()).toBe('Procesando...');
  });

  it('should not render dialog when visible is false', () => {
    const fixture = setupDialog({ visible: false });

    const overlay = fixture.nativeElement.querySelector(
      '[data-testid="confirmation-dialog-overlay"]',
    );
    expect(overlay).toBeNull();
  });
});
