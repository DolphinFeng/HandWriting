/*
 * @Description: 会议室接口
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-12 18:05:30
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2022-12-29 11:29:13
 * @FilePath: /scheduleweb/src/services/meeting.ts
 */

import ajax from './ajax';

const prefix = '/api/v2/xm';

// 获取会议室列表账号
export async function findRoom(params) {
  return ajax.post(`${prefix}/meeting/findRoom`, params);
}

// 获取会议室会议列表
export async function schedulesBooked(params) {
  return ajax.post(`${prefix}/schedules/booked`, params);
}

// 转让会议室
export async function meetingTransfer(params) {
  return ajax.post(`${prefix}/meeting/transfer`, params);
}

// 释放会议室
export async function meetingRelease(params) {
  return ajax.post(`${prefix}/meeting/release`, params);
}

// 获取公告信息
export async function getNotification() {
  return ajax.get(`${prefix}/getNotification`);
}
