/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-12 18:05:30
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-08 17:55:51
 * @FilePath: /scheduleweb/src/services/apis.ts
 */

import ajax from './ajax';
import { ICheckMeetingFreeParams } from '../pages/scheduleEdit/FormPanel/store';

const prefix = '/api/v2/xm';

export * from './meeting';
export * from './groupMeeting';

// 获取员工账号
export async function getAttanceAccount(params) {
  return ajax.post(`${prefix}/meeting/dataset/account`, params);
}

// 获取城市、大厦及楼层数据
export async function getCityBuildingFloorData() {
  return ajax.get(`${prefix}/meeting/dataset/getCityBuildingAndFloor`);
}

// 获取设备列表
export async function getEquipList() {
  return ajax.get(`${prefix}/meeting/dataset/getEquips`);
}

// 获取容量列表
export async function getCapacityList() {
  return ajax.get(`${prefix}/meeting/dataset/getCapacities`);
}

// 获取会议室列表
export async function getMeetingList(params) {
  return ajax.post(`${prefix}/findFreePeriod`, params);
}

// 检查会议室是否可用
export async function checkMeetingFree(params: ICheckMeetingFreeParams) {
  return ajax.post(`${prefix}/meeting/checkConflict`, params);
}

// 创建或编辑日程
export async function scheduleEdit(params, scheduleId?: string) {
  return scheduleId
    ? ajax.put(`${prefix}/schedules/${scheduleId}`, params)
    : ajax.post(`${prefix}/schedules`, params);
}
// 编辑循环日程
export async function scheduleRecurrenceEdit(
  params,
  recurrenceScheduleId: string,
  scheduleId: string
) {
  return ajax.put(
    `${prefix}/schedules/recurrence/${recurrenceScheduleId}/currentSchedule/${scheduleId}`,
    params
  );
}

// 冲突时间判断
export async function busyRecommend(params) {
  return ajax.post(`${prefix}/schedules/conflict/busy/recommend`, params);
}

// 登录用户的会议室配置信息获取
export async function getBookRules() {
  return ajax.post(`${prefix}/getBookRules`);
}

export async function getVersion() {
  return ajax.get('/getVersion');
}

/**
 * 主日历页面
 */
// 获取登录人信息
export async function getUserInfo() {
  return ajax.get(`${prefix}/userinfo`);
}
// 获取共享给我的列表
export async function getShareToMeList() {
  return ajax.get(`${prefix}/shares/action/to-me`);
}
// 获取我共享给别人的列表
export async function getShareToOtherList() {
  return ajax.get(`${prefix}/shares/action/to-other`);
}
// 获取日程来源
export async function getApplications() {
  return ajax.get(`${prefix}/applications`);
}
// 保存我的共享日程给别人
export async function saveShareToOther(parmas: {
  shareUserId: string;
  applicationIdList: number[];
}) {
  return ajax.post(`${prefix}/shares`, parmas);
}
// 撤回邀请 - 我的共享日程给别人
export async function cancelShareToOther(id: number) {
  return ajax.put(`${prefix}/shares/${id}/status`, {
    status: 3
  });
}
// 删除共享给我的日程
export async function deleteShareToMe(id: number) {
  return ajax.delete(`${prefix}/shares/${id}`);
}
// 编辑保存我的共享日程给别人
export async function saveEditShareToOther(
  id: number,
  applicationIdList: number[]
) {
  return ajax.put(`${prefix}/shares/${id}/application`, {
    applicationIdList
  });
}
// 勾选共享人
export async function saveShareCheck(id, type?) {
  if (type === 'show') {
    return ajax.post(`${prefix}/shares/${id}/checked`);
  }
  return ajax.delete(`${prefix}/shares/${id}/checked`);
}

// 获取大象群列表
export async function group(params) {
  return ajax.post(`${prefix}/group`, params);
}

// 获取大象群成员列表
export async function groupMembers(params) {
  return ajax.post(`${prefix}/group/member`, params);
}

// 分享
export async function shareToOther(params) {
  return ajax.post(`${prefix}/schedules/share`, params);
}

export async function getADInfo() {
  return ajax({
    url: '/getADInfo',
    method: 'get',
    withErrorMessage: false
  });
}

// 公告日历勾选
export function publicCalendarsCheck(params) {
  return ajax.post(`${prefix}/calendars/check`, params);
}

// 旧ID转新ID
export function getEventIdByScheduleId(params) {
  return ajax({
    url: `${prefix}/getEventIdByScheduleId`,
    method: 'post',
    data: params,
    withErrorMessage: false
  });
}

export function getCreatableCalendars() {
  return ajax.post(`${prefix}/editorLevelCalendarsPullDown`);
}

export function getCalMainColors() {
  return ajax.get(`${prefix}/calendars/color`);
}

// 邮箱通知设置
export function getMailStatus() {
  return ajax.get(`${prefix}/setting/mail/getMailStatus`);
}

export function setMailStatus(params) {
  return ajax.post(`${prefix}/setting/mail/setMailStatus`, params);
}

// 获取用户时区接口
export async function getAttendeeTimeZone(params) {
  const data = await ajax.post(`${prefix}/setting/timeZone/getAttendeeTimeZone`, params);
  return data;
}
