import { StyleSheet } from '@mrn/react-native'
import { device, pixel } from '@onejs/mrn-utils'
import {
  CommonFlexStyles,
  ECommonFontSize,
  ESolidColor,
  ETransparentColor
} from '@src/common/styles'

export default StyleSheet.create({
  container: {
    backgroundColor: ESolidColor.White
  },
  headerContainer: {
    paddingTop: device.hasLiuhai ? pixel.px2dp(44) : pixel.px2dp(14),
    paddingHorizontal: pixel.px2dp(16),
    backgroundColor: ESolidColor.White,
    ...CommonFlexStyles.flexStart,
    paddingBottom: pixel.px2dp(8)
  },
  searchIcon: {
    paddingHorizontal: pixel.px2dp(4),
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize20
  },
  textInputContainer: {
    borderRadius: 8,
    backgroundColor: ESolidColor.GrayF5,
    paddingHorizontal: pixel.px2dp(4),
    ...CommonFlexStyles.flexStart,
    flex: 1,
    height: pixel.px2dp(36)
  },
  textInput: {
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontSize: ECommonFontSize.FontSize16
  },
  cancelText: {
    color: ETransparentColor.Black84,
    paddingLeft: pixel.px2dp(16),
    fontSize: ECommonFontSize.FontSize16
  },
  emptyContainer: {
    height: pixel.px2dp(200),
    ...CommonFlexStyles.flexCenter
  },
  emptyText: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize18
  },
  accountList: {
    padding: pixel.px2dp(16),
    backgroundColor: ESolidColor.White
  },
  item: {
    paddingVertical: pixel.px2dp(8),
    height: pixel.px2dp(56),
    ...CommonFlexStyles.flexStart,
    flex: 1
  },
  itemText: {
    paddingLeft: pixel.px2dp(8),
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize17,
    flex: 1
  },
  listFooter: {
    height: pixel.px2dp(50),
    width: '100%'
  }
})
