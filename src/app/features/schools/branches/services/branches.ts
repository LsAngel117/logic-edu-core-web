import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BranchResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '../models/branch';

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly http = inject(HttpClient);

  getBySchool(schoolId: string): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(`/api/v1/schools/${schoolId}/branches`);
  }

  getById(schoolId: string, id: string): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`/api/v1/schools/${schoolId}/branches/${id}`);
  }

  create(schoolId: string, payload: CreateBranchRequest): Observable<BranchResponse> {
    return this.http.post<BranchResponse>(`/api/v1/schools/${schoolId}/branches`, payload);
  }

  update(schoolId: string, id: string, payload: UpdateBranchRequest): Observable<BranchResponse> {
    return this.http.put<BranchResponse>(`/api/v1/schools/${schoolId}/branches/${id}`, payload);
  }

  updateStatus(schoolId: string, id: string): Observable<BranchResponse> {
    return this.http.patch<BranchResponse>(`/api/v1/schools/${schoolId}/branches/${id}/deactivate`, null);
  }
}
