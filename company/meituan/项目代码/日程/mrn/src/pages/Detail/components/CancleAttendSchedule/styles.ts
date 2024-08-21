import { StyleSheet } from '@mrn/react-native'
import { px2dp } from '@onejs/mrn-utils'

export const styles = StyleSheet.create({
  btn: {
    color: '#FF5F5A',
    fontSize: px2dp(17),
    lineHeight: px2dp(24)
  },
  item: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancleItem: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },

  itemFooter: {
    marginTop: 4,
    borderBottomWidth: 0
  },
  itemText: {
    fontSize: px2dp(16),
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.87)'
  },
  highlight: {
    color: '#FF5F5A'
  }
})
