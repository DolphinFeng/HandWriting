import React from 'react'
import { Text, View } from '@mrn/react-native'
import { styles } from './styles'

export interface ITagProps {
  text: string
  color?: string
}

export const Tag: React.FC<ITagProps> = ({ text, color = '#AAA' }) => {
  if (text) {
    return (
      <View style={[styles.tag, { borderColor: color }]}>
        <Text style={[styles.tagText, { color }]}>{text}</Text>
      </View>
    )
  }
  return null
}
