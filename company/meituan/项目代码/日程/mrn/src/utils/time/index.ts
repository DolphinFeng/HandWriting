/* eslint-disable @typescript-eslint/no-extraneous-class */
export const ONE_WEEK = ['日', '一', '二', '三', '四', '五', '六']
export const ONE_SECOND = 1000
export const ONE_MINUTE = 60 * ONE_SECOND
export const ONE_HOUR = 60 * ONE_MINUTE
export const ONE_DAY = 24 * ONE_HOUR

const QUETO = 15

export class TimeUtils {
  public static zeroize(num: number): string {
    return (String(num).length === 1 ? '0' : '') + String(num)
  }

  public static format(timestamp: number, format: string, isEndTime?: boolean): string {
    const date: Date = new Date(timestamp)

    let year: number = date.getFullYear()
    let month: number = date.getMonth() + 1
    let day: number = date.getDate()
    let week: number = date.getDay()
    const hour: number = date.getHours()
    const minute: number = date.getMinutes()
    const seconds: number = date.getSeconds()

    // 00:00 显示为前一天 24:00
    if (isEndTime && hour === 0 && minute === 0 && seconds === 0) {
      date.setDate(day - 1)
      year = date.getFullYear()
      month = date.getMonth() + 1
      day = date.getDate()
      week = date.getDay()
      return format
        .replace('YYYY', year.toString()) // 年
        .replace('yy', year.toString().slice(-2)) // 年后两位
        .replace('MM', month.toString()) // 月
        .replace('dd', day.toString()) // 日
        .replace('E', ONE_WEEK[week]) // 周几
        .replace('HH', '24') // 24小时制
        .replace('mm', '00') // 分钟
    }

    return format
      .replace('YYYY', year.toString()) // 年
      .replace('yy', year.toString().slice(-2)) // 年后两位
      .replace('MM', month.toString()) // 月
      .replace('dd', day.toString()) // 日
      .replace('E', ONE_WEEK[week]) // 周几
      .replace('HH', TimeUtils.zeroize(hour)) // 24小时制
      .replace('mm', TimeUtils.zeroize(minute)) // 分钟
  }

  public static setDate(now: Date | number = new Date(), date: Date | number = new Date()): number {
    if (typeof now === 'number') now = new Date(now)
    if (typeof date === 'number') date = new Date(date)
    now.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
    return now.getTime()
  }

  // 获取0点时间戳
  public static getToday0Time(now: Date | number = new Date()): number {
    if (typeof now === 'number') now = new Date(now)
    return new Date(now.toLocaleDateString()).getTime()
  }

  // 获取24点时间戳
  public static getToday24Time(now: Date | number = new Date()): number {
    if (typeof now === 'number') now = new Date(now)
    return new Date(now.toLocaleDateString()).getTime() + ONE_DAY
  }

  // 获取最近的下一刻钟
  public static getNextQuarterh(now: Date | number = new Date()): number {
    if (typeof now === 'number') now = new Date(now)
    return now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0)
  }

  public static getNextTime(now: Date | number = new Date(), interval: number): number {
    if (typeof now === 'number') now = new Date(now)
    return now.setTime(now.getTime() + interval)
  }

  public static getNextHour(now: Date | number = new Date(), numberOfHours: number = 1): number {
    if (typeof now === 'number') now = new Date(now)
    return now.setHours(now.getHours() + numberOfHours)
  }

  public static getNextMonth(now: Date | number = new Date(), numberOfMonths: number = 1): number {
    if (typeof now === 'number') now = new Date(now)
    return now.setMonth(now.getMonth() + numberOfMonths)
  }

  public static getNextYear(now: Date | number = new Date(), numberOfYears: number = 1): number {
    if (typeof now === 'number') now = new Date(now)
    return now.setFullYear(now.getFullYear() + numberOfYears)
  }

  // 获取指定日期的下一刻钟时间戳
  public static getQuaterMinuteMoment(timestamp?: number): number {
    const date: Date = timestamp ? new Date(timestamp) : new Date()
    const hour = date.getHours()
    const minite: number = date.getMinutes()
    // 0 15 30 45 取下一个15分钟
    const roundedUp = Math.ceil((minite + 1) / QUETO) * QUETO
    return date.setHours(hour, roundedUp, 0, 0).valueOf()
  }
}
