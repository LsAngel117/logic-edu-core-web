import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membership, AddMembershipPayload } from '../models/membership';

@Injectable({ providedIn: 'root' })
export class MembershipsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/memberships';

  getByUser(userId: string): Observable<Membership[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Membership[]>(this.baseUrl, { params });
  }

  add(userId: string, payload: AddMembershipPayload): Observable<Membership> {
    return this.http.post<Membership>(this.baseUrl, { ...payload, userId });
  }

  remove(userId: string, membershipId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${membershipId}`);
  }
}
