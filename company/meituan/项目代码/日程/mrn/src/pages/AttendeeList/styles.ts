import { StyleSheet } from '@mrn/react-native'
import { device } from '@onejs/mrn-utils'
import { ESolidColor } from '@src/common/styles'

export const styles = StyleSheet.create({
  container: {
    height: device.screen.height
  },
  item: {
    backgroundColor: ESolidColor.White
  }
})
