/* eslint-disable react/no-array-index-key */
/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react'
import { View, TouchableWithoutFeedback } from '@mrn/react-native'
import { debug, device, px2dp } from '@onejs/mrn-utils'
import { IconFont } from '@src/components/IconFont'
import { NavigationContext } from '@src/context'
import { IAttendee, IOrganizer } from '../../interfaces'
import { styles, avatarStyles } from './styles'
import { AttendeeItem } from './AttendeeItem'

interface IScheduleAttendeeAvatarsProps {
  organizer: IOrganizer
  attendees: IAttendee[]
}

export const ScheduleAttendeeAvatars: React.FC<IScheduleAttendeeAvatarsProps> = ({
  organizer,
  attendees
}) => {
  const navigation = useContext(NavigationContext)

  const handlePress = () => {
    debug(navigation)
    navigation.push('AttendeeList', { organizer, attendees })
  }

  let items = null
  const mergedAttendees = [organizer, ...attendees]
  const count = mergedAttendees.length
  if (count <= 6) {
    items = new Array(6).fill(false).map((item, index) => index < count)
  } else {
    items = new Array(12).fill(false).map((item, index) => index < count)
  }

  const otherWidth = 16 * 3 + 20 * 2
  const itemWidth = px2dp(Math.min(Math.floor((device.screen.width - otherWidth) / 7), 36))

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.box}>
        <View style={[avatarStyles.avatarContainer]}>
          <View style={[avatarStyles.avatarBox]}>
            {items.slice(0, 6).map((show, index) => {
              if (!show) {
                return <View key={`${show} ${index}`} style={{ width: itemWidth }} />
              }
              const attendee = mergedAttendees[index]
              return (
                <AttendeeItem
                  key={attendee?.empId}
                  width={itemWidth}
                  attendee={attendee}
                  isOrganizer={attendee?.empId === organizer?.empId}
                />
              )
            })}
          </View>
          {count > 6 && (
            <View style={[avatarStyles.avatarBox, { paddingTop: 16 }]}>
              {items.slice(6, 12).map((show, index) => {
                if (!show) {
                  return <View key={`${show} ${index}`} style={{ width: itemWidth }} />
                }
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                const attendee = mergedAttendees[index + 6]
                return (
                  <AttendeeItem
                    key={attendee?.empId}
                    width={itemWidth}
                    attendee={attendee}
                    isOrganizer={false}
                  />
                )
              })}
            </View>
          )}
        </View>
        <IconFont style={[styles.text, styles.arrow]} icon='dx-calright_day_nav' />
      </View>
    </TouchableWithoutFeedback>
  )
}
