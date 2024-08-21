import { StyleSheet } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'
import { CommonFlexStyles } from '@src/common/styles'

export default StyleSheet.create({
  mask: {
    position: 'absolute',
    left: busyStyleConst.leftWidth,
    right: 0,
    top: busyStyleConst.hearderHeight + 1,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingBottom: 100,
    ...CommonFlexStyles.flexColumn
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.36)',
    lineHeight: 16
  }
})
