import { StyleSheet } from '@mrn/react-native'
import tipStyle from '@ss/mtd-react-native'
export const CommonStyle = StyleSheet.create({
  icon: {
    width: 24,
    height: 24
  }
})

export const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff',
    flex: 1
  },
  titleItem: {
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.87)',
    fontFamily: 'PingFangSC-Medium'
  },
  starImage: {
    width: 24,
    height: 24
  },
  tabBoxInner: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F2',
    height: 44
  },
  tabContent: {
    flex: 1
  },
  tabContentText: {
    fontSize: 14,
    color: '#D8D8D8',
    fontFamily: 'PingFangSC-Regular'
  },
  baseTab: {
    marginLeft: 16,
    marginTop: 12,
    paddingRight: 12,
    alignItems: 'flex-start'
  },
  baseItem: {
    flexDirection: 'row',
    marginBottom: 12
  },
  baseKey: {
    width: 80,
    height: 22,
    color: 'rgba(0,0,0,0.38)',
    fontSize: 16
  },
  baseValue: {
    flex: 1,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 16
  },
  baseLevel: {
    borderWidth: 0.5,
    borderColor: '#8C1B20',
    borderRadius: 2,
    fontSize: 12,
    color: '#8C1B20',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14
  },
  recordUser: {
    flexDirection: 'row'
  },
  recordAvator: {
    width: 24,
    height: 24,
    marginRight: 8
  },
  recordName: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 16
  },
  recordTime: {
    color: 'rgba(0,0,0,0.24)',
    fontSize: 12,
    textAlign: 'right'
  },
  recordInfo: {
    color: 'rgba(0,0,0,0.87)',
    paddingLeft: 48,
    paddingRight: 16,
    marginBottom: 10,
    marginTop: 8,
    fontSize: 16
  },
  container: {
    flex: 1,
    paddingTop: 22
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontFamily: 'PingFangSC-Medium',
    backgroundColor: 'rgba(247,247,247,1.0)'
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44
  },
  tag: {
    fontSize: 17,
    lineHeight: 22,
    color: 'rgba(0,0,0,0.87)',
    marginTop: 12,
    fontFamily: 'PingFangSC-Medium',
    paddingHorizontal: 16
  },
  tagContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    flexDirection: 'row'
  },
  tagInfo: {
    paddingVertical: 10
  },
  tagText: {
    backgroundColor: '#F7F7F7',
    borderColor: '#F7F7F7',
    borderRadius: 3,
    color: 'rgba(0,0,0,0.60)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    height: 28
  },
  pressedTag: {
    backgroundColor: '#EEF6FF',
    borderColor: '#EEF6FF',
    borderRadius: 3,
    color: '#1C6CDC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    height: 28,
    fontFamily: 'PingFangSC-Medium',
    fontWeight: '500'
  },
  outline: {
    marginBottom: 68
  },
  empty: {
    marginHorizontal: 16,
    fontFamily: 'PingFangSC-Regular',
    fontSize: 16,
    color: 'rgba(0,0,0,0.87)',
    letterSpacing: 0,
    lineHeight: 20,
    marginVertical: 12
  },
  line: {
    height: 8,
    backgroundColor: '#F7F7F7'
    // marginTop: 12
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16
  },
  rowLeft: {
    color: 'rgba(0,0,0,0.38)',
    fontFamily: 'PingFangSC-Regular',
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 22
  },
  rowRight: {
    color: 'rgba(0,0,0,0.87)',
    fontFamily: 'PingFangSC-Regular',
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 22
  }
})

export const tipStyles = Object.assign(tipStyle, {
  container: {
    backgroundColor: '#EEF6FF'
  },
  textStyle: {
    // todo mrn2.0
    // ...tipStyle.textStyle,
    color: 'rgba(0,0,0,0.87)',
    lineHeight: 20
  }
})
