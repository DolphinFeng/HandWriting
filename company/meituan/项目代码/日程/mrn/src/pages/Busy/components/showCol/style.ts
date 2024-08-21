import { StyleSheet } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'

export default StyleSheet.create({
  colItem: {
    position: 'absolute',
    top: busyStyleConst.topStart,
    left: 0,
    right: busyStyleConst.itemDistanceWidth,
    zIndex: 60,
    height: 1
  }
})
