import '../chart-setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DonutChart } from './donut-chart';

describe('DonutChart', () => {
  function setupDonutChart(
    series: number[],
    labels: string[],
  ): ComponentFixture<DonutChart> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DonutChart],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(DonutChart);
    fixtureRef.componentRef.setInput('series', series);
    fixtureRef.componentRef.setInput('labels', labels);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render an apx-chart element', () => {
    const fixture = setupDonutChart([8, 3, 1], ['Active', 'Inactive', 'Pending']);

    const chartEl = fixture.nativeElement.querySelector('apx-chart');
    expect(chartEl).toBeTruthy();
  });

  it('should build chart config with donut type', () => {
    const fixture = setupDonutChart([8, 3, 1], ['Active', 'Inactive', 'Pending']);

    const c = fixture.componentInstance;
    expect(c.chartConfig.type).toBe('donut');
  });

  it('should use design system colors for donut', () => {
    const fixture = setupDonutChart([8, 3, 1], ['Active', 'Inactive', 'Pending']);

    const c = fixture.componentInstance;
    expect(c.colors).toEqual(['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']);
  });

  it('should configure donut plot options with 75% size', () => {
    const fixture = setupDonutChart([8, 3, 1], ['Active', 'Inactive', 'Pending']);

    const c = fixture.componentInstance;
    const donut = c.plotOptions.pie!.donut!;
    expect(donut.size).toBe('75%');
    expect(donut.labels!.total!.show).toBe(true);
  });

  it('should pass series and labels correctly', () => {
    const fixture = setupDonutChart([50, 30, 20], ['A', 'B', 'C']);

    const c = fixture.componentInstance;
    expect(c.series()).toEqual([50, 30, 20]);
    expect(c.labels()).toEqual(['A', 'B', 'C']);
  });

  it('should show legend', () => {
    const fixture = setupDonutChart([8, 3, 1], ['Active', 'Inactive', 'Pending']);

    const c = fixture.componentInstance;
    expect(c.legendConfig.show).toBe(true);
  });

  it('should disable data labels on the donut slices', () => {
    const fixture = setupDonutChart([8, 3, 1], ['Active', 'Inactive', 'Pending']);

    const c = fixture.componentInstance;
    expect(c.dataLabelsConfig.enabled).toBe(false);
  });

  it('should center total label with correct formatter', () => {
    const fixture = setupDonutChart([8, 3, 1], ['Active', 'Inactive', 'Pending']);

    const c = fixture.componentInstance;
    const total = c.plotOptions.pie!.donut!.labels!.total!;
    expect(total.show).toBe(true);
    expect(total.label).toBe('Total');
    // The formatter should sum series values
    const result = total.formatter!({ config: {}, globals: { seriesTotals: [8, 3, 1] } });
    expect(result).toBe('12');
  });
});
