export function getPastDates(preMinutes: number): [Date, Date] {
  const nowDate = new Date()

  const pastDate = new Date(nowDate.getTime() - preMinutes * 60 * 1000)

  return [pastDate, nowDate]
}

// 获取近N天时间范围 整点时间 如 2020-05-21 00:00:00 2020-05-28 23:59:59
export function getPastDatesByDays(preDays: number): [Date, Date] {
  let start = new Date(
    new Date(new Date().toLocaleDateString()).getTime() -
      preDays * 24 * 60 * 60 * 1000
  ) // 当天0点
  let end = new Date(
    new Date(new Date().toLocaleDateString()).getTime() + // 当天23:59
      24 * 60 * 60 * 1000 -
      1
  )
  console.log('s ' + start + ' e ' + end)
  return [start, end]
}

// 获取近N个月时间范围
export function getPastDatesByMonths(preMonths: number): [Date, Date] {
  const nowDate = new Date()

  const pastDate = new Date(
    nowDate.getTime() - preMonths * 30 * 24 * 60 * 60 * 1000
  )

  return [pastDate, nowDate]
}
