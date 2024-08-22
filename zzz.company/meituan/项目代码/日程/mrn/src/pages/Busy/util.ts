import { TimeUtils, ONE_HOUR } from '@src/utils/time'

export const MAX_CONFLICT_NO = 50 // 最大展示冲突人数

export interface IBusy {
  start: number
  distance: number
}

export interface IConflictItem {
  name?: string
  empId?: string
  avatar?: string
  busyPeriod?: number[]
  busy?: IBusy[]
  isConflict?: boolean
}

// 把 [0, 1, 0 ...]忙闲字段解析成忙碌段
export const getBusyDistance = (periodList: number[]): IBusy[] => {
  let firstIndex = -1
  const busyList: IBusy[] = []
  for (let i = 0; i < periodList.length; i++) {
    if (periodList[i] === 1) {
      if (firstIndex === -1) {
        firstIndex = i
        if (i + 1 === periodList.length || periodList[i + 1] === 0) {
          busyList.push({
            start: firstIndex,
            distance: 1
          })
          firstIndex = -1
        }
      } else if (i + 1 === periodList.length || periodList[i + 1] === 0) {
        busyList.push({
          start: firstIndex,
          distance: i - firstIndex + 1
        })
        firstIndex = -1
      }
    }
  }
  return busyList
}

export const getConflictInfos = (busyList, nCheck: boolean, start: number, end: number) => {
  const height = end - start
  const useList = busyList.map(item => {
    const busyList: IBusy[] = getBusyDistance(item?.busyPeriod)
    return {
      name: item?.user?.name,
      empId: item?.user?.empId,
      avatar: item?.user?.avatar,
      busyPeriod: item?.busyPeriod,
      busy: busyList,
      isConflict: nCheck && height > 1 && item?.busyPeriod?.slice(start, end).includes(1)
    }
  })
  return useList
}

// 开始结束时间相关初始化
export const initStartAndEnd = (start?: number, end?: number) => {
  let startTime = start
  let endTime = end
  if (!startTime) {
    startTime = TimeUtils.getQuaterMinuteMoment()
    endTime = startTime + ONE_HOUR
  }
  const hour = new Date(startTime).getHours()
  const minute = new Date(startTime).getMinutes()

  const duration = endTime - startTime
  const durationBlock = parseInt(`${duration / (15 * 60 * 1000)}`, 10)

  const scheduleStart = hour * 4 + minute / 15
  const scheduleHeight = durationBlock
  return {
    startTime,
    endTime,
    scheduleHeight,
    scheduleStart,
    originStartTime: startTime,
    originEndTime: endTime
  }
}

// 获取最近的15分钟
export const initStartAndEndCurrent = () => {
  const startTime = TimeUtils.getQuaterMinuteMoment()
  const endTime = startTime + ONE_HOUR

  return {
    startTime,
    endTime
  }
}

export const changeTimeByQuota = (timeStamp: number, quota: number) => {
  const hours = Math.floor(quota / 4)
  const min = Math.floor(quota % 4) * 15
  return new Date(timeStamp).setHours(hours, min, 0, 0).valueOf()
}

/* eslint-disable implicit-arrow-linebreak */
export const isSameDay = (timeStamp: number, timeStampTest: number): boolean =>
  new Date(timeStamp).toDateString() === new Date(timeStampTest).toDateString()

export const getQuotaByTime = (timeStamp: number): number => {
  const hour = new Date(timeStamp).getHours()
  const minute = new Date(timeStamp).getMinutes()
  return hour * 4 + Math.floor(minute / 15)
}

// 获取下一个小时，如果下一个小时不是今天则获取今天的24点
export const getAnthorHourInToday = (timeStamp: number): number =>
  Math.min(timeStamp + ONE_HOUR, new Date(timeStamp).setHours(24, 0, 0, 0).valueOf())
