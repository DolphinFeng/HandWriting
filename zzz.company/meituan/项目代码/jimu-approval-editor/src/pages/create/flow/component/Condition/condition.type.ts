/**
 * 规则的属性，由系统属性和组件属性定义，组件属性有 componentType，否则是系统属性
 */
export interface IConditionProperty {
  // 0 : 不做数据拉取; 1: 发起人;3:部门,当 businuessType 为 1 和 3 时， condition-values 会发起数据请求
  businessType: number;
  propertyCode: string;
  propertyName: string;
}

export enum LogicalType {
  OR = 1,
  AND = 2
}
/**
 * 规则明细，包含 condition-propery, condition-operation , condition-value
 */
export interface ICondition
  extends IConditionProperty,
    IConditionOperation,
    IConditionValueData,
    IConditionComponent {
  operator?: string;
  value: string;
  key: string;
  leaf?: boolean;
  conditions?: ICondition[];
  logical: LogicalType;
  subPropertyCode?: string;
  // 组件类型
}

export interface IConditionComponent {
  id?: string;
  componentType?: string;
  componentName: string;
  options?: Array<IConditionValueOption> | undefined;
}

/**
 *
 */
interface IConditionValueData {
  data:
    | string
    | Array<IConditionValueOption>
    | IConditionValueOption
    | Array<IConditionValueOptionData>;
}

export interface IConditionValueOptionData {
  dataId: number;
  name: string;
  code?: string;
  seriesName?: string;
}
export interface IConditionValueOption {
  value: string;
  label: string;
  id: string;
}

/**
 * 规则操作：属于，不属于，包含不包含等
 */
export interface IConditionOperation {
  operationCode: string;
  operationDisplay: string;
}
