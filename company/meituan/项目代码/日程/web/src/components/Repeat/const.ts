import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-12 18:05:30
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-06-15 22:25:07
 * @FilePath: /scheduleweb/src/components/Repeat/const.ts
 */

export enum ERepeatFreqOption {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum EMonthlyType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

export const repeatFreqOption = [
  {
    // 重复频率的可选项
    value: ERepeatFreqOption.DAILY,
    label: i18nClient.t('repeat_day', '天')
  },
  {
    value: ERepeatFreqOption.WEEKLY,
    label: i18nClient.t('repeat_week', '周')
  },
  {
    value: ERepeatFreqOption.MONTHLY,
    label: i18nClient.t('repeat_month', '月')
  }
];

export const repeatFreqOptions = [
  {
    // 重复频率的可选项
    value: ERepeatFreqOption.DAILY,
    label: i18nClient.t('repeat_days', '天')
  },
  {
    value: ERepeatFreqOption.WEEKLY,
    label: i18nClient.t('repeat_weeks', '周')
  },
  {
    value: ERepeatFreqOption.MONTHLY,
    label: i18nClient.t('repeat_months', '月')
  }
];


export const monthlyType = [
  {
    // 重复频率的可选项
    value: EMonthlyType.DAILY,
    label: i18nClient.t('repeat_daily', '按日期')
  },
  {
    value: EMonthlyType.WEEKLY,
    label: i18nClient.t('repeat_weekly', '按星期')
  }
];

export const weeklyDayRepeat = [
  {
    value: 'MO',
    label: i18nClient.t('repeat_monday', '周一')
  },
  {
    value: 'TU',
    label: i18nClient.t('repeat_tuesday', '周二')
  },
  {
    value: 'WE',
    label: i18nClient.t('repeat_wednesday', '周三')
  },
  {
    value: 'TH',
    label: i18nClient.t('repeat_thursday', '周四')
  },
  {
    value: 'FR',
    label: i18nClient.t('repeat_friday', '周五')
  },
  {
    value: 'SA',
    label: i18nClient.t('repeat_saturday', '周六')
  },
  {
    value: 'SU',
    label: i18nClient.t('repeat_sunday', '周日')
  }
];
