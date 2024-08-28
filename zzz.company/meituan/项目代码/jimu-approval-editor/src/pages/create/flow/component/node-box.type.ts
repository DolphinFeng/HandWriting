import {
  IApprovalGroup,
  IFormRole,
  ApprovalDeDuplicateType,
  AdvancedType
} from './Task/task.type';
import { ICondition } from './Condition/condition.type';
import { NODETYPE } from '../flow.type';

export interface IValidateMessage {
  // 一期只有 message ，后面可能会有 curNodeIndex 等定位工具
  type?: 'process' | 'form' | 'base' | 'publish';
  validateMessage?: string;
}

/**
 * 每一个 NodeBox 都有一个 option 的数据对象，这个对象目前混合了三种能力
 * 1. 数据；
 * 2. 操作；
 * 3. UI Style
 */
export interface INodeBoxOption
  extends IOptionData,
    IOptionStyles,
    IOptionOperations {
  [x: string]: any;
  validateMessage?: string;
  overrideid?: string;
}

/**
 * 表单数据
 */
export interface IOptionData {
  /**
   * 抄送组
   */
  ccGroups?: IApprovalGroup[];

  /**
   * 审批组
   */
  approvalGroup?: IApprovalGroup;
  /**
   * 条件组规则
   */
  conditions?: Array<ICondition>;
  /**
   * 展示在 NodeBox 里的 title
   */
  title?: string;
  /**
   * 展示在 NodeBox 里的 description
   */
  description?: string;
  /**
   * 优先级
   */
  priority?: number;
  /**
   * 逻辑且或
   */
  logical?: number;

  /**
   * 当前是否是叶子节点
   */
  leaf?: boolean;

  /**
   * 表单权限
   */
  formRoles?: IFormRole[];

  /**
   * 发起人是自己时，审批节点是否去重
   */
  starterDeduplicate?: ApprovalDeDuplicateType;
  /**
   * 审批组重复配置
   */
  approverDeduplicate?: ApprovalDeDuplicateType;

  default?: boolean;

  /**
   * 封顶设置
   */
  filterCeiling: string;

  /**
   * 保底设置
   */
  filterFloor: string;

  /**
   * 高级设置
   */
  advanced?: AdvancedType;
}

export interface IOptionStyles {
  /**
   * 样式属性
   */
  background?: string;
}

export interface IOptionOperations {
  /**
   * XPath 路径记录，findNode 的时候很快
   */
  curNodeIndex?: Array<number>;
  /**
   * 外层统一的 Node 操作，包含 saveNode, addNode, 等
   */
  dealWithNodeFn?: Function;
}

export interface INodeBox {
  id?: number;
  code?: string;
  resourceId: string;
  option?: INodeBoxOption;
  type?: NODETYPE;
  child?: Array<INodeBox>;
  bounds?: IBounds;
  curNodeBoundsDeepIndex?: number;
}

interface IPoint {
  x: number;
  y: number;
}

interface IBounds {
  lowerRight: IPoint;
  upperLeft: IPoint;
}

export enum EComponentType {
  Number = 'number',
  String = 'string',
  Array = 'array'
}
