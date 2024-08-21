import React from 'react'
import { View, Text } from '@mrn/react-native'
import { HOUR_HEIGHT } from '@src/common/consts'
import { CommonTextStyles } from '@src/common/styles'
import { IBusy } from '../../util'
import styles from './style'

interface IPropsType {
  busy: IBusy[]
}

const ShowBusyCol: React.FunctionComponent<IPropsType> = (props: IPropsType): JSX.Element => {
  const { busy } = props
  if (!busy || busy.length === 0) {
    return null
  }
  const ONE_QUOTE_HEIGHT = HOUR_HEIGHT / 4
  return (
    <View pointerEvents='none' style={styles.colItem}>
      {busy.map((bItem, bIndex) => {
        const top = bItem.start * ONE_QUOTE_HEIGHT
        const bottom = -(top + bItem.distance * ONE_QUOTE_HEIGHT - 1)
        return (
          <View
            key={bIndex}
            style={[
              styles.busy,
              {
                top,
                bottom
              }
            ]}
          >
            {bItem.distance > 1 && <Text style={CommonTextStyles.eventNormalText}>忙碌</Text>}
            {/* 大于一刻钟再显示 */}
            {/* <p>{bItem.distance === 1 ? '' : `${userItem.name}-忙碌`}</p> */}
          </View>
        )
      })}
    </View>
  )
}

export default ShowBusyCol
