import { Platform } from '@mrn/react-native'
import KNB from '@mrn/mrn-knb'

const mws = Platform.OS === 'ios' ? 'com.meituan.mmws' : 'com.sankuai.mmws'
const dingxiang =
  Platform.OS === 'ios' ? 'com.meituan.tide.ep' : 'com.meituan.retail.tide'
const dingxiangAppstore = 'com.baobaoaichi.tide'
const youxuan =
  Platform.OS === 'ios'
    ? 'com.meituan.grocery.tide.ep'
    : 'com.meituan.grocery.tide'
const youxuanAppstore = 'com.baobaoaichi.grocery.tide'
const dx = Platform.OS === 'ios' ? 'com.meituan.message' : 'com.sankuai.xmpp'
const dxAppstore = 'com.meituan.xm'
const qishou =
  Platform.OS === 'ios'
    ? 'com.meituan.idelivery.ep'
    : 'com.meituan.retail.c.android.delivery'
const qishouAppstore = 'com.baobaoaichi.idelivery'
const pangu = 'com.sankuai.arm.moma'
const starfire = 'com.meituan.banma.starfire'
const aboluo =
  Platform.OS === 'ios' ? 'com.dianping.ba.crm.Mobile' : 'com.dianping.crm'
const aboluoAppstore =
  Platform.OS === 'ios' ? 'com.dianping.apollo.crm' : 'com.dianping.crm'
const tiangong =
  Platform.OS === 'ios'
    ? 'com.dianping.welkin.crm.dailybuild'
    : 'com.dianping.welkin'
const tiangongAppstore =
  Platform.OS === 'ios' ? 'com.dianping.welkin.crm' : 'com.dianping.welkin'
const youxuanBD =
  Platform.OS === 'ios' ? 'com.meituan.igrocery.bd' : 'com.meituan.grocery.bd'
const bee = Platform.OS === 'ios' ? 'com.meituan.beeRN.ep' : 'com.meituan.beeRN'
const sinan =
  Platform.OS === 'ios'
    ? 'com.meituan.beeRN.sinan.ep'
    : 'com.meituan.beeRN.sinan'

// 目前支持的App
export enum AppName {
  dx = 'dx',
  mws = 'mws',
  dingxiang = 'dingxiang',
  youxuan = 'youxuan',
  qishou = 'qishou',
  pangu = 'pangu',
  starfire = 'starfire',
  youxuanBD = 'youxuanBD',
  aboluo = 'aboluo',
  tiangong = 'tiangong',
  bee = 'bee',
  sinan = 'sinan',
  unknow = 'unknow'
}

export function getAppPackageInfo() {
  return new Promise<string>((resolve, rejects) => {
    KNB.getAppInfo({
      success: function (data) {
        // 包名
        let pack = new String(data.package)
        console.log('app package' + pack)
        let appName = 'unknow'
        if (pack.includes(dx) || pack.includes(dxAppstore)) {
          appName = AppName.dx
        } else if (
          pack.includes(dingxiang) ||
          pack.includes(dingxiangAppstore)
        ) {
          appName = AppName.dingxiang
        } else if (pack.includes(youxuan) || pack.includes(youxuanAppstore)) {
          appName = AppName.youxuan
        } else if (pack.includes(qishou) || pack.includes(qishouAppstore)) {
          appName = AppName.qishou
        } else if (pack.includes(mws)) {
          appName = AppName.mws
        } else if (pack.includes(starfire)) {
          appName = AppName.starfire
        } else if (pack.includes(pangu)) {
          appName = AppName.pangu
        } else if (pack.includes(youxuanBD)) {
          appName = AppName.youxuanBD
        } else if (pack.includes(aboluo) || pack.includes(aboluoAppstore)) {
          appName = AppName.aboluo
        } else if (pack.includes(tiangong) || pack.includes(tiangongAppstore)) {
          appName = AppName.tiangong
        } else if (pack.includes(bee)) {
          appName = AppName.bee
        } else if (pack.includes(sinan)) {
          appName = AppName.sinan
        }
        resolve(appName)
      },
      fail: rejects
    })
  })
}
