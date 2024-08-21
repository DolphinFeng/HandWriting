import * as React from 'react'
import { Text, View } from '@mrn/react-native'
import { TimeUtils } from '@src/utils/time'
import { styles } from './styles'

export interface IScheduleTimeProps {
  isAllDay: 0 | 1
  startTime: number
  endTime: number
}

function checkIsAllDay(isAllDay) {
  return isAllDay === 1
}

export const ScheduleTime = (props: IScheduleTimeProps) => {
  const { startTime, endTime, isAllDay } = props

  const startDate = TimeUtils.format(startTime, 'MM月dd日 周E ')
  const startHour = TimeUtils.format(startTime, 'HH:mm')

  const endDate = TimeUtils.format(endTime, 'MM月dd日 周E ', true)
  const endHour = TimeUtils.format(endTime, 'HH:mm', true)

  // 当天日程
  if (startDate === endDate) {
    return (
      <View>
        <Text style={styles.time}>
          {startDate}
          {checkIsAllDay(isAllDay) ? '全天' : `${startHour}-${endHour}`}
        </Text>
      </View>
    )
  }

  // 跨天日程
  return (
    <View>
      <Text style={styles.time}>
        开始：{startDate}
        {checkIsAllDay(isAllDay) ? '' : startHour}
      </Text>
      <Text style={styles.time}>
        结束：{endDate}
        {checkIsAllDay(isAllDay) ? '' : endHour}
      </Text>
    </View>
  )
}
