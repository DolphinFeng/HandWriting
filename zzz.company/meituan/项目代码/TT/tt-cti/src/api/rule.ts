import { service } from '../utils';
// /rule 转发标识
// 触发器列表
export const getTriggerList = (params: {
    name?: string;
    scene?: string;
    sceneId?: number;
    cn?: number;
    sn?: number;
}) => {
    return service.get('/rule/1.0/trigger/list', { params });
};
// 触发器开关
export const triggerSwitch = (ruleId: number, active: boolean) => {
    return service.put(`/rule/1.0/trigger/control/${ruleId}?active=${active}`);
};
// 复制触发器
export const copyTrigger = (ruleId: number) => {
    return service.post(`/rule/1.0/trigger/copy/${ruleId}`);
};
// 删除触发器
export const deleteTrigger = (ruleId: number) => {
    return service.delete(`/rule/1.0/trigger/del/${ruleId}`);
};
// 创建触发器
export const createTrigger = (params: CommonTypes.triggerForm) => {
    return service.post('/rule/1.0/trigger/add', params);
};
// 更新触发器
export const updateTrigger = (id: number, params: CommonTypes.triggerForm) => {
    return service.put(`/rule/1.0/trigger/update/${id}`, params);
};
// 获取触发器详情
export const getTriggerDetail = (id: number) => {
    return service.get(`/rule/1.0/trigger/detail/${id}`);
};
// 搜索组织架构
export const searchOrg = (name: string) => {
    return service.get(`/rule/1.0/org/search?name=${name}`);
};
// 获取某组织架构详情
export const getOrgDetail = (id: number) => {
    return service.get(`/rule/1.0/org/detail?orgId=${id}`);
};
// 触发器排序
export const triggerSort = (param: CommonTypes.triggerSort) => {
    return service.post('/rule/1.0/trigger/list/sort', param);
};
