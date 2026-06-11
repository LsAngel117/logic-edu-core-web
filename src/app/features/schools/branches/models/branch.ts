export interface BranchResponse {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  shortName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  type: 'MAIN' | 'SECONDARY' | 'VIRTUAL';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  shortName: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateBranchRequest {
  name: string;
  code: string;
  shortName: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}
