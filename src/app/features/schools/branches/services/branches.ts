import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Branch,
  CreateBranchPayload,
  UpdateBranchPayload,
  UpdateBranchStatusPayload,
} from '../models/branch';

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/branches';

  getBySchool(schoolId: string): Observable<Branch[]> {
    const params = new HttpParams().set('schoolId', schoolId);
    return this.http.get<Branch[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateBranchPayload): Observable<Branch> {
    return this.http.post<Branch>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateBranchPayload): Observable<Branch> {
    return this.http.patch<Branch>(`${this.baseUrl}/${id}`, payload);
  }

  updateStatus(id: string, payload: UpdateBranchStatusPayload): Observable<Branch> {
    return this.http.patch<Branch>(`${this.baseUrl}/${id}/status`, payload);
  }
}
