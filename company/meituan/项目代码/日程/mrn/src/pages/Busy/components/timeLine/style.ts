import { StyleSheet } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'
import { CommonFlexStyles, ONE_PIX_BORDER } from '@src/common/styles'

export default StyleSheet.create({
  timeLineContariner: {
    position: 'absolute',
    top: 10,
    zIndex: 99,
    left: busyStyleConst.leftWidth,
    right: 0,
    height: 5,
    ...CommonFlexStyles.flexCenter
  },
  circle: {
    width: 5,
    height: 5,
    backgroundColor: '#F5483B',
    borderRadius: 5
  },
  line: {
    height: ONE_PIX_BORDER,
    width: '100%',
    backgroundColor: '#F5483B'
  }
})
