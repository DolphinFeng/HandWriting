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
    ...CommonTextStyles.boldText,
    marginHorizontal: 4
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
    height: pixel.px2dp(40)
  },
  tipText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    ...CommonTextStyles.tipsText
  },
  busyTitle: {
    flex: 1,
    ...CommonFlexStyles.flexCenter
  },
  nextIco: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize24
  }
})
