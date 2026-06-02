import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  School,
  CreateSchoolPayload,
  UpdateSchoolPayload,
  UpdateSchoolStatusPayload,
} from '../models/school';

@Injectable({ providedIn: 'root' })
export class SchoolsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/schools';

  getAll(search?: string): Observable<School[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('q', search);
    }
    return this.http.get<School[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<School> {
    return this.http.get<School>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateSchoolPayload): Observable<School> {
    return this.http.post<School>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateSchoolPayload): Observable<School> {
    return this.http.patch<School>(`${this.baseUrl}/${id}`, payload);
  }

  updateStatus(id: string, payload: UpdateSchoolStatusPayload): Observable<School> {
    return this.http.patch<School>(`${this.baseUrl}/${id}/status`, payload);
  }
}
