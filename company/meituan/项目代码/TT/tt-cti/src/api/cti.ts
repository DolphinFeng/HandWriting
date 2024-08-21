import { service } from '../utils';
// 添加一级目录
export const addCategory = (data: { name: string }, params?: { spaceId: number }) => {
    return service.post('/cti/1.0/category/add', data, {
        params
    });
};
// 添加二级目录
export const addType = (params: {
    name: string;
    parentId: number;
}) => {
    return service.post('/cti/1.0/type/add', params);
};
// 添加三级目录
export const addItem = (params: {
    name: string;
    parentId: number;
    rgId: number;
    state?: number;
    templateId?: number;
}) => {
    return service.post('/cti/1.0/item/add', params);
};
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
// 编辑一级目录
export const editCategory = (categoryId: number, params: {
    name: string;
    roleUsersMap?: CommonTypes.mapObject;
    defaultItemId?: number;
    ticketRelated?: boolean;
    state?: number;
    mainSpaceVisible?: boolean;
}) => {
    return service.put(`/cti/1.0/category/edit/${categoryId}`, params);
};
// 编辑二级目录
export const editType = (typeId: number, params: {
    name: string;
    roleUsersMap?: CommonTypes.mapObject;
    defaultItemId?: number;
    ticketRelated?: boolean;
    state?: number;
}) => {
    return service.put(`/cti/1.0/type/edit/${typeId}`, params);
};
// 编辑三级目录
export const editItem = (itemId: number, params: {
    name: string;
    rgId?: number;
    templateId?: number;
    state?: number;
}) => {
    return service.put(`/cti/1.0/item/edit/${itemId}`, params);
};
// 删除二级目录
export const deleteType = (typeId: number) => {
    return service.delete(`/cti/1.0/type/del/${typeId}`);
};
// 删除三级目录
export const deleteItem = (itemId: number) => {
    return service.delete(`/cti/1.0/item/${itemId}/del`);
};
// 获取用户信息
export const getUserInfo = () => {
    return service.get('/cti/1.0/user/current');
};
// 获取用户引导因袭
export const getUserInstruction = () => {
    return service.get('/cti/1.0/user/guide/contents');
};

// 根据item获取rg信息
export const getRgDetail = (itemId: number) => {
    return service.get(`/cti/1.0/item/rg/detail?itemId=${itemId}`);
};
// 获取item详情
export const getItemInfo = (itemId: number) => {
    return service.get(`/cti/1.0/item/${itemId}/info`);
};
// 获取item详情（目录被删除/停用时该接口不会报错，会把异常信息放在status字段中）
export const getItemInfoWithAllStatus = (itemId: number) => {
    return service.get(`/cti/1.0/item/${itemId}/all/status/info`);
};
// 查询cti树形结构（搜索用 不过滤没有item的目录）
export const getCategoryTree = () => {
    return service.get('/cti/1.0/category/type/item');
};
// 批量获取displayname
export const searchDisplayNameList = (users: any[]) => {
    type UserDisplayItem = Omit<CommonTypes.userDisplayItem, 'username'>;
    return service.post<Record<string, UserDisplayItem>>('/cti/1.0/search/user/list/v2', users);
};
// 获取美维中的cti列表
export const getHelpdeskCTI = (projectId: number, cn: number, sn: number) => {
    return service.get(`/cti/1.0/mw/project/cate/list?projectId=${projectId}&cn=${cn}&sn=${sn}`);
};
// 查询cti树形结构（绑定美维用 三层）
export const getCategoryTreeTotal = (includeDeleted: boolean = false) => {
    return service.get(`/cti/1.0/category/tree?includeDeleted=${includeDeleted}`);
};
// 提交美维目录与cti的绑定关系
export const bindMwToCti = (params: {
    mwProjectId: number;
    mwCate1Name: string;
    mwCate1Id: number;
    mwCate2Name: string;
    mwCate2Id: number;
    mwCate3Name: string;
    mwCate3Id: number;
    itemName: string;
    itemId: number;
}) => {
    return service.post('/cti/1.0/mw/cti/bind/tt', params);
};
// 解除现有的绑定关系
export const removeBindToCti = (configId: number) => {
    return service.delete(`/cti/1.0/mw/config/delete/${configId}`);
};
// 发起美维迁移
export const mwTransfer = (projectId: number) => {
    return service.post(`/cti/1.0/mw/migrate/project/${projectId}`);
};
// 根据RG获取CTI树形
export const getCategoryByRg = (rgId: number) => {
    return service.get(`/cti/1.0/rg/${rgId}/item/info`);
};
// 发起cti下TT的迁移
export const ctiTransfer = (params: {
    sources: CommonTypes.CtiItem[];
    target: CommonTypes.CtiItem;
    type: number;
}) => {
    return service.post('/cti/admin/migrate/cti/and/ticket', params);
};
// 根据rg查询推荐标签
export const searchTagsByRg = (params: {
    rgId: number;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/rg/label/list', { params });
};
// 添加rg推荐标签
export const addRgTag = (params: {
    name: string;
    rgId: number;
    color?: string;
}) => {
    return service.post('/cti/1.0/rg/label/add', params);
};
// 查询标签
export const searchTicketTags = (params: {
    name: string;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/tt/1.0/label/search', { params });
};
// 删除标签
export const deleteRgTag = (id: number, rgId: number) => {
    return service.delete(`/cti/1.0/rg/label/del?id=${id}&rgId=${rgId}`);
};
// 根据用户返回cti
export const getUserCti = (assigned: string) => {
    return service.get(`/cti/1.0/rg/user/search/cti?assigned=${assigned}`);
};
// 根据关键字搜索CTI
export const searchCTIbyName = (name: string) => {
    return service.get(`/cti/1.0/type/item/search?name=${name}`);
};
// 设置满意度接口
export const setSatisfaction = (params: {
    rgId: number;
    commentsRequire?: boolean;
    commentsDeadlineRequire?: boolean;
    commentsDeadlineInterval?: number;
    commentsDeadlineUnit?: 'HOUR' | 'DAY' | 'WEEK';
    maxPushNum?: number;
    intervalSecond?: number;
    uncommentMultiPush?: boolean;
    dissatisfiedTtToCcEmps?: {
        type?: string[]; // 一级主管等
        username?: string[]; // mis号信息
    };
    dissatisfiedTtToPushEmps?: {
        type?: string[]; // 一级主管等
        username?: string[]; // mis号信息
    };
    dissatisfiedTtGroupJoinRequire?: boolean;
    dissatisfiedReasonRequire?: boolean;
    dissatisfiedReasons?: string[];
    commonTtToCcEmps?: {
        type?: string[]; // 一级主管等
        username?: string[]; // mis号信息
    };
    commonTtToPushEmps?: {
        type?: string[]; // 一级主管等
        username?: string[]; // mis号信息
    };
    commonTtGroupJoinRequire?: boolean;
    commonReasonRequire?: boolean;
    commonReasons?: string[];
}) => {
    return service.post('/cti/1.0/satisfaction/setting', params);
};
// 获取满意度接口
export const getSatisfation = (params: {
    rgId: number;
}) => {
    const { rgId } = params;
    return service.get(`/cti/1.0/satisfaction/setting/${rgId}`);
};
// 问题归档
// 获取节点的子节点
export const getNodesByParent = (parentId: number) => {
    return service.get(`/cti/1.0/archive/list?parentId=${parentId}`);
};
// 获取节点的字节点树（一直到最底层）
export const getArchiveTreeByParent = (parentId: number) => {
    return service.get(`/cti/1.0/archive/tree?parentId=${parentId}`);
};
// 添加子节点
export const addNodes = (params: {
    name: string;
    parentId: number;
}) => {
    return service.post('/cti/1.0/archive/add', params);
};
// 更新节点
export const updateNodes = (params: {
    id: number;
    name?: string;
    parentId?: number;
    rgId?: number;
    inUse?: boolean;
}) => {
    return service.put('/cti/1.0/archive/update', params);
};
// 删除节点
export const deleteArchiveNode = (params: {
    id: number;
}) => {
    const { id } = params;
    return service.delete(`/cti/1.0/archive/delete/${id}`);
};
// 问题归档启用
export const fileActive = (rgId: number, active: boolean) => {
    return service.get(`/cti/1.0/rg/archive/active/switch?rgId=${rgId}&active=${active}`);
};
// 获取归档设置
export const getRgFileSetting = (rgId: number) => {
    return service.get(`/cti/1.0/rg/archive/info?rgId=${rgId}`);
};
// 导出问题归档（Excel会通过公众号发送）
export const exportArchive = (rgId: number) => {
    return service.get(`/cti/1.0/archive/export?rgId=${rgId}`);
};
// 下载问题归档模板（Excel会通过公众号发送）
export const getArchiveExportTemplate = (rgId: number) => {
    return service.get(`/cti/1.0/archive/export/template?rgId=${rgId}`);
};
// 关闭/暂停原因导出
export const exportReason = (params: {
    rgId: number;
    type: string;
}) => {
    return service.get('/cti/1.0/rg/display/field/export', { params });
};
// 查询rg绑定的cti（tree）
export const getCategoryTreeByRg = (rgId: number) => {
    return service.get(`/cti/1.0/rg/${rgId}/item/info`);
};
// 获取目录设置
export const getCatalogDetail = (params: {
    id: number;
    level: number;
}) => {
    return service.get('/cti/1.0/directory', { params });
};
// 查询迁移进度
export const getTransferProgress = (migrateId: number) => {
    return service.get(`/cti/admin/migrate/progress/${migrateId}`);
};
export const draggableSort = (params: {
    parentId: number;
    level: number;
    ctiIds: number[];
}[]) => {
    return service.post('/cti/1.0/sort/CTI', params);
};

// 空间的目录管理接口
// 获取全部目录树
export const getCatalogTree = (params: {
    spaceId?: number;
    domain?: string;
    states?: number;
}) => {
    return service.get('/cti/1.0/cti/tree/all', { params });
};

// 根据空间获取一级目录列表
export const getCatalogLevel1Tree = (params: {
    spaceId?: number;
    domain?: string;
    states?: number;
}) => {
    return service.get('/cti/1.0/category/list/space', { params });
};

// 根据一级空间获取二级目录
export const getCatalogLevel2Tree = (params: {
    parentId: number;
    states?: number;
}) => {
    return service.get('/cti/1.0/type/list/space', { params });
};

// 根据二级空间获取三级目录
export const getCatalogLevel3Tree = (params: {
    parentId: number;
    states?: number;
}) => {
    return service.get('/cti/1.0/item/list/space', { params });
};

// 页面查询空间下所有rg分组
export const getAllSpaceRg = (params: {
    spaceId: number;
    name?: string;
    id?: number;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/space/rg/list', { params });
};

// 删除一级目录
export const deleteLevel1Catalog = (id: number) => {
    return service.delete(`/cti/1.0/category/del/${id}`);
};

// 删除二级目录
export const deleteLevel2Catalog = (id: number) => {
    return service.delete(`/cti/1.0/type/del/${id}`);
};

// 删除三级目录
export const deleteLevel3Catalog = (id: number) => {
    return service.delete(`/cti/1.0/item/${id}/del`);
};

// 目录迁移
export const migrateSpace = (params: {
    categoryIds: number[];
    targetSpaceId: number;
    includeRg: boolean;
    unbindConflictingDirectories: boolean;
}) => {
    return service.post('/cti/1.0/migrate/cti/between/space', params);
};

// 除了本空间外的其他目录
export const otherCatalog = (params: {
    spaceId?: number;
    domain?: string;
    states?: number;
}) => {
    return service.get('/cti/1.0/cti/tree/all/exclude/space', { params });
};

// 删除目录或者叫迁移
export const deleteCategory = (params: {
    categoryIds: number;
}) => {
    return service.post('/cti/1.0/space/category/remove', null, { params });
};
// 获取三级目录详情信息
export const getDetailItem = (itemId: number, params: {
    spaceId: number;
}) => {
    return service.get(`/cti/1.0/item/detail/${itemId}/space`, { params });
};

// 判断当前用户是否管理员
export const isAdmin = () => {
    return service.get('/cti/1.0/user/current');
};
// 设置问题归档必填
export const setArchiveSetting = (rgId: number, archiveRequire: boolean) => {
    return service.post(`/cti/1.0/rg/setting/archive/require?rgId=${rgId}&archiveRequire=${archiveRequire}`);
};
// 设置问题归档是否需要选择到最末级
export const setArchiveRequireEnd = (rgId: number, archiveRequireEnd: boolean) => {
    return service.post(`/cti/1.0/rg/setting/archive/require/end?rgId=${rgId}&archiveRequireEnd=${archiveRequireEnd}`);
};
// 根据用户名查询目录是否授权
export const isAuth = (username: string, params:{
    cid: number;
}) => {
    return service.get(`/cti/1.0/cti/auth?username=${username}`, { params });
};
// 根据组织架构全路径查看对应详情，仅 4 层架构（包含）以下
export const orgDetailByPath = (orgPath: string) => {
    return service.get(`/cti/1.0/org/detail/by/path?orgPath=${orgPath}`);
};
// 查询当前用户是否有交接工作
export const hasHandover = () => {
    return service.get('/cti/1.0/has/handover');
};
// 目录搜索
export const searchCti = (params: {
    keyword: string;
    sceneId: number; // 1 —— 发起，对应原 cti/tree 接口 (默认值) ;2 —— 流转和过滤器筛选，对应原 category/tree 接口
}) => {
    return service.post('/cti/1.0/cti/tree/query', params);
};

// 判断是否展示新版值班
export const switchOncall = (rgId: number) => {
    return service.get(`/cti/1.0/on/call/switch?rgId=${rgId}`);
};
