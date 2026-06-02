import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { computed } from '@angular/core';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth';

describe('app.routes', () => {
  let router: Router;
  let location: Location;
  let authServiceMock: { isAuthenticated: ReturnType<typeof computed<boolean>> };

  function setupRoutes(isAuth: boolean) {
    authServiceMock = {
      isAuthenticated: computed(() => isAuth),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  }

  it('should allow access to /auth/login without authentication', async () => {
    setupRoutes(false);

    await router.navigate(['/auth/login']);

    expect(location.path()).toBe('/auth/login');
  });

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
});
