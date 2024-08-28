import ajax from './ajax';

const thirdTripartitePrefix = '/api/proc/third-approval';

export async function getFlowById(params) {
  return ajax.get(`${thirdTripartitePrefix}/get`, params);
}

// 创建三方审批
export async function createFlow(params) {
  return ajax.post(`${thirdTripartitePrefix}/create`, params);
}

// 更新三方审批
export async function updateFlow(params) {
  return ajax.post(`${thirdTripartitePrefix}/update`, params);
}

/**
 * 获取三方审批列表
 */
export async function getTripartiteSubmitList(params) {
  return ajax.post(`${thirdTripartitePrefix}/list`, params);
}
