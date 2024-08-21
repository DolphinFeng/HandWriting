import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import {
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
  confirmText: {
    color: EPrimaryColor.Blue,
    fontSize: ECommonFontSize.FontSize16,
    fontWeight: '500'
  },
  cancelText: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize16
  },
  disabledText: {
    color: ETransparentColor.Black60,
    fontSize: ECommonFontSize.FontSize16
  }
})
