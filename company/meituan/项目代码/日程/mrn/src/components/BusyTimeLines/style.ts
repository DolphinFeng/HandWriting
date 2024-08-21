import { StyleSheet } from '@mrn/react-native'
import { ONE_PIX_BORDER } from '@src/common/styles'
import busyStyleConst from '@src/common/styles/busy'

export default StyleSheet.create({
  hours: {
    marginTop: -6,
    fontSize: 10,
    color: 'rgba(0,0,0,0.36)',
    fontWeight: '500',
    lineHeight: 12,
    textAlign: 'right'
  },
  left: {
    position: 'absolute',
    top: busyStyleConst.hearderHeight,
    left: 0,
    paddingRight: 12,
    zIndex: 99,
    width: busyStyleConst.leftWidth,
    backgroundColor: '#fff'
  },
  distance: {
    height: 24,
    backgroundColor: '#fff'
  },
  timeItem: {
    height: busyStyleConst.oneHourHeight
  },
  timeLinesContanier: {
    right: 0,
    position: 'absolute',
    left: 0,
    top: busyStyleConst.hearderHeight
  },
  lineItem: {
    width: '100%',
    height: busyStyleConst.oneHourHeight,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    borderTopWidth: ONE_PIX_BORDER
  }
})
