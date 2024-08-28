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

// 表单提交函数
export function setFlowBehavior() {}

export function mergeFormData(ctx, formData) {
  for (const i in formData) {
    const { fieldId, fieldData } = formData[i];
    const curInstance = ctx.componentInstanceMap[fieldId];
    const value = fieldData.onlyValue ? fieldData.value : fieldData;
    curInstance._props._instance.setCompState('value', value);
    // readOnly: false,
    // disable: false,
    // hidden: false,
    curInstance._props._instance.setCompState('behavior', 'READONLY');
    // this.componentInstanceMap[this.formData[i].componentName]._setState()
  }
}

export function getFormValue(ctx) {
  const noCom = ['jimu-root', 'ColumnsGrid', 'Column', 'jimu-view'];
  const values = [];
  for (const i in ctx.componentInstanceMap) {
    const curInstance = ctx.componentInstanceMap[i];
    if (noCom.includes(curInstance.componentName)) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const fieldData = {
      componentId: i,
      componentName: curInstance.componentName,
      fieldId: curInstance.fieldId,
      fieldData: curInstance._state.value?.value
        ? curInstance._state.value
        : {
            onlyValue: true,
            value: curInstance._state.value
          }
    };
    values.push(fieldData);
  }
  return values;
}
