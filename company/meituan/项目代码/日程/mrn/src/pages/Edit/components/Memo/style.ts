import { StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import { CommonFlexStyles, ECommonFontSize, ESolidColor } from '@src/common/styles'

export default StyleSheet.create({
  container: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(16),
    minHeight: pixel.px2dp(56),
    ...CommonFlexStyles.flexStart
  },
  icon: {
    fontSize: ECommonFontSize.FontSize20,
    paddingRight: pixel.px2dp(12),
    marginTop: pixel.px2dp(3)
  },
  disabledText: {
    color: ESolidColor.GrayE0
  }
})
