import { typeCheck } from '@onejs/mrn-utils'
import { IRecurrenceRule } from '@src/apis/Edit/interface'
import { RecurrenceRuleText } from '@src/common/consts'
import { EFreq, EWeekDay } from '@src/common/enums'

export const getRecurrenceRuleText = (recurrenceRule: IRecurrenceRule): string => {
  if (!recurrenceRule) return ''
  const { freq, interval, byDay, byMonthDay } = recurrenceRule
  switch (freq) {
    case EFreq.DAILY:
      return `每${interval > 1 ? interval : ''}天重复`
    case EFreq.WEEKLY:
      return `每${interval > 1 ? interval : ''}周的${byDay
        .map((i: EWeekDay) => RecurrenceRuleText[i])
        .join('、')}重复`
    case EFreq.MONTHLY:
      return `每${interval > 1 ? `${interval}个` : ''}月的${byMonthDay[0]}日重复`
    default:
      return ''
  }
}

interface IEllipsisStringParams {
  text: string
  ellipsis?: string
  maxLength?: number
}

export const ellipsisString = (params: IEllipsisStringParams) => {
  const { text, maxLength = 10, ellipsis = '...' } = params
  switch (true) {
    case !typeCheck.isString(text):
      return ''
    case text.length <= maxLength:
      return text
    case text.length > maxLength:
      return text.slice(0, maxLength) + ellipsis
    default:
      return text
  }
}
