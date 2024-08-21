import { StyleSheet } from '@mrn/react-native'
import { EPrimaryColor } from '@onejs/mrn'
import { px2dp } from '@onejs/mrn-utils'
import { CommonFlexStyles } from '@src/common/styles'
import { containerPaddingH } from '../../consts'

export const styles = StyleSheet.create({
  container: {
    height: px2dp(44),
    backgroundColor: EPrimaryColor.White,
    paddingHorizontal: containerPaddingH,
    paddingTop: px2dp(8)
  },
  box: {
    ...CommonFlexStyles.flexCenter,
    justifyContent: 'space-between',
    backgroundColor: '#FFFAE0',
    paddingLeft: px2dp(12),
    paddingRight: px2dp(8),
    height: px2dp(36),
    borderRadius: 8
  },
  text: {
    fontSize: px2dp(14),
    lineHeight: px2dp(20),
    textAlign: 'center',
    color: '#8F5300'
  },
  icon: {
    fontSize: px2dp(19)
  }
})
