import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MembershipsService } from './memberships';
import { Membership, AddMembershipPayload } from '../models/membership';

function setupService(): { service: MembershipsService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
  });
  const service = TestBed.inject(MembershipsService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

const mockMembership: Membership = {
  id: 'm1',
  userId: 'u1',
  role: 'teacher',
  scope: 'school-1',
  effectivePermissions: ['read:courses', 'grade:assignments'],
};

const mockMemberships: Membership[] = [
  mockMembership,
  {
    id: 'm2',
    userId: 'u1',
    role: 'student',
    scope: 'class-5a',
    effectivePermissions: ['read:courses'],
  },
];

describe('MembershipsService', () => {
  describe('getByUser', () => {
    it('should GET /api/v1/users/:userId/memberships and return Membership[]', () => {
      const { service, httpMock } = setupService();

      let result: Membership[] | undefined;
      service.getByUser('u1').subscribe((memberships: Membership[]) => (result = memberships));

      const req = httpMock.expectOne('/api/v1/users/u1/memberships');
      expect(req.request.method).toBe('GET');

      req.flush(mockMemberships);

      expect(result).toEqual(mockMemberships);
    });

    it('should return empty array when user has no memberships', () => {
      const { service, httpMock } = setupService();

      let result: Membership[] | undefined;
      service.getByUser('u1').subscribe((memberships: Membership[]) => (result = memberships));

      const req = httpMock.expectOne('/api/v1/users/u1/memberships');
      req.flush([]);

      expect(result).toEqual([]);
    });

    it('should propagate 404 when user not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getByUser('nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users/nonexistent/memberships');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('add', () => {
    it('should POST to /api/v1/users/:userId/memberships with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: AddMembershipPayload = {
        role: 'admin',
        scope: 'school-2',
      };

      const created: Membership = {
        id: 'm3',
        userId: 'u1',
        role: payload.role,
        scope: payload.scope,
        effectivePermissions: ['manage:users', 'read:courses'],
      };

      let result: Membership | undefined;
      service.add('u1', payload).subscribe((m: Membership) => (result = m));

      const req = httpMock.expectOne('/api/v1/users/u1/memberships');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(created);

      expect(result).toEqual(created);
    });

    it('should propagate 409 on duplicate membership', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.add('u1', { role: 'teacher', scope: 'school-1' }).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users/u1/memberships');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
    });
  });

  describe('remove', () => {
    it('should DELETE /api/v1/users/:userId/memberships/:membershipId', () => {
      const { service, httpMock } = setupService();

      let completed = false;
      service.remove('u1', 'm1').subscribe({
        complete: () => (completed = true),
      });

      const req = httpMock.expectOne('/api/v1/users/u1/memberships/m1');
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(completed).toBe(true);
    });

    it('should propagate 404 when membership already removed', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.remove('u1', 'm-gone').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/users/u1/memberships/m-gone');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });
});
