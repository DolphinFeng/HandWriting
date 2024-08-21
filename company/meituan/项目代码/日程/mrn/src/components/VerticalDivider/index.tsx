import React from 'react'
import { View, StyleProp, TextStyle } from '@mrn/react-native'
import styles from './styles'

export interface IVerticalDeviderProps {
  style?: StyleProp<TextStyle>
}

export const VertivalDevider: React.FC<IVerticalDeviderProps> = ({ style }): JSX.Element => (
  <View style={[styles.divider, style]} />
)
