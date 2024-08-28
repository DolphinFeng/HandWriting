import {
  IConditionProperty,
  IConditionComponent
} from './component/Condition/condition.type';
/**
 * type
 *      Start: 开始节点
 *      Gateway: 条件网关（包含审批节点和审批条件）
 *      Branch: 审批条件
 *      Task: 审批节点
 *      End: 结束节点
 */
export enum NODETYPE {
  Start = 'Start',
  Gateway = 'Gateway',
  Branch = 'Branch',
  Task = 'Task',
  End = 'End',
  Condition = 'Condition'
}

export interface IFormProperty
  extends IConditionProperty,
    IConditionComponent {}
