export const customFieldEditForm = [
    {
        name: '字段名称',
        identify: 'name',
        type: 2,
        inputType: 'SINGLE_LINE_TEXT',
        defaultValue: '',
        isRequired: true,
        isHidden: false
    }, {
        name: '填写说明',
        identify: 'instruction',
        type: 2,
        inputType: 'MULTI_LINE_TEXT',
        defaultValue: '',
        isRequired: false,
        isHidden: false
    }, {
        name: '默认值',
        identify: 'defaultValue',
        type: 2,
        inputType: 'SINGLE_LINE_TEXT',
        defaultValue: '',
        isRequired: false,
        isHidden: false
    }, {
        name: '其他',
        identify: 'setting',
        type: 2,
        inputType: 'MULTI_CHECKBOX',
        defaultValue: '',
        isRequired: false,
        isHidden: false,
        options: [{
            value: 'isRequired',
            label: '必填',
            isDefault: false
        }, {
            value: 'isHidden',
            label: '对发起人隐藏',
            isDefault: false
        }]
    }
];
export const extraEditFields = {
    componentDate: {
        inputType: 'DATE'
    },
    componentWithOptions: {
        name: '选项',
        identify: 'options',
        inputType: 'OPTIONS_SETTING'
    },
    componentRelation: {
        name: '关联类型',
        inputType: 'RELATION_SELECT',
        identify: 'extraSettings',
        type: 2,
        defaultValue: {
            relationIntefaceIdentify: 'MEITUAN_DIANPING_POI'
        },
        isRequired: false,
        isHidden: false
    }
};
