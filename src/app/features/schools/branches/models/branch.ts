export interface Branch {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface CreateBranchPayload {
  schoolId: string;
  name: string;
  code: string;
  address: string;
}

export interface UpdateBranchPayload {
  name: string;
  code: string;
  address: string;
}

export interface UpdateBranchStatusPayload {
  status: 'active' | 'inactive';
}
