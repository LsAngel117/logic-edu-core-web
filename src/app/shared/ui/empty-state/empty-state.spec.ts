import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  function setupEmptyState(
    icon: string,
    title: string,
    description: string = '',
    actionLabel: string = '',
  ): ComponentFixture<EmptyState> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EmptyState],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(EmptyState);
    fixtureRef.componentRef.setInput('icon', icon);
    fixtureRef.componentRef.setInput('title', title);
    fixtureRef.componentRef.setInput('description', description);
    fixtureRef.componentRef.setInput('actionLabel', actionLabel);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render icon and title', () => {
    const fixture = setupEmptyState('inbox', 'Sin registros');

    const iconEl = fixture.nativeElement.querySelector('[data-testid="empty-state-icon"]');
    expect(iconEl).toBeTruthy();

    const titleEl = fixture.nativeElement.querySelector('[data-testid="empty-state-title"]');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Sin registros');
  });

  it('should render description when provided', () => {
    const fixture = setupEmptyState('inbox', 'Sin registros', 'No hay elementos para mostrar');

    const descEl = fixture.nativeElement.querySelector('[data-testid="empty-state-description"]');
    expect(descEl).toBeTruthy();
    expect(descEl.textContent.trim()).toBe('No hay elementos para mostrar');
  });

  it('should hide description when not provided', () => {
    const fixture = setupEmptyState('inbox', 'Sin registros', '');

    const descEl = fixture.nativeElement.querySelector('[data-testid="empty-state-description"]');
    expect(descEl).toBeNull();
  });

  it('should render action button when actionLabel is provided', () => {
    const fixture = setupEmptyState('inbox', 'Sin registros', '', 'Crear');

    const actionBtn = fixture.nativeElement.querySelector(
      '[data-testid="empty-state-action"]',
    ) as HTMLElement;
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.textContent.trim()).toBe('Crear');
  });

  it('should emit action output when action button is clicked', () => {
    const fixture = setupEmptyState('inbox', 'Sin registros', '', 'Crear');

    let emitted = false;
    fixture.componentInstance.action.subscribe(() => {
      emitted = true;
    });

    const actionBtn = fixture.nativeElement.querySelector(
      '[data-testid="empty-state-action"]',
    ) as HTMLElement;
    expect(actionBtn).toBeTruthy();
    actionBtn.click();

    expect(emitted).toBe(true);
  });

  it('should hide action button when actionLabel is not provided', () => {
    const fixture = setupEmptyState('inbox', 'Sin registros', '', '');

    const actionBtn = fixture.nativeElement.querySelector('[data-testid="empty-state-action"]');
    expect(actionBtn).toBeNull();
  });

  it('should render with all elements when all inputs provided', () => {
    const fixture = setupEmptyState('book-open', 'No hay cursos', 'Crea tu primer curso', 'Nuevo curso');

    expect(fixture.nativeElement.querySelector('[data-testid="empty-state-icon"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="empty-state-title"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="empty-state-description"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="empty-state-action"]')).toBeTruthy();
  });
});
