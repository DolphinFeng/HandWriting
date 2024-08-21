import { StyleSheet } from '@mrn/react-native'
import { px2dp } from '@onejs/mrn-utils'
import { CommonFlexStyles } from '@src/common/styles'

export const styles = StyleSheet.create({
  container: {
    ...CommonFlexStyles.flexStart,
    flexWrap: 'wrap',
    marginBottom: px2dp(6)
  },
  title: {
    color: 'rgba(0, 0, 0, 0.93)',
    fontSize: px2dp(19),
    lineHeight: px2dp(26),
    fontWeight: 'bold',
    marginRight: px2dp(10)
  },
  tag: {}
})
