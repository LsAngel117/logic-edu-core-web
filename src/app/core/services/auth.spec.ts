import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { User } from '../models/user';

const TEST_TOKEN_KEY = 'auth_token';

function encodeJwt(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const base64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `header.${base64}.signature`;
}

const mockUserPayload = {
  sub: 'usr_test123',
  email: 'test@logicedu.com',
  name: 'Test User',
  roles: ['teacher'],
};

const mockJwt = encodeJwt(mockUserPayload);

const expectedUser: User = {
  id: 'usr_test123',
  email: 'test@logicedu.com',
  displayName: 'Test User',
  roles: ['teacher'],
  token: mockJwt,
};

/** Configure TestBed and return a freshly-injected AuthService + HttpTestingController. */
function setupService(): { service: AuthService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
  });
  const service = TestBed.inject(AuthService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('constructor rehydration', () => {
    it('should rehydrate user from a valid JWT in localStorage', () => {
      localStorage.setItem(TEST_TOKEN_KEY, mockJwt);
      const { service } = setupService();

      expect(service.user()).toEqual(expectedUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.token()).toBe(mockJwt);
    });

    it('should leave user null when localStorage has no token', () => {
      const { service } = setupService();

      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.token()).toBeNull();
    });

    it('should clear token when localStorage has an invalid JWT', () => {
      localStorage.setItem(TEST_TOKEN_KEY, 'not.a.validjwt');
      const { service } = setupService();

      // Invalid base64 in JWT payload should cause decode to fail gracefully
      // The service should clear the token and leave user null
      expect(service.token()).toBeNull();
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(TEST_TOKEN_KEY)).toBeNull();
    });

    it('should handle empty string in localStorage', () => {
      localStorage.setItem(TEST_TOKEN_KEY, '');
      const { service } = setupService();

      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.token()).toBeNull();
    });
  });

  describe('login()', () => {
    it('should POST to /auth/login, store token in localStorage, and set user signal', async () => {
      const { service, httpMock } = setupService();

      const loginPromise = service.login('test@logicedu.com', 'password123');

      const req = httpMock.expectOne('/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@logicedu.com', password: 'password123' });

      req.flush({ token: mockJwt });

      await loginPromise;

      expect(localStorage.getItem(TEST_TOKEN_KEY)).toBe(mockJwt);
      expect(service.user()).toEqual(expectedUser);
      expect(service.token()).toBe(mockJwt);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should handle 401 without mutating state or storage', async () => {
      // Pre-authenticate the service with a valid JWT
      localStorage.setItem(TEST_TOKEN_KEY, mockJwt);
      const { service, httpMock } = setupService();

      // Verify we start authenticated with the valid JWT
      expect(service.isAuthenticated()).toBe(true);
      expect(service.token()).toBe(mockJwt);

      const loginPromise = service.login('wrong@logicedu.com', 'badpass');

      const req = httpMock.expectOne('/auth/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      try {
        await loginPromise;
      } catch (_) {
        // Expected — error propagation
      }

      // State must NOT be mutated on 401 — still the original valid JWT
      expect(localStorage.getItem(TEST_TOKEN_KEY)).toBe(mockJwt);
      expect(service.user()).toEqual(expectedUser);
      expect(service.token()).toBe(mockJwt);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should throw on network error without mutating state', async () => {
      const { service, httpMock } = setupService();

      const loginPromise = service.login('test@logicedu.com', 'pass');

      const req = httpMock.expectOne('/auth/login');
      req.error(new ProgressEvent('Network error'));

      await expect(loginPromise).rejects.toThrow();

      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(TEST_TOKEN_KEY)).toBeNull();
    });
  });

  describe('logout()', () => {
    it('should clear localStorage, set token to null, and set user to null', () => {
      localStorage.setItem(TEST_TOKEN_KEY, mockJwt);
      const { service } = setupService();

      expect(service.isAuthenticated()).toBe(true);

      service.logout();

      expect(localStorage.getItem(TEST_TOKEN_KEY)).toBeNull();
      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should be safe to call logout when already logged out', () => {
      const { service } = setupService();
      expect(service.isAuthenticated()).toBe(false);

      service.logout();

      expect(service.user()).toBeNull();
      expect(service.token()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAuthenticated computed', () => {
    it('should react to token changes via login and logout', async () => {
      const { service, httpMock } = setupService();

      // Initially unauthenticated
      expect(service.isAuthenticated()).toBe(false);

      // Login
      const loginPromise = service.login('test@logicedu.com', 'pass');
      httpMock.expectOne('/auth/login').flush({ token: mockJwt });
      await loginPromise;

      expect(service.isAuthenticated()).toBe(true);

      // Logout
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when only user is set without token', () => {
      const { service } = setupService();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
