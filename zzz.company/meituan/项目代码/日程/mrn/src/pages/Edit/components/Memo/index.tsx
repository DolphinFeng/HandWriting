/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { View } from '@mrn/react-native'
import { IconFont } from '@src/components/IconFont'
import { ESolidColor } from '@src/common/styles'
import { Input } from '../Input'
import styles from './style'

export interface IMemoProps {
  memo: string
  setMemo: (memo: string) => void
  disabled?: boolean
}

export const Memo: React.FunctionComponent<IMemoProps> = ({
  memo,
  setMemo,
  disabled = false
}: IMemoProps): JSX.Element => (
  <View style={styles.container}>
    <IconFont icon='dx-calremarks' style={[styles.icon, disabled && styles.disabledText]} />
    <Input
      name='备注'
      maxLength={5000}
      value={memo}
      onChangeText={setMemo}
      editable={!disabled}
      style={disabled && styles.disabledText}
      {...(disabled && { placeholderTextColor: ESolidColor.GrayE0 })}
    />
  </View>
)
