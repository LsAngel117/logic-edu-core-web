import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  function setupStatCard(
    icon: string,
    label: string,
    value: number | string,
    trend?: number,
  ): ComponentFixture<StatCard> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [StatCard],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(StatCard);
    fixtureRef.componentRef.setInput('icon', icon);
    fixtureRef.componentRef.setInput('label', label);
    fixtureRef.componentRef.setInput('value', value);
    if (trend !== undefined) {
      fixtureRef.componentRef.setInput('trend', trend);
    }
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render icon, label, and value', () => {
    const fixture = setupStatCard('users', 'Usuarios', 42);

    const iconEl = fixture.nativeElement.querySelector('[data-testid="stat-icon"]');
    expect(iconEl).toBeTruthy();

    const labelEl = fixture.nativeElement.querySelector('[data-testid="stat-label"]');
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent.trim()).toBe('Usuarios');

    const valueEl = fixture.nativeElement.querySelector('[data-testid="stat-value"]');
    expect(valueEl).toBeTruthy();
    expect(valueEl.textContent.trim()).toBe('42');
  });

  it('should render positive trend in green (#10B981) with trending-up icon', () => {
    const fixture = setupStatCard('users', 'Usuarios', 42, 12);

    const trendEl = fixture.nativeElement.querySelector('[data-testid="stat-trend"]');
    expect(trendEl).toBeTruthy();
    expect(trendEl.textContent.trim()).toContain('+12%');
    // Verify trend color is green via class or computed style
    expect(trendEl.classList.contains('stat-card__trend--positive')).toBe(true);

    const trendIcon = trendEl.querySelector('svg[lucideTrendingUp]');
    expect(trendIcon).toBeTruthy();
  });

  it('should render negative trend in red (#EF4444) with trending-down icon', () => {
    const fixture = setupStatCard('users', 'Usuarios', 42, -5);

    const trendEl = fixture.nativeElement.querySelector('[data-testid="stat-trend"]');
    expect(trendEl).toBeTruthy();
    expect(trendEl.textContent.trim()).toContain('-5%');
    expect(trendEl.classList.contains('stat-card__trend--negative')).toBe(true);

    const trendIcon = trendEl.querySelector('svg[lucideTrendingDown]');
    expect(trendIcon).toBeTruthy();
  });

  it('should hide trend element when trend is not provided', () => {
    const fixture = setupStatCard('users', 'Usuarios', 42);

    const trendEl = fixture.nativeElement.querySelector('[data-testid="stat-trend"]');
    expect(trendEl).toBeNull();
  });

  it('should render string values correctly', () => {
    const fixture = setupStatCard('building-2', 'Instituciones', '24 activas');

    const valueEl = fixture.nativeElement.querySelector('[data-testid="stat-value"]');
    expect(valueEl).toBeTruthy();
    expect(valueEl.textContent.trim()).toBe('24 activas');
  });
});
