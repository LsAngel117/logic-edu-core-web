import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component } from '@angular/core';
import { DashboardCard } from './dashboard-card';

/** Test host to project content and actions */
@Component({
  standalone: true,
  imports: [DashboardCard],
  template: `
    <app-dashboard-card title="Resumen">
      <p data-testid="content-text">Contenido del dashboard</p>
      <button data-testid="action-btn" card-actions>Acción</button>
    </app-dashboard-card>
  `,
})
class TestHost {}

/** Test host without action slot */
@Component({
  standalone: true,
  imports: [DashboardCard],
  template: `
    <app-dashboard-card title="Simple">
      <p data-testid="content-only">Solo contenido</p>
    </app-dashboard-card>
  `,
})
class TestHostNoAction {}

describe('DashboardCard', () => {
  function setupCard(title: string): ComponentFixture<DashboardCard> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DashboardCard],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(DashboardCard);
    fixtureRef.componentRef.setInput('title', title);
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

  function setupHostNoAction(): ComponentFixture<TestHostNoAction> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TestHostNoAction],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(TestHostNoAction);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render title in the card header', () => {
    const fixture = setupCard('Resumen');

    const titleEl = fixture.nativeElement.querySelector('[data-testid="dashboard-card-title"]');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Resumen');
  });

  it('should render projected content inside the card body', () => {
    const fixture = setupHost();

    const contentEl = fixture.nativeElement.querySelector('[data-testid="content-text"]');
    expect(contentEl).toBeTruthy();
    expect(contentEl.textContent.trim()).toBe('Contenido del dashboard');
  });

  it('should render action slot in the header', () => {
    const fixture = setupHost();

    const actionBtn = fixture.nativeElement.querySelector('[data-testid="action-btn"]');
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.textContent.trim()).toBe('Acción');
  });

  it('should still render content when no action slot is projected', () => {
    const fixture = setupHostNoAction();

    const contentEl = fixture.nativeElement.querySelector('[data-testid="content-only"]');
    expect(contentEl).toBeTruthy();
    expect(contentEl.textContent.trim()).toBe('Solo contenido');

    const titleEl = fixture.nativeElement.querySelector('[data-testid="dashboard-card-title"]');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Simple');
  });
});
