import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { pixel } from '@onejs/mrn-utils'
import { CommonFlexStyles, ECommonFontSize, ESolidColor } from '@src/common/styles'

export default StyleSheet.create({
  container: {
    backgroundColor: ESolidColor.White
  },
  item: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(16),
    ...CommonFlexStyles.flexDefault
  },
  checkIcon: {
    color: EPrimaryColor.DarkBlue,
    fontSize: ECommonFontSize.FontSize24
  }
})
