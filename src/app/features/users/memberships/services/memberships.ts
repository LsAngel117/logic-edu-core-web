import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membership, AddMembershipPayload } from '../models/membership';

@Injectable({ providedIn: 'root' })
export class MembershipsService {
  private readonly http = inject(HttpClient);

  getByUser(userId: string): Observable<Membership[]> {
    return this.http.get<Membership[]>(`/api/v1/users/${userId}/memberships`);
  }

  add(userId: string, payload: AddMembershipPayload): Observable<Membership> {
    return this.http.post<Membership>(`/api/v1/users/${userId}/memberships`, payload);
  }

  remove(userId: string, membershipId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/users/${userId}/memberships/${membershipId}`);
  }
}
