/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-11-12 20:00:49
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-13 18:03:18
 * @FilePath: /scheduleweb/src/pages/newWeekly/calendarUtils.ts
 */
// 获取指定时间的所在周列表
import dayjs from 'dayjs';
import { ATTENDANCE_TYPE_TO_CLS } from '@/consts/weekly';

export const getCalendarWeek = (target?: Date): Date[] => {
  const currentTime: Date = target || new Date();
  const year: number = currentTime.getFullYear();
  const month: number = currentTime.getMonth();
  const dateArr: Date[] = [];

  const curWeekDay: number = (currentTime.getDay() + 6) % 7;
  const curDate: number = currentTime.getDate();

  let i = 0;
  while (i < 7) {
    dateArr.push(new Date(year, month, curDate - curWeekDay + i, 0, 0, 0));
    i++;
  }
  return dateArr;
};


export const setAttendances = (data, start, end) => {
  const attendances = new Array(7).fill('');
  if (data && data.length) {
    data.forEach((item) => {
      // 不处理预期外的考勤类型
      if (!ATTENDANCE_TYPE_TO_CLS[item.type]) {
        return;
      }
      // 不是本周数据
      if (item.day < start || item.day > end) {
        return;
      }
      // moment有三个方法获取工作日,day/ weekday/ ISOweekday，本地时用day
      const weekday = dayjs(item.day).day();
      item.weekday = weekday;

      // 1-6代表周一到周六，放到数组的0-5索引；0代表周天，放到数据的6索引
      if (weekday === 0) {
        attendances[6] = ATTENDANCE_TYPE_TO_CLS[item.type];
      } else {
        attendances[weekday - 1] = ATTENDANCE_TYPE_TO_CLS[item.type];
      }
    });
  }
  return attendances;
};
