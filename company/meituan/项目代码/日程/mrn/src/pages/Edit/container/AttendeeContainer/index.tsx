import React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
import { View, Text, TouchableWithoutFeedback } from '@mrn/react-native'
//
import { Devider } from '@src/components/Devider'
import { Avatar } from '@src/components/Avatar'
import { IconFont } from '@src/components/IconFont'
import { CommonFlexStyles, CommonTextStyles } from '@src/common/styles'
import { ellipsisString } from '@src/utils/text'
import { EChatType } from '@src/common/enums'
//
import { IEditStore } from '../../stores'
import styles from './style'

export interface IAttendeeContainerProps {
  store: IEditStore
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

@observer
export class AttendeeContainer extends React.Component<IAttendeeContainerProps> {
  @computed public get showBusy() {
    const { isAllDay, isOverDay } = this.props.store
    return !isAllDay && !isOverDay
  }

  public render(): React.ReactNode {
    const { organizer, attendees } = this.props.store
    return (
      <>
        <View style={styles.item}>
          <View style={CommonFlexStyles.flexStart}>
            <IconFont icon='dx-calavatar' style={styles.icon} />
            <Text style={CommonTextStyles.defaultText}>{`${attendees.length}人`}</Text>
            {attendees.length > 500 && <Text style={styles.errorTip}>最多添加500人</Text>}
          </View>
          {this.renderBusy()}
        </View>
        <Devider left={48} />
        <TouchableWithoutFeedback onPress={() => this.handlePressAttendeeList()}>
          <View style={styles.item}>
            <View style={styles.attendeeAvatar}>
              {organizer && this.renderPerson(organizer.name, organizer.avatar, 0, true)}
              {attendees
                .filter(i => i.empId !== organizer.empId)
                .slice(0, 9)
                .map((attendee, index) =>
                  this.renderPerson(attendee.name, attendee.avatar, index + 1, false)
                )}
              <View style={styles.circleIconWrapper}>
                <IconFont
                  icon='dx-caladd_circle'
                  style={styles.circleIcon}
                  onPress={this.addAttendees}
                />
              </View>
              <View style={styles.circleIconWrapper}>
                <IconFont
                  icon='dx-calreduce_circle'
                  style={styles.circleIcon}
                  onPress={this.deleteAttendees}
                />
              </View>
            </View>
            <IconFont icon='dx-calright_day_nav' style={styles.navIcon} />
          </View>
        </TouchableWithoutFeedback>
        <Devider height={8} />
      </>
    )
  }

  private handlePressAttendeeList = () => {
    const { navigation, store } = this.props
    const { organizer, attendees } = store
    navigation.push('AttendeeList', {
      organizer,
      attendees: attendees.filter(i => i.empId !== organizer.empId)
    })
  }

  private addAttendees = () => {
    const { navigation, store } = this.props
    const { organizer, attendees, chatId, chatType, setAttendees, selectAttendees } = store

    if (chatType === EChatType.GroupChat) {
      navigation.navigate('AddAttendee', {
        organizer,
        attendees,
        chatId,
        setAttendees
      })
    } else {
      selectAttendees()
    }
  }

  private deleteAttendees = () => {
    const { navigation, store } = this.props
    const { organizer, attendees, setAttendees, isOrganizer, detail } = store
    const { attendees: initialAttendees } = detail || {}
    navigation.navigate('DeleteAttendee', {
      organizer,
      attendees,
      setAttendees,
      isOrganizer,
      initialAttendees
    })
  }

  private renderPerson = (
    name: string,
    avatar: string,
    index: number,
    isOrganizer: boolean = false
  ) => (
    <View
      style={[styles.attendee, (1 + index) % 6 === 0 && styles.rightWrapper]}
      key={`${name}${avatar}`}
    >
      <Avatar img={avatar} isOrganizer={isOrganizer} width={36} />
      <Text numberOfLines={1} style={styles.attendeeName}>
        {name}
      </Text>
    </View>
  )

  private renderBusy = () => {
    const { confiltAttendees } = this.props.store
    switch (true) {
      case !this.showBusy:
        return null
      case confiltAttendees.length > 0:
        return (
          <TouchableWithoutFeedback onPress={this.handlePressConflict}>
            <View style={styles.conflictTipContainer}>
              <Text style={styles.conflictTip}>
                {confiltAttendees
                  .slice(0, 2)
                  .map(i => ellipsisString({ text: i?.name, maxLength: 12 }))
                  .join('、')}
                {confiltAttendees.length > 2 && '等人'}
                日程冲突
              </Text>
              <IconFont icon='dx-calright_day_nav' style={styles.orangeBusyNavIcon} />
            </View>
          </TouchableWithoutFeedback>
        )
      default:
        return (
          <TouchableWithoutFeedback onPress={this.handlePressConflict}>
            <View style={CommonFlexStyles.flexStart}>
              <Text style={styles.busyText}>查看忙闲</Text>
              <IconFont icon='dx-calright_day_nav' style={styles.busyNavIcon} />
            </View>
          </TouchableWithoutFeedback>
        )
    }
  }

  private handlePressConflict = () => {
    const { navigation } = this.props
    const {
      scheduleId,
      appKey,
      startTime,
      endTime,
      attendees,
      isOrganizer,
      backByBusy
    } = this.props.store

    navigation.push('Busy', {
      scheduleId,
      appKey,
      startTime,
      endTime,
      attendees,
      editable: !scheduleId || isOrganizer,
      backByBusy
    })
  }
}
