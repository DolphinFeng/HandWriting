export const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('标题不能为空'));
    }
    if (value.length > 60) {
        return callback(new Error('标题不能超过60个字'));
    }
    return callback();
};
export const validateDesc: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('问题描述不能为空'));
    }
    return callback();
};
export const validateTickettype: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择问题类型'));
    }
    return callback();
};
export const validateSla: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择问题等级'));
    }
    return callback();
};
export const validateReporter: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择发起人'));
    }
    return callback();
};
export const validateCc: Function = (_rule, value, callback) => {
    if (value && value.length > 20) {
        return callback(new Error('最多可输入20个协助人'));
    }
    return callback();
};
// 默认兜底校验
export const validate: Function = (_rule, value, callback) => {
    if (_rule.required && !value) {
        return callback(new Error('请填写字段内容'));
    }
    return callback();
};
export const validateInstruction: Function = (_rule, value, callback) => {
    if (value && value.length > 500) {
        return callback(new Error('填写说明不超过500个字'));
    }
    return callback();
};
export function validateSetting (this: any, _rule, value, callback) {
    const defaultValue = this.formData.defaultValue;
    if (value.includes('isHidden') && !defaultValue) {
        return callback(new Error('设置对发起人隐藏时，请同时填写默认值'));
    }
    return callback();
}
export function validateDefaultvalue (this: any, _rule, value, callback) {
    // const setting = this.formData.setting;
    // if (!value && setting.includes('isHidden')) {
    //     return callback(new Error('设置对发起人隐藏时，请同时填写默认值'));
    // }
    // if (value.length > 50) {
    //     return callback(new Error('默认值不能不超过50个字'));
    // }
    return callback();
}
// export function validateExtrasettings (this: any, _rule, value, callback) {
//     if (!value || !value.relationIntefaceIdentify) {
//         return callback(new Error('请选择关联类型'));
//     }
//     return callback();
// }
export const validateOptions: Function = (_rule, value, callback) => {
    if (value && value.length) {
        value.forEach(item => {
            if (item.value && item.value.length > 50) {
                return callback(new Error('选项不能超过50个字'));
            }
        });
    }
    return callback();
};
export const validateAssigned: Function = (_rule, value, callback) => {
    console.log(value);
    return callback();
};
