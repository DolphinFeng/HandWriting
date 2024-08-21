import { Platform, Dimensions } from '@mrn/react-native'
import MRNUtils from '@mrn/mrn-utils'

// iPhoneX Xs
const X_WIDTH = 375
const X_HEIGHT = 812

// iPhoneXR XsMax
const XR_WIDTH = 414
const XR_HEIGHT = 896

// 适配title显示与优选Android状态栏重叠的问题
const YouXuanBD_AndroidPackage = 'com.meituan.grocery.bd'

export function isIPhoneX() {
  const window = Dimensions.get('window')
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((window.height === X_HEIGHT && window.width === X_WIDTH) ||
      window.height === X_WIDTH ||
      window.width === X_HEIGHT)
  )
}

export function isIPhoneXR() {
  const window = Dimensions.get('window')

  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((window.height === XR_HEIGHT && window.width === XR_WIDTH) ||
      (window.height === XR_WIDTH && window.width === XR_HEIGHT))
  )
}

export function isIPhoneWithNotch() {
  const window = Dimensions.get('window')

  // 大于 iPhoneX 屏幕高度的都是全面屏
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    window.height >= X_HEIGHT
  )
}

export function getNavigationHeight() {
  const appPkg = MRNUtils.env?.package

  let x = Platform.select({
    android: appPkg === YouXuanBD_AndroidPackage ? 88 : 44,
    ios: isIPhoneWithNotch() ? 44 : 44
  })

  // console.warn('nav height', x)
  return x
}

export function getPaddingTop() {
  const appPkg = MRNUtils.env?.package

  let y = Platform.select({
    android: appPkg === YouXuanBD_AndroidPackage ? 44 : 0,
    ios: isIPhoneWithNotch() ? 44 : 20
  })

  // console.warn('pad top', y)
  return y
}
