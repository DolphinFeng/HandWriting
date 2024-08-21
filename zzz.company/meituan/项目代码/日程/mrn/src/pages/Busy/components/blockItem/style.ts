import { StyleSheet } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'
import { CommonFlexStyles, CommonTextStyles } from '@src/common/styles'

export default StyleSheet.create({
  block: {
    width: busyStyleConst.leftWidth,
    height: busyStyleConst.hearderHeight,
    position: 'absolute',
    zIndex: 90,
    backgroundColor: '#fff',
    paddingTop: 3,
    ...CommonFlexStyles.flexEnd
  },
  membersContent: {
    ...CommonFlexStyles.flexCenter
  },
  boldSmallText: {
    ...CommonTextStyles.boldSmallText,
    marginBottom: 3,
    marginRight: -2
  },
  selectIcon: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.84)'
  },
  selectNoText: {
    ...CommonTextStyles.smallRemindText,
    textAlign: 'center'
  }
})
