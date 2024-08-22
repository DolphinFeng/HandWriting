import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { pixel } from '@onejs/mrn-utils'
import {
  CommonFlexStyles,
  CommonTextStyles,
  ECommonFontSize,
  ESolidColor
} from '@src/common/styles'

export default StyleSheet.create({
  container: {
    backgroundColor: ESolidColor.White
  },
  item: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(12),
    ...CommonFlexStyles.flexDefault
  },
  checkIcon: {
    color: EPrimaryColor.DarkBlue,
    fontSize: ECommonFontSize.FontSize24
  },
  text: {
    ...CommonTextStyles.tipsText,
    paddingHorizontal: pixel.px2dp(16),
    paddingVertical: pixel.px2dp(4)
  }
})
