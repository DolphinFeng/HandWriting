import { StyleSheet } from '@mrn/react-native'
import { ETransparentColor, ONE_PIX_BORDER } from '@src/common/styles'
import busyStyleConst from '@src/common/styles/busy'

export default StyleSheet.create({
  scrollContanier: { backgroundColor: '#fff' },
  pageContanier: {
    flex: 1,
    position: 'relative'
  },
  devider: {
    height: ONE_PIX_BORDER,
    left: 0,
    right: 0,
    top: busyStyleConst.hearderHeight,
    position: 'absolute',
    zIndex: 99,
    backgroundColor: ETransparentColor.Black12
  },
  headerItem: {
    position: 'absolute',
    top: 0,
    left: busyStyleConst.leftWidth,
    right: 0,
    zIndex: 30,
    backgroundColor: '#fff'
  },
  busyInfos: {
    marginTop: busyStyleConst.hearderHeight,
    marginLeft: busyStyleConst.leftWidth
  },
  busyContanier: {
    height: busyStyleConst.oneHourHeight * 25,
    position: 'relative'
  },
  verWhiteLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: busyStyleConst.itemDistanceWidth,
    backgroundColor: '#fff'
  }
})
