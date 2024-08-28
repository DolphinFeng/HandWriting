import { INodeBox } from '@/pages/create/flow/component/node-box.type';
import {
  ApprovalDeDuplicateType,
  APPROVERTYPE,
  APPROVETYPE,
  ExpireAutoEnum,
  OptionTypeEnum
} from '@/pages/create/flow/component/Task/task.type';
import { IMoreSetting } from '@/pages/create/more/MessageSetting.type';

interface IUsers {
  misId?: string;
  uid: number;
  name?: string;
}
/**
 * 数据接口,见文档：https://km.sankuai.com/page/1036994863#id-%E6%B5%81%E7%A8%8B%E5%8F%91%E5%B8%83
 */

export interface IStandardRole {
  roleType: string;
  roleId?: string;
  roleName?: string;
  approvalTypes?: any[];
  properties?: {
    code: string;
    name: string;
    inputType?: string;
    inputKey?: string;
    dataPath?: string;
  }[];
}
export interface BaseApprovalGroupData {
  code?: string;
  inputType?: InputTypeEnum;
  outputType?: OutputTypeEnum;
  groupType?: GroupTypeEnum;
  filterField?: ReportChainTypeEnum | APPROVERTYPE;
  filterValue?: string;
  depts?: Array<number>;
  departmentGrade?: string;
  choiceType?: ChoiceTypeEnum;
  expressionType?: GroupTypeEnum;
  levelOffset?: string;
  inputKey?: string;
  optionType?: OptionTypeEnum;
  entityType?: EntityTypeEnum;
  filterCeilings?: Array<FilterCeilingOrFloorType>;
  filterFloors?: Array<FilterCeilingOrFloorType>;
  standardRoleConfig?: IStandardRole;
}

export interface FilterCeilingOrFloorType {
  type: 'JOB_LEVEL' | 'DEPARTMENT_DEPTH';
  value: string;
}

interface IApprovalGroupData extends BaseApprovalGroupData {
  users?: Array<number>;
}

interface IComponent {
  id?: string;
  label?: string;
  options?: [];
  type: string;
  required: boolean;
  componentName: string;
  parentId?: string;
  parentLabel?: string;
  dataSource?: object;
}

export interface IApprovalGroupForm extends BaseApprovalGroupData {
  users: IUsers[];
}

export interface IFormField {
  fieldId: string;
  privilege: number;
}

interface IApprovalGroupResponse {
  id?: number;
  code?: string;
  approveGroups: IApprovalGroupForm[];
  ccGroups: IApprovalGroupForm[];
  approveType: APPROVETYPE;
  name: string;
  resourceId: string;
  formFields: Array<IFormField>;
  starterDeduplicate: ApprovalDeDuplicateType;
  approverDeduplicate: ApprovalDeDuplicateType;
  handleLimit: number;
  expireAuto: ExpireAutoEnum;
}

interface IFormData {
  formId?: number;
  approvalInfo: any;
  form?: {
    model?: string;
    id?: number;
    formProperties: any[];
    formControlledFields: any[];
  };
  deployInfo: any;
  formControlledFields?: any[];
  formPropertiesFromService?: any[];
  process: Array<INodeBox>;
  componentList?: IComponent[];
  conditionComponentList?: IComponent[];
  approvalMoreSetting?: IMoreSetting;
  dataSource?: any[];
  version: number;
}

export enum ChoiceTypeEnum {
  // 选定层级
  FIRST = 'FIRST',
  // 逐级
  SERIES = 'SERIES'
}

export enum ReportChainTypeEnum {
  UNKNOW = '',
  OA_GRADE = 'OA_GRADE',
  REPORT_CHAIN_LEVEL = 'REPORT_CHAIN_LEVEL',
  DEPARTMENT_GRADE = 'DEPARTMENT_GRADE',
  DEPARTMENT_DEPTH = 'DEPARTMENT_DEPTH',
  DEPARTMENT_LEVEL = 'DEPARTMENT_LEVEL'
}

export enum GroupTypeEnum {
  EMPLOYEE = 'EMPLOYEE',
  DEPARTMENT = 'DEPARTMENT',
  REPORT_CHAIN = 'REPORT_CHAIN',
  DEPARTMENT_CHAIN = 'DEPARTMENT_CHAIN',
  // 成本中心
  COST_CENTER = 'COST_CENTER',
  // 法务
  FAWU = 'FAWU',
  // ER
  ER = 'ER',
  // 招聘Leader
  RECRUITER_LEADER = 'RECRUITER_LEADER'
}

export enum InputTypeEnum {
  // ['指定成员','部门负责人','部门成员','发起人 HRBP','子部门成员','SVP']
  STATIC = 'STATIC',
  // ['发起人本人','上级主管','连续多级主管']
  STARTER = 'STARTER',
  // ['发起人自选']
  DYNAMIC = 'DYNAMIC'
}

export enum EntityTypeEnum {
  UNKNOW = '',
  USER = 'USER',
  DEPARTMENT = 'DEPARTMENT'
}

export enum OutputTypeEnum {
  // 部门负责人
  USER = 'USER',
  DEPARTMENT = 'DEPARTMENT',
  DEPARTMENT_OWNER = 'DEPARTMENT_OWNER',
  DEPARTMENT_HRBP = 'DEPARTMENT_HRBP',
  DEPARTMENT_HRBP_OR_PARENT = 'DEPARTMENT_HRBP_OR_PARENT',
  DEPARTMENT_MEMBER = 'DEPARTMENT_MEMBER',
  DEPARTMENT_ALL_MEMBER = 'DEPARTMENT_ALL_MEMBER',
  COST_CENTER_OWNER = 'COST_CENTER_OWNER',
  COST_CENTER_OWNER_OR_LEADER = 'COST_CENTER_OWNER_OR_LEADER'
}

export const STANDARD_ROLES_KEY = {
  [APPROVERTYPE.STANDARD_ROLE_FINANCIAL]: 'STANDARD_ROLE_FINANCIAL',
  [APPROVERTYPE.STANDARD_ROLE_HR]: 'STANDARD_ROLE_HR',
  [APPROVERTYPE.STANDARD_ROLE_LEGAL]: 'STANDARD_ROLE_LEGAL',
  [APPROVERTYPE.STANDARD_ROLE_CONTROL]: 'STANDARD_ROLE_CONTROL'
};

export const STANDARD_APPROVERTYPE_TITLE = {
  [APPROVERTYPE.STANDARD_ROLE_FINANCIAL]: '财务类标准角色',
  [APPROVERTYPE.STANDARD_ROLE_HR]: 'HR类标准角色',
  [APPROVERTYPE.STANDARD_ROLE_LEGAL]: '法务类标准角色',
  [APPROVERTYPE.STANDARD_ROLE_CONTROL]: '内控类标准角色'
};

export {
  IUsers,
  IApprovalGroupData,
  IApprovalGroupResponse,
  IFormData,
  IComponent
};
