import React from 'react'
import { View } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'
import styles from './style'

interface ITimeLine {
  current: number
}

export const TimeLine = (props: ITimeLine) => {
  const { current } = props

  const hours = new Date(current).getHours()
  const minute = new Date(current).getMinutes()
  // 时间高度 + 顶部高度 - 自身高度的一半
  const top =
    (hours * 60 + minute) * busyStyleConst.oneMinuteHeight +
    busyStyleConst.hearderHeight +
    busyStyleConst.oneHourHeight / 2 -
    3

  return (
    <View pointerEvents='none' style={[styles.timeLineContariner, { top }]}>
      <View style={styles.circle} />
      <View style={styles.line} />
    </View>
  )
}
