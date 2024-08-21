export const validateName: Function = (_rule, value, callback) => {
    if (!value.length) {
        return callback(new Error('名称不能为空'));
    }
    if (value.length > 40) {
        return callback(new Error('名称不能超过40个字符'));
    }
    return callback();
};
export const validateRg: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('RG不能为空'));
    }
    return callback();
};
export const validateOncallCycle: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择轮值周期'));
    }
    return callback();
};
export const validateOncallStart: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择轮换时间点'));
    }
    return callback();
};
export const validateSendTime: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择发送时间'));
    }
    return callback();
};
export const validateSendCycle: Function = (_rule, value, callback) => {
    if (!(value.length && value[0])) {
        return callback(new Error('请选择发送周期'));
    }
    return callback();
};
export default {
    validateName,
    validateRg,
    validateOncallCycle,
    validateOncallStart,
    validateSendTime,
    validateSendCycle
};
