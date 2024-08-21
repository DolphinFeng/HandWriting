import { StyleSheet, Dimensions, ViewStyle } from '@mrn/react-native'
import theme from '@src/common/styles/MWSStyle'
const { width } = Dimensions.get('window')

// 暂时方案：按页面区分

export const cStyle = StyleSheet.create({
  promptDialogTitle: {
    fontSize: theme.size16,
    color: 'rgba(0,0,0,0.84)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22
  },
  promptTitle: {
    fontSize: theme.size14,
    color: 'rgba(0,0,0,0.84)',
    textAlign: 'center',
    lineHeight: 20
  },
  dialogOperation: {},
  dialogOperationText: {
    flex: 1,
    lineHeight: 48,
    textAlign: 'center',
    fontSize: theme.size16
  },
  dialogCancelText: {
    color: 'rgba(0,0,0,0.60)'
  },
  dialogConfirmText: {
    color: theme.yellow800,
    fontWeight: '500'
  }
})

// 详情页样式
export const dStyle = StyleSheet.create({
  SLAOutWrapper: {
    marginHorizontal: theme.spacing10,
    marginVertical: theme.spacing8,
    borderRadius: theme.radius8,
    height: theme.height48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing12
  },
  SLAInnerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius6,
    paddingHorizontal: theme.spacing10,
    paddingVertical: theme.spacing4,
    marginRight: theme.spacing12,
    minWidth: theme.width66
  },
  SLAFont14: {
    fontSize: theme.size12,
    color: 'white',
    ...theme.fontBold
  } as ViewStyle,
  DescWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 10
  },
  DescFont24: {
    fontSize: theme.size24,
    lineHeight: theme.heith30,
    color: theme.gray84,
    flex: 1,
    ...theme.fontBold
  } as ViewStyle,

  FontBold16: {
    fontSize: theme.size16,
    lineHeight: theme.height22,
    color: theme.gray84,
    ...theme.fontBold
  } as ViewStyle,
  FontRegul16: {
    fontSize: theme.size16,
    color: theme.gray60,
    lineHeight: theme.height22
  },
  FontRegul10: {
    fontSize: theme.size10,
    color: theme.gray84,
    lineHeight: theme.height14
  },
  FlowBtn: {
    fontSize: theme.size10,
    color: 'rgba(0,0,0,0.84)',
    lineHeight: theme.height14,
    ...theme.fontBold
  } as ViewStyle,
  FontBoldl12: {
    ...theme.fontBold,
    fontSize: theme.size12,
    color: theme.gray36,
    lineHeight: theme.height18
  } as ViewStyle,
  FontRegul12: {
    fontSize: theme.size12,
    color: theme.gray36,
    lineHeight: theme.height18
  },
  FontRegul14: {
    fontSize: theme.size14,
    color: theme.gray60,
    lineHeight: theme.height20
  },
  Font14by87: {
    fontSize: theme.size14,
    color: theme.gray87,
    lineHeight: theme.height22
  },
  Font14by84: {
    ...theme.fontBold,
    fontSize: theme.size14,
    color: theme.gray84,
    lineHeight: theme.height20
  } as ViewStyle,
  Font14byFF: {
    ...theme.fontBold,
    fontSize: theme.size14,
    color: 'white',
    lineHeight: theme.height20
  } as ViewStyle,
  FontBold14: {
    ...theme.fontBold,
    fontSize: theme.size14,
    lineHeight: theme.height20,
    color: theme.gray87
  } as ViewStyle,
  FontRegu12: {
    fontSize: theme.size12,
    lineHeight: theme.height18,
    color: theme.gray60
  } as ViewStyle,
  InfoText: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    paddingVertical: 12,
  } as ViewStyle,
  DevideLine: {
    height: 1,
    backgroundColor: '#F5F5F5'
  } as ViewStyle,
  Edit: {
    borderRadius: theme.radius6,
    backgroundColor: theme.gray06,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    height: 28,
    width: 28
  },
  EditPlaceHolder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    height: 28,
    width: 28
  },
  ActivieUnderline: {
    backgroundColor: theme.yellow300,
    height: 3,
    borderRadius: theme.radius1by5
  },
  ticketDivider1: {
    ...theme.divider1
  } as ViewStyle,
  attachWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
    marginHorizontal: 16
  },
  attachInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 12
  },
  image18: {
    width: 18,
    height: 18
  },
  image24: {
    width: 24,
    height: 24
  },
  image36: {
    width: 36,
    height: 36
  },
  fileIcon: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 4
  },
  flowBtn: {
    alignItems: 'center',
    height: 40,
    width: 88,
    borderRadius: 8,
    justifyContent: 'center'
  },
  aboutTxt: {
    textDecorationLine: 'underline',
    color: theme.blueDC,
    fontSize: 14,
    lineHeight: 20
  },
  satisfyWrapper: {
    justifyContent: 'center',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    marginHorizontal: 16
  },
  cancel: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    left: 0,
    position: 'absolute'
  },
  preTextStyle: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    paddingLeft: 16,
    minHeight: 30
  },
  createChat: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    right: 0,
    position: 'absolute'
  } as ViewStyle,
  chatTxt: {
    ...theme.fontBold,
    color: theme.yellow800,
    fontSize: theme.size16
  } as ViewStyle,
  circle: {
    backgroundColor: theme.yellow300,
    height: 20,
    width: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  font16By84: {
    fontSize: theme.size16,
    color: theme.gray84,
    lineHeight: 22
  },
  inputTxt: {
    height: 100,
    paddingTop: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    backgroundColor: theme.grayF5
  },
  satisfyBtn: {
    height: 40,
    width: width - 32,
    borderColor: 'white',
    borderRadius: 8
  },
  lineItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 8
  },
  lineDot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'solid',
    width: 9,
    height: 9,
    borderRadius: 10
  },
  lineVer: {
    borderWidth: 1,
    width: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.12)',
    height: 20,
    marginVertical: 2
  },
  peopleCategory: {
    fontSize: theme.size14,
    color: 'rgba(0,0,0,0.84)',
    lineHeight: theme.height20
  },
  finishTxt: {
    ...theme.fontBold,
    fontSize: theme.size16,
    lineHeight: theme.height22
  } as ViewStyle,
  avator: {
    height: 36,
    width: 36,
    overflow: 'hidden',
    borderRadius: 18
  },
  iconButton: {
    width: 24,
    height: 24,
    tintColor: '#979797'
  },
  coloredIconButton: {
    width: 24,
    height: 24,
    tintColor: theme.yellow800
  },
  foldBar: {
    alignItems: 'center',
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  foldBtn: {
    height: 16,
    width: 16,
    opacity: 0.24
  },
  avatar: {
    height: 24,
    width: 24,
    borderRadius: 12,
    overflow: 'hidden'
  },
  ccWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    height: 32,
    borderRadius: 16,
    paddingLeft: 4,
    paddingRight: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 6,
    maxWidth: '90%'
  },
  addTag: {
    position: 'absolute',
    right: 0,
    top: 2,
    color: 'rgba(0, 0, 0, 0.36)'
  },
  labelTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 8,
    marginBottom: 6
  },
  exteranlTag: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.8)',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginLeft: 4,
    marginRight: 8
  },
  editIcon: {
    width: 20,
    height: 20,
    opacity: 0.6
  },
  homeIcon: {
    width: 15,
    height: 15,
    opacity: 0.6,
    marginLeft: 5,
    marginRight: 5  
  },
  copyIcon: {
    width: 16,
    height: 16,
    paddingLeft: 10,
  },
  assignMe: {
    fontSize: theme.size12,
    lineHeight: theme.size20,
    color: theme.yellow800,
    ...theme.fontBold
  } as ViewStyle,
  vDivider: {
    width: 1,
    height: 12,
    backgroundColor: theme.gray12,
    marginHorizontal: 8
  },
  satisfyTip: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#FF5E1A'
  },
  satisfyMark: {
    fontSize: 12,
    color: '#f5483b'
  },
  satisfyCommonTxt: {
    color: 'rgba(0,0,0,0.60)',
    fontSize: 12,
    fontFamily: 'PingFangSC-Regular'
  },
  satisfySelectedTxt: {
    color: '#F5BA31',
    fontSize: 12,
    fontFamily: 'PingFangSC-Medium',
    fontWeight: 'bold'
  },
  dashLine: {
    height: 0,
    borderWidth: 0.8,
    borderColor: 'rgba(0,0,0,0.38)',
    borderStyle: 'dashed',
    borderRadius: 0.1
  }
})

export function convertHex(hex: string, opacity: number): string {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')'
  return result
}

// TT 首页样式
export const TTHomeListStyle = StyleSheet.create({
  rowItem: {
    paddingHorizontal: theme.spacing16,
    paddingVertical: theme.spacing14
  },
  itemTitle: {
    fontSize: theme.size16,
    // ...theme.fontBold,
    color: theme.gray84,
    lineHeight: theme.size24
  } as ViewStyle,
  stateStyle: {
    paddingHorizontal: theme.spacing6,
    paddingVertical: theme.spacing3,
    color: theme.white,
    borderRadius: theme.radius4,
    fontSize: theme.size12,
    lineHeight: theme.height14
  },
  stateBg: {
    // paddingVertical: 2,
    height: 20,
    borderRadius: theme.radius4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stateText: {
    marginHorizontal: theme.spacing6,
    color: theme.white,
    fontSize: theme.size12,
    lineHeight: theme.height14
  },
  itemTime: {
    fontSize: theme.size12,
    lineHeight: theme.size20,
    color: theme.gray36
  }
})

export const TTHomeFilterStyle = StyleSheet.create({
  whole: {
    // backgroundColor: '#ffff82',
    // justifyContent: 'center'
    flexDirection: 'column',
    justifyContent: 'space-between',
    // margin: 12,
    paddingLeft: 16,
    paddingRight: 16
  },
  button: {
    marginRight: 0,
    borderRadius: 8,
    width: (Dimensions.get('window').width - 32 - 15) / 2,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    ...theme.fontBold,
    fontSize: theme.size14,
    color: theme.gray84,
    lineHeight: theme.height20
  } as ViewStyle
})

export const TTCreateStyle = StyleSheet.create({
  valueStyle: {
    fontSize: theme.size16,
    lineHeight: theme.height20,
    color: theme.gray84
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: 'white'
  },
  tip: {
    fontSize: theme.size12,
    lineHeight: theme.height20,
    color: theme.gray38,
    marginTop: 4
  }
})

export const TTHomeStyle = StyleSheet.create({
  itemTitle: {
    ...theme.fontBold,
    fontSize: theme.size13,
    lineHeight: theme.height18,
    color: theme.gray84,
    marginLeft: 8,
    fontFamily: 'PingFangSC-Medium'
  } as ViewStyle,
  itemCount: {
    fontSize: theme.size13,
    lineHeight: theme.height18,
    color: theme.gray36,
    marginLeft: 2
  }
})
