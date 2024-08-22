import dayjs from 'dayjs';
import { IEventItem, EYesOrNo, ENow } from '../interface';

/*
 * @Description: 日历基础功能
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-11-13 19:19:17
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-03 15:22:20
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/util/utils.ts
 */

// 按天、全天、跨天分隔日程
export const splitEvents = (events: IEventItem[], weekDays: Date[]) => {
  const dayEvents = [[], [], [], [], [], [], []];
  const fullDayEvents = [];
  if (Array.isArray(weekDays) && weekDays.length === 7) {
    for (let i = 0; i < events.length; i++) {
      const item = events[i];
      const { isAllDay, isOverDay, start } = item;
      if (isAllDay === EYesOrNo.YES || isOverDay === EYesOrNo.YES) {
        fullDayEvents.push(item);
      } else {
        // 不是全天和跨天日程，把同一天日程区分出来
        const weekStartDay = dayjs(weekDays[0]).startOf('days');
        const startDay = dayjs(start).startOf('days');
        // diff 判断时间差 一点注意不是整天的问题
        const dayIndex = startDay.diff(weekStartDay, 'days');

        if (dayIndex >= 0 && dayIndex <= 6) {
          dayEvents[dayIndex].push(item);
        }
      }
    }
  }
  return {
    dayEvents,
    fullDayEvents
  };
};

// 判断选中的是今天还是今天之前、之后
export const checkSelectDay = (selectDay: Date, current: Date): ENow => {
  if (dayjs(selectDay).isBefore(current, 'days')) {
    return ENow.BEFORE;
  }
  if (dayjs(selectDay).isSame(current, 'days')) {
    return ENow.NOW;
  }
  return ENow.AFTER;
};

/**
 * 获取全天日程起始的位置和占的格子
 *
 */
const getWeekDaysIndex = (event: IEventItem, weekDays: Date[]) => {
  for (let i = 0; i < weekDays.length; i++) {
    const dayItem = dayjs(weekDays[i]);
    if (
      dayItem.isSameOrAfter(event.start, 'days')
      && dayItem.isSameOrBefore(event.end, 'days')
    ) {
      let dayLength = dayjs(event.end)
        .startOf('days')
        .diff(dayItem.startOf('days'), 'days');
      // 全天日程结束为下一天的0点 跨天非全天日程为结束当天； 所以需要给跨天非全天日程补1天
      if (event.isOverDay && !event.isAllDay) {
        if (dayjs(event.end).format('HH:mm') !== '00:00') {
          // 只有在跨天日程结束时间不是0点的时候给增加一天
          dayLength += 1;
        }
      }
      return { index: i, dayLength };
    }
  }
  return { index: -1, dayLength: -1 };
};

// 根据 是否全天，开始时间，结束时间对全天跨天日程排序
const dayItemSort = (obj0: IEventItem, obj1: IEventItem): number => {
  if (obj0.isAllDay === obj1.isAllDay) {
    if (obj0.start === obj1.start) {
      if (obj0.end === obj1.end) {
        return 0;
      }
      if (obj0.end > obj1.end) {
        return -1;
      }
      return 1;
    }
    if (obj0.start < obj1.start) {
      return -1;
    }
    return 1;
  }
  if (obj0.isAllDay) {
    return -1;
  }
  return 1;
};

// 获取改天的第一个可以的数字，作为距离顶部的位置
const getTopIndex = (usedIndex, index) => {
  const currentUsedIndex = usedIndex[index];
  let i = 0;
  while (true) {
    if (!currentUsedIndex.includes(i)) {
      break;
    }
    i++;
  }
  return i;
};

/**
 * 序列化全天日程
 */
export const splitFullDayEvents = (events: IEventItem[], weekDays: Date[]) => {
  const usedIndex = [[], [], [], [], [], [], []];
  const allDayEvents = [[], [], [], [], [], [], []];
  // 确定日程的起始天和所占的横向格子数目
  for (let i = 0; i < events.length; i++) {
    const item: IEventItem = events[i];
    const { index, dayLength } = getWeekDaysIndex(item, weekDays);
    if (index >= 0 && index < weekDays.length) {
      item.allDayIndex = index;
      item.allDayLength = dayLength;
      allDayEvents[index].push(item);
    }
  }

  // 按照优先级对每天日程进行排序
  for (let i = 0; i < allDayEvents.length; i++) {
    allDayEvents[i].sort(dayItemSort);
  }

  // 获取日程所在的纵向格子
  let maxTopIndex = 0; // 格子的最高纵向高度，觉得父容器的高度
  for (let i = 0; i < allDayEvents.length; i++) {
    const dayItem = allDayEvents[i];
    for (let j = 0; j < dayItem.length; j++) {
      const eventItem: IEventItem = dayItem[j];
      const topIndex = getTopIndex(usedIndex, i);
      eventItem.allDayTopIndex = topIndex;
      usedIndex[i].push(topIndex);
      maxTopIndex = Math.max(maxTopIndex, topIndex);
      for (
        let k = 0;
        k < eventItem.allDayLength - 1 && k + i + 1 < allDayEvents.length;
        k++
      ) {
        usedIndex[k + i + 1].push(topIndex);
      }
    }
  }
  return { maxTopIndex, allDayEvents };
};
