import React from 'react'
import { View } from '@mrn/react-native'
import { computeSegCoords } from '@src/utils/eventPlacement'
import { IEventItem } from '@src/common/interfaces'
import ShowEvent from '../showEvent'
import styles from './style'

interface IPropsType {
  events: IEventItem[]
  targetDate: Date
  width: number
}

const ShowCol: React.FunctionComponent<IPropsType> = (props: IPropsType): JSX.Element => {
  const { events, targetDate, width } = props
  if (events && events.length > 0) {
    computeSegCoords(events, targetDate)
  }
  return (
    <View pointerEvents='none' style={styles.colItem}>
      {events.map((item, index) => (
        <ShowEvent parentWidth={width} event={item} key={index} />
      ))}
    </View>
  )
}

export default ShowCol
