import { StyleSheet } from '@mrn/react-native'
import { px2dp } from '@onejs/mrn-utils'
import { CommonTextStyles, CommonFlexStyles } from '@src/common/styles'

export const styles = StyleSheet.create({
  box: {
    ...CommonFlexStyles.flexDefault
  },
  text: {
    ...CommonTextStyles.defaultText,
    color: 'rgba(0, 0, 0, 0.36)',
    textAlign: 'center'
  },
  countText: {
    ...CommonTextStyles.defaultText,
    textAlign: 'center'
  },
  normalText: {
    ...CommonTextStyles.middleText,
    color: 'rgba(0, 0, 0, 0.36)'
  },
  conflictText: {
    color: '#FF8800',
    fontSize: px2dp(14),
    fontWeight: '500'
  },
  conflictIcon: {
    color: '#FF8800',
    fontSize: px2dp(14)
  },
  arrow: {
    fontSize: px2dp(19)
  }
})
