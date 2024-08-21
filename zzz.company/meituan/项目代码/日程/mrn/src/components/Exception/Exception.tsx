import React from 'react'
import { Text, View } from '@mrn/react-native'
import { IconFont } from '@src/components/IconFont'
import { styles } from './styles'

interface IExceptionProps {
  icon: string
  text: string
}

export const Exception: React.FC<IExceptionProps> = ({ icon, text }) => (
  <View style={styles.container}>
    <View style={styles.main}>
      <IconFont style={styles.iconfont} icon={icon} />
      <Text style={styles.text}>{text}</Text>
    </View>
  </View>
)
