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
});
