import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { pixel } from '@onejs/mrn-utils'
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
  item: {
    ...CommonFlexStyles.flexStart,
    height: pixel.px2dp(60),
    paddingHorizontal: pixel.px2dp(14)
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
    marginRight: pixel.px2dp(4)
  },
  tag: {
    backgroundColor: EPrimaryColor.Blue,
    padding: pixel.px2dp(2),
    borderRadius: pixel.px2dp(2),
    ...CommonFlexStyles.flexCenter
  },
  tagText: {
    fontSize: ECommonFontSize.FontSize10,
    color: ESolidColor.White,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
})
