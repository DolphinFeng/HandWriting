import { StyleSheet } from '@mrn/react-native'
import { px2dp } from '@onejs/mrn-utils'
import { CommonTextStyles, CommonFlexStyles } from '@src/common/styles'
import { containerPaddingV, containerPaddingH } from '../../consts'

export const styles = StyleSheet.create({
  container: {
    ...CommonFlexStyles.flexStart,
    alignItems: 'flex-start'
  },
  iconBox: {
    paddingVertical: containerPaddingV
  },
  icon: {
    fontSize: px2dp(19)
  },
  iconLess: {
    opacity: 0
  },
  contentBox: {
    flex: 1,
    paddingLeft: containerPaddingH
  },
  mainContent: {
    paddingRight: containerPaddingH,
    paddingVertical: containerPaddingV
  },
  text: {
    ...CommonTextStyles.defaultText
  }
})
