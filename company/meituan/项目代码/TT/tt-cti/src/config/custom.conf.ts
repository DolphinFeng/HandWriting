export const CustomFieldCn = {
    componentInput: '单行文本',
    componentTextarea: '多行文本',
    componentSelect: '下拉单选',
    componentSelectMultiple: '下拉多选',
    componentDate: '日期',
    componentRelation: '关联系统'
};
export const CustomFieldIcon = {
    SINGLE_LINE_TEXT: 'iconfont icon-colorfont',
    MULTI_LINE_TEXT: 'iconfont icon-multi-line',
    SINGLE_DROP_DOWN: 'iconfont icon-yichuli',
    MULTI_DROP_DOWN: 'iconfont icon-checkbox-checked-o',
    DATE: 'iconfont icon-calendar-o',
    RELATION_INTERFACE: 'mtdicon mtdicon-checkbox-checked-o',
    labels: 'iconfont icon-label',
    permission: 'iconfont icon-shield-success',
    cc: 'iconfont icon-avatar-add'
};

export const CustomFieldList = [{
    name: '单行文本',
    inputType: 'SINGLE_LINE_TEXT'
}, {
    name: '多行文本',
    inputType: 'MULTI_LINE_TEXT'
}, {
    name: '下拉单选',
    inputType: 'SINGLE_DROP_DOWN',
    options: [{
        value: '',
        isDefault: false
    }]
}, {
    name: '下拉多选',
    inputType: 'MULTI_DROP_DOWN',
    options: [{
        value: '',
        isDefault: false
    }]
}, {
    name: '日期',
    inputType: 'DATE'
}, {
    name: '关联系统',
    inputType: 'RELATION_INTERFACE'
}];

export const FieldToCompontent = {
    SINGLE_LINE_TEXT: 'componentInput',
    MULTI_LINE_TEXT: 'componentTextarea',
    SINGLE_DROP_DOWN: 'componentSelect',
    MULTI_DROP_DOWN: 'componentSelectMultiple',
    DATE: 'componentDate',
    MULTI_CHECKBOX: 'componentCheckbox',
    RELATION_INTERFACE: 'componentRelation',
    // 以下用于字段设置
    OPTIONS_SETTING: 'componentOptions',
    RELATION_SELECT: 'componentRelationselect',
    IDENTIFY_NAME: 'componentInput',
    IDENTIFY_DESC: 'componentDesc',
    IDENTIFY_CC: 'componentCc',
    IDENTIFY_PERMISSION: 'componentPermission',
    IDENTIFY_LABELS: 'componentLabels',
    IDENTIFY_SLA: 'componentSelect',
    IDENTIFY_TICKETTYPE: 'componentSelect',
    IDENTIFY_CITY: 'componentCity',
    IDENTIFY_ASSOCIATETICKET: 'componentAssociateticket'
};

export const compontentToField = {
    componentInput: 'SINGLE_LINE_TEXT',
    componentTextarea: 'MULTI_LINE_TEXT',
    componentSelect: 'SINGLE_DROP_DOWN',
    componentSelectMultiple: 'MULTI_DROP_DOWN',
    componentDate: 'DATE',
    componentRelation: 'RELATION_INTERFACE'
};

// 将系统组件映射至基础组件
export const SysFieldToComponent = {
    name: 'componentInput',
    sla: 'componentSelect',
    ticketType: 'componentSelect'
};

// 将系统组件映射至基础组件（编辑默认值）
export const DefaultValSysToComponent = {
    name: 'SINGLE_LINE_TEXT',
    desc: 'SINGLE_LINE_TEXT',
    sla: 'SINGLE_DROP_DOWN',
    ticketType: 'SINGLE_DROP_DOWN',
    cc: 'IDENTIFY_CC',
    permission: 'IDENTIFY_PERMISSION',
    labels: 'IDENTIFY_LABELS'
};

// 已经创建过的 收起的系统字段
export const foldSys = ['labels', 'associateTicket', 'cc', 'permission'];
