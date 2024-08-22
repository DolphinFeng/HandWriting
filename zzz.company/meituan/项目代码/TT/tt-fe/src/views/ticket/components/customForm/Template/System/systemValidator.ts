export const validateName: Function = (i18n) => (_rule, value, callback) => {
    if (value?.length > 60) {
        return callback(new Error(i18n('create_ticket_validate_name_error', '标题不能超过60个字')));
    }
    if (_rule.required && !value) {
        return callback(new Error(i18n('create_ticket_validate_required_error', '请填写标题')));
    }
    return callback();
};
export const validateDesc: Function = (i18n) => (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(i18n('create_ticket_validate_desc_error', '问题描述不能为空')));
    }
    return callback();
};
export const validateTickettype: Function = (i18n) => (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(i18n('create_ticket_validate_ticket_type_error', '请选择问题类型')));
    }
    return callback();
};
export const validateSla: Function = (i18n) => (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(i18n('create_ticket_validate_sla_error', '请选择问题等级')));
    }
    return callback();
};
export const validateReporter: Function = (i18n) => (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(i18n('create_ticket_validate_reporter_error', '请选择发起人')));
    }
    return callback();
};
export const validateCc: Function = (i18n) => (_rule, value, callback) => {
    if (value && value.length > 30) {
        return callback(new Error(i18n('create_ticket_validate_cc_error_length', '最多可输入30个协助人')));
    }
    if (_rule.required && !value.length) {
        return callback(new Error(i18n('create_ticket_validate_cc_error_required', '请填写抄送人')));
    }
    return callback();
};
export const validateLabels: Function = (i18n) => (_rule, value, callback) => {
    if (_rule.required && !value.length) {
        return callback(new Error(i18n('create_ticket_validate_labels_error', '请填写标签')));
    }
    return callback();
};
export const validateComponentrelation: Function = (i18n) => (_rule, value, callback) => {
    const formatValue = value ? JSON.parse(value) : null;
    if (!_rule.required || _rule.required && formatValue && formatValue.shopId) {
        return callback();
    }
    return callback(new Error(i18n('create_ticket_validate_componentrelation_error', '请输入正确的门店ID')));
};
// 默认兜底校验
export const validate: Function = (i18n) => (_rule, value, callback) => {
    if (_rule.required) {
        if (!value) return callback(new Error(i18n('create_ticket_validate_required_error', '请填写字段内容')));
        if (Array.isArray(value) && !value.length) {
            return callback(new Error(i18n('create_ticket_validate_required_error', '请填写字段内容')));
        }
    }
    return callback();
};
