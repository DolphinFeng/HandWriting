import { StyleSheet } from '@mrn/react-native'
import { device, pixel, px2dp } from '@onejs/mrn-utils'
import {
  CommonFlexStyles,
  CommonTextStyles,
  ECommonFontSize,
  ESolidColor,
  ETransparentColor
} from '@src/common/styles'

const { width } = device.screen

export default StyleSheet.create({
  item: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(16),
    minHeight: pixel.px2dp(56),
    width: '100%',
    ...CommonFlexStyles.flexDefault
  },
  icon: {
    fontSize: ECommonFontSize.FontSize20,
    paddingRight: pixel.px2dp(12)
  },
  navIcon: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize20,
    marginLeft: -50
  },
  orangeBusyNavIcon: {
    color: ESolidColor.Orange,
    fontSize: ECommonFontSize.FontSize20
  },
  busyNavIcon: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize20
  },
  circleIcon: {
    fontSize: pixel.px2dp(36),
    color: ETransparentColor.Black36
  },
  circleIconWrapper: {
    height: pixel.px2dp(60),
    marginRight: Math.round((width - 36 * 6 - 96) / 5)
  },
  placeholder: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize17,
    lineHeight: ECommonFontSize.FontSize24
  },
  attendee: {
    marginRight: Math.round((width - 36 * 6 - 96) / 5),
    ...CommonFlexStyles.flexColumn
  },
  rightWrapper: {
    marginRight: 0
  },
  attendeeAvatar: {
    paddingLeft: pixel.px2dp(36),
    ...CommonFlexStyles.flexStart,
    flexWrap: 'wrap'
  },
  busyText: {
    ...CommonTextStyles.tipsText
  },
  attendeeName: {
    color: ETransparentColor.Black60,
    lineHeight: ECommonFontSize.LineHeight18,
    fontSize: pixel.px2dp(10),
    paddingVertical: pixel.px2dp(4),
    maxWidth: pixel.px2dp(36)
  },
  conflictTipContainer: {
    ...CommonFlexStyles.flexEnd,
    flex: 1
  },
  conflictTip: {
    color: ESolidColor.Orange,
    fontSize: ECommonFontSize.FontSize14,
    lineHeight: ECommonFontSize.LineHeight20,
    fontWeight: '500',
    textAlign: 'right',
    textAlignVertical: 'center',
    paddingLeft: px2dp(16)
  },
  errorTip: {
    paddingHorizontal: pixel.px2dp(4),
    fontSize: ECommonFontSize.FontSize12,
    color: ESolidColor.Red
  }
})
