import { StyleSheet } from '@mrn/react-native'
import { px2dp } from '@onejs/mrn-utils'
import { CommonFlexStyles } from '@src/common/styles'

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF'
  },
  view: {
    ...CommonFlexStyles.flexCenter,
    justifyContent: 'space-around',
    paddingVertical: px2dp(10),
    paddingHorizontal: px2dp(40)
  }
})
