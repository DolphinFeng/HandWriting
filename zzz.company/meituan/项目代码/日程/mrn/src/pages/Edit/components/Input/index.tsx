/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { TextInput, TextInputProps } from '@mrn/react-native'
import { ETransparentColor } from '@src/common/styles'
import styles from './style'

export interface IInputProps extends TextInputProps {
  name: string
}

export const Input: React.FunctionComponent<IInputProps> = (props: IInputProps): JSX.Element => {
  const { name, maxLength = 50, style, ...rest } = props
  return (
    <TextInput
      placeholder={`请输入${name}，${maxLength}字以内`}
      style={[styles.input, style]}
      maxLength={maxLength}
      placeholderTextColor={ETransparentColor.Black36}
      multiline
      {...rest}
    />
  )
}
