/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-10-30 17:56:34
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-16 20:49:14
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/util/misc.ts
 */
export function flexibleCompare(a, b) {
  if (!a && !b) {
    return 0;
  }
  if (b == null) {
    return -1;
  }
  if (a == null) {
    return 1;
  }
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).localeCompare(String(b));
  }
  return a - b;
}

export function compareByFieldSpec(obj0, obj1, fieldSpec) {
  //   if (fieldSpec.func) {
  //     return fieldSpec.func(obj0, obj1);
  //   }

  return (
    flexibleCompare(obj0[fieldSpec.field], obj1[fieldSpec.field])
    * (fieldSpec.order || 1)
  );
}

export function compareByFieldSpecs(obj0, obj1, fieldSpecs) {
  let i;
  let cmp;

  for (i = 0; i < fieldSpecs.length; i++) {
    cmp = compareByFieldSpec(obj0, obj1, fieldSpecs[i]);
    if (cmp) {
      return cmp;
    }
  }

  return 0;
}
