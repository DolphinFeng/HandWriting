import { ICondition } from '../pages/create/flow/component/Condition/condition.type';

const SYS_PROPERTIES = [
  {
    propertyCode: 'SYS_CRT_USERID',
    propertyName: '发起人',
    businessType: 1,
    subProperties: []
  }
];

const OPERATION_LIST = [
  { operationCode: 'eq', operationDisplay: '等于', operationName: '==' },
  { operationCode: 'ne', operationDisplay: '不等于', operationName: '!=' },
  { operationCode: 'bd', operationDisplay: '属于部门' },
  { operationCode: 'nbd', operationDisplay: '不属于部门' },
  {
    operationCode: 'CT',
    operationDisplay: '包含任一',
    operationName: 'contains'
  },
  {
    operationCode: 'NT',
    operationDisplay: '不包含任一',
    operationName: 'not contains'
  },
  { operationCode: 'in', operationDisplay: '等于任一', operationName: 'in' },
  {
    operationCode: 'ni',
    operationDisplay: '不等于任一',
    operationName: 'not in'
  },
  { operationCode: 'ge', operationDisplay: '大于等于', operationName: '>=' },
  { operationCode: 'gt', operationDisplay: '大于', operationName: '>' },
  { operationCode: 'le', operationDisplay: '小于等于', operationName: '<=' },
  { operationCode: 'lt', operationDisplay: '小于', operationName: '<' }
];

// 系统属性和操作映射
const OPERATION_PROPERTY_MAPPING = {
  SYS_CRT_USERID: ['eq', 'ne', 'in', 'ni', 'bd', 'nbd'],
  SYS_CRT_DEPTID: ['eq', 'ne', 'in', 'ni']
};

const getSystemOperation = (propertyCode: string): Array<string> => {
  return OPERATION_PROPERTY_MAPPING[propertyCode] || [];
};

// 表单属性和操作映射
const OPERATION_COMPANYTYPE_MAPPING = {
  number: ['eq', 'ne', 'in', 'ni', 'ge', 'gt', 'le', 'lt'],
  string: ['eq', 'ne', 'in', 'ni'],
  array: ['NT', 'CT'],
  people: ['eq', 'ne', 'in', 'ni', 'bd', 'nbd'],
  department: ['eq', 'ne', 'in', 'ni', 'bd', 'nbd']
};

export function getPropertyList(formProperties = []) {
  return async function() {
    return {
      pageList: SYS_PROPERTIES.concat(formProperties)
    };
  };
}

/**
 * 获取操作列表，根据系统 propertyCode 或 fogetOperationListrmPropertyCode 获取
 */
export function getOperationList(condition: ICondition, formProperties) {
  const { propertyCode } = condition;

  return async function() {
    /* 系统属性 */
    let data = getSystemOperation(propertyCode);

    /**
     * 取不到系统属性，取 formProperty
     */
    if (!data || data.length === 0) {
      const formProperty = formProperties.filter((item) => {
        return item.propertyCode === propertyCode;
      })[0];
      const componentType = formProperty?.componentType;

      data = OPERATION_COMPANYTYPE_MAPPING[componentType];
    }

    const pageList = OPERATION_LIST.filter((item) => {
      return data?.indexOf(item.operationCode) > -1;
    });

    return {
      pageList
    };
  };
}
