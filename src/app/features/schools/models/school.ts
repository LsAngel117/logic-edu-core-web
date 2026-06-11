export interface School {
  id: string;
  name: string;
  code: string;
  shortName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CreateSchoolPayload {
  name: string;
  code: string;
  shortName: string;
  description?: string;
  email?: string;
  phone?: string;
  address: string;
  city?: string;
  country?: string;
}

export interface UpdateSchoolPayload {
  name: string;
  code: string;
  shortName: string;
  description?: string;
  email?: string;
  phone?: string;
  address: string;
}
