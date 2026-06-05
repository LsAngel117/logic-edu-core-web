import '../../shared/ui/charts/chart-setup';
import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';
import { DashboardComponent } from './dashboard';
import { getStats, getRecentActivity } from './dashboard-data';

const MOCK_USER: User = {
  id: 'usr_001',
  email: 'maria@logicedu.com',
  username: 'maria.garcia',
  fullName: 'María García',
  roles: ['TEACHER'],
  token: 'jwt.mock',
};

describe('DashboardComponent', () => {
  function setup(user: User | null): {
    fixture: ComponentFixture<DashboardComponent>;
    authMock: ReturnType<typeof createAuthMock>;
  } {
    const authMock = createAuthMock(user);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
      ],
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    return { fixture, authMock };
  }

  function createAuthMock(user: User | null) {
    return {
      user: signal(user),
      token: signal(user?.token ?? null),
      isAuthenticated: signal(user !== null),
    };
  }

  /** Safely query all elements and cast to array */
  function queryAll(selector: string, root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll(selector)) as HTMLElement[];
  }

  /** Safely query single element */
  function query(selector: string, root: HTMLElement): HTMLElement | null {
    return root.querySelector(selector) as HTMLElement | null;
  }

  // --- PageHeader ---

  it('should render PageHeader with title "Dashboard"', () => {
    const { fixture } = setup(MOCK_USER);

    const headers = queryAll('app-page-header h1', fixture.nativeElement);
    const dashboardTitle = headers.find((h) => h.textContent!.trim() === 'Dashboard');
    expect(dashboardTitle).toBeTruthy();
  });

  it('should render PageHeader description', () => {
    const { fixture } = setup(MOCK_USER);

    const descEl = fixture.nativeElement.querySelector('[data-testid="page-header-description"]');
    expect(descEl).toBeTruthy();
    expect(descEl!.textContent!.trim()).toBe('Resumen general de la plataforma');
  });

  // --- Stat Cards ---

  it('should render 4 StatCards', () => {
    const { fixture } = setup(MOCK_USER);

    const cards = queryAll('app-stat-card', fixture.nativeElement);
    expect(cards.length).toBe(4);
  });

  it('should render StatCards with correct values from getStats()', () => {
    const { fixture } = setup(MOCK_USER);
    const stats = getStats();

    const cards = queryAll('app-stat-card', fixture.nativeElement);
    expect(cards.length).toBe(stats.length);

    // First card: Total Schools
    const firstLabel = cards[0].querySelector('[data-testid="stat-label"]') as HTMLElement;
    expect(firstLabel).toBeTruthy();
    expect(firstLabel.textContent!.trim()).toBe(stats[0].label);

    const firstValue = cards[0].querySelector('[data-testid="stat-value"]') as HTMLElement;
    expect(firstValue).toBeTruthy();
    expect(firstValue.textContent!.trim()).toBe(String(stats[0].value));
  });

  // --- Charts Row ---

  it('should render area chart inside a ChartCard', () => {
    const { fixture } = setup(MOCK_USER);

    const areaChart = query('app-area-chart', fixture.nativeElement);
    expect(areaChart).toBeTruthy();
  });

  it('should render donut chart inside a ChartCard', () => {
    const { fixture } = setup(MOCK_USER);

    const donutChart = query('app-donut-chart', fixture.nativeElement);
    expect(donutChart).toBeTruthy();
  });

  it('should render two ChartCards for charts row', () => {
    const { fixture } = setup(MOCK_USER);

    const chartCards = queryAll('app-chart-card', fixture.nativeElement);
    expect(chartCards.length).toBeGreaterThanOrEqual(2);
  });

  // --- Activity Table ---

  it('should render activity DataTable', () => {
    const { fixture } = setup(MOCK_USER);

    const dataTable = query('app-data-table', fixture.nativeElement);
    expect(dataTable).toBeTruthy();
  });

  it('should render activity rows in DataTable', () => {
    const { fixture } = setup(MOCK_USER);
    const activities = getRecentActivity();

    // DataTable renders rows — verify first activity user appears
    const tds = queryAll('app-data-table td', fixture.nativeElement);
    expect(tds.length).toBeGreaterThan(0);

    const userCell = tds.find((td) => td.textContent!.trim() === activities[0].user);
    expect(userCell).toBeTruthy();
  });

  it('should render "Actividad Reciente" header', () => {
    const { fixture } = setup(MOCK_USER);

    const headers = queryAll('app-page-header h1', fixture.nativeElement);
    const activityHeader = headers.find((h) => h.textContent!.trim() === 'Actividad Reciente');
    expect(activityHeader).toBeTruthy();
  });

  // --- User greeting in welcome hero ---

  it('should show user fullName in welcome hero', () => {
    const { fixture } = setup(MOCK_USER);

    const welcomeEl = fixture.nativeElement.querySelector('[data-testid="dashboard-welcome"]');
    expect(welcomeEl).toBeTruthy();
    expect(welcomeEl!.textContent).toContain('María García');
  });

  it('should show "Usuario" fallback when user is null', () => {
    const { fixture } = setup(null);

    const welcomeEl = fixture.nativeElement.querySelector('[data-testid="dashboard-welcome"]');
    expect(welcomeEl).toBeTruthy();
    expect(welcomeEl!.textContent).toContain('Usuario');
  });
});
