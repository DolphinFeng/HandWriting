import { StyleSheet } from '@mrn/react-native'
import { px2dp } from '@onejs/mrn-utils'
import { CommonTextStyles, CommonFlexStyles, EPrimaryColor } from '@src/common/styles'
import { containerPaddingH } from '../../consts'

export const styles = StyleSheet.create({
  icon: { fontSize: px2dp(19) },
  room: {
    ...CommonFlexStyles.flexDefault
  },
  main: {
    flex: 1,
    paddingRight: containerPaddingH
  },
  text: {
    ...CommonTextStyles.defaultText
  },
  reminderText: {
    ...CommonTextStyles.remindText
  },
  reminderLinkText: {
    ...CommonTextStyles.remindText,
    color: '#0A70F5'
  },
  uMeetIcon: {
    ...CommonTextStyles.defaultText,
    color: EPrimaryColor.Blue,
    fontSize: 16
  },
  arrow: {
    ...CommonTextStyles.defaultText,
    fontSize: px2dp(19),
    color: 'rgba(0, 0, 0, 0.36)'
  },
  uMeetContanier: {
    flexDirection: 'row'
  }
})
