import React from 'react'
import { View, Text } from '@mrn/react-native'
import styles from './style'

const BusyTimeLines: React.FC<{}> = () => {
  const hours = new Array(25).fill(1)
  return (
    <>
      <View pointerEvents='none' style={styles.left}>
        <View style={styles.distance} />
        {hours.map((_item, index) => (
          <View key={index} style={styles.timeItem}>
            <Text style={styles.hours}>{`${index}:00`}</Text>
          </View>
        ))}
        <View style={styles.distance} />
      </View>
      <View pointerEvents='none' style={styles.timeLinesContanier}>
        <View style={styles.distance} />
        {hours.map((_item, index) => (
          <View key={index} style={styles.lineItem} />
        ))}
        <View style={styles.distance} />
      </View>
    </>
  )
}

export default BusyTimeLines
