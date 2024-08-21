import { i18nClient } from '@sailor/i18n-mrn'
import { StatusBar, Platform, Alert } from '@mrn/react-native'
import { getNavigationHeight } from '@src/common/styles/NavigationStyle'
import { ModalProps, Toast, SlideModal } from '@ss/mtd-react-native'
import { getUserInfo, getCtiVersion } from '../../constants/TTApi'
import { CCPersonModel, Level } from '../../constants/TTServiceModule'
import { getKey } from '@src/common/helpers/api'

import { reportOwlError } from '@src/common/helpers/HelperFunctions'
// import NativeModules from 'NativeModules'
import { NativeModules } from 'react-native'
const { MTImagePickerManager, ImagePickerManager } = NativeModules

// FIXME: 调整这里的高度数据
export const modalMarginTop =
  44 +
  Platform.select({
    android: 0,
    ios: getNavigationHeight(),
  })

/**  通用的slidemodal 属性，可以传入点击事件处理蒙层点击 */
export const ttSlideModalProp = (onClose?: () => void) => {
  return {
    maskClosable: true,
    onPressClose: onClose, // 用户点击半透明 mask
    keyboardBehavior: null, // modal 默认开启 keyboardavoding, 这里先关闭，只对 ios 起作用
    containerStyles: {
      // 默认有个白色的底色
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      position: 'relative', // 修复 android 键盘问题
      marginTop: modalMarginTop,
      // justifyContent: 'flex-end'  // not working
    },
  } as ModalProps
}

export const ttSlideModal = (child: JSX.Element) => {
  const instance = SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(() => instance.close()),
    children: child,
  })

  return instance
}

export const splitStringFromKeyword = (str: string, keyword: string) => {
  const firstIndex = str.indexOf(keyword)
  const lastIndex = str.lastIndexOf(keyword)

  const s1 = str.substring(0, firstIndex)
  const s2 = keyword
  const s3 = str.substring(firstIndex + keyword.length, str.length)
}

let currentUser = null
// 获取当前用户，不一定有头像
export async function requestCurrentUser() {
  if (currentUser != null && currentUser?.username != null) return currentUser

  const res = await getUserInfo()
  const { username, displayname, i18nDisplayName } = res?.data || {}

  console.log('res.data:', res.data);
  

  if (username?.length > 0) {
    let model = new CCPersonModel()
    model.username = username
    model.displayName = displayname
    model.i18nDisplayName = i18nDisplayName

    currentUser = model
  } else if (!res) {
    Toast.open(i18nClient.t('components_common_dc486e', { defaultValue: '获取用户信息失败' }))
  } else {
    Toast.open(i18nClient.t('components_common_dc486e', { defaultValue: '获取用户信息失败' }))
    reportOwlError('tt requestCurrentUser error, ' + username)
  }

  return currentUser
}

let isInsideUser = null
export async function requestInsideUser() {
  if (isInsideUser !== null) return isInsideUser

  const res = await getCtiVersion()

  if (res?.code === 200) {
    isInsideUser = res?.data?.version !== 0
  }

  return isInsideUser
}

export function updateCurrentUser(user: CCPersonModel) {
  currentUser = user
}

export function ttLog(msg: string) {
  // const debug = false
  // if (debug) { Alert.alert(msg) }
}
export const BaseScript = `
height = document.body.scrollHeight;
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'setHeight',
  height: height,
}))
true;
`

/**
 * check if the character is in CJK Unified Ideographs (U+4E00..U+9FFF)
 * @param str contains single character
 */
const isCJK = (str: string) => {
  const codePoint = str.codePointAt(0)
  return codePoint >= 0x4e00 && codePoint <= 0x9fff
}
export const lengthOf = (str: string) =>
  Array.from(str)
    .map(s => (isCJK(s) ? 2 : 1))
    .reduce((sum, l) => sum + l, 0)

// 判断数组是否相等
export function arrayEquals(array1: Array<any>, array2: Array<any>) {
  if (array1 === undefined && array2 != null) {
    return false
  }
  if (array2 === undefined && array1 != null) {
    return false
  }
  if (!(array1 || array2)) {
    return false
  }

  if (array1.length !== array2.length) {
    return false
  }

  for (let i = 0; i < array1.length; i++) {
    if (!array2.includes(array1[i])) {
      return false
    }
  }

  return true
}

export function getTTlinkByEnv(ticketId) {
  return getKey('env') === 'test'
    ? `http://tt.cloud.test.sankuai.com/ticket/detail?id=${ticketId}`
    : `https://tt.sankuai.com/ticket/detail?id=${ticketId}`
}

export function getTTRglinkByEnv(rgId) {
  return getKey('env') === 'test'
    ? `http://tt.cloud.test.sankuai.com/moses-helper?rgId=${rgId}`
    : `https://tt.sankuai.com/ticket/moses-helper?rgId=${rgId}`
}

export function isXiaoXiang() {
  const appName = getKey('appName')
  if (appName && (appName === 'dingxiang' || appName === 'youxuan' || appName === 'qishou')) {
    return true
  }
  return false
}

export function getCtiPrefix(level) {
  switch (level) {
    case Level.category:
      return i18nClient.t('components_common_112b5f', { defaultValue: '一级目录：' })
    case Level.type:
      return i18nClient.t('components_common_6ee800', { defaultValue: '二级目录：' })
    case Level.item:
      return i18nClient.t('components_common_8f20d1', { defaultValue: '三级目录：' })
    default:
      return ''
  }
}

export function uploadImageByBee(imageCallback) {
  let options = {
    aspectX: 4,
    aspectY: 3,
    quality: 1,
    recognizeQR: false,
    title: i18nClient.t('components_common_c2e406', { defaultValue: '选择照片' }),
    cancelButtonTitle: i18nClient.t('components_common_625fb2', { defaultValue: '取消' }),
    takePhotoButtonTitle: i18nClient.t('components_common_bed9ec', { defaultValue: '拍照' }),
    chooseFromLibraryButtonTitle: i18nClient.t('components_common_5145e5', {
      defaultValue: '相册',
    }),
  }

  // 从相册里选择图片
  if (Platform.OS === 'ios') {
    MTImagePickerManager.showImagePicker(options, imageCallback)
  } else {
    ImagePickerManager.showImagePicker(options, imageCallback)
  }
}
