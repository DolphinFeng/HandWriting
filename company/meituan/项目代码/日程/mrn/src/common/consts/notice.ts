import { EAllDayNoticeRule, ENoticeRule } from '@src/common/enums'

export const NoticeTimeText = {
  [EAllDayNoticeRule.不提醒]: '不提醒',
  [EAllDayNoticeRule['当天9:00']]: '当天9:00',
  [EAllDayNoticeRule['1天前9:00']]: '1天前9:00',
  [EAllDayNoticeRule['2天前9:00']]: '2天前9:00',
  [EAllDayNoticeRule['1周前9:00']]: '1周前9:00',
  [ENoticeRule.日程开始时]: '日程开始时',
  [ENoticeRule['5分钟前']]: '5分钟前',
  [ENoticeRule['10分钟前']]: '10分钟前',
  [ENoticeRule['15分钟前']]: '15分钟前',
  [ENoticeRule['30分钟前']]: '30分钟前',
  [ENoticeRule['1小时前']]: '1小时前',
  [ENoticeRule['1天前']]: '1天前'
}

export const NoticeText = {
  [EAllDayNoticeRule.不提醒]: '不提醒',
  [EAllDayNoticeRule['当天9:00']]: '当天9:00提醒',
  [EAllDayNoticeRule['1天前9:00']]: '1天前9:00提醒',
  [EAllDayNoticeRule['2天前9:00']]: '2天前9:00提醒',
  [EAllDayNoticeRule['1周前9:00']]: '1周前9:00提醒',
  [ENoticeRule.日程开始时]: '日程开始时提醒',
  [ENoticeRule['5分钟前']]: '5分钟前提醒',
  [ENoticeRule['10分钟前']]: '10分钟前提醒',
  [ENoticeRule['15分钟前']]: '15分钟前提醒',
  [ENoticeRule['30分钟前']]: '30分钟前提醒',
  [ENoticeRule['1小时前']]: '1小时前提醒',
  [ENoticeRule['1天前']]: '1天前提醒'
}
