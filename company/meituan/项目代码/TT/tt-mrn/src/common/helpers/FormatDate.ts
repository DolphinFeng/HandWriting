import dayjsWithTimeZone from './moment';

export function formatDate(timestamp: number, format: string = 'YYYY/MM/DD HH:mm') {
  if (!timestamp) {
    return '';
  }
  return dayjsWithTimeZone(timestamp).format(format);
}

export function formatDateWithoutCentury(dateString) {
  // 假设 dateString 的格式为 "2024/05/14 03:39"
  const parts = dateString.split('/');
  const year = parts[0];
  const yearWithoutCentury = year.slice(-2); // 取年份的后两位
  parts[0] = yearWithoutCentury;
  return parts.join('/');
}

// 精确到秒
export function formatDateSeconds(time: number, type?: 'default' | 'noYear') {
  if (time === null || time === undefined) {
    return '';
  }
  const date = dayjsWithTimeZone(time);
  const format = type === 'noYear' ? 'MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss';
  return date.format(format);
}

// 精确到毫秒
export function formatDateMilliSeconds(time: number) {
  const dates = new Date(time)
  // 年份
  const Year: number = dates.getFullYear()

  // 月份下标是0-11
  const Months: any =
    dates.getMonth() + 1 < 10
      ? '0' + (dates.getMonth() + 1)
      : dates.getMonth() + 1

  // 具体的天数
  const Day: any =
    dates.getDate() < 10 ? '0' + dates.getDate() : dates.getDate()

  // 小时
  const Hours =
    dates.getHours() < 10 ? '0' + dates.getHours() : dates.getHours()

  // 分钟
  const Minutes =
    dates.getMinutes() < 10 ? '0' + dates.getMinutes() : dates.getMinutes()

  // 秒
  const Seconds =
    dates.getSeconds() < 10 ? '0' + dates.getSeconds() : dates.getSeconds()

  const Milliseconds = dates.getMilliseconds()

  // 返回数据格式
  return (
    Year +
    '-' +
    Months +
    '-' +
    Day +
    ' ' +
    Hours +
    ':' +
    Minutes +
    ':' +
    Seconds +
    '.' +
    Milliseconds
  )
}

export function formatDate2(timestamp: number, format: string = 'MM-DD HH:mm') {
  if (!timestamp) {
      return '-';
  }
  return dayjsWithTimeZone(timestamp).format(format);
}

export function formatDate3(time: number) {
  const dates = new Date(time)

  // 年份
  const Year: number = dates.getFullYear()

  // 月份下标是0-11
  const Months: any =
    dates.getMonth() + 1 < 10
      ? '0' + (dates.getMonth() + 1)
      : dates.getMonth() + 1

  // 具体的天数
  const Day: any =
    dates.getDate() < 10 ? '0' + dates.getDate() : dates.getDate()

  // 返回数据格式
  return Year + '-' + Months + '-' + Day
}

export function formatDate4(time?: Date) {
  if (time === null || time === undefined) {
    return null
  }

  const dates = time

  // 月份下标是0-11
  const Months: any =
    dates.getMonth() + 1 < 10
      ? '0' + (dates.getMonth() + 1)
      : dates.getMonth() + 1

  // 具体的天数
  const Day: any =
    dates.getDate() < 10 ? '0' + dates.getDate() : dates.getDate()

  // 小时
  const Hours =
    dates.getHours() < 10 ? '0' + dates.getHours() : dates.getHours()

  // 分钟
  const Minutes =
    dates.getMinutes() < 10 ? '0' + dates.getMinutes() : dates.getMinutes()

  // 秒
  const Seconds =
    dates.getSeconds() < 10 ? '0' + dates.getSeconds() : dates.getSeconds()

  // 返回数据格式
  return Months + '-' + Day + ' ' + Hours + ':' + Minutes
}

export function formatDate5(dates: Date) {
  // 年份
  const Year: number = dates.getFullYear()

  // 月份下标是0-11
  const Months: any =
    dates.getMonth() + 1 < 10
      ? '0' + (dates.getMonth() + 1)
      : dates.getMonth() + 1

  // 具体的天数
  const Day: any =
    dates.getDate() < 10 ? '0' + dates.getDate() : dates.getDate()

  // 小时
  const Hours =
    dates.getHours() < 10 ? '0' + dates.getHours() : dates.getHours()

  // 分钟
  const Minutes =
    dates.getMinutes() < 10 ? '0' + dates.getMinutes() : dates.getMinutes()

  // 秒
  const Seconds =
    dates.getSeconds() < 10 ? '0' + dates.getSeconds() : dates.getSeconds()

  // 返回数据格式
  return Year + '-' + Months + '-' + Day + ' ' + Hours + ':' + Minutes
}

// 月-日
export function formatDate6(time: number) {
  if (time === null || time === undefined) {
    return null
  }

  const dates = new Date(time)

  // 年份
  const Year: number = dates.getFullYear()

  // 月份下标是0-11
  const Months: any =
    dates.getMonth() + 1 < 10
      ? '0' + (dates.getMonth() + 1)
      : dates.getMonth() + 1

  // 具体的天数
  const Day: any =
    dates.getDate() < 10 ? '0' + dates.getDate() : dates.getDate()

  // 返回数据格式
  return Months + '-' + Day
}

// 完整的y-m-d-h-m-s
export function formatDate7(dates: Date) {
  // 年份
  const Year: number = dates.getFullYear()

  // 月份下标是0-11
  const Months: any =
    dates.getMonth() + 1 < 10
      ? '0' + (dates.getMonth() + 1)
      : dates.getMonth() + 1

  // 具体的天数
  const Day: any =
    dates.getDate() < 10 ? '0' + dates.getDate() : dates.getDate()

  // 小时
  const Hours =
    dates.getHours() < 10 ? '0' + dates.getHours() : dates.getHours()

  // 分钟
  const Minutes =
    dates.getMinutes() < 10 ? '0' + dates.getMinutes() : dates.getMinutes()

  // 秒
  const Seconds =
    dates.getSeconds() < 10 ? '0' + dates.getSeconds() : dates.getSeconds()

  // 返回数据格式
  return (
    Year +
    '-' +
    Months +
    '-' +
    Day +
    ' ' +
    Hours +
    ':' +
    Minutes +
    ':' +
    Seconds
  )
}
