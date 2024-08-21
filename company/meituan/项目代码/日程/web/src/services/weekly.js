/*
 * @Description: 周视图接口
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-09 10:47:03
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-15 18:04:03
 * @FilePath: /scheduleweb/src/services/weekly.js
 */
import ajax from './ajax';
import { addResError } from '@/utils';

/**
 * 获取登录人信息
 */
export async function getUserInfo() {
  return ajax.get('/api/v2/xm/userinfo');
}

/**
 *
 * @param {*} params
 * 获取考勤系统日期状态
 */
export async function getAttendances(params) {
  return ajax.get('/api/v2/xm/attendances', params);
}

/**
 * 获取指定区间日程视图日程数据
 * @param {*} params
 */
export async function getCalendars(params) {
  if (params?.mtUserIds?.length === 0 || params?.appKeyList?.length === 0) {
    addResError('初始化获取日程列表无用户或无应用', '获取列表参数不符合预期', params);
    return Promise.resolve([]);
  }
  return ajax.get('/api/v2/xm/calendars', params);
}

/**
 * 获取列表日程的所有日程详情
 * 暂时下线后续再上线
 * @param {*} params
 */
export async function getSchedulesDetailList(params) {
  return ajax({
    url: '/api/v2/xm/schedules/scheduleIds',
    method: 'post',
    data: params,
    withErrorMessage: false
  });
}

/**
 * 获取关联日程应用列表
 * @param {*} params
 */
export async function getApplications() {
  return ajax.get('/api/v2/xm/applications');
}

/**
 * 获取日程详情接口
 * @param {*} params
 */
export async function getSchedules(scheduleId, calendarId, appKey, empId) {
  const params = {
    appKey,
    calendarId,
    extension: appKey === 'exchange' ? 'e' : '',
    empId
  };
  return ajax.get(`/api/v2/xm/schedules/${scheduleId}`, params);
}
/**
 * 获取日程详情PC接口
 * @param {*} params
 */
export async function getPcSchedules({
  scheduleId, calendarId, empId, eventId, appKey
}) {
  let url = `/api/v2/xm/calendars/detail?scheduleId=${scheduleId}`;
  if (calendarId) url = `${url}&calendarId=${calendarId}`;
  if (empId) url = `${url}&empId=${empId}`;
  if (eventId) url = `${url}&eventId=${eventId}`;
  if (appKey) url = `${url}&appKey=${appKey}`;
  return ajax({
    url,
    method: 'get',
    withErrorMessage: false
  });
}

/**
 * 获取日程反馈统计
 */
export async function getScheduleCount(scheduleId, appKey, empId) {
  const params = {
    appKey,
    extension: appKey === 'exchange' ? 'e' : '',
    empId
  };
  return ajax.get(`/api/v2/xm/schedules/feedback/${scheduleId}/count`, params);
}

/**
 * 反馈日程
 */
export async function feedbackScheule(params) {
  return ajax.post(
    `/api/v2/xm/schedules/feedback/${params.scheduleId}`,
    { ...params, extension: params.appKey === 'exchange' ? 'e' : '' },
    { withMessage: false }
  );
}

/**
 * 反馈循环日程
 */
export async function feedbackCycleScheule(params) {
  return ajax.post(
    `/api/v2/xm/schedules/feedback/recurrence/${params.recurrenceScheduleId}/currentSchedule/${params.scheduleId}`,
    { ...params, extension: params.appKey === 'exchange' ? 'e' : '' },
    { withMessage: false }
  );
}

/**
 * 取消日程
 */
export async function deleteScheule(params) {
  const data = {
    cancellationReason: params.reason
  };
  return ajax.delete(`/api/v2/xm/schedules/${params.scheduleId}`, data, {
    withMessage: false
  });
}

/**
 * 取消循环日程
 */
export async function deleteCycleScheule(params) {
  const data = {
    cancellationReason: params.reason
  };
  return ajax.delete(
    `/api/v2/xm/schedules/recurrence/${params.recurrenceScheduleId}/currentSchedule/${params.scheduleId}`,
    data,
    {
      withMessage: false
    }
  );
}

/**
 * 获取详情冲突人员列表
 *
 */
export async function getScheduleConflicts(scheduleId, params) {
  return ajax.post(
    `/api/v2/xm/schedules/${scheduleId}/detail/conflicts`,
    params
  );
}

/**
 * 添加参会者
 *
 */
export async function addAttendances(scheduleId, params) {
  return ajax.post(`/api/v2/xm/schedules/attendances/${scheduleId}`, params);
}

/**
 * 循环添加参会者
 */
export async function addCycleAttendances(
  scheduleId,
  recurrenceScheduleId,
  params
) {
  return ajax.post(
    `/api/v2/xm/schedules/attendances/recurrence/${recurrenceScheduleId}/currentSchedule/${scheduleId}`,
    params
  );
}
