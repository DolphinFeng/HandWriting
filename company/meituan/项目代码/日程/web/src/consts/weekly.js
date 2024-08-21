import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description:
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-28 09:58:01
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-09-14 20:19:23
 * @FilePath: /scheduleweb/src/consts/weekly.js
 */

export const weekArray = [
  i18nClient.t('weekly_monday', '周一'),
  i18nClient.t('weekly_tuesday', '周二'),
  i18nClient.t('weekly_wednesday', '周三'),
  i18nClient.t('weekly_thursday', '周四'),
  i18nClient.t('weekly_friday', '周五'),
  i18nClient.t('weekly_saturday', '周六'),
  i18nClient.t('weekly_sunday', '周日')
];
// 周
export const weekObject = {
  0: i18nClient.t('weekly_sunday', '周日'),
  1: i18nClient.t('weekly_monday', '周一'),
  2: i18nClient.t('weekly_tuesday', '周二'),
  3: i18nClient.t('weekly_wednesday', '周三'),
  4: i18nClient.t('weekly_thursday', '周四'),
  5: i18nClient.t('weekly_friday', '周五'),
  6: i18nClient.t('weekly_saturday', '周六'),
};

export const maxConflictBlockNum = 14;

export const offsetTop = { normal: 174, lower: 75 };

export const distance = 4; // 详情面板与日程块的间距

export const detailWidth = 336; // 详情面板的宽度

export const maxRemarkNum = 5000; // 备注字数上限

export const timeConstant = {
  beginTime: 0,
  endTime: 24,
  timeStep: 15
};

export const ATTENDANCE_TYPE_TO_CLS = {
  1: 'salary', // 发薪日
  2: 'rest', // 法定假日
  3: 'rest', // 法定假日休息日
  4: 'work' // 周末上班日
};

// 接受 暂定 拒绝
/**
 *日程反馈类型
 */
export const FEEDBACK_TYPE = {
  all: -1,
  default: 0,
  accept: 1,
  tentative: 2,
  refuse: 3
};
