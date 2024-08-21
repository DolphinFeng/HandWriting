import { StyleSheet } from '@mrn/react-native'
import { px2dp } from '@onejs/mrn-utils'

export const styles = StyleSheet.create({
  tag: {
    borderColor: '#AAA',
    alignItems: 'center',
    paddingHorizontal: px2dp(4),
    height: px2dp(16),
    lineHeight: px2dp(16),
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  tagText: {
    color: '#666',
    fontSize: px2dp(11),
    fontWeight: '500'
  }
})
