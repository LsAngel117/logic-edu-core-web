export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  status: 'active' | 'inactive';
  branchCount?: number;
  createdAt: string;
}

export interface CreateSchoolPayload {
  name: string;
  code: string;
  address: string;
}

export interface UpdateSchoolPayload {
  name: string;
  code: string;
  address: string;
}

export interface UpdateSchoolStatusPayload {
  status: 'active' | 'inactive';
}
