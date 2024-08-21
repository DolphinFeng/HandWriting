/* eslint-disable @typescript-eslint/restrict-plus-operands */
import dayjs from 'dayjs';
import { IMonthTime } from '../store/month';
import { MONTH_CHANGE_TYPE } from './MonthSwitch';
import { getEvents } from '@/services/monthly';

const COUNT = 2; // 一行可以显示的日程个数


// eslint-disable-next-line consistent-return
export const getChosenMonth = (type: MONTH_CHANGE_TYPE, monthTime?: IMonthTime) => {
  const { year = 0, month = 0 } = monthTime || {};
  switch (type) {
    case MONTH_CHANGE_TYPE.TODAY:
      return getCurMonth();
    case MONTH_CHANGE_TYPE.PREV:
      return getPrevMonth(year, month);
    case MONTH_CHANGE_TYPE.NEXT:
      return getNextMonth(year, month);
    default:
      break;
  }
};

export const getCurMonth = () => {
  return {
    year: dayjs().year(),
    month: dayjs().month()
  };
};

const getNextMonth = (year, month) => {
  const date = dayjs(`${year}-${month + 1}`).add(1, 'month');
  return {
    year: date.year(),
    month: date.month()// 将 month 转换为从 1 开始的数值
  };
};

const getPrevMonth = (year, month) => {
  const date = dayjs(`${year}-${month + 1}`).subtract(1, 'month');
  return {
    year: date.year(),
    month: date.month() // 将 month 转换为从 1 开始的数值
  };
};

// 基于月份获得显示的所有事件
export const getMonthDates = (monthTime) => {
  const { year, month } = monthTime;
  const daysInMonth = dayjs(`${year}-${month + 1}`).daysInMonth();
  const firstDayOfMonth = dayjs(`${year}-${month + 1}-01`).day() || 7;
  const daysInPrevMonth = dayjs(`${year}-${month + 1}-01`).subtract(1, 'month').daysInMonth();
  const calendarDays = [];
  let day = daysInPrevMonth - firstDayOfMonth + 2;
  for (let i = 0; i < firstDayOfMonth - 1; i++) {
    calendarDays.push({ year, month: month - 1, day: day++ });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ year, month, day: i });
  }
  day = 1;
  while (calendarDays.length < 42) {
    calendarDays.push({ year, month: month + 1, day: day++ });
  }
  return calendarDays;
};

// 缓存处理
const PreFetchLast = 1;
const PreFetchNext = 2;
// 初始化缓存
export function InitializeCache() {
  const cache = new Map();
  const time_arr = [];
  const current = getChosenMonth(MONTH_CHANGE_TYPE.TODAY);
  time_arr.push(current);
  let cur = current;
  for (let i = 0; i < PreFetchLast; i++) {
    cur = getChosenMonth(MONTH_CHANGE_TYPE.PREV, cur);
    time_arr.push(cur);
  }
  cur = current;
  for (let i = 0; i < PreFetchNext; i++) {
    cur = getChosenMonth(MONTH_CHANGE_TYPE.NEXT, cur);
    time_arr.push(cur);
  }
  time_arr.forEach((obj) => {
    const key = `${obj.year}-${obj.month}`;
    cache.set(key, null);
  });
  return cache;
}

export function preFetchMonth(cache, calendarSetId) {
  for (const key of cache.keys()) {
    if (!cache.get(key)) {
      cache.set(key, getEventsByMonthStr(calendarSetId, key));
    }
  }
}

function getEventsByMonthStr(calendarSetId, time_str) {
  const parts = time_str.split('-');
  const month = { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) };
  const monthDates = getMonthDates(month);
  return getEvents(
    {
      calendarSetId,
      startTime: dayjs(monthDates[0]).valueOf(),
      endTime: dayjs(monthDates[41]).add(1, 'day').valueOf() - 1
    }
  ).then((data) => {
    return data;
  });
}

// 处理日程
export const handleCalendars = (originMonthEvents, monthDates) => {
  const eventsList = preHandleCal(originMonthEvents, monthDates); // 预处理日程
  sortEvents(eventsList); // 基于优先级排序
  const eventList_ = tileEvents(eventsList); // 递推地铺平到拉平的月视图上
  return handleEventsShow(eventList_, monthDates); // 处理展示
};

// 预处理日程
const preHandleCal = (originMonthEvents, monthDates) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const eventsList = new Array(monthDates.length).fill(0).map(_ => []);
  originMonthEvents.forEach((event) => {
    const {
      startTime, endTime, applicationId, scheduleId, title, isAllDay, appKey, ownerName, isCyclic
    } = event;
    let dayStartIndex = dayjs(startTime).diff(dayjs(monthDates[0]), 'day');
    if (dayStartIndex < 0) dayStartIndex = 0;
    let dayEndIndx = dayjs(endTime - 1).diff(dayjs(monthDates[0]), 'day');
    if (dayEndIndx > 41) dayEndIndx = 41;
    const length = dayEndIndx - dayStartIndex + 1;
    dayStartIndex < monthDates.length && eventsList[dayStartIndex].push({
      scheduleId,
      title,
      startTime,
      endTime,
      length,
      dayStartIndex,
      applicationId,
      isAllDay,
      appKey,
      ownerName,
      isCyclic
    });
  });
  return eventsList;
};
// 基于优先级按天对日程进行排序
const sortEvents = (eventsPreHandled) => {
  eventsPreHandled.forEach((events) => {
    preSortedByDay(events);
  });
};

const preSortedByDay = (events) => {
  events.sort((event_a, event_b) => {
    if (event_a.length !== event_b.length) {
      return event_b.length - event_a.length;
    }
    if (event_a.startTime !== event_b.startTime) {
      return event_a.startTime - event_b.startTime;
    }
    return compareScheduleId(event_a.scheduleId, event_b.scheduleId);
  });
  return events;
};

const compareScheduleId = (scheduleId_a, scheduleId_b) => {
  const reg = /\d+/;
  return (BigInt(scheduleId_b.search(reg)) - BigInt(scheduleId_a.search(reg))) > 0;
};

// 得到拉平的月视图
export const tileEvents = (eventsSorted) => {
  const eventsShow = new Array(eventsSorted.length).fill(0).map(() => []);
  for (let index = 0; index < eventsSorted.length; index++) {
    tiileEventsbyDay(eventsSorted[index], index, eventsShow);
  }
  return eventsShow;
};

const tiileEventsbyDay = (events, dayIndex, eventsShow) => {
  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    const posIndex = (eventsShow[dayIndex].indexOf(-1) !== -1) ? eventsShow[dayIndex].indexOf(-1) : eventsShow[dayIndex].length;
    event.posIndex = posIndex;
    for (let i = 0; i < event.length; i++) {
      // 注意处理跨月的日程
      if (eventsShow[dayIndex + i]?.length < posIndex) {
        let temp = posIndex - 1;
        while (temp >= 0 && eventsShow[dayIndex + i][temp] === undefined) {
          eventsShow[dayIndex + i][temp] = -1;
          temp--;
        }
      }
      eventsShow[dayIndex + i][posIndex] = { eventInfo: event };
    }
  }
};

// 获得显示字段，包括是否展示、展示长度、是否跨周、是否在更多
const handleEventsShow = (eventsList, monthDates) => {
  for (let idx = 0; idx < eventsList.length; idx++) {
    const events = eventsList[idx];
    for (let j = 0; j < events.length; j++) {
      const event = events[j];
      if (event === -1) {
        events[j] = {
          isShow: false, showlength: 0, eventInfo: null, isRest: false
        };
      } else {
        event.isShow = isShow(event, idx, eventsList); // 展示
        [event.showLength, event.isAcrossWeek] = event.isShow ? getShowLength(event, monthDates[idx], idx) : [0, false];
        event.isRest = isRest(event, idx, eventsList);
      }
    }
  }
  return eventsList;
};

// 该日程是否展示
export const isShow = (event, index, monthEventsShow) => {
  const { eventInfo: { dayStartIndex, posIndex, length } } = event;
  const isFirstShow = dayStartIndex === index || index % 7 === 0;

  if (posIndex < COUNT - 1) {
    return isFirstShow; // 日程的开始日或者周一
  }
  if (posIndex === COUNT - 1) {
    if (dayStartIndex === index) {
      // 如果日程在第二行，需要后向的判断该日程后面的格子的日程总数是否小于count
      for (let i = 0; i < length; i++) {
        if (index + i >= monthEventsShow.length) {
          break;
        }
        if (monthEventsShow[index + i].length > COUNT) {
          return false;
        }
      }
      return true;
    }
    if (dayStartIndex !== index && index % 7 === 0) {
      return monthEventsShow[dayStartIndex][COUNT - 1].isShow;
    }
  }
  return false;
};

// 该日程是否放到更多
const isRest = (event, index, monthEventsShow) => {
  const { eventInfo: { dayStartIndex, posIndex } } = event;
  if (posIndex < COUNT - 1) return false;
  if (posIndex === COUNT - 1) {
    return !monthEventsShow[dayStartIndex][posIndex].isShow;
  }
  return true;
};

// 获得展示长度
const getShowLength = (event, date, dayIndex) => {
  const {
    eventInfo: { dayStartIndex, endTime }
  } = event;
  const thisDay = dayjs(date);
  const lastDayOfWeek = thisDay.subtract(1, 'day').endOf('week').add(1, 'day');
  const isStartDay = dayIndex === dayStartIndex;
  const endBeforeLastDay = endTime <= lastDayOfWeek;
  if (isStartDay) {
    if (endBeforeLastDay) {
      // 开始时间 - 结束时间 在一周内，直接结束时间和开始时间的差值
      return [Math.ceil(dayjs(endTime).diff(thisDay, 'day', true)), !endBeforeLastDay];
    }
    // 结束时间不在该周内，延时到最后一个格子；如果开始时间是周日 格子长度是1，不是周日，7 - 周几 + 1
    return [thisDay.day() ? 7 - thisDay.day() + 1 : 1, !endBeforeLastDay];
  }
  if (endBeforeLastDay && !dayjs(endTime).day()) {
    // 不是这周开始时间 也不是这周结束；全周都画，这个逻辑是不是不需要？？
    return [7, !endBeforeLastDay];
  }

  // 不是开始时间，这周结束，结束是周几画几个格子（结束那天是0点0分，则额外长度减1）
  // 不是开始时间，也不是这周结束，7天全画
  // eslint-disable-next-line no-nested-ternary
  return [endBeforeLastDay ? (dayjs(endTime).format('HH:mm') === '00:00' ? dayjs(endTime).day() - 1 : dayjs(endTime).day()) : 7, !endBeforeLastDay];
};
