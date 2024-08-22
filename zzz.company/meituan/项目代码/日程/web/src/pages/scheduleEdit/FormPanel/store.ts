/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-15 10:52:36
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-08 14:41:49
 * @FilePath: /scheduleweb/src/pages/scheduleEdit/FormPanel/store.ts
 */

import { observable, action } from 'mobx';
import dayjs from 'dayjs';
import { getQuaterMinuteMoment } from '@/utils';
import { remindNotAlldayOption } from '@/components/Remind/const';
import { checkMeetingFree } from '@/services/apis';
import { DEFAULT_REC_PATTERN, IRecurrencePattern } from '@/consts/recurrenceType';

export interface ICheckMeetingFreeParams {
  roomId: string; // 会议室ID
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  scheduleId?: string;
}
export interface ICalendarInfo {
  calendarId: number; // 日历ID
  summary: string; // 日历描述
  type: 'PUBLIC' | 'PRIVATE'; // 日历类型 PUBLIC or PRIVATE
  color: string;
}
const defaultPersonalCalendarInfo = {
  calendarId: -1,
  summary: ' ',
  type: 'PRIVATE',
};
const defaultPulicCalendarInfo = {
  calendarId: -2,
  summary: ' ',
  type: 'PUBLIC',
};
/**
 * 表单Store
 */
export default class FormPanelStore {
  // 日历信息
  @observable currentCalendarInfo = defaultPersonalCalendarInfo;
  @observable creatableCalendarsInfo: ICalendarInfo[] = [];
  // @observable creatbleCalendarsInfo = [{ calendarId: 1, summary: '个人日历', type: 'PRIVATE' }];

  // 可选择的日历信息
  // @observable

  // 日程ID
  @observable scheduleId = null;

  // 循环日程ID
  @observable recurrenceScheduleId = null;

  // 标题
  @observable title = '';

  // 初始store时候以15分钟为时间点，防止出现不是15分钟的时间
  // 开始时间
  @observable startTime = dayjs(getQuaterMinuteMoment()).valueOf();

  // 结束时间
  @observable endTime = dayjs(this.startTime).add(1, 'hour').valueOf();

  // 是否全天
  @observable isAllDay = 0;

  // 地址信息
  @observable location = '';

  // 选择会议室弹窗
  @observable meetingModelShow = false;

  // 会议室信息
  @observable meeting = null;

  // 提醒规则
  @observable noticeRule = remindNotAlldayOption[4].value;

  // 循环规则
  @observable recurrencePattern: IRecurrencePattern = DEFAULT_REC_PATTERN;

  // 备注
  @observable remark = '';

  // 参与者
  @observable attendees = [];

  // 组织者
  @observable organizer = null;

  // 截止时间
  @observable deadline = new Date().getTime();

  // 时候修改关于循环的参数
  @observable hasChangeRepeatParams = false;

  @observable appKey: string = null;

  // 当前状态会议室是否可用
  @observable meetingAvaliable = true;

  @observable requestDetailFail = false;

  /**
   * 更新数据
   */
  @action.bound
  setData(data: any) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  @action
  removePerson = (empId) => {
    const pIndex = this.attendees.findIndex(item => item.empId === empId);
    if (pIndex >= 0) {
      this.attendees.splice(pIndex, 1);
      // 触发更新
      this.attendees = [...this.attendees];
    }
  };

  /**
   * 检查会议室是否可用
   */
  @action.bound
  // eslint-disable-next-line class-methods-use-this
  async checkMeetingFree(params: ICheckMeetingFreeParams) {
    return checkMeetingFree(params);
  }

  // 获取默认值
  @action
  getDefaultData = (currentUser, isPublicCalendar) => ({
    scheduleId: null,
    title: '',
    startTime: 0,
    endTime: 0,
    isAllDay: 0,
    location: '',
    meeting: null,
    noticeRule: remindNotAlldayOption[4].value,
    remark: '',
    attendees: [currentUser],
    organizer: currentUser,
    deadline: dayjs().add(6, 'months').valueOf(), // 默认半年
    hasChangeRepeatParams: false,
    recurrenceScheduleId: null,
    appKey: null,
    meetingAvaliable: true,
    recurrencePattern: DEFAULT_REC_PATTERN,
    currentCalendarInfo: isPublicCalendar ? defaultPulicCalendarInfo : defaultPersonalCalendarInfo,
  });
}
