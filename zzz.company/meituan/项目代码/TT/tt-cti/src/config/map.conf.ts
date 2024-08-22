export const NavBar = [{
    label: 'cti_top_nav_tab_handle_tt',
    value: 'handle',
}, {
    label: 'cti_top_nav_tab_search_tt',
    value: 'filter',
}, {
    label: 'cti_top_nav_tab_analyze',
    value: 'statistic',
}, {
    label: 'cti_top_nav_tab_cti',
    value: 'cti',
}];
export const NavBarWithQuality = [{
    label: 'cti_top_nav_tab_handle_tt',
    value: 'handle',
}, {
    label: 'cti_top_nav_tab_search_tt',
    value: 'filter',
}, {
    label: 'cti_top_nav_tab_inspect_tt',
    value: 'quality',
}, {
    label: 'cti_top_nav_tab_analyze',
    value: 'statistic',
}, {
    label: 'cti_top_nav_tab_cti',
    value: 'cti',
}];
export const UserRole = {
    NORMAL: '普通成员',
    RGADMIN: '管理员',
    ASSIST: '协作成员'
};

export const UserRoleArr = [
    {
        value: 'NORMAL',
        label: '普通成员'
    }, {
        value: 'RGADMIN',
        label: '管理员'
    }, {
        value: 'ASSIST',
        label: '协作成员'
    }
];

export const SpaceUserRole = {
    ADMIN: '空间管理员'
};
export const SpaceInspectionUserRole = {
    ADMIN: '质检管理员',
    INSPECTOR: '质检员'
};
export const InspectionMemberTable = [
    {
        key: 'admin',
        label: '质检管理员',
        hint: '最多支持添加15位质检管理员'
    }, {
        key: 'inspector',
        label: '质检员',
        hint: '最多支持添加15位质检员'
    }
];

export const OncallCycle = ['day', 'day_skip', 'week'];

export const OncallCycleText = {
    day: '按天轮值',
    day_skip: '按天轮值（跳过节假日）',
    week: '按周轮值（7天）'
};

export const WeekDays = ['一', '二', '三', '四', '五', '六', '日'];

export const EveryWeekdayList = [
    { label: '周一', value: 'MONDAY', digit: '1' },
    { label: '周二', value: 'TUESDAY', digit: '2' },
    { label: '周三', value: 'WEDNESDAY', digit: '3' },
    { label: '周四', value: 'THURSDAY', digit: '4' },
    { label: '周五', value: 'FRIDAY', digit: '5' },
    { label: '周六', value: 'SATURDAY', digit: '6' },
    { label: '周日', value: 'SUNDAY', digit: '7' }
];

export const EveryHourList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

export const DEFAULT_AVATAR = '//s3plus.sankuai.com/v1/mss_4a5c70e8b289484393a22a82f4c3ed40/static-source/default-avatar.png';

export const fieldOptionsArr = [{
    value: 'NAME',
    label: '标题关键字'
}, {
    value: 'ORG',
    label: '发起人所在部门'
}, {
    value: 'REPORTER_CITY',
    label: '发起人所在城市'
}
];
export const autoArchiveOptionsArr = [{
    value: 'NAME',
    label: '标题关键字'
}, {
    value: 'DESC',
    label: '描述关键字'
}];

export const fieldOptions = {
    name: {
        property: 'CONTENT',
        predicate: 'CONTAIN'
    },
    reporter: {
        property: 'DEPARTMENT',
        predicate: 'BELONG'
    },
    city: {
        property: 'REPORTERCITYCITY',
        predicate: 'ONLYBELONG'
    }
};
export const predicateOptions = {
    CONTAIN: 'CONTAIN',
    NOT_CONTAIN: 'NOT_CONTAIN'
};
export const predicateCn = {
    CONTAIN: '包含',
    NOT_CONTAIN: '不包含'
};
export const actionOptions = {
    ASSIGNED: {
        nameCn: '流转-处理人',
        action: 'UPDATE'
    },
    ITEM_ID: {
        nameCn: '流转-服务目录',
        action: 'UPDATE'
    },
    CC: {
        name: '添加-抄送人',
        action: 'ADD'
    }
};

export const actionOptionsArr = [{
    value: 'ASSIGNED',
    label: '流转：处理人'
}, {
    value: 'ITEM_ID',
    label: '流转：服务目录'
}, {
    value: 'CC',
    label: '添加：抄送人'
}];

export const triggerTimeOptions = [{
    value: 'BEFORE_TT',
    label: 'TT发起前'
}];

export const DutyModes = [{
    value: 'SINGLE_TURN',
    label: '轮值设置'
}, {
    value: 'MULTI_ONLINE',
    label: '默认模式'
}];

export const DutyModeMap = {
    SINGLE_TURN: '按人值班-单人轮值',
    MULTI_ONLINE: '按人值班-默认模式',
    GROUP_TURN: '按组值班-按组轮值',
    GROUP_TIME_TURN: '按组值班-按时间段值班'
};

export const SourceTypes = [{
    text: '全部',
    value: ''
}, {
    text: 'RG成员',
    value: 'rg_user'
}, {
    text: '值班组',
    value: 'rg_onCall'
}, {
    text: '模板管理',
    value: 'rg_template'
}, {
    text: '通知报表',
    value: 'rg_report'
}, {
    text: '触发器',
    value: 'rg_trigger'
}, {
    text: '设置',
    value: 'rg_setting'
}];

export const TenantList = ['代理商账号', '猫眼账号', '外包账号'];

export const TimeTypes = {
    MINUTE: '分钟',
    HOUR: '小时',
    DAY: '天',
    WEEK: '周'
};
export const Sla2CN = {
    S1: '非常紧急',
    S2: '紧急',
    S3: '高',
    S4: '中',
    S5: '低'
};
export const SlaTip = {
    S1: '重大事件，或者受客户影响',
    S2: '严重事件，对部门有影响，必须立刻响应',
    S3: '对部门有影响，需要尽快解决',
    S4: '对个人有影响，不及时解决会升级',
    S5: '低级，不影响工作效率'
};
export const SlaExplain = {
    S1: '<p>如果 Ticket 等级为非常紧急，在创建时会发送一条短信给当前处理人，同时发送一条大象通知给处理人所在 RG 中的所有成员，同时也会发送大象通知给协同 RG 的值班员。</p><p>如果 Ticket 等级为非常紧急，且在响应时长时间内状态未改变，则会发送一条大象通知给当前处理人和处理人的 leader，如再次超时将会向 leader 的 leader 发送通知，循环向上通知三次，通知对象可在“升级提醒”中配置。</p>',
    S2: '如果 Ticket 等级为紧急，且在响应时长时间内状态未改变，则会发送一条短信给当前处理人，并同时发送一条大象通知给当前处理人的 leader，如再次超时将会向 leader 的 leader 发送通知，循环向上通知三次，通知对象可在“升级提醒”中配置。',
    S3: '如果 Ticket 等级为高且在响应时长时间内状态未改变，则发送一条大象通知给处理人，如需额外的通知对象，可在“升级提醒”中配置。',
    S4: '如果 Ticket 等级为中，且在处理时长时间内未完成处理（状态变为已解决或已关闭），则 Ticket 等级会上升一级，并发送一条通知给当前处理人，如需额外的通知对象，可在“升级提醒”中配置。',
    S5: '如果 Ticket 等级为低，且在处理时长时间内未完成处理（状态变为已解决或已关闭），则 Ticket 等级会上升一级，并发送一条通知给当前处理人，如需额外的通知对象，可在“升级提醒”中配置。'
};
export const SlaSettingTip = {
    holiday: '除下列节假日时间的其他日期，均会被视为工作日。',
    responseTime: 'TT状态从工单创建到处理中/暂停/已关闭任意一种状态之间的时长，若关闭后重新打开则重新计算响应时长。',
    resolveTime: 'TT状态从工单创建到已解决/已关闭任意一种状态之间的时长，若关闭后重新打开则累加计算解决时长。',
    workTime: '可在SLA等级下的工作时间中设置工作时间和非工作时间。工作时间默认为周一至周日全天。',
    noWorkTime: '可在SLA等级下的工作时间中设置工作时间和非工作时间。非工作时间默认为法定节假日。'
};
export const HolidayMap = {
    0: [{
        date: 1,
        name: '元旦'
    }, {
        date: 24,
        name: '除夕'
    }, {
        date: 25,
        name: '春节'
    }],
    3: [{
        date: 4,
        name: '清明'
    }],
    4: [{
        date: 1,
        name: '劳动'
    }],
    5: [{
        date: 24,
        name: '端午'
    }],
    9: [{
        date: 1,
        name: '国庆'
    }]
};
export const ProvinceList = [
    {
        code: '110000',
        name: '北京市'
    },
    {
        code: '120000',
        name: '天津市'
    },
    {
        code: '130000',
        name: '河北省'
    },
    {
        code: '140000',
        name: '山西省'
    },
    {
        code: '150000',
        name: '内蒙古自治区'
    },
    {
        code: '210000',
        name: '辽宁省'
    },
    {
        code: '220000',
        name: '吉林省'
    },
    {
        code: '230000',
        name: '黑龙江省'
    },
    {
        code: '310000',
        name: '上海市'
    },
    {
        code: '320000',
        name: '江苏省'
    },
    {
        code: '330000',
        name: '浙江省'
    },
    {
        code: '340000',
        name: '安徽省'
    },
    {
        code: '350000',
        name: '福建省'
    },
    {
        code: '360000',
        name: '江西省'
    },
    {
        code: '370000',
        name: '山东省'
    },
    {
        code: '410000',
        name: '河南省'
    },
    {
        code: '420000',
        name: '湖北省'
    },
    {
        code: '430000',
        name: '湖南省'
    },
    {
        code: '440000',
        name: '广东省'
    },
    {
        code: '450000',
        name: '广西壮族自治区'
    },
    {
        code: '460000',
        name: '海南省'
    },
    {
        code: '500000',
        name: '重庆市'
    },
    {
        code: '510000',
        name: '四川省'
    },
    {
        code: '520000',
        name: '贵州省'
    },
    {
        code: '530000',
        name: '云南省'
    },
    {
        code: '540000',
        name: '西藏自治区'
    },
    {
        code: '610000',
        name: '陕西省'
    },
    {
        code: '620000',
        name: '甘肃省'
    },
    {
        code: '630000',
        name: '青海省'
    },
    {
        code: '640000',
        name: '宁夏回族自治区'
    },
    {
        code: '650000',
        name: '新疆维吾尔自治区'
    },
    {
        code: '710000',
        name: '台湾省'
    },
    {
        code: '810000',
        name: '香港特别行政区'
    },
    {
        code: '820000',
        name: '澳门特别行政区'
    }
];
export const SpaceDetailTabs = [{
    label: '空间管理员',
    value: 'space_admin'
}, {
    label: 'RG组管理',
    value: 'space_rg'
}, {
    label: '目录管理',
    value: 'space_catalog'
}, {
    label: '质检成员管理',
    value: 'space-quality-member'
}, {
    label: '质检模板配置',
    value: 'space-quality-template'
}
];
export const FieldSettingTabs = [{
    label: '暂停原因',
    value: 'pause',
    type: 'PENDING_REASON'
}, {
    label: '关闭原因',
    value: 'close',
    type: 'CLOSED_REASON'
}];

export const ReplySettingTabs = [{
    label: '评论',
    value: 'comment',
    type: 'COMMENT'
}, {
    label: '关闭描述',
    value: 'close',
    type: 'CLOSED_DESC'
}, {
    label: '暂停描述',
    value: 'pending',
    type: 'PENDING_REASON'
}, {
    label: '解决方案',
    value: 'resolution',
    type: 'RESOLUTION'
}];

export const SlaList = [{
    value: 'S5',
    name: '低'
}, {
    value: 'S4',
    name: '中'
}, {
    value: 'S3',
    name: '高'
}, {
    value: 'S2',
    name: '紧急'
}, {
    value: 'S1',
    name: '非常紧急'
}];

export const RemindReceiversTypes = [{
    value: 'ASSIGNED',
    label: '处理人'
}, {
    value: 'CC',
    label: '抄送人'
}, {
    value: 'LEVEL_ONE_LEADER',
    label: '一级主管'
}, {
    value: 'LEVEL_TWO_LEADER',
    label: '二级主管'
}];
export const TimeUnits = [{
    value: 'DAY',
    label: '天'
}, {
    value: 'HOUR',
    label: '小时'
}, {
    value: 'MINUTE',
    label: '分钟'
}, {
    value: 'SECOND',
    label: '秒'
}];

export const UserRoleState = {
    RGADMIN: '管理员可以参与值班，可以对RG组内的所有配置进行增删改',
    NORMAL: '普通成员可以参与值班，但不能对RG组的配置进行更改',
    ASSIST: '协作成员无法参与值班、无法作为RG组工单处理人，但可以查看RG组下的保密工单'
};
export const dxSettingMap = [
    {
        title: '欢迎语消息',
        time: 'TT大象群创建成功后',
        type: 'TT大象群',
        content: '欢迎语、TT基本消息',
        key: 'welcomeMessage'
    },
    {
        title: '满意度评价提醒',
        time: '工单处理',
        type: 'radio',
        content: '满意度邀评',
        key: 'satisfyReminder',
        radioKey: 'satisfyReminderMethod'
    },
    {
        title: '工单处理提醒',
        time: 'input',
        type: 'TT大象群',
        content: '提醒处理人及时关单',
        key: 'ticketReminder',
        inputKey: 'ticketReminderTime'
    },
    {
        title: '重新打开工单提醒',
        time: '工单被重新打开，会向TT大象群里发送提示',
        type: 'radio',
        content: '重新打开提示',
        key: 'reopenReminder',
        radioKey: 'reopenReminderMethod'
    },
    {
        title: '处理人变更消息',
        time: 'TT工单处理人变更',
        type: 'radio',
        content: '变更后处理人',
        key: 'assignedUpdate',
        radioKey: 'assignedUpdateReminderMethod'
    },
    {
        title: '下游系统状态变更提醒',
        time: '工单关联的下游系统工作项处理完成',
        type: 'radio',
        content: '工作项基本描述及工作项状态',
        key: 'associateSystemReminder',
        radioKey: 'associateSystemReminderMethod',
        checkKey: 'associateSystemAdditionalReceiver',
        hint: '通过「TT小助手公众号」这类发送方式，可接收到信息的用户范围',
        checkList: [{
            label: '发起人',
            value: 'REPORTER'
        }, {
            label: '处理人',
            value: 'ASSIGNED'
        }, {
            label: '抄送人',
            value: 'CC'
        }]
    },
    {
        title: '工单被暂停提醒',
        time: 'TT被暂停时',
        type: 'radio',
        content: 'TT已被暂停',
        key: 'pauseReminder',
        radioKey: 'pauseReminderMethod',
        checkKey: 'pauseReminderReceiver',
        checkList: [{
            label: '发起人',
            value: 'REPORTER'
        }, {
            label: '处理人',
            value: 'ASSIGNED'
        }, {
            label: '抄送人',
            value: 'CC'
        }]
    },
    {
        title: '工单描述变更提醒',
        time: 'TT描述发生变更',
        type: 'radio',
        content: '变更后的TT描述',
        key: 'descUpdateReminder',
        radioKey: 'descUpdateReminderMethod',
        checkKey: 'descUpdateReminderReceiver',
        checkList: [{
            label: '发起人',
            value: 'REPORTER'
        }, {
            label: '处理人',
            value: 'ASSIGNED'
        }, {
            label: '抄送人',
            value: 'CC'
        }]
    },
];

export const OncallSettingTabs = [{
    value: 'rg_oncall_info',
    label: '值班信息'
}, {
    value: 'rg_oncall_group',
    label: '值班组管理'
}, {
    value: 'rg_oncall_setting',
    label: '班次管理'
}, {
    value: 'rg_oncall_rules',
    label: '值班规则'
}, {
    value: 'rg_oncall_reminder',
    label: '值班提醒'
},
// , {
//     value: 'rg_shift_modification',
//     label: '值班变更管理'
// }
{
    value: 'rg_oncall_export',
    label: '数据导出'
}
];

export const OncallRulesTable = [
    {
        key: 'normal',
        label: '日常值班规则',
        hint: '日常值班规则无需选择起止时间，适用于大多数日常场景',
        modalHint: '日常值班规则无需选择起止时间，新增规则将于明日生效，适用于大多数日常场景',
        modalEditHint: '修改后的值班规则将于明日生效'
    }
    // , {
    //     key: 'special',
    //     label: '特定值班规则',
    //     hint: '特定值班适用于针对节假日的差异化值班配置，其优先级高于日常值班（即当同时段下同时存在日常值班和特定值班，按照特定值班规则执行）',
    //     modalHint: '特定值班适用于针对节假日的差异化值班配置，其优先级高于日常值班',
    //     modalEditHint: '特定值班适用于针对节假日的差异化值班配置，其优先级高于日常值班'
    // }
];
export const OncallCycleTypeMap = [
    {
        label: '按天值班',
        value: 'BY_DAY'
    },
    {
        label: '按天值班（跳过节假日）',
        value: 'BY_DAY_SKIP_HOLIDAY'
    },
    {
        label: '按周值班',
        value: 'BY_WEEK'
    },
    {
        label: '自定义值班',
        value: 'CUSTOM'
    }
];
export const OncallWeekdayList = [
    { label: '周一', value: 2 },
    { label: '周二', value: 3 },
    { label: '周三', value: 4 },
    { label: '周四', value: 5 },
    { label: '周五', value: 6 },
    { label: '周六', value: 7 },
    { label: '周日', value: 1 }
];
export const OncallReminderConfigText = {
    BEFORE_SHIFT_START: '值班开始前',
    AFTER_SHIFT_START: '值班开始后',
    REMIND_ONLINE: '提醒值班人上线',
    REMIND_CHECK_IN: '提醒值班人签到',
    REMIND_LATE: '未完成签到记为迟到，并通知',
    REMIND_ABSENTEEISM: '未完成签到记为旷工，并通知'
};

export const OncallExportTableDesc = {
    DUTY_LOG: '选中时间范围内值班成员值班表',
    WORK_TIME_LOG: '选中时间范围内值班成员每日的实际值班时长',
    DUTY_CHANGE_LOG: '选中时间范围内上下线、请假、换班等记录',
    CHECK_IN_LOG: '选中时间范围内值班成员签到情况'
};

export const OpenAndCloseOptions = [
    {
        label: '开启',
        value: true
    },
    {
        label: '关闭',
        value: false
    }
];
