import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { device, pixel } from '@onejs/mrn-utils'
import { CommonFlexStyles, CommonTextStyles, ESolidColor } from '@src/common/styles'

const { width } = device.screen

export default StyleSheet.create({
  container: {
    backgroundColor: ESolidColor.White,
    paddingHorizontal: pixel.px2dp(8),
    height: '100%'
  },
  scrollPickerWrapper: {
    height: pixel.px2dp(140),
    overflow: 'hidden'
  },
  scrollPicker: {
    marginTop: pixel.px2dp(-100)
  },
  weekButtonWrapper: {
    marginVertical: pixel.px2dp(6),
    borderRadius: 99,
    width: pixel.px2dp(32),
    height: pixel.px2dp(32),
    backgroundColor: ESolidColor.White,
    ...CommonFlexStyles.flexCenter
  },
  monthPickerContainer: {
    ...CommonFlexStyles.flexStart,
    flexWrap: 'wrap'
  },
  monthButtonWrapper: {
    marginVertical: pixel.px2dp(6),
    width: pixel.px2dp(32),
    height: pixel.px2dp(32),
    borderRadius: 99,
    ...CommonFlexStyles.flexCenter,
    backgroundColor: ESolidColor.White,
    marginRight: Math.round((width - 32 * 7 - 16) / 6)
  },
  rightButtonWrapper: {
    marginRight: 0
  },
  selectBg: {
    backgroundColor: EPrimaryColor.Blue
  },
  selectText: {
    color: ESolidColor.White
  },
  text: {
    ...CommonTextStyles.middleText,
    paddingVertical: pixel.px2dp(12)
  }
})
