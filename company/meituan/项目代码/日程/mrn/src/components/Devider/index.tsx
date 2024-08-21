/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { View, StyleProp, TextStyle } from '@mrn/react-native'
import styles from './style'

export interface IDeviderProps {
  height?: number
  left?: number
  style?: StyleProp<TextStyle>
}

export const Devider: React.FunctionComponent<IDeviderProps> = ({
  height = 1,
  left,
  style
}: IDeviderProps): JSX.Element => (
  <View style={[styles.devider, style, { height, marginLeft: left }]} />
)
