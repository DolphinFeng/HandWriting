import { service } from '../utils';
// 获取空间模板
export const getSpaceTemplate = (params: {
    spaceId?: number,
    domain?: string,
    type: string,
    cn?: number,
    sn?: number
}) => {
    return service.get('/cti/1.0/space/template/list', { params });
};
// 获取指定空间下的三级tree（用于发起TT）
export const getSpaceCti = (params?: {
    spaceId?: number
    domain?: string
    isFilterTicket?: boolean
}) => {
    return service.get('/cti/1.0/cti/tree?states=1', { params });
};
// 获取指定空间下有权限的目录（支持逐级加载）
export const getAuthSpaceCti = (domain: string, CtiTreeQueryDTO: {
    categoryIds?: number[],
    typeIds?: number[],
    itemIds?: number[],
    createScene: boolean, // 是：创建场景；否：流转场景
    categoryCreate?: boolean, // 是否一级目录发起
    typeOrItemCreate?: boolean // 是否二三级目录发起
}, isMainSpace?: boolean) => {
    return service.post(`/cti/1.0/cti/tree/layer?domain=${domain}&isMainSpace=${isMainSpace}&spaceId=`, CtiTreeQueryDTO);
};
// 查询有权限管理的空间
export const getMySpace = (params?: {
    cn?: number,
    sn?: number
}) => {
    return service.get('/cti/1.0/user/auth/space/list', { params });
};
// 获取空间下的目录版本号
export const getSpaceCtiVersion = (params?: {
    spaceId?: number,
    domain?: string
}) => {
    return service.get('/cti/1.0/cti/tree/version?states=1', { params });
};
