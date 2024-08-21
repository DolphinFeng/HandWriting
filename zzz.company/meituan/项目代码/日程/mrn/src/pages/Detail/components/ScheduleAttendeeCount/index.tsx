/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState, useEffect } from 'react'
import { Text, View } from '@mrn/react-native'
import { IconFont } from '@src/components/IconFont'
import { debug } from '@onejs/mrn-utils'
import { NavigationContext } from '@src/context'
import { CommonFlexStyles } from '@src/common/styles'
import { ellipsisString } from '@src/utils/text'
import { IScheduleDetail } from '../../interfaces'
import { styles } from './styles'

interface IScheduleAttendeeCountProps {
  schedule: IScheduleDetail
  conflicts: string[]
}

export const ScheduleAttendeeCount: React.FC<IScheduleAttendeeCountProps> = ({
  schedule,
  conflicts = []
}) => {
  const { attendees = [] } = schedule
  const navigation = useContext(NavigationContext)
  const [conflictAttendees, setConflictAttendees] = useState([])

  useEffect(() => {
    const { organizer, attendees } = schedule
    if (!Array.isArray(conflicts.slice())) {
      setConflictAttendees([])
    }
    const conflictAttendees = []
    // 先检测创建者
    if (organizer && conflicts.find(mis => mis === organizer.mis)) {
      conflictAttendees.push(organizer)
    }
    // 再检测参与者
    for (const mis of conflicts.slice(0, 2)) {
      const attendee = attendees.find(a => a.mis === mis)
      if (attendee) {
        conflictAttendees.push(attendee)
      }
    }

    setConflictAttendees(conflictAttendees)
  }, [schedule, conflicts])

  const handlePressConflict = () => {
    const { id, appKey, startTime, endTime, organizer, attendees } = schedule
    const routeParams = {
      scheduleId: id,
      appKey,
      startTime,
      endTime,
      attendees: [organizer, ...attendees],
      editable: false
    }
    debug('From DetailPage To BusyPage with', routeParams)
    navigation.push('Busy', routeParams)
  }

  const renderConflict = () => {
    const { isAllDay, isOverDay } = schedule
    const unshowConflict = isAllDay || isOverDay // 全天和跨天日程 不显示查看忙闲入口
    if (unshowConflict) {
      return null
    }
    const names = conflictAttendees
      .slice(0, 2)
      .map(item => ellipsisString({ text: item?.name, maxLength: 12 }))
    const text = ['查看忙闲', `${names.join('、')}日程冲突`, `${names.join('、')}等人日程冲突`]
    const isConflict = names.length > 0
    return (
      <View
        style={[
          CommonFlexStyles.flexEnd,
          {
            flex: 1
          }
        ]}
      >
        <Text
          numberOfLines={2}
          onPress={handlePressConflict}
          style={[
            styles.normalText,
            isConflict && styles.conflictText,
            {
              flexShrink: 1,
              paddingLeft: 16,
              textAlign: 'right'
            }
          ]}
        >
          {text[names.length]}
        </Text>
        <IconFont
          style={[styles.text, isConflict && styles.conflictIcon, styles.arrow]}
          icon='dx-calright_day_nav'
        />
      </View>
    )
  }

  return (
    <View style={styles.box}>
      <Text style={styles.countText}> {1 /* 创建者 */ + attendees.length} 人</Text>
      {renderConflict()}
    </View>
  )
}
