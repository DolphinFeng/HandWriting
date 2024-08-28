import ajax, { searchAjax } from './ajax';

const bpmPrefix = '/approval/api/bpm';

const FLOW_LIST_URL = '/service/console/bpm/v2/list';
const CALLBACK_DEBUG_URL = '/service/console/bpm/v2/callback/debug';

export { FLOW_LIST_URL, CALLBACK_DEBUG_URL };
/**
 * 创建流程
 */
export async function createFlow(params) {
  return ajax.post(`/service/console/bpm/v2/create`, params);
}

export async function publishFlow(params) {
  return ajax.post(`/service/console/bpm/v2/deploy`, params);
}

export async function getFlowList(params) {
  return ajax.get(FLOW_LIST_URL, params);
}
export async function getFlowListPage(params) {
  // /service/console/bpm/v2/list/page
  return ajax.post(`${FLOW_LIST_URL}/page`, params);
}

export async function updateFlow(params) {
  return ajax.post(`/service/console/bpm/v2/update`, params);
}

export async function getSubmitList(params) {
  return ajax.post(`${bpmPrefix}/service/approval-center/bpm/list`, params);
}

export async function getFlowById(params) {
  return ajax.get(`/service/console/bpm/v2/get`, params);
}

export async function getAvatar(params) {
  return ajax.get(`${bpmPrefix}/service/user/image/fetch`, params);
}

export async function getCategory() {
  return ajax.get(`/service/console/bpm/v2/getCategory`);
}

/**
 * 选人或者部门
 */
// 获取组织架构
export async function getDeptData(id) {
  return ajax.post(`/service/console/bpm/v2/dataSet/user/visibleDepts`, {
    rootDeptId: id
  });
}

// 获取最近联系人
export async function getUserData() {
  return ajax.get(`/service/console/bpm/v2/dataSet/user/recentContacts`);
}

// 获取搜索数据
export async function getSearchData(params) {
  return searchAjax.post(
    `/service/console/bpm/v2/dataSet/search/user_dept`,
    params
  );
}
/**
 * 根据 SSO 获取用户
 */
export async function getUser() {
  return ajax.post(`${bpmPrefix}/service/bpm/workspace/userinfo`);
}

/**
 * UAC 权限控制
 */
export async function getUAC() {
  return ajax.get(`/service/console/bpm/v2/uac/menu/list`);
}

/**
 * 回调事件列表
 */
export async function getCallBackEventList() {
  return ajax.get('/service/console/bpm/v2/event/list');
}

/**
 * 回调事件列表
 */
export async function getAppKeyList(params) {
  return ajax.post('/service/console/bpm/v2/dataSet/appKey/search', params);
}
