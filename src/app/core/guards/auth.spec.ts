import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, CanActivateFn } from '@angular/router';
import { computed } from '@angular/core';
import { authGuard } from './auth';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let router: Router;
  let authServiceMock: { isAuthenticated: ReturnType<typeof computed<boolean>> };

  function setupGuard(isAuth: boolean) {
    authServiceMock = {
      isAuthenticated: computed(() => isAuth),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    router = TestBed.inject(Router);
  }

  it('should return true when the user is authenticated', () => {
    setupGuard(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should return a UrlTree to /auth/login when the user is not authenticated', () => {
    setupGuard(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).not.toBe(true);
    expect(result).not.toBe(false);
    expect(router.isActive('/auth/login', { paths: 'exact', matrixParams: 'ignored', queryParams: 'ignored', fragment: 'ignored' })).toBe(false);
    // verify the result is a UrlTree pointing to /auth/login
    expect(result!.toString()).toBe('/auth/login');
  });
});
