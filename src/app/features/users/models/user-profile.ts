export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'inactive';
  roles: string[];
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  displayName: string;
  password: string;
  roles: string[];
}

export interface UpdateStatusPayload {
  status: 'active' | 'inactive';
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
