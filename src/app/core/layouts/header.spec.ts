import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';
import { Header } from './header';

const MOCK_USER: User = {
  id: 'usr_001',
  email: 'john@logicedu.com',
  username: 'john',
  fullName: 'John Doe',
  roles: ['TEACHER'],
  token: 'jwt.mock',
};

describe('Header', () => {
  function setupComponent(user: User | null) {
    const authMock = {
      user: signal(user),
      logout: vi.fn(),
      token: signal(user?.token ?? null),
      isAuthenticated: signal(user !== null),
    };

    const routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    return { authMock, routerMock };
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(Header);
    fixture.detectChanges();
    return fixture;
  }

  it('should render user fullName from AuthService', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const userNameEl = fixture.nativeElement.querySelector('[data-testid="user-name"]');
    expect(userNameEl).toBeTruthy();
    expect(userNameEl.textContent.trim()).toBe('John Doe');
  });

  it('should emit toggleCollapsed when hamburger button is clicked', async () => {
    setupComponent(MOCK_USER);
    const fixture = await TestBed.createComponent(Header);
    fixture.detectChanges();

    let emitted = false;
    (fixture.componentInstance as unknown as Header).toggleCollapsed.subscribe(() => {
      emitted = true;
    });

    const hamburger = fixture.nativeElement.querySelector('[data-testid="hamburger-btn"]') as HTMLElement;
    expect(hamburger).toBeTruthy();
    hamburger.click();
    fixture.detectChanges();

    expect(emitted).toBe(true);
  });

  it('should call AuthService.logout() and navigate to /auth/login on logout', async () => {
    const { authMock, routerMock } = setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const logoutBtn = fixture.nativeElement.querySelector('[data-testid="logout-btn"]') as HTMLElement;
    expect(logoutBtn).toBeTruthy();
    logoutBtn.click();
    fixture.detectChanges();

    expect(authMock.logout).toHaveBeenCalledOnce();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should show empty fallback when user is null', async () => {
    setupComponent(null);
    const fixture = await createFixture();

    const userNameEl = fixture.nativeElement.querySelector('[data-testid="user-name"]');
    expect(userNameEl).toBeTruthy();
    expect(userNameEl.textContent.trim()).toBe('');
  });

  it('should display avatar placeholder with user initials', async () => {
    setupComponent(MOCK_USER);
    const fixture = await createFixture();

    const avatarEl = fixture.nativeElement.querySelector('[data-testid="avatar-placeholder"]');
    expect(avatarEl).toBeTruthy();
    expect(avatarEl.textContent.trim()).toBe('JD');
  });

  it('should display empty avatar placeholder when user is null', async () => {
    setupComponent(null);
    const fixture = await createFixture();

    const avatarEl = fixture.nativeElement.querySelector('[data-testid="avatar-placeholder"]');
    expect(avatarEl).toBeTruthy();
    // Still renders the avatar element but possibly empty or with fallback
    expect(avatarEl.textContent.trim()).toBe('');
  });
});
