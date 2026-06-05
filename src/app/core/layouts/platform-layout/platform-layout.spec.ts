import { describe, it, expect, vi } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user';
import { PlatformLayout } from './platform-layout';

const MOCK_USER: User = {
  id: 'usr_admin',
  email: 'admin@logicedu.com',
  username: 'admin',
  fullName: 'Platform Admin',
  roles: ['PLATFORM_ADMIN'],
  token: 'jwt.admin',
};

@Component({ template: '<p>Mock Page</p>', standalone: true })
class MockPageComponent {}

describe('PlatformLayout', () => {
  function setupComponent() {
    const authMock = {
      user: signal(MOCK_USER),
      logout: vi.fn(),
      token: signal('jwt.admin'),
      isAuthenticated: signal(true),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PlatformLayout],
      providers: [
        provideRouter([
          { path: '', component: MockPageComponent },
          { path: 'dashboard', component: MockPageComponent },
          { path: 'users', component: MockPageComponent },
          { path: 'schools', component: MockPageComponent },
        ]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(PlatformLayout);
    fixture.detectChanges();
    return fixture;
  }

  it('should render the top navigation bar', async () => {
    setupComponent();
    const fixture = await createFixture();

    const topNav = fixture.nativeElement.querySelector('[data-testid="top-navbar"]');
    expect(topNav).toBeTruthy();
  });

  it('should render the sidebar with contextual nav items', async () => {
    setupComponent();
    const fixture = await createFixture();

    const sidebar = fixture.nativeElement.querySelector('[data-testid="sidebar"]');
    expect(sidebar).toBeTruthy();
  });

  it('should show only Dashboard in sidebar when active section is dashboard', async () => {
    setupComponent();
    const fixture = await TestBed.createComponent(PlatformLayout);
    fixture.componentInstance.activeSection.set('dashboard');
    fixture.detectChanges();

    const navItems = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
    expect(navItems.length).toBe(1);
    expect(navItems[0].textContent?.trim()).toBe('Dashboard');
  });

  it('should show Users, Schools, and Memberships when active section is administration', async () => {
    setupComponent();
    const fixture = await TestBed.createComponent(PlatformLayout);
    fixture.componentInstance.activeSection.set('administration');
    fixture.detectChanges();

    const navItems = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
    expect(navItems.length).toBe(3);
    const labels = Array.from(navItems).map((el) => (el as Element).textContent?.trim());
    expect(labels).toContain('Usuarios');
    expect(labels).toContain('Instituciones');
    expect(labels).toContain('Membresías');
  });
});
