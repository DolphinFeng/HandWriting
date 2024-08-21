import { service } from '../utils';
// 添加RG
export const addRg = (params: {
    name: string;
    owner: string;
    description?: string;
    icon: string;
}) => {
    return service.post('/cti/1.0/rg/add', params);
};
// 查询RG
export const getRgList = (params: {
    name?: string;
    active?: boolean;
    id?: number;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/rg/list', { params });
};
// 查询我参与的RG
export const getMyRg = (params?: {
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/rg/my', { params });
};
// 编辑RG
export const editRg = (params: {
    rgId: number;
    owner?: string;
    description?: string;
    name: string;
    icon: string;
}) => {
    return service.put(`/cti/1.0/rg/${params.rgId}`, params);
};
// 删除RG
export const deleteRg = (rgId: number) => {
    return service.delete(`/cti/1.0/rg/${rgId}/del`);
};
// 添加RG下user
export const addRgUser = (params: {
    rgUsers: string[];
    rgId: number;
    // 'MISID'
    type: string;
    role: string;
}) => {
    return service.post('/cti/1.0/rg/user/add', params);
};
// 删除RG下user
export const deleteRgUser = (userId: number) => {
    return service.delete(`/cti/1.0/rg/user/${userId}/del`);
};
// 查询RG下user
export const getRgUser = (params: {
    rgId: number;
    includeOncall?: boolean;
    identify?: string;
    cn?: number;
    sn?: number;
    roles?: string;
}) => {
    type RgUsersResult = CommonTypes.PaginationResponse<CommonTypes.RgUserItem>;
    return service.get<RgUsersResult>('/cti/1.0/rg/user/list', { params });
};
// 修改RG下user
export const updateRgUser = (userId: number, role: string) => {
    return service.put(`/cti/1.0/rg/user/${userId}/update`, { role: role });
};
// 关键词检索用户
export const searchUser = (params: {
    keyword: string;
    includeOffJob?: boolean;
    includeVirtual?: boolean;
    includeExternal?: boolean;
}) => {
    interface UserListResult { items: Array<CommonTypes.userDisplayItem> }
    return service.get<UserListResult>('/cti/1.0/search/user', { params });
};

// 查询rg-oncall下的user
export const getOncallUserList = (params: {
    rgId: number;
    cn?: number;
    sn?: number;
}) => {
    type OncallUsersResult = CommonTypes.PaginationResponse<{
        rgId: number;
        identify: string;
        displayName: string;
        bgName: string;
        isOncall: boolean;
        startDate: string;
        endDate: string;
    }>;
    return service.get<OncallUsersResult>('/cti/1.0/oncall/user/list', { params });
};

/** **** 按组值班 - 相关接口 *******/
// 查询rg-oncall下的小组列表
export const getOncallGroupList = (params: {
    rgId: number;
    cn?: number;
    sn?: number;
}) => {
    interface GroupListResult {
        tn: number;
        cn: number;
        sn: number;
        pn: number;
        items: Array<{
            id: number;
            name: string;
            isOnCall: boolean;
            onCallId: number;
            onCallUserList: Array<{ identify: string; displayName: string}>;
        }>;
    }
    return service.get<GroupListResult>('/cti/1.0/on/call/group/list', { params });
};
// 维护值班组-添加新小组
export const addOncallGroup = (payload: CommonTypes.OnCallGroup) => {
    return service.post('/cti/1.0/on/call/group', payload);
};
// 维护值班组-删除值班小组x
export const deleteOncallGroup = (groupId: number) => {
    return service.delete(`/cti/1.0/on/call/group/${groupId}`);
};
// 维护值班组-修改值班小组x
export const updateOncallGroup = (groupId: number, payload: CommonTypes.OnCallGroupRecord) => {
    return service.put(`/cti/1.0/on/call/group/${groupId}`, payload);
};
// 查询值班组详情
export const getOncallGroupDetail = (groupId: number) => {
    return service.get<CommonTypes.OnCallGroupRecord>(`/cti/1.0/on/call/group/${groupId}`);
};

/**
 * 设置按组一个个周期性地轮替值班 - cyclic means 循环
 * see: https://km.sankuai.com/page/500053333#id-%E5%80%BC%E7%8F%AD%E5%88%86%E7%BB%84%E8%AE%BE%E7%BD%AE%E6%8E%A5%E5%8F%A3
 */
export const setGroupOncallCyclic = (payload: {
    rgId: number;
    groupList: string[];
    onCallRule: { ruleCycle: string; ruleStart: string };
}) => {
    return service.post('/cti/1.0/on/call/group/setting', { ...payload, onCallModeName: 'GROUP_TURN' });
};
/**
 * 设置按固定时间段固定组值班 -
 */
export const setGroupOncallFixedSchedule = (payload: {
    rgId: number;
    weekTimeList: Array<{
        weekDay: string;
        groupTimeList: Array<{ groupId: number; startAt: number; endAt: number}>;
    }>;
    userList: string[];
}) => {
    return service.post('/cti/1.0/on/call/group/time/setting', { ...payload, onCallModeName: 'GROUP_TIME_TURN' });
};

// rg用户添加到oncall组
export const addOncallUser = (params: {
    rgId: number;
    identifys: any;
}) => {
    return service.post('/cti/1.0/oncall/user/add', params);
};

// 从oncall组移除用户
export const moveOncallUser = (params: {
    rgId: number;
    identifys: any;
}) => {
    return service.post('/cti/1.0/oncall/user/move', params);
};

// 设置单个用户的 oncall 状态(上下线)
export const setUserOnlineStatus = (params: {
    rgId: number;
    username: string;
    action?: 'online' | 'offline';
}) => {
    return service.post('/cti/1.0/oncall/user/set', params);
};
// 设置某值班组的 oncall 状态(上下线)
export const setGroupOncallStatus = (params: {
    rgId: number;
    groupId: number;
    action?: 'online' | 'offline';
}) => {
    return service.post('/cti/1.0/on/call/group/set', params);
};
// 查询RG下模板
export const getRgTemplate = (params: {
    rgId: number;
    name?: string;
    cn?: number;
    sn?: number;
    viewType?: string;
}) => {
    return service.get('/cti/1.0/template/search', { params });
};
// 查询RG下所有模板（包括自定义模板和普通模板）
export const getRgTemplateList = (params: {
    rgId: number;
    sn: number;
}) => {
    return service.get(`/cti/1.0/template/list/${params.rgId}`, { params });
};
// 添加RG下模板
export const addRgTemplate = (params: {
    name: string;
    content: string;
    rgId?: number;
}) => {
    return service.post('/cti/1.0/template/add', params);
};
// 更新RG下模板
export const updateRgTemplate = (templateId: Number, params: {
    name: string;
    content: string;
}) => {
    return service.put(`/cti/1.0/template/${templateId}/update`, params);
};
// 删除模板
export const deleteRgTemplate = (templateId: number) => {
    return service.delete(`/cti/1.0/template/${templateId}/delete`);
};
// 根据模板id获取绑定目录列表
export const getCatalogByTemplate = (templateId: number, templateType: string) => {
    return service.get(`/cti/1.0/template/bind/info?templateId=${templateId}&templateType=${templateType}`);
};
// 根据模板id获取模板内容
export const getTemplateById = (templateId: number) => {
    return service.get(`/cti/1.0/template/${templateId}`);
};
// oncall人员排序
export const oncallSort = (params: {
    rgId: number;
    users: string[];
    ruleCycle: string;
}) => {
    return service.post('/cti/1.0/oncall/user/sort', params);
};
// oncall周期设置
export const oncallRule = (params: {
    rgId: number;
    ruleCycle: string;
    ruleStart: string;
}) => {
    return service.post('/cti/1.0/oncall/rule/setting', params);
};
/**
 * 轮值规则细则，总的来说共包含4种方案
 * 1. 按人值班 - 普通模式
 * 2. 按人值班 - 轮值模式
 * 3. 按组值班 - 按天轮值（每天N点）/按周轮值（每周N）
 * 4. 按组值班 - (高级设置) 自行设置时间段值班
 */
export const getOncallRule = (rgId: number) => {
    interface Result {
        mode: 'MULTI_ONLINE' | 'SINGLE_ONLINE' | 'GROUP_TURN' | 'GROUP_TIME_TURN';
        ruleCycle: 'week' | 'day' | 'day_skip';
        ruleStart: string;
    }
    return service.get<Result>(`/cti/1.0/oncall/setting/query?rgId=${rgId}`);
};
/**
 * 当前判断按组值班的配置内容，需要调两个接口获取:
 * 1. 自动轮流值班模式 getGroupOncallSettingCyclic
 * 2. 固定时间段值班模式 getGroupOncallSettingFixed
 */
export const getGroupOncallSettingCyclic = (rgId: number) => {
    return service.get(`/cti/1.0/on/call/group/setting?rgId=${rgId}`);
};
export const getGroupOncallSettingFixed = (rgId: number) => {
    return service.get(`/cti/1.0/on/call/group/time/setting?rgId=${rgId}`);
};
// 获取对rg的权限
export const getRgPermission = (rgId: number) => {
    return service.get(`/cti/1.0/oncall/user/permission?rgId=${rgId}`);
};
// 获取rg的邮件报表设置
export const getRgEmailReportSetting = (rgId: number) => {
    return service.get(`/cti/1.0/report/detail?rgId=${rgId}`);
};
// 设置rg邮件报表
export const setRgReport = (rgId: number, params: {
    sendConfig: boolean;
    sendCycle: string[];
    sendTime: number;
    sendRole: string;
    sendCc: string[];
}) => {
    return service.put(`/cti/1.0/report/${rgId}/change`, params);
};

// 大象群消息通知设置
export const getRecentXmGroupList = () => {
    return service.get<{ items: Array<CommonTypes.XmGroup> }>('/cti/1.0/xm/groups/recent');
};

export const searchXmGroupByKeyword = (keyword: string) => {
    return service.get<{ items: Array<CommonTypes.XmGroup>}>('/cti/1.0/xm/groups/search', { params: { keyword } });
};

// 查询大象群通知设置
export const getRgXmReportSetting = (rgId: number) => {
    return service.get<CommonTypes.RgXmGroupNotifSettingResponse>(`/cti/1.0/report/xm/detail?rgId=${rgId}`);
};

// 提交大象群通知设置
export const saveRgXmReportSetting = (payload: CommonTypes.RgXmGroupNotifSettingDef) => {
    return service.put('/cti/1.0/report/xm/edit', payload);
};

// 保存rg的默认设置
export const sendRgSetting = (params: {
    rgId?: number;
    auth?: string;
    users?: string[];
    mailAddress?: string;
    mailSwitch?: 'on'|'off';
    reopenAssignToOnCallSwitch?: 'on'|'off';
    adminOnly?: boolean;
    customStatusSwitch?: 'on'|'off';
    siteCodeSwitch?: 'on'|'off';
}) => {
    return service.post('/cti/1.0/rg/setting/add', params);
};
// 查询rg的默认设置
export const getRgSetting = (rgId: number) => {
    return service.get(`/cti/1.0/rg/setting/get?rgId=${rgId}`);
};
// 查询RG组目录权限配置
export const getRgCtiPermission = (rgId: number) => {
    return service.get(`/cti/1.0/rg/item/permission/setting/${rgId}`);
};
// 修改RG组目录权限配置
export const editRgCtiPermission = (rgId: number, params: {
    rgId: number;
    authActive: boolean;
    authOrgInfoList?: string[];
}) => {
    return service.post(`/cti/1.0/rg/item/permission/setting/${rgId}`, params);
};
// 保存rg详情页面设置
export const sendDetailEditAuth = (params: {
    rgId?: number;
    type?: string;
    value?: 'ALL' | 'RG_AND_CC' | 'RG' | 'NONE';
}) => {
    return service.post('/cti/1.0/rg/ticket/setting/update', params);
};
// 查询rg详情页面设置
export const getDetailEditAuth = (rgId: number) => {
    return service.get(`/cti/1.0/rg/ticket/setting/permission?rgId=${rgId}`);
};
// 根据item获取当前用户是否是 rg 管理员
export const getRgRole = (rgId: number) => {
    return service.get(`/cti/1.0/rg/${rgId}/user/detail`);
};
// 查询rg下oncall user
export const getOncallUser = (params: {
    rgId: number;
}) => {
    return service.get('/cti/1.0/oncall/user/detail', { params });
};
// 多人值班设置
export const multiModeSetting = (params: {
    rgId: number;
    mode: 'SINGLE_TURN' | 'MULTI_ONLINE';
    users: any;
}) => {
    return service.post('/cti/1.0/on/call/multi/mode/setting', params);
};
// 单人值班设置
export const singleModeSetting = (params: {
    mode: 'SINGLE_TURN' | 'MULTI_ONLINE';
    rule: {
        rgId: number;
        ruleCycle: string;
        ruleStart: string;
    };
}) => {
    return service.post('/cti/1.0/on/call/single/mode/setting', params);
};
// 查询操作记录
export const getRgHistory = (params: {
    rgId: number;
    sourceType?: string;
    actor?: string;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/rg/change/history/search', { params });
};
// 获取租户权限
export const getTenantAgent = (rgId: number) => {
    return service.get(`/cti/1.0/rg/tenant/get?rgId=${rgId}`);
};
// 租户权限设置
export const tenantModify = (params: {
    rgId: number;
    tenant: string;
    action: 'ADD' | 'DELETE';
}[]) => {
    return service.post('/cti/1.0/rg/tenant/modify', params);
};
// 工作日值班信息获取
export const getHolidayOncalSetting = (rgId: number) => {
    return service.get(`/tt/1.0/sla/work/holiday/on/call/hour/${rgId}`);
};
// 节假日值班信息保存
export const setHolidayOncall = (params: {
    rgId: number;
    workHours?: number[][];
    workDaysOfWeek?: number[];
    holidayOnCallHours?: any;
    workHoursMap: any;
}) => {
    return service.post('/tt/1.0/sla/work/holiday/on/call/hour/setting', params);
};
// 节假日值班设置获取
export const getHolidaySetting = (params: {
    rgId: number;
    year: number;
}) => {
    return service.get('/tt/1.0/sla/holiday/on/call/hour/setting', { params });
};
// 节假日值班设置修改
export const updateHolidaySetting = (params: {
    rgId: number;
    year: number;
    holidayBO: {
        name: string;
        workTime: string[];
        holidayTypeEnum: string;
        id?: number;
        dateList?: number[];
    };
}) => {
    return service.post('/tt/1.0/sla/holiday/on/call/hour/setting', params);
};
// 节假日值班设置删除
export const deleteHolidaySetting = (id: number) => {
    return service.delete(`/tt/1.0/sla/holiday/on/call/hour/setting/${id}`);
};
// 设置sla是否升级
export const setSlaUpgrade = (params: {
    name: string;
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    slaUpgrade: Boolean;
    rgId?: number;
}) => {
    return service.post('/tt/1.0/sla/upgrade/setting', params);
};
// 设置SLA
export const setSlaConfig = (params: any[]) => {
    return service.post('/tt/1.0/sla/setting', params);
};
// SLA设置查询
export const getSlaConfig = (rgId: number) => {
    return service.get(`/tt/1.0/sla/${rgId}/search`);
};
// 设置SLA公共设置（等级变更是否必填原因）
export const setSlaSharedSetting = (params: {
    rgId: number;
    upgradeReasonRequire: boolean;
}) => {
    return service.post('/tt/1.0/sla/setting/shared', params);
};
// 设置协助RG
export const setRgConfig = (params: {
    name: string;
    rgId: number;
    assistRgs?: any;
    slaUpgrade?: boolean;
    displayWhenLauch?: boolean;
    description?: string;
}) => {
    return service.post('/tt/1.0/sla/setting/extra', params);
};
// 查询RG下定制表单列表
export const getRgCustomTemplate = (params: {
    cn?: number;
    sn?: number;
    rgId: number;
}) => {
    return service.get('/tt/1.0/rg/custom/form/list', { params });
};
// 创建 & 更新 定制表单
export const addRgCustomTemplate = (params: {
    id?: number;
    name?: string;
    type: string;
    rgId: number;
    permission?: string;
    customFieldContents: CommonTypes.customField[];
    instruction?: string;
}) => {
    return service.post('/tt/1.0/rg/custom/form', params);
};
// 删除定制表单
export const deleteRgCustomTemplate = (templateId: number) => {
    return service.delete(`/tt/1.0/rg/custom/form/${templateId}`);
};
// 获取系统字段配置
export const getSystemFields = (rgId: number) => {
    return service.get(`/tt/1.0/system/all/fields?rgId=${rgId}`);
};
// 获取表单详情
export const getCustomFormDetail = (id: number, getParent: boolean = false) => {
    return service.get(`/tt/1.0/rg/custom/form/${id}?getParent=${getParent}`);
};
// 设置定制表单（权限）
export const updateRgCustomTemplate = (params: {
    rgId: number;
    id: number;
    permissionOrgs: CommonTypes.OrgVO[];
}) => {
    return service.post('/tt/1.0/rg/custom/form/update', params);
};
// 获取rg绑定cti列表（平铺）
export const getCtiByRgUnfold = (params: {
    rgId: number;
    cn: number;
    sn: number;
}) => {
    return service.get(`/cti/1.0/rg/${params.rgId}/item/info/unfold?cn=${params.cn}&sn=${params.sn}`);
};

// 公告&常见问题接口

// 公告 Bulletin
type BulletinRelationType = 'HELPDESK' | 'MOSES';

export const getBulletin = (params: {
    rgId: number;
    enable?: boolean;
    relationType?: BulletinRelationType;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/rg/bulletin', { params });
};

export const getHelpdeskBulletin = (params: { rgId: number; enable?: boolean; cn?: number; sn?: number }) => {
    return getBulletin({ ...params, relationType: 'HELPDESK' });
};

export const getMosesBulletins = (params: { rgId: number; enable?: boolean; cn?: number; sn?: number }) => {
    return getBulletin({ ...params, relationType: 'MOSES' });
};

export const addBulletin = (params: {
    rgId: number;
    relationType?: BulletinRelationType;
    content: string;
}) => {
    return service.post('/cti/1.0/rg/bulletin', params);
};

export const addHelpdeskBulletin = (params: { rgId: number; content: string }) => {
    return addBulletin({ ...params, relationType: 'HELPDESK' });
};

export const addMosesBulletin = (params: { rgId: number; content: string }) => {
    return addBulletin({ ...params, relationType: 'MOSES' });
};

export const updateBulletin = (params: {
    id: number;
    rgId: number;
    content: string;
    enable?: boolean;
}) => {
    return service.put('/cti/1.0/rg/bulletin', params);
};

export const deleteBulletin = (bulletinId: number) => {
    return service.delete(`/cti/1.0/rg/bulletin/delete/${bulletinId}`);
};

// 常见问题接口

type FaqRelationType = 'HELPDESK' | 'MOSES';

type Faq = CommonTypes.Faq;

export const getFaq = (params: {
    rgId: number;
    title?: string;
    enable?: boolean;
    cn?: number;
    sn?: number;
    relationType?: BulletinRelationType;
}) => {
    type Result = CommonTypes.PaginationResponse<Faq>;
    return service.get<Result>('/cti/1.0/rg/faq', { params });
};

export const getHelpdeskFaqs = (params: { rgId: number; enable?: boolean; cn?: number; sn?: number }) => {
    return getFaq({ ...params, relationType: 'HELPDESK' });
};

export const getMosesFaqs = (params: { rgId: number; enable?: boolean; cn?: number; sn?: number }) => {
    return getFaq({ ...params, relationType: 'MOSES' });
};

export const addFaq = (params: {
    rgId: number;
    content: string;
    title: string;
    relationType?: FaqRelationType;
}) => {
    return service.post('/cti/1.0/rg/faq', params);
};

export const addHelpdeskFaq = (params: { rgId: number; title: string; content: string }) => {
    return addFaq({ ...params, relationType: 'HELPDESK' });
};

export const addMosesFaq = (params: { rgId: number; title: string; content: string }) => {
    return addFaq({ ...params, relationType: 'MOSES' });
};

export const updateFaq = (params: {
    id: number;
    rgId: number;
    content: string;
    title: string;
    enable?: boolean;
}) => {
    return service.put('/cti/1.0/rg/faq', params);
};

export const deleteFaq = (faqId: number) => {
    return service.delete(`/cti/1.0/rg/faq/delete/${faqId}`);
};

// 设置标签编辑权限
export const setLabelPermission = (params: {
    rgId: number;
    labelRequired?: boolean;
    labelSwitch?: boolean;
}) => {
    return service.put('/cti/1.0/rg/label/setting', params);
};
// 获取标签编辑权限
export const getLabelPermission = (params: {
    rgId: number;
}) => {
    return service.get('/cti/1.0/rg/label/setting', { params });
};
// 字段设置
// 添加字段
export const addReplyField = (params: {
    rgId: number;
    content: string;
    type: string;
}) => {
    return service.post('/cti/1.0/rg/display/field', params);
};
// 编辑字段
export const editReplyField = (params: {
    id: number;
    content: string;
    type: string;
    rgId: number;
}) => {
    return service.put('/cti/1.0/rg/display/field', params);
};
// 删除字段
export const deleteReplyField = (id: number, params: {
    rgId: number;
}) => {
    return service.delete(`/cti/1.0/rg/display/field/${id}`, { params });
};
// 字段拖拽
export const sortFields = (params: {
    orderIds: string[];
    rgId: number;
    type: string;
}) => {
    return service.put('/cti/1.0/rg/config/sort', params);
};
// 获取展示字段
export const getRgReplyField = (params: {
    rgId: number;
    type: string;
}) => {
    return service.get('/cti/1.0/rg/display/field', { params });
};
// 常用回复
// 添加常用回复
export const addReplyText = (params: {
    rgId: number;
    content: string;
    type: string;
}) => {
    return service.post('/cti/1.0/rg/quick/reply', params);
};
// 编辑字段
export const editReplyText = (params: {
    id: number;
    content: string;
    type: string;
    rgId: number;
}) => {
    return service.put('/cti/1.0/rg/quick/reply', params);
};
// 删除字段
export const deleteReplyText = (id: number, params: {
    rgId: number;
}) => {
    return service.delete(`/cti/1.0/rg/quick/reply/${id}`, { params });
};
// 查询常用回复
export const getRgReplyText = (params: {
    rgId: number;
    type: string;
}) => {
    return service.get('/cti/1.0/rg/quick/reply', { params });
};

interface NoticeListResult {
    items: Array<CommonTypes.SlaRaiseNotice>;
}

// sla 升级通知相关设置
export const getSlaRaiseNoticeSetting = (params: { rgId: number }) => {
    return service.get<NoticeListResult>('/tt/1.0/sla/upgrade/notice/setting', { params });
};

export const setSlaRaiseNotices = (params: { rgId: number; payload: Array<CommonTypes.SlaRaiseNotice> }) => {
    return service.post<NoticeListResult>(`/tt/1.0/sla/upgrade/notice/setting?rgId=${params.rgId}`, params.payload);
};

// 摩西机器人相关设置
interface MosesSetting {
    rgId: number;
    active: boolean;
    mosesId: string;
    // FIXME: content 字段没用
    content: string;
    resolutionKnowledgeBaseSwitch?: boolean;
}
// 知识库摩西相关设置
interface BrainpowerMoses {
    isActive: boolean;
    mosesId: string;
}

// 获取摩西机器人绑定设置
export const getMosesSetting = (rgId: number) => {
    return service.get<MosesSetting>(`/cti/1.0/rg/moses/${rgId}`);
};

// 设置摩西机器人详细配置
export const updateMosesSetting = (params: MosesSetting) => {
    return service.put<MosesSetting>('/cti/1.0/rg/moses/update', params);
};

// 新增绑定机器人设置
export const addMosesSetting = (params: MosesSetting) => {
    return service.post<any>('/cti/1.0/rg/moses/add', params);
};

// RG摩西机器人设置
export const theMosesSetting = (params: MosesSetting) => {
    return service.post<any>('/cti/1.0/rg/moses/setting', params);
};
// 获取摩西机器人绑定设置
export const getBrainpowerMoses = (rgId: number) => {
    return service.get<BrainpowerMoses>(`/cti/1.0/rg/processing/knowledge/base?rgId=${rgId}`);
};
// 设置摩西机器人详细配置
export const updateBrainpowerMoses = (params: BrainpowerMoses) => {
    return service.post<BrainpowerMoses>('/cti/1.0/rg/processing/knowledge/base', params);
};
// 添加 RG 下的组织架构
export const orgAdd = (params: {
    rgId: number;
    orgIds: string[];
    role: string;
}) => {
    return service.post('/cti/1.0/rg/org/add', params);
};
// 删除 RG 下的组织架构
export const deleteRgOrg = (params: {
    rgId: number;
    orgIds: string[];
}) => {
    return service.delete('/cti/1.0/rg/org/delete', { data: params });
};
// 获取 RG 关联的组织架构列表
export const getRgOrg = (params: {
    rgId: number;
    role: string;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/rg/org/list', { params });
};
// 更新 RG 组织架构的信息
export const updateRgOrg = (rgId: number, orgId: string, params: {
    role: string;
}) => {
    return service.put(`/cti/1.0/rg/org/update?rgId=${rgId}&orgId=${orgId}`, params);
};

// 查询大象群成员组
export const getXmGroupList = (params: {
    rgId: number;
    cn: number;
    sn: number;
}) => {
    return service.get('/cti/1.0/rg/xm/group', { params });
};
// 添加大象群成员组
export const setXmGroup = (params: {
    groupId: number;
    groupName: string;
    members: string[];
    rgId: number;
    description: string;
}
) => {
    return service.post('/cti/1.0/rg/xm/group', params);
};
// 删除大象群成员组
export const deleteXmGroup = (params: {
    groupId: number;
    rgId: number;
}) => {
    return service.delete('/cti/1.0/rg/xm/group', { params });
};

// 获取大象群组事件监听配置列表
export const getDxGroupListener = (rgId: number) => {
    return service.get(`/cti/1.0/rg/group/listener/list?rgId=${rgId}`);
};
// 更新大象群组事件监听配置
export const updateDxGroupListener = (params: {
    id?: number;
    dxGroupId?: number;
    keywords?: string[];
    listenerRangeType?: string; // single/单条 multiPre/前序多条
    enableGroupReply?: boolean;
    groupReplyContent?: string;
    settingStatus?: number;
    relatedItemId?: number;
    rgId?: number;
    features: {
        multiPre: string;
    };
}) => {
    return service.post('/cti/1.0/rg/group/listener/update', params);
};
// 创建大象群组事件监听配置
export const createDxGroupListener = (params: {
    dxGroupId?: number;
    keywords?: string[];
    listenerRangeType?: string; // single/单条 multiPre/前序多条
    enableGroupReply?: boolean;
    groupReplyContent?: string;
    settingStatus?: number;
    relatedItemId: number;
    rgId: number;
    features: {
        multiPre: string;
    };
}) => {
    return service.post('/cti/1.0/rg/group/listener/create', params);
};
// 删除大象群组事件监听配置
export const deleteDxGroupListener = (id: number) => {
    return service.delete(`/cti/1.0/rg/group/listener/delete/${id}`);
};
