import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SchoolsService } from './schools';
import { School, CreateSchoolPayload } from '../models/school';

function setupService(): { service: SchoolsService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
  });
  const service = TestBed.inject(SchoolsService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

const mockSchool: School = {
  id: 's1',
  name: 'North Academy',
  code: 'NAC-001',
  shortName: 'North',
  description: 'A school of excellence',
  email: 'north@school.edu',
  phone: '1234567890',
  address: '123 Main St',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockSchools: School[] = [
  mockSchool,
  {
    id: 's2',
    name: 'South School',
    code: 'SOS-002',
    shortName: 'South',
    description: '',
    email: '',
    phone: '',
    address: '456 Oak Ave',
    status: 'INACTIVE',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

describe('SchoolsService', () => {
  describe('getAll', () => {
    it('should GET /api/v1/schools and return School[]', () => {
      const { service, httpMock } = setupService();

      let result: School[] | undefined;
      service.getAll().subscribe((schools: School[]) => (result = schools));

      const req = httpMock.expectOne('/api/v1/schools');
      expect(req.request.method).toBe('GET');

      req.flush(mockSchools);

      expect(result).toEqual(mockSchools);
    });

    it('should append search query param when provided', () => {
      const { service, httpMock } = setupService();

      let result: School[] | undefined;
      service.getAll('north').subscribe((schools: School[]) => (result = schools));

      const req = httpMock.expectOne('/api/v1/schools?q=north');
      expect(req.request.method).toBe('GET');

      req.flush([mockSchool]);

      expect(result).toEqual([mockSchool]);
    });

    it('should return empty array when backend returns empty', () => {
      const { service, httpMock } = setupService();

      let result: School[] | undefined;
      service.getAll().subscribe((schools: School[]) => (result = schools));

      const req = httpMock.expectOne('/api/v1/schools');
      req.flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should GET /api/v1/schools/:id and return School', () => {
      const { service, httpMock } = setupService();

      let result: School | undefined;
      service.getById('s1').subscribe((school: School) => (result = school));

      const req = httpMock.expectOne('/api/v1/schools/s1');
      expect(req.request.method).toBe('GET');

      req.flush(mockSchool);

      expect(result).toEqual(mockSchool);
    });

    it('should propagate 404 error when school not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getById('nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('create', () => {
    it('should POST to /api/v1/schools with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: CreateSchoolPayload = {
        name: 'East Academy',
        code: 'EAC-003',
        shortName: 'East',
        address: '789 Pine Rd',
      };

      const created: School = {
        id: 's3',
        name: payload.name,
        code: payload.code,
        shortName: payload.shortName,
        description: '',
        email: '',
        phone: '',
        address: payload.address,
        status: 'ACTIVE',
        createdAt: '2026-03-01T00:00:00Z',
      };

      let result: School | undefined;
      service.create(payload).subscribe((school: School) => (result = school));

      const req = httpMock.expectOne('/api/v1/schools');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(created);

      expect(result).toEqual(created);
    });

    it('should propagate 409 conflict on duplicate', () => {
      const { service, httpMock } = setupService();

      const payload: CreateSchoolPayload = {
        name: 'North Academy',
        code: 'NAC-001',
        shortName: 'North',
        address: '123 Main St',
      };

      let errorStatus: number | undefined;
      service.create(payload).subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools');
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
    });
  });

  describe('update', () => {
    it('should PATCH /api/v1/schools/:id with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload = {
        name: 'North Academy Updated',
        code: 'NAC-001',
        shortName: 'North',
        address: '123 Main St',
      };

      const updated: School = { ...mockSchool, name: 'North Academy Updated' };

      let result: School | undefined;
      service.update('s1', payload).subscribe((school: School) => (result = school));

      const req = httpMock.expectOne('/api/v1/schools/s1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);

      req.flush(updated);

      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should PATCH /api/v1/schools/{id}/deactivate with no body', () => {
      const { service, httpMock } = setupService();

      const updated: School = { ...mockSchool, status: 'INACTIVE' };

      let result: School | undefined;
      service.updateStatus('s1').subscribe((school: School) => (result = school));

      const req = httpMock.expectOne('/api/v1/schools/s1/deactivate');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBeNull();

      req.flush(updated);

      expect(result).toEqual(updated);
    });

    it('should propagate 404 when school not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.updateStatus('nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/nonexistent/deactivate');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });
});
