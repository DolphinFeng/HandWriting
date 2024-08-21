import { StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import { ESolidColor, ETransparentColor } from './colors'

// 字体图标名称
export enum EIconFont {}

export enum ECommonFontSize {
  // 字体大小定义
  FontSize30 = pixel.px2dp(30),
  FontSize28 = pixel.px2dp(28),
  FontSize24 = pixel.px2dp(24),
  FontSize22 = pixel.px2dp(22),
  FontSize20 = pixel.px2dp(20),
  FontSize18 = pixel.px2dp(18),
  FontSize17 = pixel.px2dp(17),
  FontSize16 = pixel.px2dp(16),
  FontSize14 = pixel.px2dp(14),
  FontSize12 = pixel.px2dp(12),
  FontSize10 = pixel.px2dp(10),
  // 行高定义
  LineHeight32 = pixel.px2dp(32),
  LineHeight30 = pixel.px2dp(30),
  LineHeight28 = pixel.px2dp(28),
  LineHeight26 = pixel.px2dp(26),
  LineHeight24 = pixel.px2dp(24),
  LineHeight22 = pixel.px2dp(22),
  LineHeight20 = pixel.px2dp(20),
  LineHeight18 = pixel.px2dp(18),
  LineHeight17 = pixel.px2dp(17)
}

export const CommonTextStyles = StyleSheet.create({
  defaultText: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize17,
    lineHeight: ECommonFontSize.LineHeight20
  },
  defaultText16: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize16,
    lineHeight: ECommonFontSize.LineHeight20
  },
  largeText: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize18,
    lineHeight: ECommonFontSize.LineHeight26
  },
  middleText: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize14,
    lineHeight: ECommonFontSize.LineHeight20
  },
  smallText: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize12,
    lineHeight: ECommonFontSize.LineHeight18
  },
  tipsText: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize14,
    lineHeight: ECommonFontSize.LineHeight20
  },
  boldText: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize17,
    lineHeight: ECommonFontSize.LineHeight20,
    fontWeight: '500'
  },
  boldSmallText: {
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize14,
    lineHeight: ECommonFontSize.LineHeight20,
    fontWeight: '500'
  },
  nameText: {
    color: ETransparentColor.Black60,
    fontSize: ECommonFontSize.FontSize12,
    lineHeight: ECommonFontSize.LineHeight17
  },
  smallRemindText: {
    color: ETransparentColor.Black60,
    fontSize: ECommonFontSize.FontSize10,
    lineHeight: ECommonFontSize.LineHeight17
  },
  remindText: {
    color: ESolidColor.Orange,
    fontSize: ECommonFontSize.FontSize12,
    lineHeight: ECommonFontSize.LineHeight18
  },
  btnPrimaryText: {
    color: ESolidColor.White,
    fontSize: ECommonFontSize.FontSize14,
    lineHeight: ECommonFontSize.LineHeight18,
    fontWeight: '500'
  },
  eventNormalText: {
    color: ESolidColor.Blue,
    fontSize: ECommonFontSize.FontSize14,
    lineHeight: ECommonFontSize.LineHeight20,
    fontWeight: '500'
  }
})
