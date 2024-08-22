export const testConfig = [
    {
        name: '单行',
        instruction: '这是一个单行文本',
        type: 2,
        inputType: 'SINGLE_LINE_TEXT',
        defaultValue: '默认值1',
        isRequired: true,
        isHidden: false,
        validator: ''
    }, {
        name: '多行',
        instruction: '这是一个多行文本',
        type: 2,
        inputType: 'MULTI_LINE_TEXT',
        defaultValue: '默认值1',
        isRequired: true,
        isHidden: false,
        validator: ''
    }, {
        name: '单选',
        type: 2,
        inputType: 'SINGLE_DROP_DOWN',
        defaultValue: '',
        isRequired: true,
        isHidden: false,
        validator: '',
        options: [{
            value: 'aaa',
            isDefault: true
        }, {
            value: 'bbb',
            isDefault: false
        }, {
            value: 'ccc',
            isDefault: false
        }]
    }, {
        name: '多选',
        type: 2,
        inputType: 'MULTI_DROP_DOWN',
        defaultValue: '',
        isRequired: true,
        isHidden: false,
        validator: '',
        options: [{
            value: 'dasdasd',
            isDefault: true
        }, {
            value: 'bbsadasb',
            isDefault: true
        }, {
            value: 'ccasdasdac',
            isDefault: false
        }]
    }, {
        name: '日期',
        type: 2,
        inputType: 'DATE',
        defaultValue: '默认值1',
        isRequired: true,
        isHidden: false,
        validator: ''
    }
];
