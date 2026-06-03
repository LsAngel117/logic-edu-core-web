import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { computed, signal } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth';
import type { User } from './core/models/user';

describe('app.routes', () => {
  let router: Router;
  let location: Location;
  let authServiceMock: {
    isAuthenticated: ReturnType<typeof computed<boolean>>;
    user: ReturnType<typeof signal<User | null>>;
    logout: ReturnType<typeof vi.fn>;
  };

  function setupRoutes(isAuth: boolean) {
    authServiceMock = {
      isAuthenticated: computed(() => isAuth),
      user: signal<User | null>(null),
      logout: vi.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  }

  // --- Login route (flat, outside layout) ---

  it('should allow access to /auth/login without authentication', async () => {
    setupRoutes(false);

    await router.navigate(['/auth/login']);

    expect(location.path()).toBe('/auth/login');
  });

  // --- Root redirect ---

  it('should redirect empty path to /dashboard when authenticated', async () => {
    setupRoutes(true);

    await router.navigate(['/']);

    expect(location.path()).toBe('/dashboard');
  });

  it('should redirect empty path to /auth/login when unauthenticated', async () => {
    setupRoutes(false);

    await router.navigate(['/']);

    // / redirects to /dashboard, then authGuard on parent rejects → /auth/login
    expect(location.path()).toBe('/auth/login');
  });

  // --- Dashboard ---

  it('should redirect unauthenticated user from /dashboard to /auth/login', async () => {
    setupRoutes(false);

    await router.navigate(['/dashboard']);

    expect(location.path()).toBe('/auth/login');
  });

  it('should allow access to /dashboard when authenticated', async () => {
    setupRoutes(true);

    await router.navigate(['/dashboard']);

    expect(location.path()).toBe('/dashboard');
  });

  // --- Users ---

  it('should redirect unauthenticated user from /users to /auth/login', async () => {
    setupRoutes(false);

    await router.navigate(['/users']);

    expect(location.path()).toBe('/auth/login');
  });

  it('should allow access to /users when authenticated', async () => {
    setupRoutes(true);

    await router.navigate(['/users']);

    expect(location.path()).toBe('/users');
  });

  it('should allow access to /users/123 when authenticated', async () => {
    setupRoutes(true);

    await router.navigate(['/users', '123']);

    expect(location.path()).toBe('/users/123');
  });

  it('should redirect unauthenticated user from /users/123 to /auth/login', async () => {
    setupRoutes(false);

    await router.navigate(['/users', '123']);

    expect(location.path()).toBe('/auth/login');
  });

  // --- Schools ---

  it('should allow access to /schools when authenticated', async () => {
    setupRoutes(true);

    await router.navigate(['/schools']);

    expect(location.path()).toBe('/schools');
  });

  it('should redirect unauthenticated user from /schools to /auth/login', async () => {
    setupRoutes(false);

    await router.navigate(['/schools']);

    expect(location.path()).toBe('/auth/login');
  });

  it('should allow access to /schools/school-1/branches when authenticated', async () => {
    setupRoutes(true);

    await router.navigate(['/schools', 'school-1', 'branches']);

    expect(location.path()).toBe('/schools/school-1/branches');
  });

  // --- Login stays outside layout ---

  it('should not require auth for /auth/login when already navigating there', async () => {
    setupRoutes(true);

    await router.navigate(['/auth/login']);

    // Login route is flat — no guard, no layout
    expect(location.path()).toBe('/auth/login');
  });
});
