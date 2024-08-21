import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { pixel } from '@onejs/mrn-utils'
import {
  CommonFlexStyles,
  CommonTextStyles,
  ECommonFontSize,
  ESolidColor,
  ETransparentColor
} from '@src/common/styles'

export default StyleSheet.create({
  container: {
    backgroundColor: ESolidColor.White
  },
  headerContainer: {
    ...CommonFlexStyles.flexStart
  },
  flatListContainer: {
    paddingVertical: pixel.px2dp(8),
    paddingHorizontal: pixel.px2dp(12),
    flexGrow: 0
  },
  searchContainer: {
    ...CommonFlexStyles.flexStart,
    paddingVertical: pixel.px2dp(8),
    paddingHorizontal: pixel.px2dp(4),
    width: pixel.px2dp(70),
    height: pixel.px2dp(54)
  },
  searchContainerMargin: {
    marginLeft: -12
  },
  searchIcon: {
    paddingRight: pixel.px2dp(4),
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize18,
    marginTop: 1
  },
  search: {
    ...CommonTextStyles.tipsText
  },
  moreAttendeeContainer: {
    ...CommonFlexStyles.flexDefault,
    padding: pixel.px2dp(16)
  },
  groupText: {
    ...CommonTextStyles.tipsText,
    height: pixel.px2dp(40),
    paddingVertical: pixel.px2dp(8),
    paddingHorizontal: pixel.px2dp(16)
  },
  acceptDisableIcon: {
    fontSize: ECommonFontSize.FontSize28,
    marginRight: pixel.px2dp(10),
    color: EPrimaryColor.TintBlue
  },
  allChecked: {
    ...CommonFlexStyles.flexStart,
    height: pixel.px2dp(56),
    paddingVertical: pixel.px2dp(8),
    paddingHorizontal: pixel.px2dp(16)
  },
  allCheckText: {
    fontSize: ECommonFontSize.FontSize17
  },
  item: {
    ...CommonFlexStyles.flexStart,
    height: pixel.px2dp(56),
    paddingHorizontal: pixel.px2dp(16)
  },
  navIcon: {
    color: ETransparentColor.Black36,
    fontSize: ECommonFontSize.FontSize20
  },
  checkBox: {
    fontSize: ECommonFontSize.FontSize28,
    marginRight: pixel.px2dp(10),
    color: ETransparentColor.Black24
  },
  disabledCheckBox: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: ETransparentColor.Black24,
    width: pixel.px2dp(28),
    height: pixel.px2dp(28),
    marginRight: pixel.px2dp(10),
    backgroundColor: ETransparentColor.Black6
  },
  acceptIcon: {
    fontSize: ECommonFontSize.FontSize28,
    marginRight: pixel.px2dp(10),
    color: EPrimaryColor.Blue
  },
  name: {
    marginLeft: pixel.px2dp(8),
    marginRight: pixel.px2dp(4),
    color: ETransparentColor.Black84,
    fontSize: ECommonFontSize.FontSize17
  },
  avatarListFooter: {
    width: pixel.px2dp(10)
  },
  listFooter: {
    height: pixel.px2dp(150),
    width: '100%'
  },
  avatarContainer: {
    paddingHorizontal: 4
  }
})
