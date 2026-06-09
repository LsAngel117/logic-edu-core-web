import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { UsersService } from './users';
import { UserProfile, CreateUserPayload, ChangeStatusRequest, ChangePasswordPayload } from '../models/user-profile';

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
  username: 'alice',
  email: 'alice@logicedu.com',
  fullName: 'Alice Johnson',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockUsers: UserProfile[] = [
  mockUser,
  {
    id: 'u2',
    username: 'bob',
    email: 'bob@logicedu.com',
    fullName: 'Bob Smith',
    status: 'INACTIVE',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

const mockCreatePayload: CreateUserPayload = {
  email: 'charlie@logicedu.com',
  rawPassword: 'secret123',
  firstGivenName: 'Charlie',
  firstFamilyName: 'Brown',
  sex: 'MALE',
  birthDate: '2000-05-15',
  documentType: 'CC',
  documentValue: '1234567890',
  role: 'TEACHER',
  scopeType: 'ALL',
};

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

      const req = httpMock.expectOne('/api/v1/users?q=alice');
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

      const created: UserProfile = {
        id: 'u3',
        username: 'charlie',
        email: mockCreatePayload.email,
        fullName: `${mockCreatePayload.firstGivenName} ${mockCreatePayload.firstFamilyName}`,
        status: 'ACTIVE',
        createdAt: '2026-03-01T00:00:00Z',
      };

      let result: UserProfile | undefined;
      service.create(mockCreatePayload).subscribe((user: UserProfile) => (result = user));

      const req = httpMock.expectOne('/api/v1/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreatePayload);

      req.flush(created);

      expect(result).toEqual(created);
    });

    it('should include optional fields in payload', () => {
      const { service, httpMock } = setupService();

      const fullPayload: CreateUserPayload = {
        ...mockCreatePayload,
        secondGivenName: 'Andrés',
        secondFamilyName: 'López',
        scopeType: 'SCHOOL',
        scopeRefId: 'school-abc',
      };

      let result: UserProfile | undefined;
      service.create(fullPayload).subscribe((user: UserProfile) => (result = user));

      const req = httpMock.expectOne('/api/v1/users');
      expect(req.request.method).toBe('POST');

      const body = req.request.body as CreateUserPayload;
      expect(body.secondGivenName).toBe('Andrés');
      expect(body.secondFamilyName).toBe('López');
      expect(body.scopeRefId).toBe('school-abc');

      req.flush({ id: 'u4', email: fullPayload.email, status: 'ACTIVE' });
    });

    it('should propagate 409 conflict on duplicate email', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.create(mockCreatePayload).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
    });
  });

  describe('changeStatus', () => {
    it('should PATCH /api/v1/users/:id/status with status payload', () => {
      const { service, httpMock } = setupService();

      const payload: ChangeStatusRequest = { status: 'INACTIVE' };
      const updated: UserProfile = { ...mockUser, status: 'INACTIVE' };

      let result: UserProfile | undefined;
      service.changeStatus('u1', payload).subscribe((user: UserProfile) => (result = user));

      const req = httpMock.expectOne('/api/v1/users/u1/status');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush(updated);

      expect(result).toEqual(updated);
    });

    it('should support BLOCKED status', () => {
      const { service, httpMock } = setupService();

      const payload: ChangeStatusRequest = { status: 'BLOCKED' };
      const updated: UserProfile = { ...mockUser, status: 'BLOCKED' };

      let result: UserProfile | undefined;
      service.changeStatus('u1', payload).subscribe((user: UserProfile) => (result = user));

      const req = httpMock.expectOne('/api/v1/users/u1/status');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'BLOCKED' });

      req.flush(updated);

      expect(result).toEqual(updated);
    });

    it('should propagate 404 when user not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.changeStatus('nonexistent', { status: 'INACTIVE' }).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users/nonexistent/status');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('changePassword', () => {
    it('should PATCH /api/v1/users/:id/password with correct payload', () => {
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
      expect(req.request.method).toBe('PATCH');
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
