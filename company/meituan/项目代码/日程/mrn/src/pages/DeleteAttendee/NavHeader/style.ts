import { StyleSheet } from '@mrn/react-native'
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
  backIcon: {
    fontSize: ECommonFontSize.FontSize20
  },
  text: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize16
  },
  disabledText: {
    color: ETransparentColor.Black60,
    fontSize: ECommonFontSize.FontSize16
  }
})
