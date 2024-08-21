import { StyleSheet } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'

export default StyleSheet.create({
  busyItemContanier: {
    minWidth: busyStyleConst.itemMinWidth,
    height: busyStyleConst.hearderHeight,
    marginRight: busyStyleConst.itemDistanceWidth,
    paddingTop: 3
  },
  infoContanier: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 8
  },
  busyAvatarContanier: {
    width: 36,
    height: 36,
    borderRadius: 36,
    overflow: 'hidden'
  },
  contentAll: {
    position: 'relative'
  },
  busyName: {
    marginTop: 4,
    width: 48,
    textAlign: 'center'
  },
  conflictIcon: {
    fontSize: 16,
    position: 'absolute',
    right: -2,
    top: -1,
    color: '#FF8800',
    backgroundColor: '#fff',
    borderRadius: 16
  }
})
