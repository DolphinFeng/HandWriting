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
  arrow: {
    fontSize: px2dp(19)
  }
})

export const avatarStyles = StyleSheet.create({
  avatarContainer: {
    flexShrink: 1
    // paddingVertical: containerPaddingV
  },
  avatarBox: {
    paddingRight: 16,
    width: '100%',
    ...CommonFlexStyles.flexDefault
  },
  avatarItem: {
    ...CommonFlexStyles.flexColumn
  },
  name: {
    ...CommonTextStyles.smallText,
    paddingVertical: px2dp(4),
    color: 'rgba(0,0,0,0.46)',
    maxWidth: px2dp(38)
  }
})
