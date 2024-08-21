import { StyleSheet, Dimensions, Platform } from '@mrn/react-native'
import {
  getNavigationHeight,
  getPaddingTop
} from '@common/styles/NavigationStyle'
const { width } = Dimensions.get('window')
export const MWSStyle = StyleSheet.create({
  icon: {
    width: 20,
    height: 20
  },
  arrowIcon: {
    width: 16,
    height: 16
  },
  headerStyle: {
    height: getNavigationHeight(),
    paddingTop: getPaddingTop(),
    backgroundColor: 'white',
    borderBottomWidth: 0,
    ...Platform.select({
      android: {
        elevation: 0
      }
    })
  },
  headerTitleStyle: {
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'PingFangSC-Medium',
    fontSize: 18,
    color: 'rgba(0,0,0,0.87)',
    letterSpacing: 0,
    lineHeight: 26
  },
  header: {
    height: 40,
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  Font12C36: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 12,
    color: 'rgba(0,0,0,0.36)',
    lineHeight: 20
  },
  Font12C6: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.60)',
    lineHeight: 20
  },
  font14C6: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 14,
    color: 'rgba(0,0,0,0.60)',
    lineHeight: 22
  },
  Font12C24: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.24)',
    lineHeight: 20
  },
  font12BlueRegular: {
    fontSize: 12,
    color: '#005ADE',
    lineHeight: 18
  },
  Font14C6: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.60)',
    lineHeight: 22
  },
  font14blue: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 14,
    color: '#005ADE',
    lineHeight: 22
  },
  font14Black: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 14,
    color: 'rgba(0,0,0,0.84)',
    lineHeight: 22
  },
  font14M: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 14,
    lineHeight: 20
  },
  font14BlueRegular: {
    fontSize: 14,
    color: '#005ADE',
    lineHeight: 22
  },
  font16blue: {
    fontSize: 16,
    color: '#1C6CDC',
    lineHeight: 24
  },
  Font16M: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 16,
    color: 'rgba(0,0,0,0.84)',
    lineHeight: 24
  },
  Font18R: {
    fontWeight: 'bold',
    alignSelf: 'center',
    flex: 1,
    fontFamily: 'PingFangSC-Regular',
    fontSize: 18,
    color: 'rgba(0,0,0,0.87)',
    letterSpacing: 0,
    lineHeight: 26
  },
  rowItem: {
    height: 76,
    // alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  rowWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 24,
    alignItems: 'center'
  },
  leftKey: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 16,
    color: 'rgba(0,0,0,0.84)',
    lineHeight: 24,
    width: width - 132
  },
  textLabel: {
    paddingHorizontal: 2,
    borderWidth: 0.5,
    borderRadius: 2,
    fontSize: 12
  },
  divider1: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)'
  },
  divider8: {
    height: 8,
    backgroundColor: '#F8F8F8'
  },
  filterParent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingBottom: 8,
    paddingTop: 8
  },
  filterSeprator: {
    width: 1,
    height: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.07)'
  },
  UnitWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  Font14Key: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.38)',
    lineHeight: 22,
    width: 84,
    marginRight: 12
  },
  Font14Value: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.87)',
    lineHeight: 22,
    width: width - 128
  },
  Font18Value: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 18,
    color: 'rgba(0,0,0,0.87)',
    lineHeight: 26,
    marginTop: 22
  },
  top20: {
    marginTop: 20
  },
  top8: {
    marginTop: 8
  },
  processTypeButton: {
    height: 32,
    backgroundColor: '#F7F7F7',
    borderRadius: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  processTextSelect: {
    color: 'black',
    paddingHorizontal: 13
  },
  processTextHint: {
    color: 'rgba(0, 0, 0, 0.24)',
    fontSize: 14,
    paddingHorizontal: 13
  },
  white: {
    backgroundColor: 'white'
  },
  imgSize: {
    height: 24,
    width: 24
  },
  tagRed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    borderColor: '#00B365'
  },
  normalBtn: {
    height: 40,
    width: 80,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
