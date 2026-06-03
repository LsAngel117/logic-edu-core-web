import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membership, AssignMembershipRequest } from '../models/membership';

@Injectable({ providedIn: 'root' })
export class MembershipsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/memberships';

  getByUser(userId: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.baseUrl}/users/${userId}`);
  }

  assign(payload: AssignMembershipRequest): Observable<Membership> {
    return this.http.post<Membership>(this.baseUrl, payload);
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activate(id: string): Observable<Membership> {
    return this.http.patch<Membership>(`${this.baseUrl}/${id}/activate`, null);
  }

  changeRole(id: string, payload: { role: string }): Observable<Membership> {
    return this.http.patch<Membership>(`${this.baseUrl}/${id}/role`, payload);
  }

  changeScope(id: string, payload: { scopeType: string; scopeRefId: string }): Observable<Membership> {
    return this.http.patch<Membership>(`${this.baseUrl}/${id}/scope`, payload);
  }
}
