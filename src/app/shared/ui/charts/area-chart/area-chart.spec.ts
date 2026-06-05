import '../chart-setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AreaChart } from './area-chart';

describe('AreaChart', () => {
  function setupAreaChart(
    series: { name: string; data: number[] }[],
    categories: string[],
    title?: string,
  ): ComponentFixture<AreaChart> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AreaChart],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(AreaChart);
    fixtureRef.componentRef.setInput('series', series);
    fixtureRef.componentRef.setInput('categories', categories);
    if (title !== undefined) {
      fixtureRef.componentRef.setInput('title', title);
    }
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render an apx-chart element', () => {
    const fixture = setupAreaChart(
      [{ name: 'Users', data: [10, 20, 30] }],
      ['Jan', 'Feb', 'Mar'],
    );

    const chartEl = fixture.nativeElement.querySelector('apx-chart');
    expect(chartEl).toBeTruthy();
  });

  it('should build chart config with area type and design system colors', () => {
    const fixture = setupAreaChart(
      [{ name: 'Users', data: [10, 20, 30] }],
      ['Jan', 'Feb', 'Mar'],
    );

    const c = fixture.componentInstance;

    // Verify chart type is 'area'
    expect(c.chartConfig.type).toBe('area');
    // Verify toolbar is hidden
    expect(c.chartConfig.toolbar!.show).toBe(false);
    // Verify animations enabled
    expect(c.chartConfig.animations!.enabled).toBe(true);

    // Verify color palette
    expect(c.colors).toEqual(['#2563EB', '#60A5FA', '#10B981']);

    // Verify stroke config
    expect(c.strokeConfig.width).toBe(2);
    expect(c.strokeConfig.curve).toBe('smooth');

    // Verify grid config
    expect(c.gridConfig.borderColor).toBe('#E5E7EB');

    // Verify markers are rounded on hover
    expect(c.markersConfig.hover!.size).toBe(6);
  });

  it('should pass categories to xaxis config', () => {
    const fixture = setupAreaChart(
      [{ name: 'Users', data: [10, 20, 30] }],
      ['January', 'February', 'March'],
    );

    const c = fixture.componentInstance;
    expect(c.xaxisConfig().categories).toEqual(['January', 'February', 'March']);
  });

  it('should pass series data unchanged', () => {
    const seriesData = [
      { name: 'Active', data: [100, 200, 300] },
      { name: 'Inactive', data: [50, 60, 70] },
    ];
    const fixture = setupAreaChart(seriesData, ['Q1', 'Q2', 'Q3']);

    const c = fixture.componentInstance;
    expect(c.series()).toEqual(seriesData);
  });

  it('should show title when provided', () => {
    const fixture = setupAreaChart(
      [{ name: 'Users', data: [10, 20] }],
      ['Jan', 'Feb'],
      'User Growth',
    );

    const titleEl = fixture.nativeElement.querySelector('[data-testid="area-chart-title"]');
    expect(titleEl).toBeTruthy();
    expect(titleEl!.textContent!.trim()).toBe('User Growth');
  });

  it('should hide title element when title is not provided', () => {
    const fixture = setupAreaChart(
      [{ name: 'Users', data: [10, 20] }],
      ['Jan', 'Feb'],
    );

    const titleEl = fixture.nativeElement.querySelector('[data-testid="area-chart-title"]');
    expect(titleEl).toBeNull();
  });
});
