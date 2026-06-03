import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { BranchesService } from './branches';
import { BranchResponse, CreateBranchRequest } from '../models/branch';

function setupService(): { service: BranchesService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
  });
  const service = TestBed.inject(BranchesService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

const mockBranch: BranchResponse = {
  id: 'b1',
  schoolId: 's1',
  name: 'Main Campus',
  code: 'MC-001',
  shortName: 'Main',
  description: 'Main campus building',
  email: 'main@school.edu',
  phone: '1234567890',
  address: '123 Campus Dr',
  type: 'MAIN',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockBranches: BranchResponse[] = [
  mockBranch,
  {
    id: 'b2',
    schoolId: 's1',
    name: 'Downtown Annex',
    code: 'DA-002',
    shortName: 'Downtown',
    description: 'Downtown annex building',
    email: 'downtown@school.edu',
    phone: '0987654321',
    address: '456 City Blvd',
    type: 'SECONDARY',
    status: 'INACTIVE',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
];

describe('BranchesService', () => {
  describe('getBySchool', () => {
    it('should GET /api/v1/schools/{schoolId}/branches and return BranchResponse[]', () => {
      const { service, httpMock } = setupService();

      let result: BranchResponse[] | undefined;
      service.getBySchool('s1').subscribe((branches: BranchResponse[]) => (result = branches));

      const req = httpMock.expectOne('/api/v1/schools/s1/branches');
      expect(req.request.method).toBe('GET');

      req.flush(mockBranches);

      expect(result).toEqual(mockBranches);
    });

    it('should return empty array when backend returns empty', () => {
      const { service, httpMock } = setupService();

      let result: BranchResponse[] | undefined;
      service.getBySchool('s1').subscribe((branches: BranchResponse[]) => (result = branches));

      const req = httpMock.expectOne('/api/v1/schools/s1/branches');
      req.flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should GET /api/v1/schools/{schoolId}/branches/{id} and return BranchResponse', () => {
      const { service, httpMock } = setupService();

      let result: BranchResponse | undefined;
      service.getById('s1', 'b1').subscribe((branch: BranchResponse) => (result = branch));

      const req = httpMock.expectOne('/api/v1/schools/s1/branches/b1');
      expect(req.request.method).toBe('GET');

      req.flush(mockBranch);

      expect(result).toEqual(mockBranch);
    });

    it('should propagate 404 error when branch not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getById('s1', 'nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/s1/branches/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('create', () => {
    it('should POST to /api/v1/schools/{schoolId}/branches with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: CreateBranchRequest = {
        name: 'East Wing',
        code: 'EW-003',
        shortName: 'East',
        description: 'East wing extension',
        email: 'east@school.edu',
        phone: '5551234567',
        address: '789 East Rd',
      };

      const created: BranchResponse = {
        id: 'b3',
        schoolId: 's1',
        name: payload.name,
        code: payload.code,
        shortName: payload.shortName,
        description: payload.description ?? '',
        email: payload.email ?? '',
        phone: payload.phone ?? '',
        address: payload.address ?? '',
        type: 'SECONDARY',
        status: 'ACTIVE',
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      };

      let result: BranchResponse | undefined;
      service.create('s1', payload).subscribe((branch: BranchResponse) => (result = branch));

      const req = httpMock.expectOne('/api/v1/schools/s1/branches');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(created);

      expect(result).toEqual(created);
    });

    it('should propagate 409 conflict on duplicate', () => {
      const { service, httpMock } = setupService();

      const payload: CreateBranchRequest = {
        name: 'Main Campus',
        code: 'MC-001',
        shortName: 'Main',
        address: '123 Campus Dr',
      };

      let errorStatus: number | undefined;
      service.create('s1', payload).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/s1/branches');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
    });
  });

  describe('update', () => {
    it('should PUT /api/v1/schools/{schoolId}/branches/{id} with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload = {
        name: 'Main Campus Updated',
        code: 'MC-001',
        shortName: 'Main',
        address: '123 Campus Dr',
      };

      const updated: BranchResponse = { ...mockBranch, name: 'Main Campus Updated' };

      let result: BranchResponse | undefined;
      service.update('s1', 'b1', payload).subscribe((branch: BranchResponse) => (result = branch));

      const req = httpMock.expectOne('/api/v1/schools/s1/branches/b1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      req.flush(updated);

      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should PATCH /api/v1/schools/{schoolId}/branches/{id}/deactivate with no body', () => {
      const { service, httpMock } = setupService();

      const updated: BranchResponse = { ...mockBranch, status: 'INACTIVE' };

      let result: BranchResponse | undefined;
      service.updateStatus('s1', 'b1').subscribe((branch: BranchResponse) => (result = branch));

      const req = httpMock.expectOne('/api/v1/schools/s1/branches/b1/deactivate');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBeNull();

      req.flush(updated);

      expect(result).toEqual(updated);
    });

    it('should propagate 404 when branch not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.updateStatus('s1', 'nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/s1/branches/nonexistent/deactivate');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });
});
