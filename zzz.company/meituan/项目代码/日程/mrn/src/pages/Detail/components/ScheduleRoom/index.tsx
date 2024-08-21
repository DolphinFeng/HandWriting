import React from 'react'
import { Text, View } from '@mrn/react-native'
import { IconFont } from '@src/components/IconFont'
import { UMEETING_DOWNLOAD_URL } from '@src/common/consts'
import { openUrl } from '@mrn/mrn-utils'
import { styles } from './styles'

interface IScheduleRoomProps {
  room: string
  locationUrl: string
  equipId: number
}

export const ScheduleRoom = (props: IScheduleRoomProps) => {
  const { room = '', locationUrl, equipId } = props
  const unShow = !room
  const hasLink = !!locationUrl
  const nUmeet: boolean = equipId === 6

  if (unShow) {
    return null
  }

  const handlePress = () => {
    if (hasLink) {
      openUrl(encodeURI(locationUrl))
    }
  }

  const openUmeetDownload = () => {
    openUrl(UMEETING_DOWNLOAD_URL)
  }

  return (
    <View style={styles.room}>
      <View style={styles.main}>
        <Text style={styles.text} onPress={handlePress}>
          {room}
        </Text>
        {nUmeet && (
          <View style={styles.uMeetContanier}>
            <IconFont style={styles.uMeetIcon} icon='dx-calumeet' />
            <Text style={styles.reminderText}>
              Umeet 会议室，请提前
              <Text onPress={openUmeetDownload} style={styles.reminderLinkText}>
                下载安装
              </Text>{' '}
              Umeet 客户端
            </Text>
          </View>
        )}
      </View>
      {hasLink ? <IconFont style={styles.arrow} icon='dx-calright_day_nav' /> : null}
    </View>
  )
}
