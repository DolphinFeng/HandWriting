import { StyleSheet } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'

export default StyleSheet.create({
  busy: {
    backgroundColor: '#EBF5FF',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingTop: 2
  },
  colItem: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: busyStyleConst.itemDistanceWidth,
    zIndex: 60,
    height: 1
  }
})
