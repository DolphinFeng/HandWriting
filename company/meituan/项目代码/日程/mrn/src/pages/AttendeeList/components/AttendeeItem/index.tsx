import React from 'react'
import { Text, View, TouchableWithoutFeedback } from '@mrn/react-native'
import { Avatar } from '@src/components/Avatar'
import { IAttendee } from '@src/common/interfaces'
import { IOrganizer } from '@src/pages/Detail/interfaces'
import { styles } from './styles'

interface IAttendeeItemProps {
  attendee: IAttendee | IOrganizer
  isOrganizer: boolean
  onPress(empId: string): void
}

export const AttendeeItem: React.FC<IAttendeeItemProps> = ({ attendee, isOrganizer, onPress }) => (
  <TouchableWithoutFeedback onPress={() => onPress(attendee.xmUid)}>
    <View style={styles.item}>
      <Avatar img={attendee.avatar} isOrganizer={isOrganizer} />
      <Text style={styles.name}>{attendee.name}</Text>
      {!!isOrganizer && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>创建者</Text>
        </View>
      )}
    </View>
  </TouchableWithoutFeedback>
)
