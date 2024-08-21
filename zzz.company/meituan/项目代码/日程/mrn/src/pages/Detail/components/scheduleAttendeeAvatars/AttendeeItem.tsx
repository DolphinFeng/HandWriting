import React from 'react'
import { Text, View } from '@mrn/react-native'
import { Avatar } from '@src/components/Avatar'
import { IAttendee, IOrganizer } from '../../interfaces'
import { avatarStyles } from './styles'

interface IAttendeeItemProps {
  isOrganizer: boolean
  attendee: IAttendee | IOrganizer
  width: number
}

export const AttendeeItem: React.FC<IAttendeeItemProps> = ({ attendee, isOrganizer, width }) => (
  <View style={avatarStyles.avatarItem}>
    <Avatar img={attendee?.avatar} width={width} isOrganizer={isOrganizer} />
    <Text style={avatarStyles.name} numberOfLines={1}>
      {attendee?.name}
    </Text>
  </View>
)
