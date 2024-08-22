import { StyleSheet } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'

export default StyleSheet.create({
  busyBlockItem: {
    position: 'absolute',
    left: busyStyleConst.leftWidth + 1,
    right: 0,
    zIndex: 60,
    borderRadius: 4,
    borderWidth: 1
  },
  unConfilict: {
    backgroundColor: 'rgba(0, 179, 101, .06)',
    borderColor: '#00b365'
  },
  conflict: {
    backgroundColor: 'rgba(255, 136, 0, .06)',
    borderColor: '#ff8800'
  },
  noBorderBottom: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  }
})
