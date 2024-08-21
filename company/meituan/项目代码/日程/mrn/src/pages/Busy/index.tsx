import React from 'react'
import { observer } from 'mobx-react'
import { View, ScrollView, TouchableWithoutFeedback, FlatList } from '@mrn/react-native'
import { debug, device } from '@onejs/mrn-utils'
import { ONE_MINUTE } from '@onejs/mrn'
import BusyAttendeeItem from '@src/components/BusyAttendeeItem'
import BusyTimeLines from '@src/components/BusyTimeLines'
import { Layout } from '@src/components/Layout'
import { IAttendee, IPageProps } from '@src/common/interfaces'
import busyStyleConst from '@src/common/styles/busy'
import { EChatType } from '@src/common/enums'
import appStore from '@src/store'
import { BusyStore } from './stores'
import ShowCol from './components/showCol'
import ShowBusyCol from './components/showBusyCol'
import BusyBlock from './components/busyBlock'
import { BusyNavHeader } from './components/busyNavHeader'
import { TimeLine } from './components/timeLine'
import { BusyPageBottom } from './components/busPageBottom'
import { BlockItem } from './components/blockItem'
import { EMaskType, MaskItem } from './components/maskItem'
import { BusyPopItems } from './components/busyPopItems'
import {
  getAnthorHourInToday,
  IConflictItem,
  initStartAndEndCurrent,
  isSameDay,
  MAX_CONFLICT_NO
} from './util'
import styles from './style'

@observer
export default class Busy extends React.Component<IPageProps> {
  private store = new BusyStore()

  private timeInteval

  private pageScrollViewRef

  private avatarFlatListRef: React.RefObject<FlatList<IConflictItem>> = React.createRef()

  private conflictListRef: React.RefObject<FlatList<IConflictItem>> = React.createRef()

  private conflictTouching: boolean = false

  componentDidMount() {
    this.initEditPage()
  }

  initEditPage = async () => {
    const { screenProps, navigation } = this.props
    const { params } = navigation.state as any

    const { initGroup, initEdit, setData } = this.store
    if (params?.startTime) {
      await initEdit(params)
    } else if (screenProps?.chatId) {
      // 单聊初始化
      await initGroup(screenProps.chatId, EChatType.Chat)
    } else if (screenProps?.groupId) {
      // 群聊初始化
      await initGroup(screenProps.groupId, EChatType.GroupChat)
    } else {
      await initEdit(params)
    }
    this.initScroll()

    this.timeInteval = setInterval(() => {
      setData({ currentTime: Date.now() })
    }, 2 * ONE_MINUTE)
  }

  componentWillUnmount() {
    this.timeInteval && clearInterval(this.timeInteval)
  }

  setPopInfos = (centerX, empId, index) => {
    const { setData, clearPop, chatType } = this.store
    const loginUserEmpId = appStore.userInfo?.user?.empId
    // 暂时仅支持群日程排序等操作
    if (chatType === EChatType.GroupChat && empId !== loginUserEmpId) {
      setData({
        popoverCenterX: centerX,
        popoverEmpId: empId,
        popoverIndex: index
      })
    } else {
      // 点击登陆的当前用户 不显示操作按钮
      clearPop()
    }
  }

  clearPop = () => {
    this.setPopInfos(0, null, -1)
  }

  handleScrollClick = e => {
    const { editable, startClickPos, endClickPos, setStart, setEnd } = this.store
    const evtLocationY = e?.nativeEvent?.locationY

    debug(evtLocationY)

    // busyStyleConst.topStart
    if (editable && evtLocationY) {
      const start = 0
      const end = busyStyleConst.oneHourHeight * 24
      const pos = Math.floor(evtLocationY) - busyStyleConst.topStart
      // 点击时间区域外
      if (pos < start || pos > end) {
        return false
      }
      const quota = busyStyleConst.oneHourHeight / 4

      const clickQuota = pos / quota

      // 开始是向下取值， 结束是向上取值
      const floorQuota = Math.floor(clickQuota)
      const ceilQuota = Math.ceil(clickQuota)
      // 第一次点击
      if (startClickPos < 0 || endClickPos > 0) {
        setStart(floorQuota)
      } else {
        if (floorQuota <= startClickPos) {
          setStart(floorQuota)
        } else {
          setEnd(ceilQuota)
        }
      }
    }
    return false
  }

  renderBusyBlock = () => {
    const { startClickPos, endClickPos, conflictIdList } = this.store
    return (
      <BusyBlock
        isBusy={conflictIdList.length > 0}
        startQuota={startClickPos}
        endQuota={endClickPos}
      />
    )
  }

  changeDay = timeStamp => {
    const { changeDay } = this.store
    changeDay(timeStamp)
  }

  setEmpLeft = () => {
    const { setEmpLeft } = this.store
    setEmpLeft()
  }

  removeEmp = () => {
    const { removeEmp } = this.store
    removeEmp()
  }

  setAttendees = (attendees: IAttendee[]) => {
    const { setEmp } = this.store
    setEmp(attendees)
  }

  submit = () => {
    const {
      chatId,
      originStartTime,
      originEndTime,
      editable,
      chatType,
      attendees,
      refreshBack
    } = this.store
    const { navigation } = this.props
    if (!editable) {
      navigation.back()
    } else if (!chatId) {
      const { params } = navigation.state as any
      let endTime = originEndTime
      // 没有选结束时间，默认一个小时或者24点
      if (endTime < originStartTime) {
        endTime = getAnthorHourInToday(originStartTime)
      }
      params?.backByBusy({
        startTime: originStartTime,
        endTime
      })
      navigation.back()
    } else {
      let startTime = originStartTime
      let endTime = originEndTime

      if (originStartTime < 0) {
        // 未设置时间
        const current = initStartAndEndCurrent()
        startTime = current.startTime
        endTime = current.endTime
      } else if (originEndTime < 0) {
        // 未设置结束时间
        endTime = getAnthorHourInToday(startTime)
      }
      navigation.push('Edit', {
        chatId,
        chatType,
        attendees,
        startTime,
        endTime,
        refresh: refreshBack
      })
    }
  }

  initScroll = () => {
    const { startTime } = this.store
    const current = startTime > 0 ? new Date(startTime) : new Date()
    const hour = current.getHours()
    const minute = current.getMinutes()
    const y = Math.floor(
      Math.max((hour - busyStyleConst.scrollBeforeHours) * 60 + minute, 0) *
        busyStyleConst.oneMinuteHeight
    )
    this.pageScrollViewRef?.scrollTo({
      x: 0,
      y,
      animated: false
    })
  }

  conflictListScroll = event => {
    if (this.conflictTouching) {
      const ofSet = event.nativeEvent.contentOffset
      this.avatarFlatListRef?.current.scrollToOffset({ offset: ofSet.x, animated: false })
    }
  }

  avatarFlatListScroll = event => {
    if (!this.conflictTouching) {
      const ofSet = event.nativeEvent.contentOffset
      this.conflictListRef?.current.scrollToOffset({ offset: ofSet.x, animated: false })
    }
  }
  // 顶部人员
  renderHeader = (itemContentWidth: number) => {
    const { useConflictList, conflictIdList } = this.store
    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        onTouchStart={() => {
          this.conflictTouching = false
        }}
        getItemLayout={(_data, index) => ({
          length: itemContentWidth,
          offset: itemContentWidth * index,
          index
        })}
        data={useConflictList}
        ref={this.avatarFlatListRef}
        onScroll={this.avatarFlatListScroll}
        style={styles.headerItem}
        horizontal
        renderItem={({ item, index }) => (
          <BusyAttendeeItem
            nConflict={conflictIdList.findIndex(cItem => cItem.empId === item.empId) >= 0}
            setPopInfos={this.setPopInfos}
            key={item.empId}
            width={itemContentWidth}
            attendee={item}
            index={index}
          />
        )}
      />
    )
  }

  render() {
    const {
      useConflictList,
      startTime,
      selfDetailScheduleList,
      originStartTime,
      originEndTime,
      conflictIdList,
      editable,
      chatId,
      chatType,
      popoverCenterX,
      popoverEmpId,
      popoverIndex,
      currentDay,
      currentTime,
      groupMemberList,
      attendees,
      loading,
      failed,
      backCurrentDay
    } = this.store
    const { empId } = appStore.userInfo.user
    const { navigation } = this.props

    const {
      screen: { width },
      hasLiuhai
    } = device
    // 在参与人较少的情况下，让参与人均匀分布
    const scrollWidth = width - busyStyleConst.leftWidth
    let itemTotalWidth = busyStyleConst.itemMinWidth + busyStyleConst.itemDistanceWidth
    if (
      useConflictList.length &&
      useConflictList.length < Math.ceil(scrollWidth / itemTotalWidth)
    ) {
      itemTotalWidth = Math.ceil(scrollWidth / useConflictList.length)
    }
    const itemContentWidth = itemTotalWidth - busyStyleConst.itemDistanceWidth
    const isShowToday = isSameDay(startTime, currentDay)
    let maskType: EMaskType = EMaskType.None
    switch (true) {
      case attendees.length > MAX_CONFLICT_NO:
        maskType = EMaskType.MaxCount
        break
      case loading:
        maskType = EMaskType.Loading
        break
      case failed:
        maskType = EMaskType.LoadingError
        break
    }
    const paddingBottom: number = (editable ? 64 : 0) + (hasLiuhai ? 34 : 0)

    return (
      <Layout>
        <BusyNavHeader
          editable={editable}
          date={startTime}
          setDate={this.changeDay}
          navigation={navigation}
          backCurrentDay={backCurrentDay}
          isInGroup={!!chatId}
          isShowBack={!isShowToday}
        />
        <View style={[styles.pageContanier, { paddingBottom }]}>
          <BlockItem
            navigation={navigation}
            chatId={chatId}
            attendees={attendees}
            setAttendees={this.setAttendees}
            allMemberCount={groupMemberList.length}
            selectMemberCount={useConflictList.length}
            inGroup={chatType === EChatType.GroupChat}
          />
          {this.renderHeader(itemContentWidth)}
          <View style={styles.devider} />
          <MaskItem maskType={maskType} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            ref={ref => {
              this.pageScrollViewRef = ref
            }}
            style={styles.scrollContanier}
          >
            <BusyTimeLines />
            {/* 今天 切无Mask的时候显示当前时间轴 */}
            {isShowToday && maskType === EMaskType.None && <TimeLine current={currentTime} />}
            {isSameDay(originStartTime, startTime) && this.renderBusyBlock()}
            <FlatList
              onScroll={this.conflictListScroll}
              showsHorizontalScrollIndicator={false}
              onTouchStart={() => {
                this.conflictTouching = true
              }}
              getItemLayout={(_data, index) => ({
                length: itemContentWidth,
                offset: itemContentWidth * index,
                index
              })}
              horizontal
              ref={this.conflictListRef}
              data={useConflictList}
              style={styles.busyInfos}
              renderItem={({ item }) => (
                <TouchableWithoutFeedback onPress={this.handleScrollClick}>
                  <View style={[styles.busyContanier, { width: itemTotalWidth }]}>
                    {empId === item?.empId && (
                      <ShowCol
                        width={itemContentWidth}
                        events={selfDetailScheduleList}
                        targetDate={new Date(startTime)}
                      />
                    )}
                    {empId !== item?.empId && <ShowBusyCol busy={item.busy} />}
                    <View style={styles.verWhiteLine} />
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
          </ScrollView>
          {editable && (
            <BusyPageBottom
              isGroup={!!chatId}
              startTime={originStartTime}
              conflictList={conflictIdList}
              endTime={originEndTime}
              submit={this.submit}
            />
          )}
          {!!popoverEmpId && (
            <BusyPopItems
              showLeft={popoverIndex !== 1}
              centerX={popoverCenterX}
              clearPop={this.clearPop}
              setEmpLeft={this.setEmpLeft}
              removeEmp={this.removeEmp}
            />
          )}
        </View>
      </Layout>
    )
  }
}
