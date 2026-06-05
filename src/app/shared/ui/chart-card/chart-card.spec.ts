import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component } from '@angular/core';
import { ChartCard } from './chart-card';

/** Test host to project content and bind model */
@Component({
  standalone: true,
  imports: [ChartCard],
  template: `
    <app-chart-card
      [title]="'Ingresos'"
      [periods]="['week', 'month', 'year']"
      [(activePeriod)]="selectedPeriod"
    >
      <div data-testid="chart-content">Chart goes here</div>
    </app-chart-card>
  `,
})
class TestHost {
  selectedPeriod = 'month';
}

describe('ChartCard', () => {
  function setupChartCard(
    overrides: {
      title?: string;
      periods?: string[];
      activePeriod?: string;
    } = {},
  ): ComponentFixture<ChartCard> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ChartCard],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(ChartCard);
    fixtureRef.componentRef.setInput('title', overrides.title ?? 'Ingresos');
    fixtureRef.componentRef.setInput('periods', overrides.periods ?? ['week', 'month', 'year']);
    if (overrides.activePeriod !== undefined) {
      fixtureRef.componentRef.setInput('activePeriod', overrides.activePeriod);
    }
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

  it('should render title', () => {
    const fixture = setupChartCard();

    const titleEl = fixture.nativeElement.querySelector('[data-testid="chart-card-title"]');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Ingresos');
  });

  it('should render period selector chips when periods provided', () => {
    const fixture = setupChartCard();

    const chips = fixture.nativeElement.querySelectorAll('[data-testid="period-chip"]');
    expect(chips.length).toBe(3);

    const chipTexts = Array.from(chips).map((c) => (c as HTMLElement).textContent!.trim());
    expect(chipTexts).toEqual(['week', 'month', 'year']);
  });

  it('should highlight active period chip', () => {
    const fixture = setupChartCard({ activePeriod: 'month' });

    const chips = fixture.nativeElement.querySelectorAll('[data-testid="period-chip"]');
    const activeChip = Array.from(chips).find((c) =>
      (c as HTMLElement).classList.contains('chart-card__chip--active'),
    );
    expect(activeChip).toBeTruthy();
    expect((activeChip as HTMLElement).textContent!.trim()).toBe('month');
  });

  it('should emit activePeriod change on chip click', () => {
    const fixture = setupChartCard();

    const chips = fixture.nativeElement.querySelectorAll('[data-testid="period-chip"]');
    // Click the "year" chip (third one)
    const yearChip = chips[2] as HTMLElement;
    yearChip.click();
    fixture.detectChanges();

    // The model should update
    expect(fixture.componentInstance.activePeriod()).toBe('year');
  });

  it('should render projected content', () => {
    const fixture = setupHost();

    const contentEl = fixture.nativeElement.querySelector('[data-testid="chart-content"]');
    expect(contentEl).toBeTruthy();
    expect(contentEl.textContent!.trim()).toBe('Chart goes here');
  });

  it('should hide period selector when no periods provided', () => {
    const fixture = setupChartCard({ periods: [] });

    const chips = fixture.nativeElement.querySelectorAll('[data-testid="period-chip"]');
    expect(chips.length).toBe(0);

    const selectorEl = fixture.nativeElement.querySelector('[data-testid="period-selector"]');
    expect(selectorEl).toBeNull();
  });
});
