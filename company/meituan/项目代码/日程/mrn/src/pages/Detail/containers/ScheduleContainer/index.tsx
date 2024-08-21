import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { ScrollView, View, Text } from '@mrn/react-native'
import { TimeUtils } from '@src/utils/time'
import { ScheduleMemo } from '../../components/ScheduleMemo'
import { ScheduleTips } from '../../components/ScheduleTips'
import { ScheduleAttendeeCount } from '../../components/ScheduleAttendeeCount'
import { ScheduleAttendeeAvatars } from '../../components/scheduleAttendeeAvatars'
import { ScheduleRoom } from '../../components/ScheduleRoom'
import { ScheduleHead } from '../ScheduleHead'
import { ItemLayout } from '../ItemLayout'
import { DetailStore } from '../../stores'
import { styles } from './styles'

interface IInjectProps {
  detailStore?: DetailStore
}

interface IScheduleContainerProps {}

@inject('detailStore')
@observer
export class ScheduleContainer extends React.Component<IScheduleContainerProps & IInjectProps> {
  render() {
    const { detailStore = {} } = this.props
    const { schedule, conflicts } = detailStore as DetailStore

    const hasLocation = !!schedule.location
    const hasRoom = !!schedule.roomName

    return (
      <ScrollView style={styles.container}>
        <ScheduleTips type={schedule.appKey} target={schedule.targetUrl} />

        <View style={styles.main}>
          {/* 会议头部信息 */}
          <ScheduleHead
            title={schedule.title}
            appKey={schedule.appKey}
            isAllDay={schedule.isAllDay}
            startTime={schedule.startTime}
            endTime={schedule.endTime}
          />

          {/* 会议地址 */}
          <ItemLayout
            useDivider={false} // 第一个不展示横线
            show={!!schedule.location}
            icon='dx-callocation'
            content={<Text style={styles.defaultText}>{schedule.location}</Text>}
          />

          {/* 会议室 */}
          <ItemLayout
            useDivider={hasLocation}
            show={!!schedule.roomName}
            icon='dx-calmeeting-room'
            content={
              <ScheduleRoom
                room={schedule.roomName}
                locationUrl={schedule.locationUrl}
                equipId={schedule.roomInfo?.equipId}
              />
            }
          />

          {/* 参与人冲突信息 */}
          <ItemLayout
            show
            useDivider={hasLocation && hasRoom}
            icon='dx-calavatar-group'
            content={<ScheduleAttendeeCount schedule={schedule} conflicts={conflicts} />}
          />

          {/* 参与人头像 */}
          <ItemLayout
            show
            useDivider
            icon='' // 无图标
            content={
              <ScheduleAttendeeAvatars
                organizer={schedule.organizer}
                attendees={schedule.attendees}
              />
            }
          />

          {/* 提醒 */}
          <ItemLayout
            useDivider
            icon='dx-calbell'
            show={!!schedule.noticeDescription}
            content={<Text style={styles.defaultText}>{schedule.noticeDescription}提醒</Text>}
          />

          {/* 循环日程信息 */}
          <ItemLayout
            useDivider
            icon='dx-calcycle'
            show={!!schedule.recurrenceDescription}
            content={<Text style={styles.defaultText}>{schedule.recurrenceDescription}重复</Text>}
          />

          {/* 循环日程信息 */}
          <ItemLayout
            useDivider
            icon=''
            show={!!schedule.recurrenceDescription}
            content={
              <Text style={styles.defaultText}>
                截止到 {TimeUtils.format(schedule.deadline, 'YYYY-MM-dd')}
              </Text>
            }
          />

          {/* 日程备注 */}
          <ItemLayout
            useDivider
            show={!!schedule.memo}
            icon='dx-calremarks'
            content={<ScheduleMemo memo={schedule.memo} />}
          />
        </View>
      </ScrollView>
    )
  }
}
