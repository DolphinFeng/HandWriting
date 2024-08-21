import { StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import { CommonFlexStyles, ECommonFontSize, ETransparentColor } from '@src/common/styles'

export default StyleSheet.create({
  input: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize17,
    lineHeight: ECommonFontSize.LineHeight18,
    textAlignVertical: 'center',
    ...CommonFlexStyles.flexCenter,
    paddingRight: pixel.px2dp(16),
    paddingVertical: 0 // 一定要加 安卓适配
  }
})
