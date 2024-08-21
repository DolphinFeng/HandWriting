import React from 'react'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
import { View, Text, TouchableWithoutFeedback } from '@mrn/react-native'
import { IconFont } from '@src/components/IconFont'
import { IAttendee } from '@src/common/interfaces'
import appStore from '@src/store'
import styles from './style'

interface IBlockItem {
  allMemberCount: number
  selectMemberCount: number
  inGroup: boolean
  chatId: string
  attendees: IAttendee[]
  setAttendees: (attendees: IAttendee[]) => void
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

export const BlockItem = (props: IBlockItem) => {
  const {
    inGroup,
    selectMemberCount,
    allMemberCount,
    navigation,
    chatId,
    attendees,
    setAttendees
  } = props

  const openAttendee = () => {
    navigation.navigate('AddAttendee', {
      organizer: appStore.userInfo.user,
      attendees,
      chatId,
      setAttendees,
      onlyGroupMember: true
    })
  }

  return (
    <View style={styles.block}>
      {inGroup && (
        <TouchableWithoutFeedback onPress={openAttendee}>
          <View>
            <View style={styles.membersContent}>
              <Text style={styles.boldSmallText}>成员</Text>
              <IconFont style={styles.selectIcon} icon='dx-caldown' />
            </View>
            <Text style={styles.selectNoText}>
              {selectMemberCount}/{allMemberCount}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  )
}
