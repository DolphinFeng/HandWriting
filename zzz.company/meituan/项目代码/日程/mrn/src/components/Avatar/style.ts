import { StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import { ESolidColor } from '@src/common/styles'

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 99,
    backgroundColor: ESolidColor.GrayF5
  },
  organizer: {
    width: pixel.px2dp(14),
    height: pixel.px2dp(14),
    position: 'absolute',
    right: 0,
    bottom: 0
  }
})
