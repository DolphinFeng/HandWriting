import { action, computed, observable } from 'mobx'
//
import { EFreq, EWeekDay } from '@src/common/enums'
import { RecurrenceRuleText } from '@src/common/consts'
import { IRecurrenceRule } from '@src/apis/Edit/interface'

export interface IWeekdayOption {
  value: EWeekDay
  label: string
  checked: boolean
}

export interface ICustomRecurrenceStore {
  freq: EFreq
  interval: number
  weekdayOption: IWeekdayOption[]
  byMonthDay: number[]
  byDay: EWeekDay[]
  rule: IRecurrenceRule
  showTip: boolean
  init: (rule: IRecurrenceRule, startTime: number) => void
  setFreq: (freq: EFreq) => void
  setInterval: (interval: number) => void
  setWeekdayOptions: (option: IWeekdayOption[]) => void
  setByMonthDay: (byMonthDay: number[]) => void
  handlePressWeekday: (key: number) => void
}

export class CustomRecurrenceStore implements ICustomRecurrenceStore {
  @observable freq: EFreq

  @observable interval: number

  @observable weekdayOption: IWeekdayOption[] = []

  @observable byMonthDay: number[] = []

  @computed public get byDay(): EWeekDay[] {
    return this.weekdayOption.filter(i => i.checked).map(i => i.value)
  }

  @computed public get rule(): IRecurrenceRule {
    return {
      freq: this.freq,
      interval: this.interval,
      byDay: this.byDay,
      byMonthDay: this.byMonthDay
    }
  }

  @computed public get showTip(): boolean {
    return this.byMonthDay[0] === 29 || this.byMonthDay[0] === 30 || this.byMonthDay[0] === 31
  }

  @action public init = (rule: IRecurrenceRule, startTime: number): void => {
    const { freq, interval, byDay, byMonthDay } = rule || {}
    this.setFreq(freq || EFreq.DAILY)
    this.setInterval(interval || 1)
    this.setByMonthDay(byMonthDay || [new Date(startTime).getDate()])
    this.setWeekdayOptions(
      [
        EWeekDay.MO,
        EWeekDay.TU,
        EWeekDay.WE,
        EWeekDay.TH,
        EWeekDay.FR,
        EWeekDay.SA,
        EWeekDay.SU
      ].map((i: EWeekDay, index: number) => ({
        value: i,
        label: RecurrenceRuleText[i],
        checked: byDay ? byDay.includes(i) : new Date(startTime).getDay() === index + 1
      }))
    )
  }

  @action public setFreq = (freq: EFreq) => {
    this.freq = freq
  }

  @action public setInterval = (interval: number) => {
    this.interval = interval
  }

  @action public setWeekdayOptions = (option: IWeekdayOption[]) => {
    this.weekdayOption = option
  }

  @action public setByMonthDay = (byMonthDay: number[]) => {
    this.byMonthDay = byMonthDay
  }

  @action public handlePressWeekday = (key: number) => {
    // 只剩一个的时候不可取消
    if (this.byDay.length <= 1 && this.weekdayOption[key].checked) {
      return
    }
    this.weekdayOption[key].checked = !this.weekdayOption[key].checked
  }
}
