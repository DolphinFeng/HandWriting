import { service } from '../utils';
// 新建空间
export const addSpace = (params: {
    name: string;
    spaceType?: number;
    orgId: number;
    accessLink?: string;
    accessLinkPrefix?: string;
}) => {
    return service.post('/cti/1.0/space', params);
};
// 编辑空间
export const editSpace = (params: {
    id: number;
    name: string;
    orgId: number;
}) => {
    return service.put('/cti/1.0/space', params);
};
// 查看空间详情
export const getSpaceDetail = (spaceId: number) => {
    return service.get(`/cti/1.0/space/${spaceId}`);
};
// 查询有权限管理的空间
export const getMySpace = (params?: {
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/user/auth/space/list', { params });
};
// 空间管理员
export const addSpaceAdmin = (params: {
    spaceId: number;
    usernames: string[];
}) => {
    return service.post(`/cti/1.0/space/${params.spaceId}/admin`, params);
};
// 删除空间管理员
export const deleteSpaceAdmin = (spaceId: number, misId: number) => {
    return service.delete(`/cti/1.0/space/${spaceId}/admin/${misId}`);
};
// 获取空间成员列表
export const getSpaceAdmin = (spaceId: number, params?: {
    cn?: number;
    sn?: number;
}) => {
    return service.get(`/cti/1.0/space/${spaceId}/user`, { params });
};
// 获取空间下RG列表
export const getSpaceRg = (params?: {
    spaceId: number;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/space/rg/list', { params });
};
// 新建空间RG并绑定
export const addSpaceRg = (params: {
    spaceId: number;
    name: string;
    owner: string;
    description?: string;
    icon?: string;
}) => {
    return service.post('/cti/1.0/space/rg/add', params);
};
// 空间绑定Rg
export const bindSpaceRg = (params: {
    rgId: number;
    spaceId: number;
}) => {
    return service.put('/cti/1.0/space/rg/bind', params);
};
// 从空间移除RG
export const removeSpaceRg = (rgId: number) => {
    return service.delete(`/cti/1.0/space/rg/${rgId}/remove`);
};
// 问题归档
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
    inUse?: boolean;
}) => {
    return service.put('/cti/1.0/archive/update', params);
};
// 问题归档启用
export const spaceFileActive = (spaceId: number, active: boolean) => {
    return service.get(`/cti/1.0/space/archive/switch?spaceId=${spaceId}&active=${active}`);
};
// 获取归档设置
export const getSpaceFileSetting = (spaceId: number) => {
    return service.get(`/cti/1.0/space/archive/info?spaceId=${spaceId}`);
};
// 根据父节点获取子节点
export const getNodesByParent = (parentId: number) => {
    return service.get(`/cti/1.0/archive/list?parentId=${parentId}`);
};
// 获取空间模板列表
export const getSpaceTemplate = (params: {
    spaceId: number;
    type: 'CUSTOM' | 'NORMAL';
    cn?: number;
    sn?: number;
}) => {
    return service.get('/cti/1.0/space/template/list', { params });
};
// 设置空间默认模板
export const setDefaultTemplate = (params: {
    spaceId: number;
    templateId: number;
    type: 'CUSTOM' | 'NORMAL';
}) => {
    return service.put('/cti/1.0/space/template/setting', params);
};
export const getSpacePermission = () => {
    return service.get('/cti/1.0/user/space/permission');
};
// 获取空间下一级目录列表
export const getSpaceCategoryList = (params: {
    spaceId?: number;
    domain?: string;
    states?: number | number[];
}) => {
    return service.get('/cti/1.0/category/list/space', { params });
};
export const getSpaceCatalogTree = (params: {
    spaceId?: number;
    domain?: string;
    states?: number[] | number;
}) => {
    return service.get('/cti/1.0/cti/tree/all', { params });
};
// 获取指定空间下有权限的目录（支持逐级加载）
export const getAuthSpaceCti = (domain: string, CtiTreeQueryDTO: {
    categoryIds?: number[];
    typeIds?: number[];
    itemIds?: number[];
    createScene: boolean; // 是：创建场景；否：流转场景
    categoryCreate?: boolean; // 是否一级目录发起
    typeOrItemCreate?: boolean; // 是否二三级目录发起
    filterByAuth?: boolean; // 是否返回无权限数据
    queryAllChild?: boolean; // 是否返回完整三级目录
}, isMainSpace?: boolean) => {
    return service.post(`/cti/1.0/cti/tree/layer?domain=${domain}&isMainSpace=${isMainSpace}&spaceId=`, CtiTreeQueryDTO);
};
