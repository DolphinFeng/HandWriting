import { service } from '../utils';

// 获取值班信息
export const getOncallTable = (params: {
    rgId: number[];
    timestamp: number;
    timeType: 'WEEK' | 'MONTH';
    needRgDetail: boolean;
}) => {
    return service.post('/oncall/1.0/table', params);
};
// 获取值班人信息
export const getOncallMember = (params: {
    rgId: number[];
    timestamp: number;
    timeType: 'WEEK' | 'MONTH';
}) => {
    return service.post('/oncall/1.0/member', params);
};
// 获取节假日信息
export const getOncallCalender = (params: {
    rgId: number[];
    timestamp: number;
    timeType: 'WEEK' | 'MONTH';
    needHolidayInfo: boolean;
}) => {
    return service.post('/oncall/1.0/calendar', params);
};
// 获取已排工时
export const getOncallHour = (params: {
    rgId: number[];
    timestamp: number;
    timeType: 'WEEK' | 'MONTH';
}) => {
    return service.post('/oncall/1.0/member/scheduled/hour', params);
};
// 编辑值班表
export const updateOncallTableByDate = (params: {
    rgId: number;
    mis: string;
    date: number;
    shift: number[];
    wholeDay: boolean;
}) => {
    return service.post('/oncall/1.0/oncall/update', params);
};

// 获取Excel模板
export const getOncallTemplate = (params: {
    rgId: number[];
    timestamp: number;
    timeType: 'WEEK' | 'MONTH';
}) => {
    return service.post('/oncall/1.0/excel/template/generate', params);
};

// 获取关闭原因 Excel 模板
export const getCloseTemplate = (params: {
    rgId: number;
    type: string;
}) => {
    return service.get('/cti/1.0/rg/display/field/export/template', { params });
};

// Excel上传校验

// 导入值班表
export const uploadOncallExcel = (rgId: number, params: {
    file: string;
    objectName: string;
    isOverride: boolean;
}) => {
    return service.post(`/oncall/1.0/excel/submit?rgId=${rgId}`, params);
};

// 总览表添加值班人
export const addOncallMember = (params: {
    rgId: number;
    mis: string[];
}) => {
    return service.post('/oncall/1.0/member/add', params);
};

// 值班人换班
export const switchOncallMember = (params: {
    rgId: number;
    switchProposer: string;
    switchAcceptor: string;
    startAt: number;
    endAt: number;
    switchReason: string;
}) => {
    return service.post('/oncall/1.0/member/switch', params);
};
// 值班人上下线
export const updateOncallMemberState = (params: {
    rgId: number;
    mis: string[];
    action: 'ONLINE' | 'OFFLINE';
}) => {
    return service.post('/oncall/1.0/member/state', params);
};
// 删除值班人
export const deleteOncallMember = (params: {
    rgId: number;
    mis: string[];
}) => {
    return service.delete('/oncall/1.0/member', { data: params });
};
// 值班人下线预校验
export const checkOncallMemberState = (params: {
    rgId: number;
    mis: string[];
    action: 'ONLINE' | 'OFFLINE';
}) => {
    return service.post('/oncall/1.0/member/state/precheck', params);
};

// 获取RG下所有班次
export const getShifts = (rgId: number) => {
    return service.get(`/oncall/1.0/shift?rgId=${rgId}`);
};

// 增加班次
export const addShift = (params: {
    rgId: number;
    name?: string;
    abbreviation?: string;
    color?: string;
    startAt: number;
    endAt: number;
    breakStartAt?: number;
    breakEndAt?: number;
}) => {
    return service.post('/oncall/1.0/shift', params);
};

// 删除班次
export const deleteShift = (shiftId: number) => {
    return service.delete(`/oncall/1.0/shift?shiftId=${shiftId}`);
};
// 更新班次
export const updateShift = (params: {
    id?: number;
    rgId: number;
    name?: string;
    abbreviation?: string;
    color?: string;
    startAt: number;
    endAt: number;
    breakStartAt?: number;
    breakEndAt?: number;
}) => {
    return service.post('/oncall/1.0/shift/update', params);
};
// 获取RG组当天在使用的班次
export const getInUseShifts = (rgId: number) => {
    return service.get(`/oncall/1.0/shift/in/use?rgId=${rgId}`);
};

// 获取RG下所有规则
export const getRgRules = (params: {
    rgId: number;
    ruleDateType: string[]; // ["SPECIAL", "NORMAL"] 不填默认两种
}) => {
    return service.post('/oncall/1.0/get/rule', params);
};
// 增加规则
export const addRgRule = (params: {
    rgId: number;
    name: string;
    ruleType: 'FIXED_RULE' | 'CYCLICAL_RULE';
    oncallMemberType: 'BY_USERNAME' | 'BY_ONCALL_GROUP';
    oncallUser: any[];
    oncallGroup: any[];
    ruleDateType: 'NORMAL'| 'SPECIAL';
    ruleStartAt: number;// 特殊日期模式下的开始时间，日常为空
    ruleEndAt: number;
    cycleTime: number;
    cycleDay: number[];
    cycleType: string;
    dayOfWeek: number[];
    shiftType: 'SHIFT'| 'WHOLE_DAY';
    shiftId:number; // 班次id, shiftType为WHOLE_DAY时无
}) => {
    return service.post('/oncall/1.0/rule', params);
};
// 编辑规则
export const updateRgRule = (params: {
    id: number;
    rgId: number;
    name: string;
    ruleType: 'FIXED_RULE' | 'CYCLICAL_RULE';
    oncallMemberType: 'BY_USERNAME' | 'BY_ONCALL_GROUP';
    oncallMemberIdentify: any[];
    ruleDateType: 'NORMAL'| 'SPECIAL';
    ruleStartAt: number;// 特殊日期模式下的开始时间，日常为空
    ruleEndAt: number;
    dayOfWeek: number[];
    shiftType: 'SHIFT'| 'WHOLE_DAY';
    shiftId: number[]; // 班次id, shiftType为WHOLE_DAY时无
}) => {
    return service.post('/oncall/1.0/rule/update', params);
};
// 删除规则
export const deleteRgRule = (ruleId: number) => {
    return service.delete(`/oncall/1.0/rule?ruleId=${ruleId}`);
};

// 查询所有值班组
export const getRgGroups = (params: {
    rgId: number;
}) => {
    return service.get('/oncall/1.0/group', { params });
};
// 增加值班组
export const addRgGroup = (params: {
    rgId: number;
    displayName: string;
    misList: string[];
}) => {
    return service.post('/oncall/1.0/group/create', params);
};
// 编辑值班组
export const updateRgGroup = (params: {
    identify: number;
    rgId: number;
    displayName: string;
    misList: string[];
}) => {
    return service.put('/oncall/1.0/group', params);
};
// 删除值班组
export const deleteRgGroup = (id: number) => {
    return service.delete(`/oncall/1.0/group?id=${id}`);
};
// 查询值班提醒配置
export const getReminderConfig = (rgId: number) => {
    return service.get(`/oncall/1.0/rg/${rgId}/reminder/config`);
};
// 修改值班提醒配置
export const updateReminderConfig = (rgId: number, params: {
    checkInState: string; // ON（开启），OFF（关闭）
    preReminderState: string;
    triggerConfigId: number;
    timeValue: number;
    timeUnit: number;
    recipient: {
        roleList: any[];
        misList: string[];
    };
}) => {
    return service.post(`/oncall/1.0/rg/${rgId}/reminder/config`, params);
};
// 查询值班提醒通知对象列表
export const getReminderConfigRecipient = (rgId: number) => {
    return service.get(`/oncall/1.0/rg/${rgId}/reminder/config/recipient`);
};

// 提交数据导出任务
export const addOncallExportTask = (params: {
    type: 'CHECK_IN_LOG' | 'DUTY_CHANGE_LOG' | 'WORK_TIME_LOG' | 'DUTY_LOG';
    rgId: number;
    startAt: string;
    endAt: string; // '2023-10'
}) => {
    return service.post('/oncall/1.0/excel/export', params);
};
// 查询导出进度
export const getOncallExportProgress = (params: {
    taskId: number;
}) => {
    return service.get('/oncall/1.0/excel/export/progress', { params });
};
