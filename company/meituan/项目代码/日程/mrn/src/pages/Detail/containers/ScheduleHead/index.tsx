import * as React from 'react'
import { View } from '@mrn/react-native'
import { Devider } from '@src/components/Devider'
import { IScheduleTimeProps, ScheduleTime } from '../../components/ScheduleTime'
import { IScheduleTitleProps, ScheduleTitle } from '../../components/ScheduleTitle'
import { styles } from './styles'

export const ScheduleHead: React.FC<IScheduleTitleProps & IScheduleTimeProps> = props => {
  const { title, appKey, isAllDay, startTime, endTime } = props
  return (
    <>
      <View style={styles.container}>
        <ScheduleTitle title={title} appKey={appKey} />
        <ScheduleTime isAllDay={isAllDay} startTime={startTime} endTime={endTime} />
      </View>
      <Devider />
    </>
  )
}
