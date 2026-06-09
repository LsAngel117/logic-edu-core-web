export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  role?: string;
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface ChangeStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserPayload {
  email: string;
  fullName: string;
}
