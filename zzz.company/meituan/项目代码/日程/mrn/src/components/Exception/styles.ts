import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { px2dp } from '@onejs/mrn-utils'
import { CommonFlexStyles, CommonTextStyles, ETransparentColor } from '@src/common/styles'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...CommonFlexStyles.flexCenter,
    backgroundColor: EPrimaryColor.White
  },
  main: {
    ...CommonFlexStyles.flexColumn
  },
  iconfont: {
    fontSize: px2dp(72),
    color: ETransparentColor.Black12
  },
  text: {
    ...CommonTextStyles.defaultText,
    lineHeight: px2dp(26),
    fontWeight: '500',
    paddingTop: px2dp(16),
    paddingBottom: px2dp(72)
  }
})
