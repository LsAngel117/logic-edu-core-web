import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UserProfile,
  CreateUserPayload,
  UpdateStatusPayload,
  ChangePasswordPayload,
} from '../models/user-profile';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/users';

  getAll(search?: string): Observable<UserProfile[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<UserProfile[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateUserPayload): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.baseUrl, payload);
  }

  updateStatus(id: string, payload: UpdateStatusPayload): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.baseUrl}/${id}`, payload);
  }

  changePassword(id: string, payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/password`, payload);
  }
}
