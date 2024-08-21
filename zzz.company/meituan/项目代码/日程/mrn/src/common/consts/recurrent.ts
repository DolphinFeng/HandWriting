import { EFreq, ERecurrenceType, EWeekDay } from '@src/common/enums'

export const RecurrenceTypeText = {
  [ERecurrenceType.NONE]: '不重复',
  [ERecurrenceType.EVERY_DAY]: '每天',
  [ERecurrenceType.WEEKLY]: '每周',
  [ERecurrenceType.PER_MONTH]: '每月',
  [ERecurrenceType.CUSTOMIZED]: '自定义'
}

// 循环频率
export const RecurrentFreq = {
  [EFreq.DAILY]: '天',
  [EFreq.WEEKLY]: '周',
  [EFreq.MONTHLY]: '月'
}

export const RecurrenceRuleText = {
  [EWeekDay.MO]: '周一',
  [EWeekDay.TU]: '周二',
  [EWeekDay.WE]: '周三',
  [EWeekDay.TH]: '周四',
  [EWeekDay.FR]: '周五',
  [EWeekDay.SA]: '周六',
  [EWeekDay.SU]: '周日'
}
