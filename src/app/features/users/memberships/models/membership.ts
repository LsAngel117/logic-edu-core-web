export interface Membership {
  id: string;
  userId: string;
  role: string;
  scopeType: string;
  scopeRefId: string;
  active: boolean;
}

export interface AssignMembershipRequest {
  userId: string;
  role: string;
  scopeType: string;
  scopeRefId: string;
}
