/*
 * @Description: 编辑页面store
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 11:37:09
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-29 15:38:08
 * @FilePath: /scheduleweb/src/pages/scheduleEdit/store/scheduleEditStore.ts
 */

import { action, computed, observable } from 'mobx';
import dayjs from 'dayjs';
import { getBookType } from '@/utils';
import { addModuleClick } from '@/services/lxService';
import { scheduleEdit, scheduleRecurrenceEdit } from '@/services/apis';
import { EApplicationsType } from '@/consts';
import ScheduleConflictPanelStore from '@/components/ScheduleConflictPanel/store';
import FormPanelStore from '../FormPanel/store';
import MeetingModalPanelStore from '../MeetingModalPanel/store';

export default class Stores {
  // 表单编辑Store
  formPanelStore = new FormPanelStore();

  // 会议室查询弹窗Store
  meetingModalPanelStore = new MeetingModalPanelStore();

  // 日程冲突Store
  scheduleConflictPanelStore = new ScheduleConflictPanelStore();

  @observable originFormPanelStore = null;

  /**
   * 更新数据
   */
  @action.bound
  setData(data: any) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  @computed
  get editTypes() {
    const { recurrenceScheduleId, hasChangeRepeatParams } = this.formPanelStore;
    if (!recurrenceScheduleId) {
      return 1; // 不是循环日程只编辑
    }
    if (hasChangeRepeatParams) {
      return 2; // 循环日程且操作过循环规则只能编辑循环日程
    }
    return 3; // 循环日程无操作循环规则，可选编辑
  }
  // 获取个人日历提交参数
  @action.bound
  getParams(chatType, chatId, pushType) {
    const {
      title,
      startTime,
      endTime,
      isAllDay,
      location,
      meeting,
      noticeRule,
      recurrencePattern,
      remark,
      attendees,
      organizer,
      deadline,
      scheduleId
    } = this.formPanelStore;
    const params = {
      title, // 日程标题
      startTime: !isAllDay
        ? dayjs(startTime)
          .set({
            second: 0,
            millisecond: 0
          })
          .valueOf()
        : dayjs(startTime).startOf('day').valueOf(), // 开始时间
      endTime: !isAllDay
        ? dayjs(endTime)
          .set({
            second: 0,
            millisecond: 0
          })
          .valueOf()
        : dayjs(endTime).add(1, 'days').startOf('day').valueOf(), // 结束时间
      isAllDay, // 是否全天日程
      location, // 地点信息
      attendees: attendees?.map(item => item.empId) || [], // 参会人大象uid
      noticeType: isAllDay ? 1 : 0, // 消息提醒的类型，0:非全天，1:全天，2:自定义（非必填）
      noticeRule, // 提醒时间规则 （ISO 8601 - 时间段表达法）
      recurrencePattern,
      deadline,
      memo: remark, // 备注长度不能超过5000个字符
      organizer: organizer && organizer.empId, // 创建人大象uid
      room: meeting,
      appKey: meeting ? EApplicationsType.Meeting : EApplicationsType.Schedule,
      bookType: getBookType(!!meeting, chatType),
      chatType,
      chatId,
      pushType // 通知参与人: 0(全部) | 1(变更的参与者 | 不通知)
    };
    // 群日程埋点
    if (chatId && !scheduleId) {
      addModuleClick('b_oa_2s67c0e5_mc');
    }
    return params;
  }
  // 获取公共日历提交参数
  @action.bound
  getParamsPublic() {
    const {
      title,
      startTime,
      endTime,
      isAllDay,
      remark,
      organizer,
      scheduleId,
      currentCalendarInfo: { calendarId },
    } = this.formPanelStore;
    const params = {
      title,
      scheduleId,
      calendarId, // 日程标题
      startTime: !isAllDay
        ? dayjs(startTime)
          .set({
            second: 0,
            millisecond: 0
          })
          .valueOf()
        : dayjs(startTime).startOf('day').valueOf(), // 开始时间
      endTime: !isAllDay
        ? dayjs(endTime)
          .set({
            second: 0,
            millisecond: 0
          })
          .valueOf()
        : dayjs(endTime).add(1, 'days').startOf('day').valueOf(), // 结束时间
      isAllDay, // 是否全天日程
      memo: remark, // 备注长度不能超过5000个字符
      organizer: organizer && organizer.empId, // 创建人大象uid
    };
    return params;
  }

  /**
   * 创建或编辑个人日历日程
   */
  @action.bound
  async scheduleEdit(chatType, chatId, pushType) {
    const { scheduleId } = this.formPanelStore;
    const { nDxScheduleId } = window;
    const params = this.getParams(chatType, chatId, pushType);
    const res = await scheduleEdit(params, scheduleId || nDxScheduleId);
    return res;
  }
  /**
   * 创建或编辑公共日历日程
   */
  @action.bound
  async scheduleEditPublic() {
    const { scheduleId } = this.formPanelStore;
    const { nDxScheduleId } = window;
    const params = this.getParamsPublic();
    const res = await scheduleEdit(params, scheduleId || nDxScheduleId);
    return res;
  }
  /**
   * 循环编辑日程
   */
  @action.bound
  async scheduleRecurrenceEdit(chatType, chatId, pushType) {
    const { scheduleId, recurrenceScheduleId } = this.formPanelStore;
    const { nDxScheduleId } = window;
    const params = this.getParams(chatType, chatId, pushType);
    const res = await scheduleRecurrenceEdit(
      params,
      recurrenceScheduleId,
      scheduleId || nDxScheduleId
    );
    return res;
  }
}
