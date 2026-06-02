export interface Membership {
  id: string;
  userId: string;
  role: string;
  scope: string;
  effectivePermissions: string[];
}

export interface AddMembershipPayload {
  role: string;
  scope: string;
}
