import _lodash from 'lodash';

// 历史原因，流程工厂task节点需要关联Overrideid，才能和规则联系到一起
export function getOverrideid() {
  return `bpm${Number(Math.random().toString() + Date.now())
    .toString(36)
    .replace(/[.]/, '')}`;
}

// 每个节点独一无二的ResourceId
export function getResourceId() {
  const res = [];
  const hex = '0123456789ABCDEF';

  for (let i = 0; i < 36; i++) res[i] = Math.floor(Math.random() * 0x10);
  res[14] = 4;
  // eslint-disable-next-line no-bitwise
  res[19] = (res[19] & 0x3) | 0x8;
  for (let i = 0; i < 36; i++) res[i] = hex[res[i]];
  // eslint-disable-next-line no-multi-assign
  res[8] = res[13] = res[18] = res[23] = '-';
  return `sid-${res.join('')}`;
}

export function dealWithArr(arr, index, item, isDelete = false) {
  arr.splice(index, isDelete ? 1 : 0, item);
}

export function cloneDeep(obj) {
  return _lodash.cloneDeep(obj);
}
