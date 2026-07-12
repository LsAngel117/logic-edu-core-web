import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AcademicStructureResponse,
  CreateAcademicStructureRequest,
  UpdateAcademicStructureRequest,
} from '../models/structure';

@Injectable({ providedIn: 'root' })
export class StructuresService {
  private readonly http = inject(HttpClient);

  private baseUrl(schoolId: string): string {
    return `/api/v1/schools/${schoolId}/structures`;
  }

  getBySchool(schoolId: string): Observable<AcademicStructureResponse[]> {
    return this.http.get<AcademicStructureResponse[]>(this.baseUrl(schoolId));
  }

  getActive(schoolId: string): Observable<AcademicStructureResponse> {
    return this.http.get<AcademicStructureResponse>(`${this.baseUrl(schoolId)}/active`);
  }

  getById(schoolId: string, id: string): Observable<AcademicStructureResponse> {
    return this.http.get<AcademicStructureResponse>(`${this.baseUrl(schoolId)}/${id}`);
  }

  create(schoolId: string, payload: CreateAcademicStructureRequest): Observable<AcademicStructureResponse> {
    return this.http.post<AcademicStructureResponse>(this.baseUrl(schoolId), payload);
  }

  update(schoolId: string, id: string, payload: UpdateAcademicStructureRequest): Observable<AcademicStructureResponse> {
    return this.http.put<AcademicStructureResponse>(`${this.baseUrl(schoolId)}/${id}`, payload);
  }

  deactivate(schoolId: string, id: string): Observable<AcademicStructureResponse> {
    return this.http.patch<AcademicStructureResponse>(`${this.baseUrl(schoolId)}/${id}/deactivate`, null);
  }
}
