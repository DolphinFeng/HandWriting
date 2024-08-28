export interface IProps {
  isShowModal: boolean;
  handleClose: () => void;
  handleSave: (UserDept: UserDept[]) => void;
  value: UserDept[];
  userDeptType: string;
  placeholder?: string;
  title: string;
  reverseOrder?: boolean;
}

export interface IState {
  recentContactData: UserDept[];
  orgData: OrgData[];
  searchLoading: boolean;
}

// 统一的部门人员数据结构
export interface UserDept {
  value: string; // id
  label: string; // 展示的名称——user：name/mis, dept:name
  avatar: string; // user需要设置默认头像，dept添加头像
  type: string; // 两种：user || department
  seriesName?: string; // 部门全称
}

export interface OrgData extends UserDept {
  leaf: boolean; // 表示是否为最后一个可展开部门
  parentValue: string; // 父级部门的id
}

export interface SearchGroup {
  label: string;
  options: UserDept[];
}

export const SelectorType = {
  Department: 'department',
  User: 'user',
  Both: 'both'
};
