/* eslint-disable prefer-template */
/* eslint-disable no-alert */
import React from 'react'
import KNB from '@mrn/mrn-knb'
import { Text } from '@mrn/react-native'
import { debug, noop, warn } from '@onejs/mrn-utils'
import { styles } from './styles'
import { IChat } from '../../apis/interfaces'

interface IShareScheduleProps {
  title: string
  onShare(chatList: IChat[]): void
}

const validateChatList = (chatList: IChat[]) =>
  chatList.map(chat => {
    const { chatId, chatID, chatType } = chat
    return {
      chatId: chatId || chatID,
      chatType
    }
  })

export const ShareSchedule: React.FC<IShareScheduleProps> = ({
  title = '[日程]',
  onShare = noop
}) => {
  // 分享日程
  const handleShare = () => {
    KNB.use('dxmp.selectSession', {
      noPub: true,
      preview: title,
      success: ({ ret }) => {
        const chatList = validateChatList(ret)
        debug('分享', ret, chatList) // [{chatId: 108xxx, chatType: 'chat'}]
        onShare(chatList)
      },
      fail: err => {
        warn('日程分享', err)
      }
    })
  }

  return (
    <Text onPress={handleShare} style={styles.btn}>
      分享日程
    </Text>
  )
}
