import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 日历const值
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-11-12 11:07:24
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-16 19:53:16
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/const.ts
 */
export const HOUR_HEIGHT = 48;

export const weekArray = [
  i18nClient.t('calendar_table_monday', '周一'),
  i18nClient.t('calendar_table_tuesday', '周二'),
  i18nClient.t('calendar_table_wednesday', '周三'),
  i18nClient.t('calendar_table_thursday', '周四'),
  i18nClient.t('calendar_table_friday', '周五'),
  i18nClient.t('calendar_table_saturday', '周六'),
  i18nClient.t('calendar_table_sunday', '周日')
];
