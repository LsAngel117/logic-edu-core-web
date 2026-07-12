import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { StructuresService } from './structures';
import { AcademicStructureResponse, CreateAcademicStructureRequest } from '../models/structure';

function setupService(): { service: StructuresService; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
  });
  const service = TestBed.inject(StructuresService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

const mockStructure: AcademicStructureResponse = {
  id: 'st1',
  schoolId: 'sch1',
  structureType: 'PRIMARIA',
  levelsCount: 6,
  periodsPerLevel: 4,
  evaluationPeriodsPerPeriod: 3,
  subjectsPerPeriod: 8,
  hoursPerSubject: 2,
  active: true,
  version: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockStructures: AcademicStructureResponse[] = [
  mockStructure,
  {
    id: 'st2',
    schoolId: 'sch1',
    structureType: 'SECUNDARIA',
    levelsCount: 4,
    periodsPerLevel: 3,
    evaluationPeriodsPerPeriod: 2,
    subjectsPerPeriod: 6,
    hoursPerSubject: 3,
    active: false,
    version: 1,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
];

describe('StructuresService', () => {
  describe('getBySchool', () => {
    it('should GET /api/v1/schools/{schoolId}/structures and return AcademicStructureResponse[]', () => {
      const { service, httpMock } = setupService();

      let result: AcademicStructureResponse[] | undefined;
      service.getBySchool('sch1').subscribe((structures: AcademicStructureResponse[]) => (result = structures));

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures');
      expect(req.request.method).toBe('GET');

      req.flush(mockStructures);

      expect(result).toEqual(mockStructures);
    });

    it('should return empty array when backend returns empty', () => {
      const { service, httpMock } = setupService();

      let result: AcademicStructureResponse[] | undefined;
      service.getBySchool('sch1').subscribe((structures: AcademicStructureResponse[]) => (result = structures));

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures');
      req.flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getActive', () => {
    it('should GET /api/v1/schools/{schoolId}/structures/active and return the active structure', () => {
      const { service, httpMock } = setupService();

      let result: AcademicStructureResponse | undefined;
      service.getActive('sch1').subscribe((structure: AcademicStructureResponse) => (result = structure));

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures/active');
      expect(req.request.method).toBe('GET');

      req.flush(mockStructure);

      expect(result).toEqual(mockStructure);
    });

    it('should propagate 404 when no active structure', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getActive('sch1').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures/active');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('getById', () => {
    it('should GET /api/v1/schools/{schoolId}/structures/{id} and return structure', () => {
      const { service, httpMock } = setupService();

      let result: AcademicStructureResponse | undefined;
      service.getById('sch1', 'st1').subscribe((structure: AcademicStructureResponse) => (result = structure));

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures/st1');
      expect(req.request.method).toBe('GET');

      req.flush(mockStructure);

      expect(result).toEqual(mockStructure);
    });

    it('should propagate 404 when structure not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.getById('sch1', 'nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures/nonexistent');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });

  describe('create', () => {
    it('should POST to /api/v1/schools/{schoolId}/structures with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: CreateAcademicStructureRequest = {
        structureType: 'MEDIA',
        levelsCount: 2,
        periodsPerLevel: 2,
        evaluationPeriodsPerPeriod: 2,
        subjectsPerPeriod: 4,
        hoursPerSubject: 2,
      };

      const created: AcademicStructureResponse = {
        id: 'st3',
        schoolId: 'sch1',
        ...payload,
        active: true,
        version: 1,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      };

      let result: AcademicStructureResponse | undefined;
      service.create('sch1', payload).subscribe((structure: AcademicStructureResponse) => (result = structure));

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(created);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should PUT /api/v1/schools/{schoolId}/structures/{id} with correct payload', () => {
      const { service, httpMock } = setupService();

      const payload: CreateAcademicStructureRequest = {
        structureType: 'PRIMARIA',
        levelsCount: 5,
        periodsPerLevel: 3,
        evaluationPeriodsPerPeriod: 2,
        subjectsPerPeriod: 7,
        hoursPerSubject: 2,
      };

      const updated: AcademicStructureResponse = {
        ...mockStructure,
        ...payload,
      };

      let result: AcademicStructureResponse | undefined;
      service.update('sch1', 'st1', payload).subscribe((structure: AcademicStructureResponse) => (result = structure));

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures/st1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      req.flush(updated);

      expect(result).toEqual(updated);
    });
  });

  describe('deactivate', () => {
    it('should PATCH /api/v1/schools/{schoolId}/structures/{id}/deactivate with null body', () => {
      const { service, httpMock } = setupService();

      const updated: AcademicStructureResponse = { ...mockStructure, active: false };

      let result: AcademicStructureResponse | undefined;
      service.deactivate('sch1', 'st1').subscribe((structure: AcademicStructureResponse) => (result = structure));

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures/st1/deactivate');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBeNull();

      req.flush(updated);

      expect(result).toEqual(updated);
    });

    it('should propagate 404 when structure not found', () => {
      const { service, httpMock } = setupService();

      let errorStatus: number | undefined;
      service.deactivate('sch1', 'nonexistent').subscribe({
        error: (err: { status: number }) => (errorStatus = err.status),
      });

      const req = httpMock.expectOne('/api/v1/schools/sch1/structures/nonexistent/deactivate');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });
});
