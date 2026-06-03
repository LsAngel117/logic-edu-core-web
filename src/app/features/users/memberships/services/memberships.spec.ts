import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MembershipsService } from './memberships';
import { Membership, AssignMembershipRequest } from '../models/membership';

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
  role: 'TEACHER',
  scopeType: 'SCHOOL',
  scopeRefId: 'school-1',
  active: true,
};

const mockMemberships: Membership[] = [
  mockMembership,
  {
    id: 'm2',
    userId: 'u1',
    role: 'STUDENT',
    scopeType: 'BRANCH',
    scopeRefId: 'branch-5a',
    active: true,
  },
];

describe('MembershipsService', () => {
  describe('getByUser', () => {
    it('should GET /api/v1/memberships/users/{userId} and return Membership[]', () => {
      const { service, httpMock } = setupService();

      let result: Membership[] | undefined;
      service.getByUser('u1').subscribe((memberships: Membership[]) => (result = memberships));

      const req = httpMock.expectOne('/api/v1/memberships/users/u1');
      expect(req.request.method).toBe('GET');

      req.flush(mockMemberships);

      expect(result).toEqual(mockMemberships);
    });

    it('should return empty array when user has no memberships', () => {
      const { service, httpMock } = setupService();

      let result: Membership[] | undefined;
      service.getByUser('u1').subscribe((memberships: Membership[]) => (result = memberships));

      const req = httpMock.expectOne('/api/v1/memberships/users/u1');
      req.flush([]);

      expect(result).toEqual([]);
    });

    it('should propagate 404 when user not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getByUser('nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/memberships/users/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('assign', () => {
    it('should POST to /api/v1/memberships with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: AssignMembershipRequest = {
        userId: 'u1',
        role: 'SCHOOL_ADMIN',
        scopeType: 'SCHOOL',
        scopeRefId: 'school-2',
      };

      const created: Membership = {
        id: 'm3',
        userId: payload.userId,
        role: payload.role,
        scopeType: payload.scopeType,
        scopeRefId: payload.scopeRefId,
        active: true,
      };

      let result: Membership | undefined;
      service.assign(payload).subscribe((m: Membership) => (result = m));

      const req = httpMock.expectOne('/api/v1/memberships');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(created);

      expect(result).toEqual(created);
    });

    it('should propagate 409 on duplicate membership', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.assign({
        userId: 'u1',
        role: 'TEACHER',
        scopeType: 'SCHOOL',
        scopeRefId: 'school-1',
      }).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/memberships');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
    });
  });

  describe('deactivate', () => {
    it('should DELETE /api/v1/memberships/{id}', () => {
      const { service, httpMock } = setupService();

      let completed = false;
      service.deactivate('m1').subscribe({
        complete: () => (completed = true),
      });

      const req = httpMock.expectOne('/api/v1/memberships/m1');
      expect(req.request.method).toBe('DELETE');

      req.flush(null);

      expect(completed).toBe(true);
    });

    it('should propagate 404 when membership already removed', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.deactivate('m-gone').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/memberships/m-gone');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('activate', () => {
    it('should PATCH /api/v1/memberships/{id}/activate with no body', () => {
      const { service, httpMock } = setupService();

      const activated: Membership = { ...mockMembership, active: true };

      let result: Membership | undefined;
      service.activate('m1').subscribe((m: Membership) => (result = m));

      const req = httpMock.expectOne('/api/v1/memberships/m1/activate');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBeNull();

      req.flush(activated);

      expect(result).toEqual(activated);
    });
  });

  describe('changeRole', () => {
    it('should PATCH /api/v1/memberships/{id}/role with role payload', () => {
      const { service, httpMock } = setupService();

      const updated: Membership = { ...mockMembership, role: 'STUDENT' };

      let result: Membership | undefined;
      service.changeRole('m1', { role: 'STUDENT' }).subscribe((m: Membership) => (result = m));

      const req = httpMock.expectOne('/api/v1/memberships/m1/role');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ role: 'STUDENT' });

      req.flush(updated);

      expect(result).toEqual(updated);
    });
  });

  describe('changeScope', () => {
    it('should PATCH /api/v1/memberships/{id}/scope with scope payload', () => {
      const { service, httpMock } = setupService();

      const updated: Membership = { ...mockMembership, scopeType: 'BRANCH', scopeRefId: 'branch-1' };

      let result: Membership | undefined;
      service.changeScope('m1', { scopeType: 'BRANCH', scopeRefId: 'branch-1' }).subscribe((m: Membership) => (result = m));

      const req = httpMock.expectOne('/api/v1/memberships/m1/scope');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ scopeType: 'BRANCH', scopeRefId: 'branch-1' });

      req.flush(updated);

      expect(result).toEqual(updated);
    });
  });
});
