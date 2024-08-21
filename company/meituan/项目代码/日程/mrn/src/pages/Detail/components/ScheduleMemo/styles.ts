import { StyleSheet } from '@mrn/react-native'
import { CommonTextStyles, EPrimaryColor } from '@src/common/styles'

export const styles = StyleSheet.create({
  text: {
    ...CommonTextStyles.defaultText
  },
  link: {
    color: EPrimaryColor.Blue
  }
})
