import { StyleSheet } from '@mrn/react-native'
import { CommonTextStyles } from '@src/common/styles'
import { containerPaddingH } from '../../consts'

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0'
  },
  main: {
    backgroundColor: '#FFF',
    paddingLeft: containerPaddingH
  },
  icon: {
    fontSize: 19
  },
  defaultText: {
    ...CommonTextStyles.defaultText
  }
})
