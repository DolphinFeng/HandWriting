import { StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import { CommonFlexStyles, ESolidColor, ETransparentColor } from '@src/common/styles'

export default StyleSheet.create({
  disabledText: {
    color: ESolidColor.GrayE0
  },
  item: {
    backgroundColor: ESolidColor.White,
    padding: pixel.px2dp(16),
    ...CommonFlexStyles.flexDefault
  },
  time: {
    height: pixel.px2dp(98),
    paddingHorizontal: pixel.px2dp(48)
  },
  errorText: {
    color: ESolidColor.Red
  },
  arrowIcon: {
    fontSize: pixel.px2dp(30),
    color: ETransparentColor.Black12,
    width: pixel.px2dp(40)
  },
  timePicker: {
    flex: 1
  }
})
