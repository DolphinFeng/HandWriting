import { getUUID } from '@/utils';

import { LogicalType } from './condition.type';

export const LogicalText = {
  [LogicalType.OR]: '或',
  [LogicalType.AND]: '且'
};

export const RuleBaseCondition = () => ({
  key: getUUID(),
  value: '',
  propertyCode: '',
  propertyName: '',
  businessType: 0,
  subPropertyCode: '',
  subPropertyName: '',
  operationCode: '',
  operationName: '',
  operationDisplay: '',
  data: [],
  showSub: true,
  editOperation: true,
  leaf: true
});
