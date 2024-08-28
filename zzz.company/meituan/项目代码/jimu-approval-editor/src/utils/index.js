/*
 * @Description:
 * @Author: wuhongjie02@meituan.com
 * @Date: 2022-05-11 19:24:12
 * @LastEditTime: 2022-05-24 12:18:41
 * @LastEditors: wuhongjie02@meituan.com
 * @FilePath: /jimu-approval-editor/src/utils/index.js
 * @Reference:
 */
export function getIn(collection, searchKeyPath, notSetValue = {}) {
  let i = 0;
  let res = collection;
  while (i !== searchKeyPath.length) {
    // 如果不能往下获取则返回默认
    if (typeof res !== 'object' || res === null) {
      return notSetValue;
    }
    const key = searchKeyPath[i++];
    res = res[key];
  }

  // undefined返回 默认值
  if (res === undefined) {
    return notSetValue;
  }
  return res;
}

export function getUUID() {
  return `bpm${Number(Math.random().toString() + Date.now())
    .toString(36)
    .replace(/[.]/, '')}`;
}

export function splitJointKey(obj, key) {
  if (Array.isArray(key)) {
    return key.reduce((item, next) => {
      return `${obj[item]} ${obj[next]}`;
    });
  }
  return obj[key];
}

export function mergeObjectWithSameProperty(obj1, obj2) {
  // console.log('-------mergeObjectWithSameProperty', {obj1, obj2})
  // eslint-disable-next-line no-unused-vars
  for (const k in obj2) {
    obj1[k] = obj2[k];
  }
}
