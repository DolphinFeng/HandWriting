// 为自定义表单挪过来的
import { service } from '../utils';
// 创建ticket
export const createTicket = (params: {
    name: string;
    description?: string;
    ticketType: string;
    categoryName: string;
    categoryId: number;
    typeName: string;
    typeId: number;
    itemName: string;
    itemId: number;
    assigned: string;
    cc?: string[];
    reporter?: string;
    sla: string;
    sourceId?: number;
}) => {
    return service.post('/tt/1.0/ticket', params);
};
// 查询ticket列表
export const getTicketList = (cn: number, sn: number, params?: {
    state?: string;
    sla?: string;
    ticketType?: string;
    createdAtStart?: number;
    createdAtEnd?: number;
    categoryName?: string;
    typeName?: string;
    itemName?: string;
    createdBy?: string;
    assigned?: string;
    rgIds?: number[];
    name?: string;
    ctiNameList?: any;
}) => {
    return service.post(`/tt/1.0/ticket/filter/query?cn=${cn}&sn=${sn}`, params);
};
// 按name查询ticket
export const getTicketByName = (keyword: string, cn?: number, sn?: number) => {
    return service.get(`/tt/1.0/ticket/keyword/query?keyword=${keyword}&cn=${cn}&sn=${sn}`);
};
// 上传附件
export const uploadAttachFiles = (params: any) => {
    return service.post('/tt/1.0/file/upload', params);
};
// 查询ticket详情
export const getTicketDetail = (ticketId: number) => {
    return service.get(`/tt/1.0/ticket/${ticketId}`);
};
// 获取处理记录列表
export const getOptionRecord = (ticketId: number, params: {
    cn: number;
    sn: number;
}) => {
    return service.get(`/tt/1.0/record/${ticketId}`, { params });
};
// 获取评论记录
export const getCommentRecord = (ticketId: number, params: {
    cn: number;
    sn: number;
}) => {
    return service.get(`/tt/1.0/comment/${ticketId}`, { params });
};
// 评论创建
export const pushComment = (params: {
    commentType: string;
    text: string;
    repliedId: number;
    parentId: number;
    repliedMis: string;
    ticketId: number;
    toUsers: string[];
}) => {
    return service.post('/tt/1.0/comment', params);
};
// 评论删除
export const deleteComment = (ticketId: number, commentId: number) => {
    return service.delete(`/tt/1.0/comment/delete/${ticketId}/${commentId}`);
};
// 更新ticket
export const updateTicket = (ticketId: number, params?: {
    sla?: string;
    assigned?: string;
    categoryName?: string;
    categoryId?: number;
    typeName?: string;
    typeId?: number;
    itemName?: string;
    itemId?: number;
    stage?: string;
    resolution?: string;
    closedReason?: string;
    closedDesc?: string;
    pendingReason?: string;
}) => {
    return service.put(`/tt/1.0/ticket/update/${ticketId}`, params);
};
// 附件下载
export const downloadAttachment = (params: {
    fileName: string;
    ticketId: number;
}) => {
    return service.get('/tt/1.0/file/download', { params });
};
// 附件删除
export const deleteAttachment = (attachmentId: number) => {
    return service.delete(`/tt/1.0/file/${attachmentId}/delete`);
};
// 查询我参与的RG
export const getMyRg = (params?: {
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/rg/my', { params });
};
// 设置协助RG 跟 rg的setRgConfig重复了
// export const setRgConfig = (params: {
//     name: string,
//     rgId: number,
//     assistRgs: any
// }) => {
//     return service.post('/tt/1.0/sla/setting/extra', params);
// };
// 设置SLA
export const setSlaConfig = (params: any[]) => {
    return service.post('/tt/1.0/sla/setting', params);
};
// SLA设置查询
export const getSlaConfig = (rgId: number) => {
    return service.get(`/tt/1.0/sla/${rgId}/search`);
};
// 设置sla是否升级
export const setSlaUpgrade = (params: {
    name: string;
    categoryId: number;
    typeId?: number;
    itemId?: number;
    slaUpgrade: Boolean;
}) => {
    return service.post('/tt/1.0/sla/upgrade/setting', params);
};
// 数据统计-按照rg和时间
export const getCountByRg = (params: {
    rgId: number;
    misId: string;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/state/count/by/rg', { params });
};
// 数据统计-按照cti和时间
export const getCountByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/state/count/by/cti', { params });
};
// 目录统计-按照rg和时间（饼图）
export const getGroupByRg = (params: {
    rgId: number;
    misId: string;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/tree/group/by/rg', { params });
};
// 目录统计-按照cti和时间（饼图）
export const getGroupByCti = (params: {
    categoryId: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/tree/group/by/cti', { params });
};
// 类型统计-按照rg和时间（饼图）
export const getGroupTypeByRg = (params: {
    rgId: number;
    misId: string;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/type/group/by/rg', { params });
};
// 类型统计-按照cti和时间（饼图）
export const getGroupTypeByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/type/group/by/cti', { params });
};
// 等级统计-按照rg和时间（饼图）
export const getGroupSlaByRg = (params: {
    rgId: number;
    misId: string;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/sla/group/by/rg', { params });
};
// 等级统计-按照cti和时间（饼图）
export const getGroupSlaByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/sla/group/by/cti', { params });
};
// oncall统计-按照rg和时间（饼图）
export const getGroupOncallByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/oncall/group/by/rg', { params });
};
// 时长统计-按照响应和处理（rg）
export const getSumTimeByRg = (params: {
    rgId: number;
    misId: string;
    dateStartAt: number;
    dateEndAt: number;
    type: 'RESOLVE' | 'RESPONSE';
}) => {
    return service.get('/tt/1.0/statistic/time/sum/by/rg', { params });
};
// 工作时长统计 - rg
export const getWorkTimeByRg = (params: {
    rgId: number;
    misId: string;
    dateStartAt: number;
    dateEndAt: number;
    type: 'RESOLVE' | 'RESPONSE';
}) => {
    return service.get('/tt/1.0/statistic/work/hour/time/sum/by/rg', { params });
};
// 时长统计-按照响应和处理（cti）
export const getSumTimeByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
    type: 'RESOLVE' | 'RESPONSE';
}) => {
    return service.get('/tt/1.0/statistic/time/sum/by/cti', { params });
};
// 工作时长统计 - cti
export const getWorkTimeByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
    type: 'RESOLVE' | 'RESPONSE';
}) => {
    return service.get('/tt/1.0/statistic/work/hour/time/sum/by/cti', { params });
};
// 合格率统计-按照响应和处理（rg）
export const getSumRateByRg = (params: {
    rgId: number;
    misId: string;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rate/sum/by/rg', { params });
};
// 合格率统计-按照响应和处理（cti）
export const getSumRateByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rate/sum/by/cti', { params });
};
// cti已响应时间分布统计
export const getAlreadyReactSpendByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/already/react/spend/distribute', { params });
};
// cti未响应时间分布统计
export const getNotReactSpendByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/not/react/spend/distribute', { params });
};
// cti处理时长分布（已响应）
export const getAlreadyHandleSpendByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/already/handle/spend/distribute', { params });
};
// cti处理时长分布（未处理）
export const getNotHandleSpendByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/not/handle/spend/distribute', { params });
};
// rg已响应时间分布统计
export const getAlreadyReactSpendByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/react/spend/distribute', { params });
};
// rg未响应时间分布统计
export const getNotReactSpendByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/react/spend/distribute', { params });
};
// rg处理时长分布（已处理）
export const getAlreadyHandleSpendByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/handle/spend/distribute', { params });
};
// rg处理时长分布（未处理）
export const getNotHandleSpendByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/handle/spend/distribute', { params });
};
// 满意度统计
export const getScoreByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number;
    misId?: string;
}) => {
    return service.get('/tt/1.0/statistic/score/count/by/rg', { params });
};
// 数据统计-cti重新打开率
export const getReopenByCti = (params: {
    categoryId?: number;
    typeId?: number;
    itemId?: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/time/trend/reopen/rate', { params });
};
// 数据统计-rg重新打开率
export const getReopenByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/time/trend/reopen/rate', { params });
};

// 获取公告内容
export const getAnnouncement = () => {
    return service.get('/tt/1.0/web/notice/content');
};
// 关联coe
export const connectCoe = (params: {
    linkType: string;
    source: number;
    content?: string;
}) => {
    return service.post('/tt/1.0/coe/associate', params);
};
// 关联tt
export const connectTT = (params: any[]) => {
    return service.post('/tt/1.0/ticket/associate', params);
};
// 获取ticket的关联信息
export const getConnectPage = (ticketId: string) => {
    return service.get(`/tt/1.0/associate/search?ticketId=${ticketId}`);
};
// 删除ticket的关联信息
export const deleteConnectPage = (params: {
    linkType: string;
    destination?: number;
    source: number;
}) => {
    return service.delete('/tt/1.0/associate/delete', { params });
};
// 按name搜索ticket
export const searchTicketByName = (name: string) => {
    return service.get(`/tt/1.0/ticket/name/query?name=${name}`);
};
// 获取ticket相关的时间信息
export const getTicketTime = (ticketId: number) => {
    return service.get(`/tt/1.0/ticket/time?ticketId=${ticketId}`);
};
// 获取权限人员
export const getTicketPermission = (ticketId: string) => {
    return service.get(`/tt/1.0/ticket/${ticketId}/permission/users`);
};
// 获取ones参与的项目
export const getOnesProjects = (params: {
    username: string;
    projectName: string;
    cn: number;
    sn: number;
}) => {
    return service.get('/tt/1.0/ones/project/joined', { params });
};
// 获取ones某项目下的成员
export const getProjectUsers = (projectId: number, params: {
    username: string;
    cn: number;
    sn: number;
}) => {
    return service.get(`/tt/1.0/ones/project/${projectId}/member`, { params });
};
// 获取ones某项目下的成员
export const createOnes = (params: {
    ticketId: number;
    projectId: number;
    issueType: string;
    name: string;
    assigned: string;
    cc: string[];
    reporter: string;
    expectClose: number;
    desc: string;
    attachment: any[];
}) => {
    return service.post('/tt/1.0/ones/issue', params);
};
// 获取转后ones的状态
export const getOnesState = (issueId: number, ticketId: number) => {
    return service.get(`/tt/1.0/ones/issue/state?id=${issueId}&ticketId=${ticketId}`);
};
// 获取ticket角色
export const getTicketRole = (ticketId: number, params?: {
    username: string;
}) => {
    return service.get(`/tt/1.0/ticket/${ticketId}/role`, { params });
};
// 同步导出数据
export const downloadExcelSync = (params: {
    state?: string[];
    sla?: string[];
    name?: string;
    ticketType?: string[];
    createdAtStart?: number;
    createdAtEnd?: number;
    createdBy?: string;
    assigned?: string;
    categoryName?: string;
    typeName?: string;
    itemName?: string;
    rgIds?: number[];
    cc?: string[];
}) => {
    return service.post('/tt/1.0/file/sync/download', params);
};
// 异步导出数据
export const downloadExcelAsync = (params: {
    state?: string[];
    sla?: string[];
    name?: string;
    ticketType?: string[];
    createdAtStart?: number;
    createdAtEnd?: number;
    createdBy?: string;
    assigned?: string;
    categoryName?: string;
    typeName?: string;
    itemName?: string;
    rgIds?: number[];
    cc: string[];
}) => {
    return service.post('/tt/1.0/file/async/download', params);
};
// 创建大象群
export const createChatRoom = (ticketId: number, includeCc: Boolean) => {
    return service.post(`/tt/1.0/chat/created/${ticketId}?includeCc=${includeCc}`);
};
// 判断是否存在大象群
export const chatRoomExist = (ticketId: number) => {
    return service.get(`/tt/1.0/chat/already/created?ticketId=${ticketId}`);
};
// 获取大象群聊天记录
export const getChatRecord = (ticketId: number, cn: number, sn: number) => {
    return service.get(`/tt/1.0/chat/record/list?ticketId=${ticketId}&cn=${cn}&sn=${sn}`);
};
// 查询标签
export const searchTicketTags = (params: {
    name: string;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/tt/1.0/label/search', { params });
};
// 添加标签
export const createTicketTags = (params: {
    name: string;
}) => {
    return service.post('/tt/1.0/label/add', params);
};
// 将标签name兑换为id
export const getLabelIdsByNames = (params: {
    labels: string[];
    mode: string;
}) => {
    return service.post('/tt/1.0/label/list/exchange', params);
};
// 工单满意度
export const addTicketScore = (params: {
    ticketId: number;
    score: number;
    suggest: string;
}) => {
    return service.post('/tt/1.0/score/add', params);
};
export const getTicketScore = (ticketId: string) => {
    return service.get(`/tt/1.0/score/find?ticketId=${ticketId}`);
};

// RG对比
// TT数量对比
export const compareNumberByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/state/number/compare', { params });
};
// TT类型对比
export const compareTypeByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/type/number/compare', { params });
};
// TT满意度对比
export const compareScoreByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/score/number/compare', { params });
};
// TT等级对比
export const compareSlaByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/sla/number/compare', { params });
};
// TT重新打开对比
export const compareReopenByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/reopen/number/compare', { params });
};
// TT平均响应时长对比
export const compareResponseByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/response/time/compare', { params });
};
// TT平均解决时长对比
export const compareResolveByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/resolve/time/compare', { params });
};
// TT平均响应合格率对比
export const compareResolveResponseRateByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/resolve/response/rate/compare', { params });
};
// TT响应时长分布（已响应）对比
export const compareAlreadyReactDistributeByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/react/distribute/compare', { params });
};
// TT响应时长分布（未响应）对比
export const compareNotReactDistributeByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/react/distribute/compare', { params });
};
// 处理时长分布（已处理）对比
export const compareAlreadyHandleDistributeByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/handle/distribute/compare', { params });
};
// 处理时长分布（未处理）对比
export const compareNotHandleDistributeByRg = (params: {
    rgIds: number[];
    dateStartAt: number;
    dateEndAt: number;
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/handle/distribute/compare', { params });
};
// 获取流转过的TT
export const getJoinTicketList = (params: {
    mis?: string;
    cn: number;
    sn: number;
}) => {
    return service.get('/tt/1.0/ticket/filter/who/join', { params });
};
// 解散大象群
export const cancelChatRoom = (params: {
    roomId: number;
    ticketId: number;
}) => {
    return service.post('/tt/1.0/chat/room/cancel', params);
};
// 拉新人进群
export const inviteUserToChat = (params: {
    ticketId: number;
    roomId: number;
    userList: string[];
}) => {
    return service.post('/tt/1.0/chat/user/invite', params);
};
// 根据省查询市
export const getCityByProvince = (params: {
    regionId: number;
    type?: number;
}) => {
    return service.get('/tt/1.0/map/province/city/search', { params });
};
// 一键转派千寻(itsm)
export const createItsm = (ticketId: number) => {
    return service.get(`/tt/1.0/itsm/transfer?ticketId=${ticketId}`);
};
export const customFormDownloadMode = (params: {
    customFormId: number;
}) => {
    return service.get('/tt/1.0/custom/form/download/mode', { params });
};
// 非工作时间设置
export const nonWorkingSetting = (params: {
    rgId: number;
    active: boolean;
    stillDealSlaList: string[];
    hint: string;
}) => {
    return service.post('/tt/1.0/rg/nonworking/hour/setting', params);
};
// 获取非工作时间设置
export const getNonWorkingSetting = (params: {
    rgId: number;
}) => {
    return service.get('/tt/1.0/rg/nonworking/hour/setting/and/time/state', { params });
};
// 获取门店店名
export const getPoiInfo = (params: {
    poiType: 'MEITUAN'|'DIANPING';
    shopId: number;
}) => {
    return service.get('/tt/1.0/poi/info', { params });
};
// 设置rg消息预提醒
export const setPreRemind = (rgId, params: {
    rgId: number;
    active: Boolean;
    slaLevel: string;
    slaType: 'RESPONSE'|'RESOLVE';
    timeUnit: 'DAY'|'HOUR'|'MINUTE'|'SECOND';
    timeValue: number;
    remindReceiversType: string;
}[]) => {
    return service.post(`/tt/1.0/ticket/remind/setting?rgId=${rgId}`, params);
};
// 获取预提醒设置
export const getPreRemind = (params: {
    rgId: any;
}) => {
    return service.get('/tt/1.0/ticket/remind', { params });
};
// 获取大象相关配置
export const getDxSetting = (rgId: any) => {
    return service.get(`/tt/1.0/xm/setting/${rgId}`);
};
// 提交大象相关配置
export const setDxSetting = (params: {
    rgId: any;
    external?: boolean;
    inviteCc?: boolean;
    addCc?: boolean;
    welcomeMessage?: boolean;
    assignedUpdate?: boolean;
    ticketReminder?: boolean;
    associateSystemReminder?: boolean;
    satisfyReminder?: boolean;
    reopenReminder?: boolean;
    ticketReminderTime?: number;
    satisfyReminderMethod?: string; // 'OFFICIAL_ACCOUNT' or 'CHATROOM_CARD'
    reopenReminderMethod?: string;
    associateSystemReminderMethod?: string;
    assignedUpdateReminderMethod?: string;
    inviteThirdPartyRobotSwitch?: boolean;
    thirdPartyRobotCtiList?: [{
        robotId: number;
        itemList: number[];
    }];
}) => {
    return service.post('/tt/1.0/xm/setting', params);
};
