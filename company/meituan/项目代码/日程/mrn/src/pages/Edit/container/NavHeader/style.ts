import { StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import {
  CommonFlexStyles,
  CommonTextStyles,
  ECommonFontSize,
  ESolidColor,
  ETransparentColor
} from '@src/common/styles'

export default StyleSheet.create({
  nav: {
    backgroundColor: ESolidColor.White
  },
  title: {
    ...CommonTextStyles.boldText
  },
  text: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize16
  },
  confirmText: {
    color: ESolidColor.Red,
    fontSize: ECommonFontSize.FontSize16
  },
  tip: {
    ...CommonFlexStyles.flexCenter,
    backgroundColor: ESolidColor.White,
    paddingVertical: pixel.px2dp(12),
    paddingHorizontal: pixel.px2dp(20),
    borderBottomWidth: 1,
    borderBottomColor: ETransparentColor.Black6
  },
  tipText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    ...CommonTextStyles.tipsText
  },
  footerView: {
    height: pixel.px2dp(56),
    backgroundColor: ESolidColor.White,
    ...CommonFlexStyles.flexCenter,
    borderTopWidth: 4,
    borderTopColor: ETransparentColor.Black6
  },
  footerText: {
    ...CommonTextStyles.defaultText16
  }
})
