import { service } from '../utils';
// 创建ticket
export const createTicket = (params: {
    name: string,
    description?: string,
    ticketType: string,
    categoryName: string,
    categoryId: number,
    typeName: string,
    typeId: number,
    itemName: string,
    itemId: number,
    assigned: string,
    cc?: string[],
    reporter?: string,
    sla: string,
    sourceId?: number,
    appointAssigned?: boolean
}) => {
    return service.post('/tt/1.0/ticket', params);
};
// 根据模版创建ticket
export const createTicketByTemplate = (params: {
    ticket: {
        name: string,
        description?: string,
        ticketType: string,
        categoryName: string,
        categoryId: number,
        typeName: string,
        typeId: number,
        itemName: string,
        itemId: number,
        assigned: string,
        cc?: string[],
        reporter?: string,
        sla: string,
        sourceId?: number
    },
    customFieldValueList: any[]
}) => {
    return service.post('/tt/1.0/ticket/custom/form/create', params);
};
// 查询ticket列表
export const getTicketList = (cn: number, sn: number, params?: {
    state?: string[],
    sla?: string,
    ticketType?: string,
    createdAtStart?: number,
    createdAtEnd?: number,
    categoryName?: string,
    typeName?: string,
    itemName?: string,
    createdBy?: string,
    assigned?: string[],
    rgIds?: number[],
    spaceId?: number[],
    name?: string,
    ctiNameList?: any,
    labelsRelation?: number,
    newMessageSwitch?: boolean
}, field?: string, order?: 'ASC' | 'DESC') => {
    return service.post(`/tt/1.0/ticket/filter/query?cn=${cn}&sn=${sn}&orderField=${field || ''}&orderKind=${order || ''}`, params);
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
    cn: number,
    sn: number
}) => {
    return service.get(`/tt/1.0/history/${ticketId}`, { params });
};
export const getMosesRecord = (ticketId: number, params: {
    cn: number,
    sn: number
}) => {
    return service.get(`/tt/1.0/moses/dialog/history/${ticketId}`, { params });
};
// 获取评论记录
export const getCommentRecord = (ticketId: number, params: {
    cn: number,
    sn: number
}) => {
    return service.get(`/tt/1.0/comment/${ticketId}`, { params });
};
// 评论创建
export const pushComment = (params: {
    commentType: string,
    text: string,
    repliedId: number,
    parentId: number,
    repliedMis: string,
    ticketId: number,
    toUsers: string[]
}) => {
    return service.post(`/tt/1.0/comment`, params);
};
// 评论删除
export const deleteComment = (ticketId: number, commentId: number) => {
    return service.delete(`/tt/1.0/comment/delete/${ticketId}/${commentId}`);
};
// 更新ticket
export const updateTicket = (ticketId: number, params?: {
    sla?: string,
    slaChangeReason?: string,
    assigned?: string,
    categoryName?: string,
    categoryId?: number,
    typeName?: string,
    typeId?: number,
    itemName?: string,
    itemId?: number,
    stage?: string,
    resolution?: string,
    state?: string,
    reopenReason?: string,
    closedReason?: string,
    closedDesc?: string,
    pendingReason?: string,
    appointAssigned?: boolean,
    transferReason?: string,
    notInScope?: boolean, // 点击“不在处理范围”按钮时传TRUE
    notInScopeWithFurtherInfo?: boolean, // 通过不在处理范围弹框流转时传TRUE
    customStatusId: string // 自定义状态
    customStatusDisplayName: string // 自定义状态名称
}) => {
    return service.put(`/tt/1.0/ticket/update/${ticketId}`, params);
};
// 更新ticket
export const updateCustomTicket = (ticketId: number, params?: {
    ticketUpdate?: {
        sla?: string,
        assigned?: string,
        categoryName?: string,
        categoryId?: number,
        typeName?: string,
        typeId?: number,
        itemName?: string,
        itemId?: number,
        stage?: string,
        resolution?: string,
        closedReason?: string,
        closedDesc?: string,
        pendingReason?: string
    },
    customFieldValueList: any[]
}) => {
    return service.post(`/tt/1.0/ticket/custom/form/update/${ticketId}`, params);
};
// 批量更新工单
export const updateBatchTicket = (params: {
    ticketUpdate: {
        assigned: string,
        appointAssigned?: boolean
    },
    ticketFilter: {
        state?: string[],
        assigned?: string[],
        rgIds?: number[]
    }
}) => {
    return service.post(`/tt/1.0/ticket/batch/update`, params);
};
// 附件下载
export const downloadAttachment = (params: {
    fileName: string,
    ticketId: number
}) => {
    return service.get('/tt/1.0/file/download', { params });
};
// 附件删除
export const deleteAttachment = (attachmentId: number) => {
    return service.delete(`/tt/1.0/file/${attachmentId}/delete`);
};
// 查询我参与的RG
export const getMyRg = (params?: {
    cn?: number,
    sn?: number
}) => {
    return service.get('/cti/1.0/rg/my', { params });
};
// 设置协助RG
export const setRgConfig = (params: {
    name: string,
    rgId: number,
    assistRgs: any
}) => {
    return service.post('/tt/1.0/assist/rg/setting', params);
};
// 设置SLA
export const setSlaConfig = (params: any[]) => {
    return service.post('/tt/1.0/sla/setting', params);
};
// SLA设置查询
export const getSlaConfig = (rgId: number) => {
    return service.get(`/tt/1.0/sla/${rgId}/search`);
};
// 工单详情页查询SLA
export const getSlaConfigGlobal = (rgId: number) => {
    return service.get(`/tt/1.0/sla/${rgId}/search/global`);
};
// 设置sla是否升级
export const setSlaUpgrade = (params: {
    name: string,
    categoryId: number,
    typeId?: number,
    itemId?: number,
    slaUpgrade: Boolean
}) => {
    return service.post('/tt/1.0/sla/upgrade/setting', params);
};
// 数据统计-按照rg和时间
export const getCountByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/state/count/by/rg', { params });
};
// 数据统计-按照cti和时间
export const getCountByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/state/count/by/cti', { params });
};
// 发起方统计-按照rg和时间（饼图）
export const getInitiatorGroupByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/bg/group/by/rg', { params });
};
// 发起方统计-按照rg和时间（饼图）
export const getInitiatorGroupByCti = (params: {
    categoryId?: number | string,
    typeId?: number | string,
    itemId?: number | string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/bg/group/by/cti', { params });
};
// 目录统计-按照rg和时间（饼图）
export const getGroupByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/tree/group/by/rg', { params });
};
// 目录统计-按照cti和时间（饼图）
export const getGroupByCti = (params: {
    categoryId: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/tree/group/by/cti', { params });
};
// 类型统计-按照rg和时间（饼图）
export const getGroupTypeByRg = (params: {
    rgId: number,
    misId?: string
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/type/group/by/rg', { params });
};
// 类型统计-按照cti和时间（饼图）
export const getGroupTypeByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/type/group/by/cti', { params });
};
// 等级统计-按照rg和时间（饼图）
export const getGroupSlaByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/sla/group/by/rg', { params });
};
// 等级统计-按照cti和时间（饼图）
export const getGroupSlaByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/sla/group/by/cti', { params });
};
// oncall统计-按照rg和时间（饼图）
export const getGroupOncallByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/oncall/group/by/rg', { params });
};
// @deprecated 时长统计-按照响应和处理（rg）
export const getSumTimeByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number,
    type: 'RESOLVE' | 'RESPONSE'
}) => {
    return service.get('/tt/1.0/statistic/time/sum/by/rg', { params });
};
// 工作时间 “响应时长” 或 “解决时长” 统计 - 按 rg
export const getWorkTimeByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number,
    type: 'RESOLVE' | 'RESPONSE'
}) => {
    return service.get('/tt/1.0/statistic/work/hour/time/sum/by/rg', { params });
};
// @deprecated 响应时长/处理时长统计-按 cti
export const getSumTimeByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number,
    type: 'RESOLVE' | 'RESPONSE'
}) => {
    return service.get('/tt/1.0/statistic/time/sum/by/cti', { params });
};
// 工作时间响应时长/处理时长统计 - cti
export const getWorkTimeByCti = (params: {
    categoryId?: number | string,
    typeId?: number | string,
    itemId?: number | string,
    dateStartAt: number,
    dateEndAt: number,
    type: 'RESOLVE' | 'RESPONSE'
}) => {
    return service.get('/tt/1.0/statistic/work/hour/time/sum/by/cti', { params });
};
// 响应时长/处理时长 合格率统计-按照响应和处理（rg）
export const getSumRateByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rate/sum/by/rg', { params });
};
// 响应时长/处理时长 合格率统计-按照响应和处理（cti）
export const getSumRateByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rate/sum/by/cti', { params });
};

// 已响应且已超时工单数统计(by RG)，展示每天的数量
export const getRespondedAndTimeoutListByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/finished/sum/by/rg`, {
        params: { ...params, type: 'RESPONSE' }
    });
};

// 未响应且已超时工单数统计(by RG)，展示每天的数量
export const getUnrespondedAndTimeoutListByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/unfinished/sum/by/rg`, {
        params: { ...params, type: 'RESPONSE' }
    });
};

// 已处理且已超时工单数统计(by RG)，展示每天的数量
export const getResolvedAndTimeoutListByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/finished/sum/by/rg`, {
        params: { ...params, type: 'RESOLVE' }
    });
};

// 未处理且已超时工单数统计(by RG)，展示每天的数量
export const getUnresolvedAndTimeoutListByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/unfinished/sum/by/rg`, {
        params: { ...params, type: 'RESOLVE' }
    });
};

// 已响应且已超时工单数统计(by CTI)，展示每天的数量
export const getRespondedAndTimeoutListByCti = (params: {
    categoryId: number | string,
    typeId: number | string,
    itemId: number | string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/finished/sum/by/cti`, {
        params: {
            ...params,
            type: 'RESPONSE'
        }
    });
};

// 未响应且已超时工单数统计(by CTI)，展示每天的数量
export const getUnrespondedAndTimeoutListByCti = (params: {
    categoryId: number | string,
    typeId: number | string,
    itemId: number | string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/unfinished/sum/by/cti`, {
        params: { ...params, type: 'RESPONSE' }
    });
};

// 已处理且已超时工单数统计(by CTI)，展示每天的数量
export const getResolvedAndTimeoutListByCti = (params: {
    categoryId: number | string,
    typeId: number | string,
    itemId: number | string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/finished/sum/by/cti`, {
        params: { ...params, type: 'RESOLVE' }
    });
};

// 未处理且已超时工单数统计(by CTI)，展示每天的数量
export const getUnresolvedAndTimeoutListByCti = (params: {
    categoryId: number | string,
    typeId: number | string,
    itemId: number | string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get(`/tt/1.0/statistic/work/hour/timeout/unfinished/sum/by/cti`, {
        params: { ...params, type: 'RESOLVE' }
    });
};

// cti已响应时间分布统计
export const getAlreadyReactSpendByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/already/react/spend/distribute', { params });
};
// cti未响应时间分布统计
export const getNotReactSpendByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/not/react/spend/distribute', { params });
};
// cti处理时长分布（已响应）
export const getAlreadyHandleSpendByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/already/handle/spend/distribute', { params });
};
// cti处理时长分布（未处理）
export const getNotHandleSpendByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/not/handle/spend/distribute', { params });
};
// rg已响应时间分布统计
export const getAlreadyReactSpendByRg = (params: {
    rgId: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/react/spend/distribute', { params });
};
// rg未响应时间分布统计
export const getNotReactSpendByRg = (params: {
    rgId: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/react/spend/distribute', { params });
};
// rg处理时长分布（已处理）
export const getAlreadyHandleSpendByRg = (params: {
    rgId: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/handle/spend/distribute', { params });
};
// rg处理时长分布（未处理）
export const getNotHandleSpendByRg = (params: {
    rgId: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/handle/spend/distribute', { params });
};
// 满意度统计（老）
export const getScoreByRg = (params: {
    rgId: number,
    dateStartAt: number,
    dateEndAt: number,
    misId?: string
}) => {
    return service.get('/tt/1.0/statistic/score/count/by/rg', { params });
};
// 满意度统计（新）
export const getSatifiedByRg = (params: {
    rgId: number,
    dateStartAt: number,
    dateEndAt: number,
    misId?: string
}) => {
    return service.get('/tt/1.0/statistic/rate/count/by/rg', { params });
};
export const getGroupTagByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/label/distribute', { params });
};
// 数据统计-cti重新打开率
export const getReopenByCti = (params: {
    categoryId?: number,
    typeId?: number,
    itemId?: number,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/cti/tt/time/trend/reopen/rate', { params });
};
// 数据统计-rg重新打开率
export const getReopenByRg = (params: {
    rgId: number,
    misId?: string,
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/time/trend/reopen/rate', { params });
};

// 获取公告内容
export const getAnnouncement = () => {
    return service.get('/tt/1.0/web/notice/content');
};
// 创建coe
export const createCoe = (ticketId: number) => {
    return service.post(`/tt/1.0/coe/associate/create?ticketId=${ticketId}`);
};
// 关联coe
export const connectCoe = (params: {
    linkType: string,
    content: string,
    source: number
}) => {
    return service.post('/tt/1.0/coe/associate', params);
};
// 关联tt
export const connectTT = (params: any[]) => {
    return service.post('/tt/1.0/ticket/associate', params);
};
// 获取ticket的关联信息
export const getConnectPage = (ticketId: number) => {
    return service.get(`/tt/1.0/associate/search?ticketId=${ticketId}`);
};
// 获取ticket的关联COE信息
export const getConnectCoe = (ticketId: number) => {
    return service.get(`/tt/1.0/associate/search/coe?ticketId=${ticketId}`);
};
// 删除ticket的关联信息
export const deleteConnectPage = (params: {
    linkType: string,
    destination?: number,
    source: number
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
    username: string,
    projectName: string,
    projectId?: number,
    cn: number,
    sn: number
}) => {
    return service.get(`/tt/1.0/ones/project/joined`, { params });
};
// 根据标题搜索ones
export const searchOnesIssue = (params: {
    projectId: number,
    keyword: string,
    issueType: string,
    cn?: number,
    sn?: number
}) => {
    return service.get(`/tt/1.0/ones/issue/keyword/query`, { params });
};
// 获取ones某项目下的成员
export const getProjectUsers = (projectId: number, params: {
    username: string,
    cn: number,
    sn: number
}) => {
    return service.get(`/tt/1.0/ones/project/${projectId}/member`, { params });
};
// 获取ones某项目下的成员
export const createOnes = (params: {
    ticketId: number,
    projectId: number,
    issueType: string,
    name: string,
    assigned: string,
    cc: string[],
    reporter: string,
    expectClose: number,
    desc: string,
    attachment: any[]
}) => {
    return service.post(`/tt/1.0/ones/issue`, params);
};
// 绑定已有ones
export const bindOnes = (id: number, params: {
    ticketId: number,
    projectId: number,
    issueType: string,
    expectClose?: number,
    cc: string[],
    desc: string,
    attachment: any[],
    reporter: string
}) => {
    return service.put(`/tt/1.0/ones/issue/${id}`, params);
};
// 获取转后ones的状态
export const getOnesState = (issueId: number, ticketId: number) => {
    return service.get(`/tt/1.0/ones/issue/state?id=${issueId}&ticketId=${ticketId}`);
};
// 获取ones工作项详情
export const getOnesItemDetail = (issueId: number) => {
    return service.get(`/tt/1.0/ones/issue/${issueId}`);
};
// 获取ticket角色
export const getTicketRole = (ticketId: number, params?: {
    username: string
}) => {
    return service.get(`/tt/1.0/ticket/${ticketId}/role`, { params });
};
// 同步导出数据
export const downloadExcelSync = (params: {
    state?: string[],
    sla?: string[],
    name?: string,
    ticketType?: string[],
    createdAtStart?: number,
    createdAtEnd?: number,
    createdBy?: string,
    assigned?: string,
    categoryName?: string,
    typeName?: string,
    itemName?: string,
    rgIds?: number[],
    cc?: string[],
    spaceIds?: number[]
}) => {
    return service.post('/tt/1.0/file/sync/download', params);
};
// 异步导出数据
export const downloadExcelAsync = (params: {
    state?: string[],
    sla?: string[],
    name?: string,
    ticketType?: string[],
    createdAtStart?: number,
    createdAtEnd?: number,
    createdBy?: string,
    assigned?: string,
    categoryName?: string,
    typeName?: string,
    itemName?: string,
    rgIds?: number[],
    cc?: string[]
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
    name: string,
    cn?: number,
    sn?: number
}) => {
    return service.get(`/tt/1.0/label/search`, { params });
};
// 添加标签
export const createTicketTags = (params: {
    name: string
}) => {
    return service.post('/tt/1.0/label/add', params);
};
// 将标签name兑换为id
export const getLabelIdsByNames = (params: {
    labels: string[],
    mode: string
}) => {
    return service.post(`/tt/1.0/label/list/exchange`, params);
};
// 工单满意度
export const addTicketScore = (params: {
    ticketId: number,
    satisfy: string,
    suggest: string,
    reasons: string[],
    resolution: string
}) => {
    return service.post('/tt/1.0/score/add', params);
};
export const getTicketScore = (ticketId: string) => {
    return service.get(`/tt/1.0/score/find?ticketId=${ticketId}`);
};

// RG对比
// TT数量对比
export const compareNumberByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/state/number/compare', { params });
};
// TT类型对比
export const compareTypeByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/type/number/compare', { params });
};
// TT满意度对比
export const compareScoreByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/score/number/compare', { params });
};
// TT等级对比
export const compareSlaByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/sla/number/compare', { params });
};
// TT重新打开对比
export const compareReopenByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/reopen/number/compare', { params });
};
// TT平均响应时长对比
export const compareResponseByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/response/time/compare', { params });
};
// TT平均解决时长对比
export const compareResolveByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/resolve/time/compare', { params });
};
// TT平均响应合格率对比
export const compareResolveResponseRateByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/resolve/response/rate/compare', { params });
};
// TT响应时长分布（已响应）对比
export const compareAlreadyReactDistributeByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/react/distribute/compare', { params });
};
// TT响应时长分布（未响应）对比
export const compareNotReactDistributeByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/react/distribute/compare', { params });
};
// 处理时长分布（已处理）对比
export const compareAlreadyHandleDistributeByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/already/handle/distribute/compare', { params });
};
// 处理时长分布（未处理）对比
export const compareNotHandleDistributeByRg = (params: {
    rgIds: number[],
    dateStartAt: number,
    dateEndAt: number
}) => {
    return service.get('/tt/1.0/statistic/rg/tt/not/handle/distribute/compare', { params });
};
// 获取流转过的TT
export const getJoinTicketList = (params: {
    mis?: string,
    cn: number,
    sn: number
}) => {
    return service.get('/tt/1.0/ticket/filter/who/join', { params });
};
// 解散大象群
export const cancelChatRoom = (params: {
    roomId: number,
    ticketId: number
}) => {
    return service.post(`/tt/1.0/chat/room/cancel`, params);
};
// 拉新人进群
export const inviteUserToChat = (params: {
    ticketId: number,
    roomId: number,
    userList: string[]
}) => {
    return service.post('/tt/1.0/chat/user/invite/history', params);
};
// 根据省查询市
export const getCityByProvince = (params: {
    regionId: number,
    type?: number
}) => {
    return service.get('/tt/1.0/map/province/city/search', { params });
};
// 一键转派千寻(itsm)
export const createItsm = (ticketId: number, type: number = 1) => {
    return service.get(`/tt/1.0/itsm/transfer?ticketId=${ticketId}&type=${type}`);
};

/******* 一键转派Case(case.sankuai.com)所需接口 *******/
export const searchCaseBusinessLine = (params: { keyword: string }) => {
    return service.get(`/tt/1.0/case/businessLine/search`, { params }) as any as Ajax.AjaxResponse;
};
/**
 * @param issue Case系统的一个问题case
 */
export const transferTicketToCase = (issue: CommonTypes.CaseIssue) => {
    return service.post('/tt/1.0/case/issue', issue) as any as Ajax.AjaxResponse<any>;
};

// 获取有模板的rg以及所有模板
export const getRgFormList = (params: {
    cn: number,
    sn: number
}) => {
    return service.get('/tt/1.0/rg/custom/form/all', { params });
};
// 获取表单详情
export const getSystemAndCustomFields = (params: {
    customFormId: number,
    forceGet?: boolean
}) => {
    return service.get(`/tt/1.0/rg/custom/form/${params.customFormId}`, { params });
};
// 【外卖代理商】标题自动添加
export const getWmDistrictCityTitle = (mis: string) => {
    return service.get(`/tt/1.0/wm/district/city/prefix/by/mis?mis=${mis}`);
};

// 获取我相关的各种tt数量
export const getRelatedTT = (mis?: string) => {
    return service.get(`/tt/1.0/ticket/number/map`, {
        params: {
            mis
        }
    });
};
// 查询我参与的rg及数量
export const getMyRgAndNum = (params?: {
    cn?: number,
    sn?: number
}) => {
    return service.get('/tt/1.0/rg/ticket/number/map', { params });
};
// 查询RG下定制表单列表
export const getRgCustomTemplate = (params: {
    rgId: number
}) => {
    return service.get('/tt/1.0/rg/custom/form/list', { params });
};

// 获取开始处理权限
export const getProcessPermission = (params: {
    ticketId: number,
    mis?: string
}) => {
    return service.get(`tt/1.0/ticket/deal/with/permission`, { params });
};

// 获取常用目录
export const commonDirector = () => {
    return service.get(`tt/1.0/hot/category/list`);
};
// 根据uid兑换mis号
export const getMisByUid = (uids: string) => {
    return service.get(`/tt/1.0/chat/user/map?uids=${uids}`);
};
// 保存过滤器
export const saveFilter = (params) => {
    return service.post(`/tt/1.0/ticket/filter/save`, params);
};
// 获取过滤器
export const getFilter = (params) => {
    return service.get(`/tt/1.0/ticket/filter/find`, { params });
};
// 删除过滤器
export const delFilter = () => {
    return service.delete(`/tt/1.0/ticket/filter/delete`);
};
// 根据用户获取猜你想问
export const getGuessAskByOrg = (mis: string) => {
    return service.get(`/tt/1.0/ticket/homepage/org?mis=${mis}`);
};
export const getHistoryReport = (mis: string) => {
    return service.get(`/tt/1.0/ticket/homepage/created?mis=${mis}`);
};
export const getAssignedTicketNum = (mis: string) => {
    return service.get(`/tt/1.0/ticket/number/map/assigned?mis=${mis}`);
};
// 快速创建tt
export const fastCreateTicket = (params: {
    name: string,
    ticketType: string,
    sla: string,
    itemId: number,
    desc: string,
    reporter: string
}) => {
    return service.post('/tt/1.0/ticket/homepage/fast/create', params);
};
// 查询RG组内，某个时间段内，每个人的统计数据汇总
export const getIndividualStatsByRg = (params: {
    rgId: number;
    dateStartAt: number;
    dateEndAt: number
}) => {
    return service.get('tt/1.0/statistic/assigned/count/by/rg', { params });
};
// 查询 CTI 内，某个时间段内，每个人的统计数据汇总
// TODO: API URL路径、参数格式待定
export const getIndividualStatsByCti = (params: {
    categoryId?: number | string,
    typeId?: number | string,
    itemId?: number | string,
    dateStartAt: number;
    dateEndAt: number
}) => {
    return service.get('tt/1.0/statistic/assigned/count/by/cti', { params });
};
// 克隆tt关联附件
export const associateAttachment = (params: {
    cloneTicketId: number,
    oldTicketId: number
}) => {
    return service.post(`/tt/1.0/file/associate?cloneTicketId=${params.cloneTicketId}&oldTicketId=${params.oldTicketId}`);
};
// 附件预览转码
export const attachmentPreview = (attachmentId: number) => {
    return service.get(`/tt/1.0/file/preview/single?attachmentId=${attachmentId}`);
};
// 获取非工作时间设置
export const getNonWorkingSetting = (params: {
    rgId: number,
    includeTimeState?: boolean
}) => {
    return service.get(`/tt/1.0/rg/nonworking/hour/setting/and/time/state`, { params });
};
// 获取详情权限
export const ticketDetailPermissions = (ticketId: number) => {
    return service.get(`/tt/1.0/permission/ticket/${ticketId}`);
};
// 获取门店店名
export const getPoiInfo = (params: {
    poiType: 'MEITUAN' | 'DIANPING',
    shopId: string
}) => {
    return service.get(`/tt/1.0/poi/info`, { params });
};
// 数据导出设置
export const setDataExportSetting = (params: {
    fieldList: any[];
}) => {
    return service.post(`/tt/1.0/export/field/saveUserExportField`, params);
};
// 获取数据导出设置
export const getDataExportSetting = () => {
    return service.get(`/tt/1.0/export/field/getUserExportFieldInfo`);
};
// 创建导出任务（新）
export const createDataExportTask = (params: {
    state?: string[],
    sla?: string,
    name?: string,
    ticketType?: string,
    createdAtStart?: number,
    createdAtEnd?: number,
    createdBy?: string,
    assigned?: string[],
    rgIds?: number[],
    cc?: string[],
    labels?: number[],
    ctiNameList?: any,
    labelsRelation?: number,
    timeoutSituation?: string[],
    handlers?: string[],
    associatedSpaces?: any,
    associatedRGs?: any
}) => {
    return service.post(`/tt/1.0/export/task/create`, params);
};
// 查询导出进度
export const getDataExportProgress = (taskId: string) => {
    return service.get(`/tt/1.0/export/task/getProgressAndResult?taskId=${taskId}`);
};
// 保存列表信息
export const saveTableColumns = (fields: string[]) => {
    return service.post(`/tt/1.0/ticket/list/columns`, { fields });
};
// 获取归档信息
export const getArchiveDistribute = (params: {
    rgId: number,
    dateStartAt: number,
    dateEndAt: number,
    parentArchiveId: number
}) => {
    return service.get(`/tt/1.0/statistic/rg/tt/archive/distribute`, { params });
};
export const getRecommendArchive = (ticketId: number) => {
    return service.get(`/tt/1.0/archive/recommend/${ticketId}`);
};
// 查询产品线
export const getProductLine = (params: {
    keyword: string
}) => {
    return service.get(`/tt/1.0/case/productLine/search`, { params });
};
// 获取缓存的产品线和处理人信息
export const getIssueCache = () => {
    return service.get(`/tt/1.0/case/issue/cache`);
};
// 查看ONES、CASE、千寻详情接口
export const getAssociateDetail = (params: {
    ticketId: string
}) => {
    return service.get(`/tt/1.0/ticket/associate/detail`, { params });
};
export const getOnesDetail = (params: {
    ticketId: string
}) => {
    return service.get(`/tt/1.0/ones/issue/detail`, { params });
};
export const cancelNotInScope = (ticketId: string) => {
    return service.get(`/tt/1.0/ticket/update/not/in/scope/cancel/${ticketId}`, {});
};
export const getGroupCcSetting = (rgId: number) => {
    return service.get(`/tt/1.0/xm/setting/invite/cc/${rgId}`);
};
export const getMosesRecommends = (ticketId: number, robotKey: string) => {
    return service.get(`/tt/1.0/knowledge/base/recommend?ticketId=${ticketId}&robotKey=${robotKey}`);
};
export const searchMoses = (params: {
    ticketId: number,
    robotKey: string,
    keyWord: string
}) => {
    return service.get(`/tt/1.0/knowledge/base/search`, { params });
};
export const getMosesSwitch = (ticketId: string) => {
    return service.get(`/tt/1.0/knowledge/base/switch?ticketId=${ticketId}`);
};
export const getMosesFavorites = (params: {
    mis: string,
    knowledgeBaseType: string
}) => {
    return service.get(`/tt/1.0/knowledge/base/favorites`, { params });
};
export const increaseMosesFavorites = (params: {
    knowledgeType: string,
    mosesId: string,
    question: string,
    rootCategoryId: number,
    intentId: number,
    solution: string
}) => {
    return service.post(`/tt/1.0/knowledge/base/favorites`, params);
};
export const decreaseMosesFavorites = (params: {
    mis: string,
    mosesId: string,
    rootCategoryId: number,
    intentId: number
}) => {
    return service.delete(`/tt/1.0/knowledge/base/favorites`, { params });
};
export const getMosesIntentAssociation = (params: {
    robotKey: string,
    keyWord: string
}) => {
    return service.get(`/tt/1.0/knowledge/base/intention/associate`, { params });
};
export const getMosesQuestionSatisfaction = (params: {
    ticketId: number,
    question: string,
    evaluateUser: string
}) => {
    return service.get(`/tt/1.0/knowledge/base/satisfaction`, { params });
};
export const setMosesQuestionSatisfaction = (params: {
    ticketId: number,
    question: string,
    isSatisfy: boolean,
    knowledgeType: string,
    evaluateUser: string
}) => {
    return service.post(`/tt/1.0/knowledge/base/satisfaction`, params);
};
export const setMosesSatisfaction = (params: any) => {
    return service.post(`/tt/1.0/knowledge/base/origin/satisfaction`, params);
};
// 查询rg配置是否默认勾选解散群
export const getDefaultGroupDisbandSetting = (rgId: number) => {
    return service.get(`/tt/1.0/xm/setting/dissolveGroupSwitch/${rgId}`);
};
