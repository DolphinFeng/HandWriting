export interface UserData {
  userId: string;
  name: string;
  mis: string;
  avatar?: string;
}

export interface DeptData {
  deptId: string;
  name: string;
  seriesName?: string;
}

export interface IApprovalInfo {
  iconUrl: string;
  id: number;
  name: string;
  tenantId?: string;
  processStarters: {
    all: boolean;
    users: UserData[];
    depts: DeptData[];
  };
}
