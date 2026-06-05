import { describe, it, expect, vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';
import { AppLayout } from './app-layout';

const MOCK_USER: User = {
  id: 'usr_001',
  email: 'john@logicedu.com',
  username: 'john',
  fullName: 'John Doe',
  roles: ['TEACHER'],
  token: 'jwt.mock',
};

@Component({ template: '<p>Mock Dashboard</p>', standalone: true })
class MockDashboardComponent {}

describe('AppLayout', () => {
  function setupComponent(user: User | null) {
    const authMock = {
      user: signal(user),
      logout: vi.fn(),
      token: signal(user?.token ?? null),
      isAuthenticated: signal(user !== null),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AppLayout],
      providers: [
        provideRouter([
          { path: 'dashboard', component: MockDashboardComponent },
        ]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
      ],
    });

    return { authMock };
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(AppLayout);
    fixture.detectChanges();
    return fixture;
  }

  it('should render sidebar component', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const sidebarEl = fixture.nativeElement.querySelector('[data-testid="sidebar"]');
    expect(sidebarEl).toBeTruthy();
  });

  it('should render header component', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const headerEl = fixture.nativeElement.querySelector('[data-testid="header"]');
    expect(headerEl).toBeTruthy();
  });

  it('should render router-outlet in the content area', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    // router-outlet is an Angular element, rendered inside the component
    const outletEl = fixture.nativeElement.querySelector('router-outlet');
    expect(outletEl).toBeTruthy();
  });

  it('should start with collapsed = false by default', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const instance = fixture.componentInstance as unknown as AppLayout;
    expect(instance.collapsed()).toBe(false);
  });

  it('should toggle collapsed signal when toggleSidebar() is called', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const instance = fixture.componentInstance as unknown as AppLayout;
    expect(instance.collapsed()).toBe(false);

    instance.toggleSidebar();
    fixture.detectChanges();
    expect(instance.collapsed()).toBe(true);

    instance.toggleSidebar();
    fixture.detectChanges();
    expect(instance.collapsed()).toBe(false);
  });

  it('should compute navItems from NAV_ITEMS filtered by user roles', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const instance = fixture.componentInstance as unknown as AppLayout;
    const items = instance.navItems();
    expect(items.length).toBeGreaterThanOrEqual(1);
    // TEACHER role: only Dashboard (no role restriction) should be visible
    expect(items[0].label).toBe('Dashboard');
  });

  it('should compute all navItems for PLATFORM_ADMIN', async () => {
    const platformAdmin: User = { ...MOCK_USER, roles: ['PLATFORM_ADMIN'] };
    setupComponent(platformAdmin);
    const fixture = await createFixture();

    const instance = fixture.componentInstance as unknown as AppLayout;
    const items = instance.navItems();
    expect(items.length).toBe(3);
    expect(items.map((i) => i.label)).toEqual(['Dashboard', 'Usuarios', 'Instituciones']);
  });
});
