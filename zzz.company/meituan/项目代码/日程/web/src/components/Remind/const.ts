import { i18nClient } from '@sailor/i18n-web';
// 非全天-提醒控件的可选项
export const remindNotAlldayOption = [
  {
    value: '0',
    label: i18nClient.t('remind_non_reminder', '不提醒')
  },
  {
    value: 'P0Y0M0DT0H0M0S',
    label: i18nClient.t('remind_start_of_programme', '日程开始时')
  },
  {
    value: 'P0Y0M0DT0H5M0S',
    label: i18nClient.t('remind_five_minutes_before', '5分钟前')
  },
  {
    value: 'P0Y0M0DT0H10M0S',
    label: i18nClient.t('remind_ten_minutes_before', '10分钟前')
  },
  {
    value: 'P0Y0M0DT0H15M0S',
    label: i18nClient.t('remind_fifteen_minutes_before', '15分钟前')
  },
  {
    value: 'P0Y0M0DT0H30M0S',
    label: i18nClient.t('remind_thirty_minutes_before', '30分钟前')
  },
  {
    value: 'P0Y0M0DT1H0M0S',
    label: i18nClient.t('remind_one_hour_before', '1小时前')
  },
  {
    value: 'P0Y0M1DT0H0M0S',
    label: i18nClient.t('remind_one_day_before', '1天前')
  }
];

// 全天-提醒控件的可选项
export const remindAlldayOption = [
  {
    value: '0',
    label: i18nClient.t('remind_non_reminder', '不提醒')
  },
  {
    value: '1',
    label: i18nClient.t('remind_that_day', '当天（9:00）')
  },
  {
    value: '2',
    label: i18nClient.t('remind_one_day_ago', '1天前（9:00）')
  },
  {
    value: '3',
    label: i18nClient.t('remind_two_days_ago', '2天前（9:00）')
  },
  {
    value: '4',
    label: i18nClient.t('remind_one_week_ago', '1周前（9:00）')
  }
];
