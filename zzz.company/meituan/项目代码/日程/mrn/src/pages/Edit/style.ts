import { StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import {
  CommonFlexStyles,
  ECommonFontSize,
  ESolidColor,
  ETransparentColor
} from '@src/common/styles'

export default StyleSheet.create({
  formContainer: {
    flex: 1,
    backgroundColor: ESolidColor.White
  },
  item: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  content: {
    flex: 1,
    ...CommonFlexStyles.flexDefault
  },
  title: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize22,
    lineHeight: ECommonFontSize.LineHeight26,
    fontWeight: '500',
    width: '100%'
  },
  deadline: {
    paddingLeft: pixel.px2dp(48)
  },
  icon: {
    fontSize: ECommonFontSize.FontSize20,
    paddingRight: pixel.px2dp(12)
  },
  navIcon: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize20
  },
  errorText: {
    color: ESolidColor.Red
  },
  placeholder: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize17,
    lineHeight: ECommonFontSize.FontSize24
  },
  disabledText: {
    color: ESolidColor.GrayE0
  }
})
