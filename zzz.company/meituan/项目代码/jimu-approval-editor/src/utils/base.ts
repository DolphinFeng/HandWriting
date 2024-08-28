/**
 * form 和 flow 共用的一个方法库
 */

export enum CompomentType {
  Number = 'Number',
  Money = 'Money',
  Select = 'Select',
  SelectDD = 'SelectDD',
  People = 'People',
  Department = 'Department'
}

export const dataType = {
  [CompomentType.Number]: 'number',
  [CompomentType.Money]: 'number',
  [CompomentType.Select]: 'string',
  [CompomentType.SelectDD]: 'array',
  [CompomentType.People]: 'people',
  [CompomentType.Department]: 'department'
};
