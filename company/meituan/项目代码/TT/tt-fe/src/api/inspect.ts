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
// 获取质检工作台信息
export const getWorkSpaceInfo = () => {
    return service.get('/inspect/1.0/inspector/workspace/info');
};
// 获取质检任务管理信息
export const getTaskManagementInfo = () => {
    return service.get('/inspect/1.0/task/management/info');
};


// 二、模板相关

// 搜索模板
export const searchInspectTemplates = (params: {
    objectId: number;
    keyword?: string;
    total?: number; // 不传默认10
    objectType?: string;
}) => {
    return service.post('/inspect/1.0/get/template/by/keyword', params);
};
// 简洁版模板查询

// 三、质检任务相关（父任务）

// 筛选质检任务
export const filterInspectMainTask = (cn: number, sn: number, params?: {
    objectId?: number;
    objectType?: string;
    name?: string;
    drawAtStart?: number;
    drawAtEnd?: number;
    inspector?: string[];
    state?: string[];
}, field?: string, order?: 'ASC' | 'DESC') => {
    return service.post(`/inspect/1.0/task/query?cn=${cn}&sn=${sn}&orderField=${field || ''}&orderKind=${order || ''}`, params);
};

// 创建质检任务
export const createInspectTask = (params: {
    templateId?: number;
    objectId?: number;
    objectType?: string;
    name?: string;
    drawAt?: number;
    dueAt?: number;
    inspectorList?: string[];
    ticketFilter?: {
        state?: string[];
        assigned?: string[];
        createdAtEnd?: number;
        createdAtStart?: number;
        ctiNameList?: [{
            categoryId?: number;
            typeId?: number;
            itemId?: number;
            categoryName?: string;
            typeName?: string;
            itemName?: string;
        }]
    };
    drawType?: 'PERCENT' | 'COUNT';
    drawNumber?: number;
}) => {
    return service.post('/inspect/1.0/task/create', params);
};
// 查询质检任务
export const getInspectTask = (params: {
    taskId: number;
}) => {
    return service.get('/inspect/1.0/task', { params });
};
// 编辑质检任务
export const editInspectTask = (params: {
    templateId?: number;
    objectId?: number;
    objectType?: string;
    name?: string;
    drawAt?: number;
    dueAt?: number;
    inspectorList?: string[];
    ticketFilter?: {
        state?: string[];
        assigned?: string[];
        createdAtEnd?: number;
        createdAtStart?: number;
        ctiNameList?: [{
            categoryId?: number;
            typeId?: number;
            itemId?: number;
            categoryName?: string;
            typeName?: string;
            itemName?: string;
        }]
    };
    drawType?: 'PERCENT' | 'COUNT';
    drawNumber?: number;
}, taskId: number) => {
    return service.put(`/inspect/1.0/task/edit?taskId=${taskId}`, params);
};
// 更新质检任务状态
export const updateInspectTask = (params: {
    taskId: number;
    state: 'CANCELLED' | 'DELETED';
}) => {
    return service.post(`/inspect/1.0/task/state/update?taskId=${params.taskId}&state=${params.state}`);
};
// 下载质检任务
export const exportTask = (params: {
    taskId: number;
}) => {
    return service.get(`/inspect/1.0/export/task/result`, { params });
};

// 四、质检员子任务

// 查询父任务的所有子任务进度
export const getAllInspectorTasks = (taskId: number) => {
    return service.get(`/inspect/1.0/inspector/task/progress/getAllByTaskId?taskId=${taskId}`);
};
// 筛选质检子任务
export const filterInspectorTask = (cn: number, sn: number, params?: {
    inspectorTaskState?: string;
    taskSpaceIdList?: number[];
    taskName?: string;
    taskCreatorMisList?: string[];
    taskDrawAtStart?: number;
    taskDrawAtEnd?: number;
    taskDueAtStart?: number;
    taskDueAtEnd?: number;
}, field?: string, order?: 'ASC' | 'DESC') => {
    return service.post(`/inspect/1.0/inspector/task/list?cn=${cn}&sn=${sn}&orderField=${field || ''}&orderKind=${order || ''}`, params);
};
// 查询质检子任务详情
export const getInspectorTaskDetail = (params: {
    inspectorTaskId: number;
}) => {
    return service.get('/inspect/1.0/inspector/task/detail', { params });
};
// 提交质检子任务结果
export const submitInspectorTask = (params: {
    inspectorTaskId: number;
    reInspectorTicketId?: number; // 已提交重新质检时需要
}) => {
    return service.get(`/inspect/1.0/inspector/task/submit`, { params });
};
// 查询质检子任务所属空间列表
export const getInspectorTaskSpaceList = (params: {
    inspectorTaskState: string;
}) => {
    return service.get(`/inspect/1.0/inspector/task/object/list`, { params });
};

// 五、质检工单相关

// 筛选质检子任务工单
export const filterInspectorTicket = (cn: number, sn: number, params?: {
    inspectorTaskId?: number;
    inspectorTicketId?: number;
    inspectorTicketState?: string[];
    ticketName?: string;
    ticketAssigned?: string[];
}, field?: string, order?: 'ASC' | 'DESC') => {
    return service.post(`/inspect/1.0/inspector/ticket/list?cn=${cn}&sn=${sn}&orderField=${field || ''}&orderKind=${order || ''}`, params);
};

// 查询质检工单详情
export const getInspectorTicketDetail = (params: {
    inspectorTicketId: number;
}) => {
    return service.get('/inspect/1.0/inspector/ticket/detail', { params });
};
// 查询质检子任务中首条未质检工单详情
export const getNextUndoInspectorTicket = (params: {
    inspectorTicketId: number;
    inspectorTaskId: number;
}) => {
    return service.get(`/inspect/1.0/inspector/ticket/detail/getNextUndoTT`, { params });
};
// 查询下一条/上一条质检工单详情
export const getAroundInspectorTicket = (params: {
    inspectorTicketId: number;
    previous: boolean;
}) => {
    return service.get(`/inspect/1.0/inspector/ticket/detail/around`, { params });
};
// 查询质检子任务中首条未质检工单ID
export const getNextUndoInspectorTicketId = (params: {
    inspectorTaskId: number;
    inspectorTicketId?: number; // 指定ID时，获取指定质检ID后的下一条未质检工单ID
}) => {
    return service.get(`/inspect/1.0/inspector/ticket/id/getNextUndoTT`, { params });
};
// 保存质检工单结果
export const saveInspectorResult = (params: {
    inspectorTicketId: number;
    customFieldInfo: any[];
    systemFieldInfo: any[];
}) => {
    return service.post(`/inspect/1.0/inspector/ticket/result/save`, params);
};
