import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { UsersService } from './users';
import { UserProfile, CreateUserPayload, UpdateStatusPayload, ChangePasswordPayload } from '../models/user-profile';

function setupService(): { service: UsersService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
  });
  const service = TestBed.inject(UsersService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

const mockUser: UserProfile = {
  id: 'u1',
  email: 'alice@logicedu.com',
  displayName: 'Alice',
  status: 'active',
  roles: ['teacher'],
  createdAt: '2026-01-01T00:00:00Z',
};

const mockUsers: UserProfile[] = [
  mockUser,
  {
    id: 'u2',
    email: 'bob@logicedu.com',
    displayName: 'Bob',
    status: 'inactive',
    roles: ['student'],
    createdAt: '2026-02-01T00:00:00Z',
  },
];

describe('UsersService', () => {
  describe('getAll', () => {
    it('should GET /api/v1/users and return UserProfile[]', () => {
      const { service, httpMock } = setupService();

      let result: UserProfile[] | undefined;
      service.getAll().subscribe((users: UserProfile[]) => (result = users));

      const req = httpMock.expectOne('/api/v1/users');
      expect(req.request.method).toBe('GET');

      req.flush(mockUsers);

      expect(result).toEqual(mockUsers);
    });

    it('should append search query param when provided', () => {
      const { service, httpMock } = setupService();

      let result: UserProfile[] | undefined;
      service.getAll('alice').subscribe((users: UserProfile[]) => (result = users));

      const req = httpMock.expectOne('/api/v1/users?search=alice');
      expect(req.request.method).toBe('GET');

      req.flush([mockUser]);

      expect(result).toEqual([mockUser]);
    });

    it('should return empty array when backend returns empty', () => {
      const { service, httpMock } = setupService();

      let result: UserProfile[] | undefined;
      service.getAll().subscribe((users: UserProfile[]) => (result = users));

      const req = httpMock.expectOne('/api/v1/users');
      req.flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should GET /api/v1/users/:id and return UserProfile', () => {
      const { service, httpMock } = setupService();

      let result: UserProfile | undefined;
      service.getById('u1').subscribe((user: UserProfile) => (result = user));

      const req = httpMock.expectOne('/api/v1/users/u1');
      expect(req.request.method).toBe('GET');

      req.flush(mockUser);

      expect(result).toEqual(mockUser);
    });

    it('should propagate 404 error when user not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getById('nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('create', () => {
    it('should POST to /api/v1/users with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: CreateUserPayload = {
        email: 'charlie@logicedu.com',
        displayName: 'Charlie',
        password: 'secret123',
        roles: ['teacher'],
      };

      const created: UserProfile = {
        id: 'u3',
        email: payload.email,
        displayName: payload.displayName,
        status: 'active',
        roles: payload.roles,
        createdAt: '2026-03-01T00:00:00Z',
      };

      let result: UserProfile | undefined;
      service.create(payload).subscribe((user: UserProfile) => (result = user));

      const req = httpMock.expectOne('/api/v1/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(created);

      expect(result).toEqual(created);
    });

    it('should propagate 409 conflict on duplicate email', () => {
      const { service, httpMock } = setupService();

      const payload: CreateUserPayload = {
        email: 'alice@logicedu.com',
        displayName: 'Alice Dupe',
        password: 'secret123',
        roles: ['student'],
      };

      let errorStatus: number | undefined;
      service.create(payload).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
    });
  });

  describe('updateStatus', () => {
    it('should PATCH /api/v1/users/:id with status payload', () => {
      const { service, httpMock } = setupService();

      const payload: UpdateStatusPayload = { status: 'inactive' };
      const updated: UserProfile = { ...mockUser, status: 'inactive' };

      let result: UserProfile | undefined;
      service.updateStatus('u1', payload).subscribe((user: UserProfile) => (result = user));

      const req = httpMock.expectOne('/api/v1/users/u1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush(updated);

      expect(result).toEqual(updated);
    });

    it('should propagate 404 when user not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.updateStatus('nonexistent', { status: 'inactive' }).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('changePassword', () => {
    it('should POST to /api/v1/users/:id/password with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: ChangePasswordPayload = {
        currentPassword: 'old',
        newPassword: 'new123',
      };

      let completed = false;
      service.changePassword('u1', payload).subscribe({
        complete: () => (completed = true),
      });

      const req = httpMock.expectOne('/api/v1/users/u1/password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(null);

      expect(completed).toBe(true);
    });

    it('should propagate 422 on weak password', () => {
      const { service, httpMock } = setupService();

      const payload: ChangePasswordPayload = {
        currentPassword: 'old',
        newPassword: '123',
      };

      let errorStatus: number | undefined;
      service.changePassword('u1', payload).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users/u1/password');
      req.flush('Unprocessable Entity', { status: 422, statusText: 'Unprocessable Entity' });

      expect(errorStatus).toBe(422);
    });
  });
});
