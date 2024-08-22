import { service } from '../utils';

// 一、角色相关

// 获取当前登录人质检任务状态
export const getUserPermission = () => {
    return service.get('/inspect/1.0/user/permission');
};
// 获取空间下所有质检成员
export const getInspector = (params: {
    objectId: number;
    role?: string[]; // ["ADMIN", "INSPECTOR"]， 不填默认所有
    objectType?: string;
}) => {
    return service.post('/inspect/1.0/get/inspector', params);
};
// 添加质检成员
export const addInspector = (params: {
    nameList: string[];
    objectId: number;
    role: string;
    objectType?: string;
}) => {
    return service.post('/inspect/1.0/inspector', params);
};
// 删除质检成员
export const deleteInspector = (params: {
    nameList: string[];
    objectId: number;
    role: string;
    objectType?: string;
}) => {
    return service.delete('/inspect/1.0/inspector', { data: params });
};

// 二、模板相关

// 获取模板列表
export const getInspectTemplateList = (cn: number, sn: number, params: {
    objectId: number;
    objectType?: string;
}) => {
    return service.post(`/inspect/1.0/get/template/list?cn=${cn}&sn=${sn}`, params);
};
// 创建模板
export const createInspectTemplate = (params: {
    name: string;
    desc: string;
    objectId: number;
    field: any[];
}) => {
    return service.post('/inspect/1.0/template/create', params);
};
// 获取模板详情
export const getTemplateDetail = (params: {
    templateId: number;
    templateVersion: number;
}) => {
    return service.get('/inspect/1.0/template', { params });
};
// 编辑模板
export const editInspectTemplate = (params: {
    name: string;
    desc: string;
    objectId: number;
    field: any[];
    id: number;
    version: number;
}) => {
    return service.put('/inspect/1.0/template/edit', params);
};
// 复制模板
export const copyInspectTemplate = (
    templateId: number,
    templateVersion: number
) => {
    return service.post(`/inspect/1.0/template/copy?templateId=${templateId}&templateVersion=${templateVersion}`);
};
// 删除模板
export const deleteInspectTemplate = (params: {
    templateId: number;
    templateVersion: number;
}) => {
    return service.delete('/inspect/1.0/template/delete', { params });
};
