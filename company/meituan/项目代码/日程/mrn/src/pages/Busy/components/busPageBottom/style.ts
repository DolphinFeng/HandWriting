import { StyleSheet } from '@mrn/react-native'
import {
  CommonFlexStyles,
  EPrimaryColor,
  ETransparentColor,
  ONE_PIX_BORDER
} from '@src/common/styles'

export default StyleSheet.create({
  bottomContanier: {
    position: 'absolute',
    bottom: 0,
    height: 64,
    zIndex: 100,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopColor: ETransparentColor.Black12,
    borderTopWidth: ONE_PIX_BORDER,
    paddingHorizontal: 16,
    ...CommonFlexStyles.flexDefault
  },
  longPageBtn: {
    width: '100%',
    height: 40,
    backgroundColor: EPrimaryColor.Blue,
    borderRadius: 8,
    ...CommonFlexStyles.flexCenter
  },
  shortBtn: {
    height: 40,
    backgroundColor: EPrimaryColor.Blue,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...CommonFlexStyles.flexCenter
  },
  conflictText: {
    marginTop: 2
  }
})
