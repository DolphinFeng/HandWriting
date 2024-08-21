import { i18nClient } from '@sailor/i18n-web';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import {
  checkPatternChanged,
  DEFAULT_REC_PATTERN,
  ERecurrenceType,
  IRecurrencePattern
} from '@/consts/recurrenceType';
import { messageStore } from '@/store/global';
import { remindNotAlldayOption } from '@/components/Remind/const';
import { maxRemarkNum } from '@/consts/weekly';
import { StorageService } from '@/services/storage';

// const timeZone = 'Asia/Shanghai'; //

// 判断是否编辑过
export function compare(origin, target) {
  // 比较的字段白名单
  const MEETING = 'meeting';
  const compareList = [
    'scheduleId',
    'title',
    'startTime',
    'endTime',
    'startDate',
    'endDate',
    'isAllDay',
    'location', // 地址
    MEETING,
    'noticeRule', // 提醒规则
    'deadline', // 截止时间
    'remark', // 备注
    'appKey'
  ];
  const originData = {};
  const targetData = {};
  for (const key in origin) {
    if (compareList.includes(key)) {
      if (key === MEETING) {
        originData.meetingId = origin[key] ? origin[key].id : '';
      } else {
        originData[key] = origin[key];
      }
    }
  }
  for (const key in target) {
    if (compareList.includes(key)) {
      if (key === MEETING) {
        targetData.meetingId = target[key] ? target[key].id : '';
      } else {
        targetData[key] = target[key];
      }
    }
  }

  if (
    (!origin.recurrencePattern?.type
      || origin.recurrencePattern?.type === ERecurrenceType.NONE)
    && (!target.recurrencePattern?.type
      || origin.recurrencePattern?.type === ERecurrenceType.NONE)
  ) {
    originData.deadline = '';
    targetData.deadline = '';
  }
  // 循环规则单独判断
  return isChangeRepeatRule(origin, target) || !isEqual(originData, targetData);
}

// 判断提交和编辑前的循环规则变化
export function isChangeRepeatRule(origin, target) {
  // 创建页刷新后初始数据丢失
  if (!origin || !target) {
    return false;
  }
  const originPattern: IRecurrencePattern = origin.recurrencePattern;
  const targetPattern: IRecurrencePattern = target.recurrencePattern;

  return checkPatternChanged(originPattern, targetPattern);
}

// 判断参数是否可用
export function checkParams({
  startTime,
  endTime,
  isAllDay,
  recurrencePattern,
  meeting,
  attendees,
  meetingAvaliable,
  deadline,
  remark,
  minSpan,
  maxSpan,
  dayBookLimit
}): boolean {
  const isRecurrence = recurrencePattern && recurrencePattern.type !== ERecurrenceType.NONE;

  if (
    (startTime >= endTime && !isAllDay)
    || (!!isAllDay
      && new Date(endTime).setHours(0, 0, 0, 0)
        < new Date(startTime).setHours(0, 0, 0, 0))
  ) {
    messageStore.error(
      i18nClient.t(
        'schedule_edit_end_time_earlier_start_time',
        '结束时间必须晚于开始时间'
      )
    );
    return false;
  }
  if (attendees && attendees.length > 500) {
    messageStore.error(
      i18nClient.t('schedule_edit_participants_not_exceed', '参与人不能超过500')
    );
    return false;
  }
  // if (
  //   isRecurrence
  //   && dayjs(startTime).format('YYYY-MM-DD')
  //     !== dayjs(endTime - 1000).format('YYYY-MM-DD')
  // ) {
  //   messageStore.error(
  //     i18nClient.t('schedule_edit_cannot_across_days', '循环日程不支持跨天')
  //   );
  //   return false;
  // }
  if (isRecurrence) {
    const deadlineDay = dayjs(deadline).startOf('day').valueOf();
    const twoYearDayFromStart = dayjs(startTime)
      .add(2, 'years')
      .startOf('day')
      .valueOf();
    if (deadlineDay > twoYearDayFromStart) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_most_two_years',
          '最多可设置2年循环，请修改截止日期'
        )
      );
      return false;
    }
  }
  if (meeting) {
    const today = new Date();
    if (isRecurrence) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_cannot_book_meeting_room_cycle',
          '循环日程不可预订会议室'
        )
      );
      return false;
    }
    if (isAllDay) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_cannot_book_meeting_room_all_day',
          '全天日程不可预订会议室'
        )
      );
      return false;
    }
    if (
      dayjs(startTime).format('YYYY-MM_DD')
      !== dayjs(endTime - 1000).format('YYYY-MM_DD')
    ) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_cannot_book_meeting_room_cross',
          '跨天日程不可预订会议室'
        )
      );
      return false;
    }
    // 过去时间 且不是编辑状态
    if (endTime < today.getTime()) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_cannot_book_meeting_room_ago',
          '过去时间不可预订会议室'
        )
      );
      return false;
    }
    // 超过可预订的时间
    const limitBookDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + dayBookLimit,
      0,
      0,
      0,
      0
    );
    if (startTime >= limitBookDay.getTime()) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_only_book_day_book_limit',
          '仅可预订{dayBookLimit}天内的会议室',
          { dayBookLimit }
        )
      );
      return false;
    }
    if (endTime - startTime > maxSpan * 60 * 1000) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_cannot_book_exceed',
          '超过{maxSpan}小时的日程不可预订会议室',
          { maxSpan: maxSpan / 60 }
        )
      );
      return false;
    }
    if (endTime - startTime < minSpan * 60 * 1000) {
      messageStore.error(
        i18nClient.t(
          'schedule_edit_cannot_book_less',
          '少于{minSpan}分钟的日程不可预订会议室',
          { minSpan }
        )
      );
      return false;
    }

    // 其它情况（接口验证失败）
    if (!meetingAvaliable) {
      messageStore.error(
        i18nClient.t('schedule_edit_booked_already', '会议室已被预订')
      );
      return false;
    }
  }
  if (remark && remark.length > maxRemarkNum) {
    messageStore.error(
      i18nClient.t(
        'schedule_edit_font_length_exceed',
        '备注长度不能超过5000个字符'
      )
    );
    return false;
  }

  if (
    isRecurrence
    && dayjs(deadline).startOf('day').valueOf()
      < dayjs(startTime).startOf('day').valueOf()
  ) {
    messageStore.error(
      i18nClient.t(
        'schedule_edit_end_time_not_earlier_start_time',
        '截止时间不可早于开始时间'
      )
    );
    return false;
  }
  return true;
}

// 通过时段说获取时间
export const getHourAndMinuteByQueto = (quote) => {
  const hour = parseInt(`${quote / 4}`, 10);
  const minute = parseInt(`${quote % 4}`, 10) * 15;
  return { hour, minute };
};

// 是否修改了参与人, 顺序调整不认为修改了参与人
export const handleIsEditAttendee = (origin, target) => {
  if (!Array.isArray(origin) || !Array.isArray(target)) {
    return false;
  }
  if (origin.length !== target.length) return true;

  const originUserIdArr = origin.map(item => item.empId);
  const otherUserIdArr = target.map(item => item.empId);

  for (const key in originUserIdArr) {
    if (!otherUserIdArr.includes(originUserIdArr[key])) {
      return true;
    }
  }
  return false;
};

export function checkParamsPublic({
  startTime, endTime, isAllDay, remark
}) {
  if (
    (startTime >= endTime && !isAllDay)
    || (!!isAllDay
      && new Date(endTime).setHours(0, 0, 0, 0)
        < new Date(startTime).setHours(0, 0, 0, 0))
  ) {
    messageStore.error(
      i18nClient.t(
        'schedule_edit_end_time_later_start_time',
        '结束时间必须晚于开始时间'
      )
    );
    return false;
  }
  if (remark && remark.length > maxRemarkNum) {
    messageStore.error(
      i18nClient.t(
        'schedule_edit_font_length_exceed',
        '备注长度不能超过5000个字符'
      )
    );
    return false;
  }
  return true;
}
export function comparePublic(origin, target): boolean {
  const compareList = [
    'scheduleId',
    'title',
    'startTime',
    'endTime',
    'startDate',
    'endDate',
    'isAllDay',
    'remark', // 备注
    'appKey'
  ];
  const originData = {};
  const targetData = {};
  for (const key in origin) {
    if (compareList.includes(key)) {
      originData[key] = origin[key];
    }
  }
  for (const key in target) {
    if (compareList.includes(key)) {
      targetData[key] = target[key];
    }
  }
  // 循环规则单独判断
  return !isEqual(originData, targetData);
}
// 获取编辑页的默认数据
export const getDefault = (nDxScheduleId, currentUser, nDxAppKey) => {
  return {
    scheduleId: nDxScheduleId,
    title: '',
    startTime: 0,
    endTime: 0,
    isAllDay: 0,
    location: '',
    meeting: null,
    noticeRule: remindNotAlldayOption[4].value,
    recurrencePattern: DEFAULT_REC_PATTERN,
    remark: '',
    attendees: StorageService.getItemSession('chatType') ? [] : [currentUser],
    organizer: currentUser,
    deadline: dayjs().add(6, 'months').valueOf(), // 默认半年
    hasChangeRepeatParams: false,
    recurrenceScheduleId: null,
    appKey: nDxAppKey,
    meetingAvaliable: true
  };
};
