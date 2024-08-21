/*
 * @Description: 日历组件接口文件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-11-12 17:16:05
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-01 20:52:31
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/interface.ts
 */
export enum EYesOrNo {
  NO = 0,
  YES = 1
}

export enum ENow {
  BEFORE = 0,
  NOW = 1,
  AFTER = 2
}
/**
 * id 事件id,注意不是唯一和ownerId组合才是唯一
 * start 和 end 开始和结束时间戳
 * title 事件的标题
 * isAllDay 全天日程
 * isOverDay 跨天日程
 * ownerId 事件归属人的id
 * color 事件的颜色 不同归属人显示不同的颜色
 */

export interface IEventColors {
  backgroundColor: string;
  fontColor: string;
  focusColor: string;
}
export interface IEventItem {
  id: string;
  start: number;
  end: number;
  duration: number;
  title: string;
  isAllDay: EYesOrNo;
  isOverDay: EYesOrNo;
  ownerId?: string;
  ownerName?: string;
  ownerEnname?: string;
  color?: IEventColors;
  top?: number;
  bottom?: number;
  level?: number;
  backwardCoord?: number;
  forwardCoord?: number;
  forwardPressure?: number;
  allDayIndex?: number; // 全天区域开始
  allDayLength?: number; // 全天区域块长度
  allDayTopIndex?: number; // 全天区域块距离上边的个数
  applicationId?: number; // 日历
}
