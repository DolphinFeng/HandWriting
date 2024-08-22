import React from 'react'
import { computed } from 'mobx'
import { inject, observer } from 'mobx-react'
import { debug, warn, info } from '@onejs/mrn-utils'
import { NavBar, navBarStyle } from '@onejs/mrn-components'
import { EApplicationsType, ERoleType } from '@src/common/enums'
import { Text, TouchableOpacity } from '@mrn/react-native'
import { INavigation } from '@src/common/interfaces'
import { IScheduleDetail } from '../../interfaces'
import { DetailStore } from '../../stores'

const CustomNavBar = NavBar.Custom

interface IInjectStore {
  detailStore?: DetailStore
}

interface INavigationBarProps {
  navigation: INavigation
}

@inject('detailStore')
@observer
export class NavigationBar extends React.Component<INavigationBarProps & IInjectStore> {
  @computed
  public get schedule() {
    // eslint-disable-next-line react/destructuring-assignment
    const { schedule } = this.props.detailStore
    return schedule || ({} as IScheduleDetail)
  }

  @computed
  public get roleType() {
    const { roleType } = this.schedule?.role ?? {}
    return roleType
  }

  // 是否为创建者
  @computed
  public get isOrgnizer() {
    return this.roleType === ERoleType.ORGANIZER
  }

  // 是否为参与者
  @computed
  public get isAttendee() {
    return this.roleType === ERoleType.ATTENDEE
  }

  // 是否为已开始的会议
  @computed
  public get isStartedMeeting() {
    const { locationId, startTime } = this.schedule
    return !!locationId && Date.now() >= startTime
  }

  // 是否为内部日程
  @computed
  public get isInnerSchedule() {
    const { appKey } = this.schedule
    return (
      EApplicationsType.Schedule === appKey ||
      EApplicationsType.Meeting === appKey ||
      EApplicationsType.Promotionapi === appKey
    )
  }

  @computed
  public get isOutSystemSchedule() {
    return !this.isInnerSchedule
  }

  // 是否可添加参与者
  @computed
  public get addable() {
    // 关联会议室的时候，会议已经开始不支持添加
    if (this.isStartedMeeting) {
      return false
    }

    // 第三方来源，不支持添加
    if (this.isOutSystemSchedule) {
      return false
    }

    return true
  }

  // 是否可编辑日程内容
  @computed
  public get editable() {
    // 会议已开始时，不显示编辑
    if (this.isStartedMeeting) {
      return false
    }

    // 外部系统，不显示编辑
    if (this.isOutSystemSchedule) {
      return false
    }

    // 创建者，显示编辑
    if (this.isOrgnizer) {
      return true
    }

    return false
  }

  render() {
    return (
      <CustomNavBar
        titleElement={this.titleElement()}
        cornerLeftElement={this.cornerLeftElement()}
        cornerRightElement={this.cornerRightElement()}
      />
    )
  }

  handleEdit = () => {
    const {
      navigation,
      detailStore: { scheduleUser, scheduleInfo, init }
    } = this.props
    const { id, appKey } = this.schedule
    const routeParams = {
      scheduleId: id,
      empId: scheduleUser.empId,
      appKey,
      refresh: (newScheduleId, newAppKey) => {
        // appKey, scheduleId
        const newScheduleInfo = {
          scheduleId: newScheduleId,
          appKey: newAppKey
        }
        info('Refresh Detail Page', newScheduleInfo)
        const { appKey, scheduleId, empId } = {
          ...scheduleInfo,
          ...newScheduleInfo
        }
        try {
          init({ appKey, empId, scheduleId, source: '' })
        } catch (reason) {
          warn('Refresh Detail Page', reason)
        }
      }
    }

    debug('From DetailPage To EditPage with', routeParams)
    navigation.push('Edit', routeParams)
  }

  titleElement = () => <Text style={navBarStyle.titleText}>日程详情</Text>
  cornerLeftElement = () => {
    const { navigation } = this.props
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.back()
        }}
        hitSlop={{
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }}
      >
        <NavBar.BackBtn />
      </TouchableOpacity>
    )
  }
  // eslint-disable-next-line no-confusing-arrow
  cornerRightElement = () =>
    this.editable || this.addable ? (
      // eslint-disable-next-line react-native/no-inline-styles
      <Text style={[navBarStyle.titleText, { fontWeight: '400' }]} onPress={this.handleEdit}>
        编辑
      </Text>
    ) : null
}
