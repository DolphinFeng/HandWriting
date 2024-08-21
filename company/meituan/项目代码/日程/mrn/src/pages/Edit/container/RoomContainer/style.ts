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
  item: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(16),
    minHeight: pixel.px2dp(56),
    ...CommonFlexStyles.flexDefault
  },
  location: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(16),
    minHeight: pixel.px2dp(56),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  locationIcon: {
    fontSize: ECommonFontSize.FontSize20,
    lineHeight: ECommonFontSize.FontSize24,
    paddingRight: pixel.px2dp(12)
  },
  navIcon: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize20
  },
  room: {
    ...CommonFlexStyles.flexColumnStart,
    paddingLeft: pixel.px2dp(48)
  },
  roomInfo: {
    width: '100%',
    ...CommonFlexStyles.flexDefault
  },
  roomTextWrapper: {
    width: '90%'
  },
  roomInfoText: {
    ...CommonTextStyles.defaultText,
    lineHeight: ECommonFontSize.FontSize24
  },
  placeholder: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize17,
    lineHeight: ECommonFontSize.FontSize24,
    height: pixel.px2dp(24)
  },
  warnTip: {
    color: ESolidColor.Orange,
    fontSize: ECommonFontSize.FontSize12,
    paddingTop: pixel.px2dp(4)
  },
  errorTip: {
    paddingTop: pixel.px2dp(4),
    fontSize: ECommonFontSize.FontSize12,
    color: ESolidColor.Red
  },
  disabledText: {
    color: ESolidColor.GrayE0
  },
  reminderLinkText: {
    ...CommonTextStyles.remindText,
    color: '#0A70F5'
  }
})
