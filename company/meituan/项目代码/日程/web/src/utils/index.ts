/*
 * @Description: utils方法
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-28 09:58:01
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2022-12-12 11:03:08
 * @FilePath: /scheduleweb/src/utils/index.ts
 */
import dayjs from 'dayjs';

export * from './urlParams';
export * from './url';
export * from './helper';
export * from './useSelect';
export * from './log';
export * from './environment';

// 最大查看冲突详情人员的数量
export const MAX_CONFLICT_NO = 50;

// 键盘keyCode值
export const KEY_CODE = {
  ESC: 27,
  ENTER: 13
};

export function isToday(time: Date) {
  const now = new Date();
  const timeDate = time;

  return (
    timeDate.getFullYear() === now.getFullYear()
    && timeDate.getMonth() === now.getMonth()
    && timeDate.getDate() === now.getDate()
  );
}

export function isPastDay(dateObj: Date) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  if (
    dateObj.getFullYear() === year
    && dateObj.getMonth() === month
    && dateObj.getDate() === date
  ) {
    if (dateObj.getTime() === new Date(year, month, date).getTime()) {
      return true;
    }
    return false;
  }
  return dateObj.getTime() < today.getTime();
}

export function getCurrentDateObj(dateObj) {
  let currentMinute = dateObj.getMinutes() % 15 === 0
    ? dateObj.getMinutes()
    : (parseInt(`${dateObj.getMinutes() / 15}`, 10) + 1) * 15;
  let currentHour = dateObj.getHours();
  currentMinute === 60 && (currentHour += 1) && (currentMinute = 0);
  return {
    currentYear: dateObj.getFullYear(),
    currentMonth: dateObj.getMonth(),
    currentDay: dateObj.getDate(),
    currentHour,
    currentMinute,
    currentWeekDay: (dateObj.getDay() + 6) % 7
  };
}

/**
 * 只将momentByTime的年月日修改为momentByDate的年月日，不修改momentByTime的时间
 * eg: momentByTime: 2018-08-08 08:08, momentByDate: 2020-02-02 02:02, return: 2020-02-02 08:08
 * @param _dayjs
 */
export function changeDateOnly({ momentByTime, momentByDate }) {
  const dateArray = momentByDate.format('YYYY-MM-DD').split('-');
  return momentByTime.set({
    year: dateArray[0],
    month: dateArray[1] - 1,
    date: dateArray[2]
  });
}

/**
 * 获取以15分钟为单位的时间dayjs
 * @param _dayjs
 * @returns {dayjs.Dayjs}
 */
export function getQuaterMinuteMoment(_dayjs = dayjs()) {
  // 0 15 30 45 取下一个15分钟
  const roundedUp = Math.ceil((dayjs().minute() + 1) / 15) * 15;

  return _dayjs.set({
    minute: roundedUp,
    second: 0,
    millisecond: 0
  });
}

/**
 * 获取当前所在的15分钟为单位的时间dayjs
 * @param _dayjs
 * @returns {dayjs.Dayjs}
 */
export function getQuaterSubMinuteMoment(_dayjs = dayjs()) {
  const roundedUp = Math.floor(dayjs().minute() / 15) * 15;
  return _dayjs.set({
    minute: roundedUp,
    second: 0,
    millisecond: 0
  });
}

// export function isBeyondTimeRange(startTime, endTime) {
//   const TIME_RANGE_START = 7;
//   const TIME_RANGE_END = 24;
//   const startHour = new Date(startTime).getHours();
//   const endHour = new Date(endTime).getHours() || 24;
//   const endMinute = endHour === 24 ? 0 : new Date(endTime).getMinutes();
//   // , 这是老代码的判断逻辑，不敢改
//   return (
//     startHour < TIME_RANGE_START ||
//     startHour >= TIME_RANGE_END ||
//     endHour < TIME_RANGE_START ||
//     (endHour === TIME_RANGE_START && endMinute === 0) ||
//     endHour > TIME_RANGE_END ||
//     (endHour === TIME_RANGE_END && endMinute > 0)
//   );
// }

// 今天或之后
export function isSameOrAfterToday(chooseTime) {
  return dayjs(chooseTime)
    .startOf('days')
    .isSameOrAfter(dayjs().startOf('days'));
}

// limit之前
export function isBeforeLimitDay(chooseTime, dayBookLimit) {
  return dayjs(chooseTime)
    .startOf('days')
    .isBefore(dayjs().add(dayBookLimit, 'days').startOf('days'));
}

// 判断指定时间是否在限制的时间之中
export function isTimeInLimit(chooseTime, dayBookLimit) {
  return (
    isSameOrAfterToday(chooseTime) && isBeforeLimitDay(chooseTime, dayBookLimit)
  );
}

/**
 * 会议ID格式化
 */
export const formatMeetingId = (id) => {
  const code = `${id}`;
  const spaces = Math.floor(code.length / 3);
  let str = '';
  let end = 0;
  for (let i = 0; i < spaces - 1; i++) {
    str += `${code.slice(i * 3, i * 3 + 3)} `;
    end = i * 3 + 3;
  }
  return str + code.slice(end);
};

export async function copyTextToClipboard(text) {
  try {
    // 使用新版API
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // 浏览器不支持，使用execCommand兼容
    const textArea = document.createElement('textarea');
    textArea.readOnly = true;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.value = text;
    document.body.appendChild(textArea);
    const isIPhone = window.navigator.userAgent.match(/iphone/gi);
    if (isIPhone) {
      textArea.setSelectionRange(0, textArea.value.length);
    } else {
      textArea.focus();
      textArea.select();
    }
    const copyStatus = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (!copyStatus) throw Error('execCommand copy error');
  }
}

export function safeParse(str: string, defaultDatd?: any) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultDatd;
  }
}

// 解决mtd Select类组件会将tabIndex放在内部的button上无法聚焦的问题
export function initMtdTabIndex() {
  const filterWrappers = document.getElementsByClassName('mtd-select');
  Array.prototype.forEach.call(filterWrappers, (val: {
    setAttribute: (arg0: string, arg1: string) => any;
    getAttribute: (arg0: string) => any;
    childNodes: any;
  }) => {
    if (/^mtd-select/.test(val.getAttribute('class')) && val.getAttribute('tabindex') === null) {
      const item = val.childNodes[0].childNodes[0];
      if (item.getAttribute('role') === 'button') {
        item.setAttribute('tabindex', '-1');
      } else {
        val.childNodes[0].setAttribute('tabindex', '-1');
      }
    }
  });
  const cascaderWrappers = document.getElementsByClassName('mtd-cascader');
  Array.prototype.forEach.call(cascaderWrappers, (val: {
    setAttribute: (arg0: string, arg1: string) => any;
    getAttribute: (arg0: string) => any;
    childNodes: any;
  }) => {
    val.setAttribute('tabindex', '0');
  });
}
