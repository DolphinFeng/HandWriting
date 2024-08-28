import { isEmpty, isPlainObject } from 'lodash';
import { IFormProperty } from '../../flow.type';
import { INodeBoxOption, EComponentType } from '../node-box.type';
import {
  ICondition,
  IConditionValueOption,
  IConditionOperation
} from './condition.type';
import { isRemoteBusinessType } from '@/utils/flow';

export const shouldRenderTag = (operation: IConditionOperation) => {
  if (!operation) {
    return false;
  }

  const group = ['in', 'ni', 'ct', 'nt'];

  return group.indexOf(operation.operationCode.toLowerCase()) > -1;
};

/**
 * 根据组件特性渲染 condition-value 的组件格式
 */
export const shouldRenderSelect = (properyCode: string) => {
  if (!properyCode) {
    return false;
  }

  const group = ['select', 'selectdd'];

  for (const matched of group) {
    if (properyCode.indexOf(matched) > -1) {
      return true;
    }
  }

  return false;
};

/**
 *
 * 校验 property，operation 和 value 的必填
 * 返回参数: [true,true,true] 证明 三个都通过
 */
export const conditionValidator = (condition: ICondition): Array<boolean> => {
  const {
    businessType,
    propertyCode,
    operationCode,
    data,
    value,
    componentType
  } = condition;

  const result = [true, true, true];
  // 这三个条件都是渲染 Select 组件的，都有 data 属性
  // 空数组，{}，空字符串, undefinded 都认为 空
  const isEmptryObject =
    (Array.isArray(data) && data.length === 0) || isEmpty(data) || data === '';
  if (
    businessType === 1 ||
    businessType === 2 ||
    shouldRenderSelect(propertyCode)
  ) {
    result[0] = !!propertyCode;
    result[1] = !!operationCode;
    result[2] = !isEmptryObject && !!value;
  } else if (businessType === 0) {
    result[0] = !!propertyCode;
    result[1] = !!operationCode;
    result[2] = !!data && !!value;
    if (componentType === EComponentType.Number && !isEmptryObject) {
      result[2] = (data as string).split(',').every((ele) => {
        let removeMinusData = ele as string;
        if (removeMinusData[0] === '-') {
          removeMinusData = removeMinusData.substring(1);
        }
        return /^[0-9]+(\.[0-9]+){0,1}$/.test(removeMinusData);
      });
    }
  }

  return result;
};

export const getValueFromOptions = (
  item: IConditionValueOption,
  options: IConditionValueOption[]
) => {
  if (!options || options.length === 0) {
    return item;
  }

  const optionValue = options.find((val) => {
    return item.value === val.value;
  });

  if (typeof optionValue !== 'undefined') {
    return optionValue;
  }

  return item;
};

/**
 * 当 form 里的 label 或 optionname 之类的修改时，需要 sync process 的展示更新
 */
export const syncConditionDisplay = (
  formProperties: IFormProperty[],
  option: INodeBoxOption
): void => {
  const { conditions } = option;
  if (!conditions || conditions.length === 0) {
    return;
  }

  for (const condition of conditions) {
    if (!condition.leaf) {
      syncConditionDisplay(formProperties, condition);
    } else if (!isRemoteBusinessType(condition.businessType)) {
      const index = formProperties.findIndex((property) => {
        return property.propertyCode === condition.propertyCode;
      });

      if (formProperties[index]) {
        condition.propertyName = formProperties[index].propertyName;

        // 带options 的
        if (shouldRenderSelect(condition.propertyCode)) {
          condition.options = formProperties[index].options;

          if (Array.isArray(condition.data)) {
            condition.data = condition.data.map((item) => {
              return getValueFromOptions(
                item as IConditionValueOption,
                condition.options || []
              );
            });
          } else {
            condition.data = getValueFromOptions(
              condition.data as IConditionValueOption,
              condition.options || []
            );
          }
        }
      }
    }
  }
};

export const buildConditionValue = (conditions: ICondition[]): void => {
  if (!conditions || conditions.length === 0) {
    return;
  }

  /**
   * 所有的 data 结构，都保持 value,label 的结构
   */
  for (const condition of conditions) {
    if (typeof condition.data !== 'undefined') {
      if (Array.isArray(condition.data)) {
        condition.value = condition.data
          .map((childItem) => {
            return childItem.value;
          })
          .join(',');
      } else if (typeof condition.data === 'string') {
        condition.value = condition.data;
      } else if (isPlainObject(condition.data)) {
        condition.value = condition.data.value;
      }
    }

    if (!condition.leaf) {
      buildConditionValue(condition.conditions || []);
    }
  }
};

export const validateHasErrorInCondition = (conditions) => {
  if (!conditions || conditions.length <= 0) {
    return false;
  }

  return conditions.some((condition) => {
    if (condition.conditions) {
      return validateHasErrorInCondition(condition.conditions);
    }
    const result = conditionValidator(condition);
    const hasError = result.filter((item) => item).length < 3;

    return hasError;
  });
};
