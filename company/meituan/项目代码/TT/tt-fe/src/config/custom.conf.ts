export const FieldToCompontent = {
    'SINGLE_LINE_TEXT': 'componentInput',
    'MULTI_LINE_TEXT': 'componentTextarea',
    'SINGLE_DROP_DOWN': 'componentSelect',
    'MULTI_DROP_DOWN': 'componentSelectMultiple',
    'RELATION_INTERFACE': 'componentRelation',
    'DATE': 'componentDate'
};
// String(1, "字符串"),
// List(3, "列表");
export const FieldToDataType = {
    'SINGLE_LINE_TEXT': 1,
    'MULTI_LINE_TEXT': 1,
    'SINGLE_DROP_DOWN': 1,
    'MULTI_DROP_DOWN': 3,
    'DATE': 4,
    'RELATION_INTERFACE': 1 // json转成字符串保存
};

// 将系统组件影射至基础组件
export const SysFieldToComponent = {
    'name': 'componentInput',
    'sla': 'componentSelect',
    'ticketType': 'componentSelect'
};

export const SysFieldToComponent2 = {
    'name': 'componentInput',
    'ticketType': 'componentSelect'
};
