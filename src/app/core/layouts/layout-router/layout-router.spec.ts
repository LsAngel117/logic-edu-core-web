import { describe, it, expect, vi } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user';
import { LayoutRouter } from './layout-router';

const PLATFORM_ADMIN: User = {
  id: 'usr_admin',
  email: 'admin@logicedu.com',
  username: 'admin',
  fullName: 'Platform Admin',
  roles: ['PLATFORM_ADMIN'],
  token: 'jwt.admin',
};

const TEACHER: User = {
  id: 'usr_teacher',
  email: 'teacher@logicedu.com',
  username: 'teacher',
  fullName: 'Docente Uno',
  roles: ['TEACHER'],
  token: 'jwt.teacher',
};

@Component({ template: '<p>Mock Page</p>', standalone: true })
class MockPageComponent {}

describe('LayoutRouter', () => {
  function setupComponent(user: User | null) {
    const authMock = {
      user: signal(user),
      logout: vi.fn(),
      token: signal(user?.token ?? null),
      isAuthenticated: signal(user !== null),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LayoutRouter],
      providers: [
        provideRouter([{ path: '', component: MockPageComponent }]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(LayoutRouter);
    fixture.detectChanges();
    return fixture;
  }

  it('should render AppLayout when user is not PLATFORM_ADMIN', async () => {
    setupComponent(TEACHER);
    const fixture = await createFixture();

    const appLayout = fixture.nativeElement.querySelector('[data-testid="app-layout"]');
    expect(appLayout).toBeTruthy();

    const platformLayout = fixture.nativeElement.querySelector('[data-testid="platform-layout"]');
    expect(platformLayout).toBeFalsy();
  });

  it('should render PlatformLayout when user is PLATFORM_ADMIN', async () => {
    setupComponent(PLATFORM_ADMIN);
    const fixture = await createFixture();

    const platformLayout = fixture.nativeElement.querySelector('[data-testid="platform-layout"]');
    expect(platformLayout).toBeTruthy();

    const appLayout = fixture.nativeElement.querySelector('[data-testid="app-layout"]');
    expect(appLayout).toBeFalsy();
  });

  it('should render AppLayout when user is null', async () => {
    setupComponent(null);
    const fixture = await createFixture();

    const appLayout = fixture.nativeElement.querySelector('[data-testid="app-layout"]');
    expect(appLayout).toBeTruthy();
  });
});
