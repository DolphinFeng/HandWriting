import React from 'react'
import { Text, View, TouchableWithoutFeedback } from '@mrn/react-native'
import { openURL } from '@onejs/mrn-utils'
import { IconFont } from '@src/components/IconFont'
import { styles } from './styles'

interface IScheduleTipsProps {
  type: string
  target: string
}

export const ScheduleTips = (props: IScheduleTipsProps) => {
  const { type = 'schedule', target } = props
  const show = type === 'exchange' && !!target
  if (!show) {
    return null
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        openURL(target)
      }}
    >
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.text}>此日程来自邮箱，编辑、删除等请前往邮箱系统</Text>
          <IconFont style={[styles.text, styles.icon]} icon='dx-calright_day_nav' />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
