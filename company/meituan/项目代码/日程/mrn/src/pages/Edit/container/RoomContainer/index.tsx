/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { observer } from 'mobx-react'
import { openUrl } from '@mrn/mrn-utils'
import { openURL } from '@onejs/mrn-utils'
import { View, Text, TouchableWithoutFeedback } from '@mrn/react-native'
import { toast } from '@onejs/mrn-components'
//
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
import { UMEETING_DOWNLOAD_URL } from '@src/common/consts'
import { ESolidColor } from '@src/common/styles'
//
import { Input } from '../../components/Input'
import { IEditStore } from '../../stores'
import styles from './style'

export interface IRoomContainerProps {
  store: IEditStore
}

export enum EJumpToMeeting {
  mrnScheduleCreate = 'mrnScheduleCreate', // 创建页进入会议室系统
  mrnScheduleTab = 'mrnScheduleTab' // 首页进入会议室系统
}

@observer
export class RoomContainer extends React.Component<IRoomContainerProps> {
  public render(): React.ReactNode {
    const { store } = this.props
    const { buildingName, floorName, roomName } = store.room || {}
    const roomInfoBuffer = roomName + floorName + buildingName

    return (
      <>
        {this.renderLocation()}
        <Devider left={48} />
        {this.renderRoom(roomInfoBuffer)}
        <Devider left={48} />
      </>
    )
  }

  private renderLocation = () => {
    const { store } = this.props
    const { location, setLocation, isOrganizer } = store
    return (
      <View style={styles.location}>
        <IconFont
          icon='dx-callocation'
          style={[styles.locationIcon, !isOrganizer && styles.disabledText]}
        />
        <Input
          name='地点'
          value={location}
          onChangeText={setLocation}
          editable={isOrganizer}
          style={[!isOrganizer && styles.disabledText]}
          {...(!isOrganizer && { placeholderTextColor: ESolidColor.GrayE0 })}
        />
      </View>
    )
  }

  private renderRoom = (roomInfoBuffer?: string) => {
    const { store } = this.props
    const { room, isOrganizer, cantBookRoom, bookRoomMessage } = store
    const { roomId, equipId } = room || {}
    const { roomId: initialRoomId } = store.detail?.roomInfo || {}
    const showError = !!roomInfoBuffer && !cantBookRoom
    const showWarn = initialRoomId && roomId !== initialRoomId && cantBookRoom
    return (
      <View style={[styles.item, styles.room]}>
        <TouchableWithoutFeedback onPress={isOrganizer && this.handlePressRoom}>
          {roomInfoBuffer ? (
            <View style={styles.roomInfo}>
              <View style={styles.roomTextWrapper}>
                <Text style={[styles.roomInfoText, !isOrganizer && styles.disabledText]}>
                  {roomInfoBuffer}
                </Text>
              </View>
              <TouchableWithoutFeedback onPress={isOrganizer && this.handlePressDelete}>
                <IconFont icon='dx-calclose_mini' style={styles.navIcon} />
              </TouchableWithoutFeedback>
            </View>
          ) : (
            <View style={styles.roomInfo}>
              <Text style={[styles.placeholder, !isOrganizer && styles.disabledText]}>
                请选择会议室
              </Text>
              {isOrganizer && <IconFont icon='dx-calright_day_nav' style={styles.navIcon} />}
            </View>
          )}
        </TouchableWithoutFeedback>
        {showError && <Text style={styles.errorTip}>{bookRoomMessage}</Text>}
        {showWarn && (
          <Text style={styles.warnTip}>原有会议室已被您更换或删除，编辑完成后将会释放</Text>
        )}
        {equipId === 6 && !showError && !showWarn && (
          <Text style={styles.warnTip}>
            Umeet 会议室，请提前
            <Text onPress={this.openUmeetDownload} style={styles.reminderLinkText}>
              下载安装
            </Text>{' '}
            Umeet 客户端
          </Text>
        )}
      </View>
    )
  }
  private handlePressDelete = () => {
    const { store } = this.props
    const { setRoom } = store
    setRoom(null)
  }

  private handlePressRoom = () => {
    const { store } = this.props
    const {
      cantBookRoom,
      bookRoomMessage,
      startTime,
      endTime,
      room,
      setStartTime,
      setEndTime,
      setRoom,
      setHasChangeEndTime
    } = store
    if (!cantBookRoom) {
      toast.open(bookRoomMessage)
    } else {
      // TODO: 后端和大象对build字段的定义不一致需要处理
      let params = { startTime, endTime, from: EJumpToMeeting.mrnScheduleCreate }
      if (room) {
        const { buildingId, buildingName, roomId, roomName, floorId, floorName } = room
        params = Object.assign(params, {
          buildId: buildingId,
          buildName: buildingName,
          roomId,
          roomName,
          floorId,
          floorName
        })
      }

      const url = 'mtdaxiang://www.meituan.com/jiaotu/reservationMeeting'
      // alert(JSON.stringify(params))
      openUrl(url, params).then(data => {
        // 失败 requestCode 1, resultCode 0
        // 成功 requestCode 1, resultCode -1 resultData Object
        // 现在按照是否获得resultData来判断成功
        if (data && data.resultData) {
          const {
            startTime,
            endTime,
            buildId,
            buildName,
            roomId,
            roomName,
            floorId,
            floorName,
            equipId
          } = data.resultData
          setStartTime(startTime)
          setEndTime(endTime)
          setHasChangeEndTime(true)
          setRoom({
            buildingId: buildId,
            buildingName: buildName,
            floorName,
            floorId,
            roomId,
            roomName,
            equipId
          })
        }
      })
    }
  }

  private openUmeetDownload = () => {
    openURL(UMEETING_DOWNLOAD_URL)
  }
}
