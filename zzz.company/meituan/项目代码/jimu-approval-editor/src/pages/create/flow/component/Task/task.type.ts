import {
  ReportChainTypeEnum,
  EntityTypeEnum,
  InputTypeEnum,
  OutputTypeEnum,
  GroupTypeEnum,
  IStandardRole
} from '@/utils/form.type';
import { IFormProperty } from '../../flow.type';
import { INodeBoxOption } from '../node-box.type';

export interface IFormRole {
  id: string;
  label?: string;
  parentId?: string;
  parentLabel?: string;
  readable?: boolean;
  disabled?: boolean;
  writable?: boolean;
}

export enum APPROVETYPE {
  /**
   * 会签（需所有人审批统一）
   */
  ALL = 'ALL',
  /**
   * 或签（一名审批人统一即可）
   */
  ANY = 'ANY',
  /**
   * 逐一审批（按顺序)
   */
  SERIES = 'SERIES'
}

/**
 * 去重设置
 * 1: 去重
 * 2: 不去重
 */
export enum ApprovalDeDuplicateType {
  Yes = 1,
  No = 2
}

export enum APPROVEFORMROLE {
  FAWU = 'FAWU',
  ER = 'ER',
  LEADER = '主管',
  HRBP = 'HRBP',
  HRBPHEAD = 'HRBPHEAD',
  CEOMinusTwo = 'CEOMinusTwo',
  CEOMinusOne = 'CEOMinusOne',
  RECRUITER_LEADER = 'RECRUITER_LEADER',
  MeiTuanMinusOne = 'MeiTuanMinusOne',
  MeiTuanMinusTwo = 'MeiTuanMinusTwo',
  EMPLOYEE = 'EMPLOYEE'
}

export enum APPROVERTYPE {
  UNKNOW = '-1',
  /**
   * 上级
   */
  LEADER = '0',
  /**
   * 部门负责人
   */
  DEPTOWNER = '1',
  /**
   * 指定审批人
   */
  SPECIFY = '2',
  /**
   * 逐级审批
   */
  STEPBYSTEP = '3',
  /**
   * 发起人 HRBP
   */
  HRBP = '4',
  /**
   * CEO - n
   */
  LOWER_THAN_CEO = '5',
  /**
   * 表单内人员控件
   */
  FORM_MEMBER = '6',

  /**
   * 成本中心负责人
   */
  COST_CENTER_OWNEER = '7',

  /**
   * 接口指定审批人
   */
  DESIGNATE_BY_CUSTOMER = '8',
  /**
   * 指定审批人为自己
   */
  DESIGNATE_BY_SELF = '9',

  /**
   * 财务类标准角色
   */
  STANDARD_ROLE_FINANCIAL = '10',
  /**
   * HR类标准角色
   */
  STANDARD_ROLE_HR = '11',
  /**
   * 法务类标准角色
   */
  STANDARD_ROLE_LEGAL = '12',
  /**
   * 法务类标准角色
   */
  STANDARD_ROLE_CONTROL = '13'
}

/**
 * 目前的部门枚举
 */
export const DEPARTMENT = ['X1', 'X2', 'X3A', 'X3B', 'X4'];

/**
 * 审批组 interface
 */
export interface IApprovalGroup extends IFormMember, INewApprovalGroup {
  approveType?: APPROVETYPE;
  approverType?: APPROVERTYPE;
  selectedUsers?: Array<ISelectedItem>;
  seriesType?: APPROVERTYPE | ReportChainTypeEnum;
  seriesValue?: string;
  code?: string;
  filterCeiling?: string;
  filterFloor?: string;
  standardRoleConfig?: IStandardRole;
}

export interface ISelectedItem {
  label?: string;
  value?: string;
  id?: string;
}

/**
 * 抄送组选项
 */
export interface ICCGroup extends IFormMember {
  hasError: boolean;
}

export interface IFormMember {
  formKey?: string;
  formValue?: string;
}

export interface DeprecatedApprovalGroupState {
  // 审批人类型
  approverType: APPROVERTYPE;
  // 多人审批时采用的审批类型
  approveType: APPROVETYPE;
  // 指定审批人时选中的对象
  selectedUsers: Array<ISelectedItem>;
  // 逐级审批类型
  seriesType: APPROVERTYPE | ReportChainTypeEnum;
  // 逐级审批时的值
  seriesValue: string;

  /**
   * UI 校验用
   */
  hasError: boolean;
  /**
   * 表单人员组件 key
   */
  formKey?: string;
  /**
   * 表单人员对应角色
   */
  formValue?: string;

  /**
   * 封顶设置
   */
  filterCeiling?: string;
  /**
   * 保底设置
   */
  filterFloor?: string;
}

export interface INewApprovalGroup {
  inputType?: InputTypeEnum;
  inputKey?: string;
  entityType?: EntityTypeEnum;
  groupType?: GroupTypeEnum;
  outputType?: OutputTypeEnum;
  optionType?: OptionTypeEnum;
  standardRoleConfig?: IStandardRole;
}

export interface IApprovalGroupState
  extends DeprecatedApprovalGroupState,
    INewApprovalGroup {}

export enum OptionTypeEnum {
  UN_KNOWN = 'UN_KNOWN',
  COST_CENTER_OWNER = 'COST_CENTER_OWNER',
  STARTER = 'STARTER',
  API_APPROVER = 'API_APPROVER',
  STANDARD_ROLES = 'STANDARD_ROLES'
}
export interface approvalMoreSetting {
  messageSetting: {
    PENDING: {
      fields: Array<any>;
      fastApprove: boolean;
    };
    APPROVED: {
      fields: Array<any>;
      fastApprove: boolean;
    };
    REJECTED: {
      fields: Array<any>;
      fastApprove: boolean;
    };
    WITHDREW: {
      fields: Array<any>;
      fastApprove: boolean;
    };
    CC: {
      fields: Array<any>;
      fastApprove: boolean;
    };
  };
  callbackSetting: {
    url: string;
    accessKey: string;
    accessSecret: string;
    event: Array<any>;
  };
  clientAppKeys: Array<any>;
  secret: boolean;
  authorizedConfigs: Array<any>;
}
export interface IApprovalGroupProps {
  formProperties: IFormProperty[];
  componentList?: any[];
  groupType: 'APPROVER' | 'CC';
  option?: INodeBoxOption;
  approvalGroup: IApprovalGroupState;
  onApprovalChange: Function;
  approvalMoreSetting?: approvalMoreSetting;
  id?: string;
  overrideid: string;
  form?: string;
}

export interface IOptions {
  label: string;
  value: string;
}

export enum Level {
  L8 = 'L8',
  L9 = 'L9',
  L10 = 'L10',
  L11 = 'L11',
  L12 = 'L12'
}

export enum Env {
  production = 'production',
  staging = 'staging',
  test = 'test'
}

/**
 * 超时自动审批枚举
 */
export enum ExpireAutoEnum {
  NOTHING = 'NOTHING', // 开关关闭
  APPROVE = 'APPROVE', // 自动通过
  REJECT = 'REJECT' // 自动驳回
}

/**
 * 高级设置
 */
export interface AdvancedType {
  enable: boolean;
  handleLimit: number;
  expireAuto: ExpireAutoEnum;
}
