import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { BranchesService } from './branches';
import { Branch, CreateBranchPayload, UpdateBranchStatusPayload } from '../models/branch';

function setupService(): { service: BranchesService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
  });
  const service = TestBed.inject(BranchesService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

const mockBranch: Branch = {
  id: 'b1',
  schoolId: 's1',
  name: 'Main Campus',
  code: 'MC-001',
  address: '123 Campus Dr',
  status: 'active',
};

const mockBranches: Branch[] = [
  mockBranch,
  {
    id: 'b2',
    schoolId: 's1',
    name: 'Downtown Annex',
    code: 'DA-002',
    address: '456 City Blvd',
    status: 'inactive',
  },
];

describe('BranchesService', () => {
  describe('getBySchool', () => {
    it('should GET /api/v1/branches?schoolId= and return Branch[]', () => {
      const { service, httpMock } = setupService();

      let result: Branch[] | undefined;
      service.getBySchool('s1').subscribe((branches: Branch[]) => (result = branches));

      const req = httpMock.expectOne('/api/v1/branches?schoolId=s1');
      expect(req.request.method).toBe('GET');

      req.flush(mockBranches);

      expect(result).toEqual(mockBranches);
    });

    it('should return empty array when backend returns empty', () => {
      const { service, httpMock } = setupService();

      let result: Branch[] | undefined;
      service.getBySchool('s1').subscribe((branches: Branch[]) => (result = branches));

      const req = httpMock.expectOne('/api/v1/branches?schoolId=s1');
      req.flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should GET /api/v1/branches/:id and return Branch', () => {
      const { service, httpMock } = setupService();

      let result: Branch | undefined;
      service.getById('b1').subscribe((branch: Branch) => (result = branch));

      const req = httpMock.expectOne('/api/v1/branches/b1');
      expect(req.request.method).toBe('GET');

      req.flush(mockBranch);

      expect(result).toEqual(mockBranch);
    });

    it('should propagate 404 error when branch not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getById('nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/branches/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('create', () => {
    it('should POST to /api/v1/branches with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: CreateBranchPayload = {
        schoolId: 's1',
        name: 'East Wing',
        code: 'EW-003',
        address: '789 East Rd',
      };

      const created: Branch = {
        id: 'b3',
        schoolId: payload.schoolId,
        name: payload.name,
        code: payload.code,
        address: payload.address,
        status: 'active',
      };

      let result: Branch | undefined;
      service.create(payload).subscribe((branch: Branch) => (result = branch));

      const req = httpMock.expectOne('/api/v1/branches');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(created);

      expect(result).toEqual(created);
    });

    it('should propagate 409 conflict on duplicate', () => {
      const { service, httpMock } = setupService();

      const payload: CreateBranchPayload = {
        schoolId: 's1',
        name: 'Main Campus',
        code: 'MC-001',
        address: '123 Campus Dr',
      };

      let errorStatus: number | undefined;
      service.create(payload).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/branches');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
    });
  });

  describe('update', () => {
    it('should PATCH /api/v1/branches/:id with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload = {
        name: 'Main Campus Updated',
        code: 'MC-001',
        address: '123 Campus Dr',
      };

      const updated: Branch = { ...mockBranch, name: 'Main Campus Updated' };

      let result: Branch | undefined;
      service.update('b1', payload).subscribe((branch: Branch) => (result = branch));

      const req = httpMock.expectOne('/api/v1/branches/b1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush(updated);

      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should PATCH /api/v1/branches/:id/status with status payload', () => {
      const { service, httpMock } = setupService();

      const payload: UpdateBranchStatusPayload = { status: 'inactive' };
      const updated: Branch = { ...mockBranch, status: 'inactive' };

      let result: Branch | undefined;
      service.updateStatus('b1', payload).subscribe((branch: Branch) => (result = branch));

      const req = httpMock.expectOne('/api/v1/branches/b1/status');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush(updated);

      expect(result).toEqual(updated);
    });

    it('should propagate 404 when branch not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.updateStatus('nonexistent', { status: 'inactive' }).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/branches/nonexistent/status');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });
});
