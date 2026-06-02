import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { authInterceptor } from './auth';
import { AuthService } from '../services/auth';
import { User } from '../models/user';

const mockUser: User = {
  id: 'usr_test123',
  email: 'test@logicedu.com',
  displayName: 'Test User',
  roles: ['teacher'],
  token: 'test-jwt-token-abc123',
};

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authServiceMock: { token: ReturnType<typeof signal<string | null>>; logout: ReturnType<typeof vi.fn> };

  function setupAuthMock(hasToken: boolean) {
    authServiceMock = {
      token: signal<string | null>(hasToken ? mockUser.token : null),
      logout: vi.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when a token exists', () => {
    setupAuthMock(true);

    http.get('/api/test').subscribe();
    const req: TestRequest = httpMock.expectOne('/api/test');

    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockUser.token}`);
    req.flush({});
  });

  it('should pass the request through unchanged when no token exists', () => {
    setupAuthMock(false);

    http.get('/api/test').subscribe();
    const req: TestRequest = httpMock.expectOne('/api/test');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should call logout() on 401 response', () => {
    setupAuthMock(true);

    http.get('/api/test').subscribe({
      error: () => {
        // Expected — 401 is propagated
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.logout).toHaveBeenCalledOnce();
  });
});
