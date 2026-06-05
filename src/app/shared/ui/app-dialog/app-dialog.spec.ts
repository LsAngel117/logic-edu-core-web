import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component } from '@angular/core';
import { AppDialog } from './app-dialog';

/** Test host to project content into the dialog body */
@Component({
  standalone: true,
  imports: [AppDialog],
  template: `
    <app-dialog [title]="'Crear Elemento'" [visible]="true">
      <p data-testid="custom-content">Contenido personalizado del formulario</p>
    </app-dialog>
  `,
})
class TestHost {}

describe('AppDialog', () => {
  function setupDialog(
    overrides: {
      title?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      loading?: boolean;
      visible?: boolean;
    } = {},
  ): ComponentFixture<AppDialog> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AppDialog],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(AppDialog);
    fixtureRef.componentRef.setInput('visible', overrides.visible ?? true);
    fixtureRef.componentRef.setInput('title', overrides.title ?? 'Crear');
    fixtureRef.componentRef.setInput('confirmLabel', overrides.confirmLabel ?? 'Confirmar');
    fixtureRef.componentRef.setInput('cancelLabel', overrides.cancelLabel ?? 'Cancelar');
    fixtureRef.componentRef.setInput('loading', overrides.loading ?? false);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  function setupHost(): ComponentFixture<TestHost> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(TestHost);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render title and buttons when visible', () => {
    const fixture = setupDialog();

    const titleEl = fixture.nativeElement.querySelector('[data-testid="app-dialog-title"]');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Crear');

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.textContent.trim()).toBe('Confirmar');

    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]');
    expect(cancelBtn).toBeTruthy();
    expect(cancelBtn.textContent.trim()).toBe('Cancelar');
  });

  it('should render custom button labels', () => {
    const fixture = setupDialog({ confirmLabel: 'Guardar', cancelLabel: 'Descartar' });

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    expect(confirmBtn.textContent.trim()).toBe('Guardar');

    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]');
    expect(cancelBtn.textContent.trim()).toBe('Descartar');
  });

  it('should project content via ng-content', () => {
    const fixture = setupHost();

    const contentEl = fixture.nativeElement.querySelector('[data-testid="custom-content"]');
    expect(contentEl).toBeTruthy();
    expect(contentEl.textContent.trim()).toBe('Contenido personalizado del formulario');
  });

  it('should disable confirm button and show processing text when loading', () => {
    const fixture = setupDialog({ loading: true });

    const confirmBtn = fixture.nativeElement.querySelector(
      '[data-testid="app-dialog-confirm"]',
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.disabled).toBe(true);
    expect(confirmBtn.textContent.trim()).toBe('Procesando...');

    const cancelBtn = fixture.nativeElement.querySelector(
      '[data-testid="app-dialog-cancel"]',
    ) as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    expect(cancelBtn.disabled).toBe(false);
  });

  it('should emit confirm output when confirm button is clicked', () => {
    const fixture = setupDialog();

    let emitted = false;
    fixture.componentInstance.confirm.subscribe(() => {
      emitted = true;
    });

    const confirmBtn = fixture.nativeElement.querySelector(
      '[data-testid="app-dialog-confirm"]',
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
      '[data-testid="app-dialog-cancel"]',
    ) as HTMLElement;
    cancelBtn.click();

    expect(emitted).toBe(true);
  });

  it('should not render dialog when visible is false', () => {
    const fixture = setupDialog({ visible: false });

    const overlay = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]');
    expect(overlay).toBeNull();
  });
});
