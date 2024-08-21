import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { pixel } from '@onejs/mrn-utils'
import { CommonFlexStyles, ECommonFontSize, ESolidColor } from '@src/common/styles'

export const styles = StyleSheet.create({
  container: {
    backgroundColor: ESolidColor.White
  },
  item: {
    ...CommonFlexStyles.flexStart,
    height: pixel.px2dp(60),
    paddingHorizontal: pixel.px2dp(14)
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
