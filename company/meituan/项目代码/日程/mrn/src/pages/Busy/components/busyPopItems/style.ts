import { StyleSheet } from '@mrn/react-native'
import { CommonFlexStyles, CommonTextStyles } from '@src/common/styles'

export const POP_WIDTH = 152
const POP_TOP = 80
export const TRANGLE_WIDTH = 12
export const POP_BORDER_RADIUS = 10

export default StyleSheet.create({
  popContanier: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999
  },
  popTrangle: {
    top: POP_TOP - 8 * 2,
    position: 'absolute',
    width: 0,
    height: 0,
    borderWidth: 8,
    borderColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 2
  },
  popItems: {
    backgroundColor: '#fff',
    borderRadius: POP_BORDER_RADIUS,
    shadowOpacity: 0.24,
    shadowRadius: 100,
    elevation: 10,
    width: POP_WIDTH,
    shadowOffset: { width: 0, height: 4 },
    paddingVertical: 4,
    top: POP_TOP,
    position: 'absolute',
    zIndex: 1
  },
  popBtns: {
    height: 48,
    paddingLeft: 16,
    ...CommonFlexStyles.flexStart
  },
  popIcons: {
    ...CommonTextStyles.defaultText16,
    fontSize: 18,
    marginRight: 8
  },
  popText: {
    ...CommonTextStyles.defaultText16
  }
})
