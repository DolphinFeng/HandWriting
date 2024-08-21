import { service } from '../utils';
// 查询一级目录
export const getCategoryList = () => {
    return service.get('/cti/1.0/category/list');
};
// 查询二级目录
export const getTypeList = (params: { parentId: number }) => {
    return service.get('/cti/1.0/type/list', { params });
};
// 查询三级目录
export const getItemList = (params: { parentId: number }) => {
    return service.get('/cti/1.0/item/list', { params });
};
// 获取用户信息
export const getUserInfo = () => {
    return service.get('/cti/1.0/user/current');
};
// 关键词检索用户
export const searchUser = (params: {
    keyword: string,
    includeVirtual?: boolean,
    includeOffJob?: boolean,
    includeExternal?: boolean
    ticketId?: number // 后端根据ticketId所属rg判断是否在白名单内，是的话可以搜索到外部账号（目前仅在抄送场景使用）
}) => {
    return service.get('/cti/1.0/search/user', { params });
};
// 查询我参与的rg
export const getMyRg = (params?: {
    cn?: number,
    sn?: number
}) => {
    return service.get('/cti/1.0/rg/my', { params });
};
// 查询rg
export const getRgs = (params?: {
    name?: number
}) => {
    return service.get('/cti/1.0/rg/list', { params });
};
// 查询cti树形结构
export const getCategoryTree = (params?: {
    scope?: string
}) => {
    return service.get('/cti/1.0/category/tree', { params });
};
// 查询rg下oncall user
export const getOncallUser = (params: {
    rgId: number
}) => {
    return service.get('/cti/1.0/oncall/user/detail', { params });
};
// 查询RG下user
export const getRgUser = (params: {
    rgId: number,
    includeOncall?: boolean,
    identify?: string,
    cn?: number,
    sn?: number
}) => {
    return service.get('/cti/1.0/rg/user/list', { params });
};

// 根据用户返回全部cti
export const getUserCti = (assigned: string) => {
    return service.get(`/cti/1.0/rg/user/search/cti?assigned=${assigned}`);
};
// 根据用户返回当前空间的cti
export const getUserCtiBySpace = (params: {
    assigned: string,
    spaceId?: number,
    domain?: string
}) => {
    return service.get(`/cti/1.0/rg/user/search/cti/space`, { params });
};
// URL发起时，判断用户有无当前目录权限
export const getPermissionURL = (params: {
    cid: number,
    tid: number,
    iid: number
}) => {
    return service.get('/cti/1.0/directory/permission', { params });
};
// 根据itemId获取模板内容
export const getTemplateByItem = (itemId: number) => {
    return service.get(`/cti/1.0/template/item/${itemId}`);
};
// 批量获取displayname
export const searchDisplayNameList = (users: any[]) => {
    return service.post(`/cti/1.0/search/user/list/v2`, users);
};
// 查询rg的默认设置
export const getRgSetting = (rgId: number) => {
    return service.get(`/cti/1.0/rg/setting/get?rgId=${rgId}`);
};
// 查询当前用户是否在rg组内
export const userInRg = (params: {
    itemId: number,
    rgId: number,
    misList: string[]
}) => {
    return service.post('/cti/1.0/is/user/in/rg', params) as any as Ajax.AjaxResponse<any>;
};
// 根据rg查询推荐标签
export const searchTagsByRg = (params: {
    rgId: number,
    cn?: number,
    sn?: number
}) => {
    return service.get(`/cti/1.0/rg/label/list`, { params });
};
// 查询cti树形结构（绑定美维用 三层）
export const getCategoryTreeByRg = (rgId: number) => {
    return service.get(`/cti/1.0/rg/${rgId}/item/info`);
};
// 查询cti树形结构（绑定美维用 三层）
export const getCategoryTreeTotal = () => {
    return service.get('/cti/1.0/category/tree');
};
// 服务目录改造：获取当前用户适用的服务目录版本
export const getCtiVersion = () => {
    return service.get('/cti/1.0/tree/version/get');
};
// 查询RG
export const getRgList = (params: {
    name?: string,
    active?: boolean,
    id?: number,
    cn?: number,
    sn?: number
}) => {
    return service.get('/cti/1.0/rg/list', { params });
};


// 公告&常见问题接口
// 公告 Bulletin
type BulletinRelationType = 'HELPDESK' | 'MOSES';

export const getBulletins = (params: {
    rgId: number,
    enable?: boolean,
    relationType?: BulletinRelationType,
    cn?: number,
    sn?: number
}) => {
    return service.get(`/cti/1.0/rg/bulletin`, { params }) as any as Promise<Ajax.AjaxResponse>;
};

export const getHelpdeskBulletins = (params: { rgId: number, enable?: boolean, cn?: number, sn?: number }) => {
    return getBulletins({ ...params, relationType: 'HELPDESK' });
};

export const getMosesBulletins = (params: { rgId: number, enable?: boolean, cn?: number, sn?: number }) => {
    return getBulletins({ ...params, relationType: 'MOSES' });
};

export const addBulletin = (params: {
    rgId: number,
    relationType?: BulletinRelationType,
    content: string
}) => {
    return service.post(`/cti/1.0/rg/bulletin`, params) as any as Promise<Ajax.AjaxResponse>;
};

export const addHelpdeskBulletin = (params: { rgId: number, content: string }) => {
    return addBulletin({ ...params, relationType: 'HELPDESK' });
};

export const addMosesBulletin = (params: { rgId: number, content: string }) => {
    return addBulletin({ ...params, relationType: 'MOSES' });
};

export const updateBulletin = (params: {
    id: number,
    rgId: number,
    content: string,
    enable?: boolean
}) => {
    return service.put(`/cti/1.0/rg/bulletin`, params) as any as Promise<Ajax.AjaxResponse>;
};

// 常见问题接口

type FaqRelationType = 'HELPDESK' | 'MOSES';

export const getFaqs = (params: {
    rgId: number,
    title?: string,
    enable?: boolean,
    cn?: number,
    sn?: number,
    relationType?: BulletinRelationType
}) => {
    return service.get(`/cti/1.0/rg/faq`, { params }) as any as Promise<Ajax.AjaxResponse>;
};

export const getHelpdeskFaqs = (params: { rgId: number, enable?: boolean, cn?: number, sn?: number }) => {
    return getFaqs({ ...params, relationType: 'HELPDESK' });
};

export const getMosesFaqs = (params: { rgId: number, enable?: boolean, cn?: number, sn?: number }) => {
    return getFaqs({ ...params, relationType: 'MOSES' });
};

export const addFaq = (params: {
    rgId: number,
    content: string,
    title: string,
    relationType?: FaqRelationType
}) => {
    return service.post(`/cti/1.0/rg/faq`, params) as any as Promise<Ajax.AjaxResponse>;
};

export const addHelpdeskFaq = (params: { rgId: number, title: string, content: string }) => {
    return addFaq({ ...params, relationType: 'HELPDESK' });
};

export const addMosesFaq = (params: { rgId: number, title: string, content: string }) => {
    return addFaq({ ...params, relationType: 'MOSES' });
};

export const updateFaq = (params: {
    id: number,
    rgId: number,
    content: string,
    title: string,
    enable?: boolean
}) => {
    return service.put(`/cti/1.0/rg/faq`, params) as any as Promise<Ajax.AjaxResponse>;
};

export const deleteFaq = (faqId: number) => {
    return service.delete(`/cti/1.0/rg/faq/${faqId}`) as any as Promise<Ajax.AjaxResponse>;
};

export const getRgFaq = (params: {
    rgId: number,
    title?: string,
    enable?: boolean,
    cn?: number,
    sn?: number
}) => {
    return service.get(`/cti/1.0/rg/faq`, {
        params
    });
};
// 获取归档设置
export const getRgFileSetting = (rgId: number) => {
    return service.get(`/cti/1.0/rg/archive/info?rgId=${rgId}`);
};
// 获取节点的字节点树（一直到最底层）
export const getArchiveTreeByParent = (parentId: number) => {
    return service.get(`/cti/1.0/archive/tree?parentId=${parentId}`);
};
// 获取节点的子节点（仅包含某节点自己的直属子节点 children）
export const getNodesByParent = (parentId: number) => {
    return service.get(`/cti/1.0/archive/list?parentId=${parentId}`);
};
// 根据关键词搜索问题归档分类
export const searchNodesByKw = (parentId: number, keyword: string, archiveRequireEnd: boolean) => {
    return service.get(`/cti/1.0/archive/search?parentId=${parentId}&keyword=${keyword}&archiveRequireEnd=${archiveRequireEnd}`);
};
export const getNewCtiFromUrl = (filterByAuth: boolean, params: {
    cid?: number,
    tid?: number,
    iid?: number,
    category: string,
    type: string,
    item: string
}) => {
    return service.post(`/cti/1.0/find/newest/bind?filterByAuth=${filterByAuth}`, params);
};
export const getDetailOperatePermission = (params: {
    rgId: number,
    pageNo?: number
}) => {
    return service.get(`/cti/1.0/element/permission`, { params });
};
// 查询常用回复
export const getRgReplyText = (params: {
    rgId: number,
    type: string
}) => {
    return service.get(`/cti/1.0/rg/quick/reply`, { params });
};
// 获取展示字段
export const getRgReplyField = (params: {
    rgId: number,
    type: string
}) => {
    return service.get(`/cti/1.0/rg/display/field`, { params });
};
// 获取关闭/暂停原因
export const getCloseReasonList = (params: {
    rgId: number,
    type: string,
    content?: string,
    pageNum?: number,
    pageSize?: number
}) => {
    return service.get(`/cti/1.0/rg/display/field/page`, { params });
};
// 获取满意度接口
export const getSatisfation = (rgId: number) => {
    return service.get(`/cti/1.0/satisfaction/setting/${rgId}`);
};
// 搜索组织架构
export const searchOrg = (name: string) => {
    return service.get(`/cti/1.0/org/search?name=${name}`);
};
// 获取当前用户有权限的组织架构
export const visibleOrg = () => {
    return service.get(`/cti/1.0/org/visible`);
};
// 大象群设置默认目录
export const setExternalDefaultCti = (params: {
    externalId: string,
    externalType: string,
    categoryId: number,
    typeId: number,
    itemId: number
}) => {
    return service.post(`/cti/1.0/external/cti`, params);
};
// 获取大象群设置的默认目录
export const getExternalDefaultCti = (params: {
    externalType: string,
    externalId: string
}) => {
    return service.get(`/cti/1.0/external/cti`, { params });
};

// 摩西机器人相关设置
interface MosesSetting {
    rgId: number;
    active: boolean;
    mosesId: string;
    // FIXME: content 字段没用
    content: string;
    resolutionKnowledgeBaseSwitch: boolean;
}

// 获取摩西机器人绑定设置
export const getMosesSetting = (rgId: number) => {
    return service.get(`/cti/1.0/rg/moses/${rgId}`) as any as Promise<Ajax.AjaxResponse<MosesSetting>>;
};
// 知识库沉淀
// 获取 RG 绑定机器人类目/领域列表
export const categoryList = (rgId: number) => {
    return service.get(`/cti/1.0/rg/moses/category/list?rgId=${rgId}`);
};
// 获取 RG 绑定机器人以及类目下的意图列表
export const intentList = (rgId: number, categoryId: number) => {
    return service.get(`/cti/1.0/rg/moses/intent/list?rgId=${rgId}&categoryId=${categoryId}`);
};
// 添加意图
export const addIntent = (params: {
    categoryId: number,
    intentName: string
}) => {
    return service.post(`/cti/1.0/add/moses/intent`, params);
};
// 添加意图对应的答案
export const addIntentAnswer = (rgId: number, params: {
    intentId: number,
    intentAnswer: string
}) => {
    return service.post(`/cti/1.0/add/moses/intent/answer?rgId=${rgId}`, params);
};
// 添加意图说法列表
export const addIntentGrammar = (rgId: number, params: {
    intentId: number,
    grammarList: Array<string>
}) => {
    return service.post(`/cti/1.0/add/moses/intent/grammar?rgId=${rgId}`, params);
};
// 摩西目录推荐
export const getRecommendCti = (params: {
    desc: string,
    reporter?: string
}) => {
    return service.post(`/cti/1.0/moses/recommend`, params);
};
// 目录搜索
export const searchCti = (params: {
    keyword: string,
    sceneId: number // 1 —— 发起，对应原 cti/tree 接口 (默认值) ;2 —— 流转和过滤器筛选，对应原 category/tree 接口
}) => {
    return service.post(`/cti/1.0/cti/scene/query`, params);
};
// 入离转工作交接相关
// 查询当前用户是否有交接工作
export const hasHandover = () => {
    return service.get(`/cti/1.0/has/handover`);
};
// 查询用户的交接工作详情
export const handoverDetail = (mis: string) => {
    return service.get(`/cti/1.0/handover/${mis}`);
};
// 提交用户在某RG组下的交接工作
export const sumbitHandoverRG = (params: {
    mis: string,
    rgId: number,
    owner?: string,
    oncall?: string,
    ticket?: string,
    handoverCompleted?: boolean
}) => {
    return service.post(`/cti/1.0/handover`, params);
};
// 查询RG组下特殊成员
export const getRgRecommendUser = (rgId: number) => {
    return service.get(`/cti/1.0/handover/rg/user/list/${rgId}`);
};
// 查询当前用户有交接工作的下属列表
export const getHandoverMembers = (cn: number, sn: number) => {
    return service.get(`/cti/1.0/handover/member/list?cn=${cn}&sn=${sn}`);
};
// 向RG内添加成员
export const addRgUser = (params: {
    rgUsers: string[];
    rgId: number;
    // 'MISID'
    type: string;
    role: string;
    handover?: boolean;
}) => {
    return service.post('/cti/1.0/rg/user/add', params);
};
// 查询用户是否为RG组成员
export const isRgUser = (params: {
    rgId: number,
    misList: string[]
}) => {
    return service.post(`/cti/1.0/is/user/in/rg`, params);
};
export const isRgAdmin = (params: {
    rgId: string;
    mis: number;
}) => {
    return service.get(`/cti/1.0/is/rg/admin`, { params });
};
// 查询摩西领域
export const getMosesCategories = (rgId: string, mosesStageType: number) => {
    return service.get(`/cti/1.0/rg/moses/category/list?rgId=${rgId}&mosesStageType=${mosesStageType}`);
};
// 查询摩西领域下的意图
export const getMosesIntentions = (params: {
    rgId: string,
    categoryId: number,
    mosesStageType: number
}) => {
    return service.get(`/cti/1.0/rg/moses/intent/list`, { params });
};
// 添加摩西领域下的意图
export const addMosesIntention = (params: {
    categoryId: number,
    intentName: string
}) => {
    return service.post(`/cti/1.0/add/moses/intent`, params);
};
// 添加摩西领域下的意图
export const addMosesAnswer = (params: {
    rgId: string,
    mosesStageType: number,
    categoryId: number,
    intentId: number,
    intentAnswer: string
}) => {
    const { rgId, mosesStageType, ...options } = params;
    return service.post(`/cti/1.0/add/moses/intent/answer?rgId=${rgId}&mosesStageType=${mosesStageType}`, options);
};
