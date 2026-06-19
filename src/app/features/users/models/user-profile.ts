export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  firstGivenName?: string;
  secondGivenName?: string;
  firstFamilyName?: string;
  secondFamilyName?: string;
  documentValue?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  role?: string;
  institution?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  rawPassword: string;
  firstGivenName: string;
  secondGivenName?: string;
  firstFamilyName: string;
  secondFamilyName?: string;
  sex: 'MALE' | 'FEMALE';
  birthDate: string;
  documentType: string;
  documentValue: string;
  role: string;
  scopeType: string;
  scopeRefId?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
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
  firstGivenName: string;
  secondGivenName?: string;
  firstFamilyName: string;
  secondFamilyName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}
