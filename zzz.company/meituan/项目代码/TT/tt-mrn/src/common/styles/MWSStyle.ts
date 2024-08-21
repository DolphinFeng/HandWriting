/**
 * 样式模版化
 * 遵循分层原则
 * 提取项目级的公共属性（分层）
 * 一级：
 *    color：用于存放整个项目的全部颜色
 *    size：用于存放整个项目的通用大小，比如说行高、间距、字体大小等公共的数值参数。
 *    layout：用于存放整个项目的公共布局，例如控制布局的flex属性、通用的padding、margin、position定位。
 * 二级：
 *    颜色：边框颜色、背景颜色、字体颜色...
 *    大小：边框大小、间距大小、字体大小...
 *    布局：flex布局、position定位...
 */

// 色彩, NOTE: must use `#000000` instead of `#000`
// https://facebook.github.io/react-native/docs/colors.html
// 8-digit-hex to 4-digit hex https://css-tricks.com/8-digit-hex-codes/
// https://www.chromestatus.com/feature/5685348285808640 chrome will support `#RGBA`
// 最后打平输出

import { StyleSheet } from '@mrn/react-native'
const px = StyleSheet.hairlineWidth

// 颜色
// 后缀是颜色后两位
const colors = {
  black: '#000000',
  black22: '#222222',
  white: '#ffffff',
  gray87: 'rgba(0, 0, 0, 0.87)',
  gray84: 'rgba(0, 0, 0, 0.84)',
  gray60: 'rgba(0, 0, 0, 0.6)',
  gray38: 'rgba(0, 0, 0, 0.38)',
  gray36: 'rgba(0, 0, 0, 0.36)',
  gray24: 'rgba(0, 0, 0, 0.24)',
  gray12: 'rgba(0, 0, 0, 0.12)',
  gray06: 'rgba(0,0,0,0.06)',
  gray04: 'rgba(0,0,0,0.04)',
  grayA3: '#A3A3A3',
  grayE0: '#E0E0E0',
  gray9B: '#9B9B9B',
  grayF2: '#f2f2f2',
  grayF5: '#F5F5F5',
  grayFA: '#F8F9FA',
  gray8F: '#8F8F8F',
  grayF8: '#F8F8F8',
  grayDF: '#DFE0DF',
  grayE9: '#E9E9E9',
  yellow2A: '#FFA62A',
  yellow800: '#FF8800',
  yellow300: '#FFC300',
  yellow600: '#FF9600',
  yellowEE: '#FFF8EE',
  yellow25: '#FFA425',
  yellowF00: '#EF7F00',
  red57: '#FE6557',
  red3B: '#F5483B',
  red29: '#ED3729',
  blueFE: '#2A8EFE',
  blueF5: '#0A70F5',
  blueDC: '#1C6CDC',
  blueFF: '#EFF8FF'
}

// 字体尺寸
const sizes = {
  size10: 10,
  size12: 12,
  size13: 13,
  size14: 14,
  size16: 16,
  size17: 17,
  size18: 18,
  size20: 20,
  size22: 22,
  size24: 24,
  size26: 26,
  size28: 28,
  size30: 30
}

const width = {
  width76: 76,
  width66: 66,
  width56: 56,
  width20: 20
}

const height = {
  height14: 14,
  height16: 16,
  height17: 17,
  height18: 18,
  height20: 20,
  height22: 22,
  height24: 24,
  heith26: 26,
  heith28: 28,
  heith30: 30,
  heith44: 44,
  height48: 48
}

// 字体
const fontBold = {
  fontWeight: 'bold',
  fontFamily: 'PingFangSC-Medium'
}

// 间距
const spacing = {
  spacing1: 1,
  spacing3: 3,
  spacing4: 4,
  spacing6: 6,
  spacing8: 8,
  spacing10: 10,
  spacing12: 12,
  spacing14: 14,
  spacing16: 16,
  spacing20: 20,
  spacing24: 24
}

// 圆角
const radius = {
  radius1by5: 1.5,
  radius2: 2,
  radius4: 4,
  radius6: 6,
  radius8: 8,
  radius10: 10
}

// 顶部导航标题
const navTitle = {
  alignSelf: 'center',
  textAlign: 'center',
  flex: 1,
  ...fontBold,
  fontSize: sizes.size18,
  color: colors.gray87,
  lineHeight: height.heith26
}

// 正文标题
const contentTitle = {
  ...fontBold,
  fontSize: sizes.size24,
  color: colors.gray84,
  lineHeight: height.heith30
}

// 分割线 height:1
const divider1 = {
  height: 0.5,
  backgroundColor: colors.grayE9
}

// 分割区间 height:8
const divider8 = {
  height: 8,
  backgroundColor: colors.grayF5
}
// 空页面icon
const emptyContent = {
  fontFamily: 'PingFangSC-Medium',
  fontSize: 18,
  color: 'rgba(0,0,0,0.84)',
  lineHeight: 26,
  marginTop: 16
}
const emptyIcon = {
  width: 60,
  height: 60
}

// 持续完善中

export default {
  ...colors,
  ...sizes,
  ...width,
  ...height,
  ...spacing,
  ...radius,
  navTitle,
  contentTitle,
  fontBold,
  divider1,
  divider8,
  emptyContent,
  emptyIcon,
  activeOpacity: 0.94
}
