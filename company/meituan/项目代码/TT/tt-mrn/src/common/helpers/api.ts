import {
  updateEnv,
  updateToken,
  updatePackage,
  updateLoginType,
  updateUserMis
} from '../store/actions'
import store from '@src/pages/tt/redux/store'
import KNB from '@mrn/mrn-knb'
import { Toast } from '@ss/mtd-react-native'
import { ttLog } from '@src/pages/tt/components/common/TTHelper'
import { getAppPackageInfo, AppName } from './app'
import { NativeModules } from 'react-native'
import CookieManager from '@mfe/react-native-cookies'
import { get } from './request'

export const devDxClientId = '26735578'
export const pubDxClientId = '60921859'
export const devMwsClientId = '68c50c4e0d'
export const pubMwsClientId = 'a2ec4bfa5a'

/**
 * 调用大象sso桥，其中clientId是访问哪个业务就传对应产品的clientId，而不是宿主App的clientId.
 * 如访问TT,则调用大象sso桥clientId传TT的clientId
 *
 * sso默认对正式员工完全信任，不会校验clientId，即只要是合法的clientId即可。但是sso会严格校验外部员工传的 clientid
 */
export const devTTclientId = 'cc7fabacff'
export const pubTTclientId = '9504f696cb'

// init state
let clientId = devDxClientId
export let globalSSOid
let mEnv
let globalLoginType = 'sso' // sso、 passport， 默认是sso

let CookieUtil = null
if (NativeModules.RNCookieManagerAndroid) {
  CookieUtil = NativeModules.RNCookieManagerAndroid
} else {
  CookieUtil = CookieManager
}

export interface UserInfo {
  name: string
  avatar: string
  mis: string
}

function fetchEnv() {
  if (mEnv) return mEnv

  return new Promise(resolve => {
    KNB.use('dxmp.getDXConfig', {
      success: ({ env }) => {
        mEnv = env
        store.dispatch(updateEnv(env))
        resolve(env)
      },
      error: err => {
        console.error(`fetch env fail: ${JSON.stringify(err)}`)
      }
    })
  })
}

export async function forceGetAppName() {
  let appName = getKey('appName')
  if (!appName) {
    appName = await getAppPackInfo().catch(e => {
      appName = ''
    })
  }
  return appName
}

export async function forceGetUserMis() {
  let userMis = getKey('userMis')
  if (!userMis) {
    let userInfo = await fetchUser().catch(e => {
      console.log('fetchuser error')
    })
    if (userInfo) {
      const { mis } = userInfo as UserInfo
      if (mis) {
        store.dispatch(updateUserMis(mis))
        return mis
      }
    }
    return get('/api/cti/1.0/user/current', {})
      .then(res => {
        if (res && res.data && res.data.username) {
          let mis = res.data.username
          store.dispatch(updateUserMis(mis))
          return mis
        }
      })
      .catch(error => {
        return ''
      })
  } else {
    return userMis
  }
}

export async function getTokenAfterEnvFromDx() {
  console.log('getTokenAfterEnvFromDx')
  const env = await fetchEnv()

  ttLog('getenv')
  store.dispatch(updateEnv(env))

  clientId = getClientId(env)

  return new Promise<string>(resolve => {
    KNB.use('dxmp.exchangeSSOId', {
      clientId: clientId,
      displayLoadingIfAuth: true,
      success: function ({ ssoId }) {
        ttLog('get sso')
        globalSSOid = ssoId
        store.dispatch(updateToken(ssoId))

        resolve(ssoId)
      },
      fail: function (err) {
        console.log(`fetch ssoid fail: ${JSON.stringify(err)}`)
        Toast.open(err?.errMsg ?? '获取sso token失败')
        resolve(null)
      }
    })
  })
}

export function getClientId(env) {
  return env === 'test' ? devTTclientId : pubTTclientId
}
export function getTokenAfterEnvFromMws() {
  return new Promise<string>((resolve, rejects) => {
    KNB.use('mws.getMwsConfig', {
      success: function ({ env }) {
        store.dispatch(updateEnv(env))
        mEnv = env
        clientId = env === 'test' ? devMwsClientId : pubMwsClientId
        KNB.use('mws.exchangeMwsSSOId', {
          clientId: clientId,
          success: function ({ ssoId }) {
            globalSSOid = ssoId
            store.dispatch(updateToken(ssoId))
            resolve(ssoId)
          },
          error: function () {
            console.warn('mws.exchangeSSOId error')
            rejects()
          }
        })
      },
      error: function () {
        console.warn('mws getDXConfig error')
        rejects()
      }
    })
  })
}

// 丁香和丁香优选App
export async function getTokenFromDingxiang() {
  console.log('getTokenFromDingxiang ssss')

  return new Promise<string>(resolve => {
    KNB.use('zhangyu.getLoginConfig', {
      success: function ({ data: { token, loginType, env } }) {
        globalSSOid = token
        store.dispatch(updateToken(token))
        globalLoginType = loginType
        store.dispatch(updateLoginType(loginType))
        mEnv = env
        store.dispatch(updateEnv(env))
        console.log('fffffff ', globalLoginType, env)
        resolve(token)
      },
      error: function (err) {
        console.log(`fetch ssoid fail: ${JSON.stringify(err)}`)
        resolve(null)
      }
    })
  })
}

// 外卖蜜蜂App
export async function getTokenFromBee() {
  const env = await fetchBeeEnv()
  mEnv = env
  store.dispatch(updateEnv(mEnv))
  return new Promise<string>(resolve => {
    if (CookieUtil?.getAll) {
      // iOS
      CookieUtil.getAll(cookies => {
        const { ssoid } = cookies
        if (ssoid?.value) {
          store.dispatch(updateToken(ssoid.value))
          resolve(ssoid.value)
        } else {
          resolve(null)
        }
      })
    } else if (CookieUtil?.getCookie) {
      // Android
      CookieUtil.getCookie('.sankuai.com', (cookies, msg) => {
        if (msg === 'success') {
          const p = cookies.match(/(.*)ssoid=(.*)/)
          if (p && p.length === 3) {
            console.log('bee android sso ', p[2])
            resolve(p[2])
          } else {
            resolve(null)
          }
        } else {
          resolve(null)
        }
      })
    }
  })
}
function fetchBeeEnv() {
  const NativeSSOManager = NativeModules.WMSSOManager
  return new Promise(resolve => {
    NativeSSOManager.getEnv(res => {
      if (res.code === 0 && res.data && res.data.domain) {
        console.log('bee env', res.data)
        const env =
          res.data.domain === 'http://beeapi.m.waimai.test.sankuai.com'
            ? 'test'
            : 'prod'
        resolve(env)
      } else {
        resolve('prod')
      }
    })
  })
}
export async function getTokenFromStarFire() {
  console.log('get token from starfire...')
  return new Promise<string>(resolve => {
    KNB.getUserInfo({
      success: function (user) {
        console.log('user=', user.userInfo)
        try {
          const { banmaSsoId } = JSON.parse(user.userInfo)
          globalSSOid = banmaSsoId
          store.dispatch(updateToken(banmaSsoId))
          console.log('fffffff ', globalLoginType, mEnv)
          resolve(banmaSsoId)
        } catch (error) {
          console.log(`json parse fail: ${error}`)
          resolve(null)
        }
      },
      fail: function (err) {
        console.log(`fetch ssoid fail: ${JSON.stringify(err)}`)
        resolve(null)
      }
    })
  })
}

export async function getTokenFromYouXuanBD() {
  console.warn('get token from YouXuanBD...')
  return new Promise<string>(resolve => {
    KNB.getUserInfo({
      success: function (user) {
        console.log('user=', user)
        const { token, loginType, env } = user
        globalSSOid = token
        store.dispatch(updateToken(token))
        globalLoginType = loginType
        store.dispatch(updateLoginType(loginType))
        mEnv = env
        store.dispatch(updateEnv(mEnv))
        console.log('fffffff ', globalLoginType, mEnv)
        resolve(token)
      },
      fail: function (err) {
        console.log(`fetch ssoid fail: ${JSON.stringify(err)}`)
        resolve(null)
      }
    })
  })
}

export async function getTokenFromDefault() {
  console.log('get token from default...')
  return new Promise<string>(resolve => {
    KNB.getUserInfo({
      success: function (user) {
        console.log('user=', user)
        const { token } = user
        globalSSOid = user.token
        store.dispatch(updateToken(token))
        console.log('fffffff ', globalLoginType, mEnv)
        resolve(token)
      },
      fail: function (err) {
        console.log(`fetch ssoid fail: ${JSON.stringify(err)}`)
        resolve(null)
      }
    })
  })
}

// 盘古App
export async function getTokenFromPangu() {
  console.log('getTokenFromPangu ssss')

  return new Promise<string>(resolve => {
    console.warn('get pangu token')
    KNB.use('moma.getLoginConfig', {
      success: function ({ data: { token, loginType, env } }) {
        globalSSOid = token
        store.dispatch(updateToken(token))
        globalLoginType = loginType
        store.dispatch(updateLoginType(loginType))
        mEnv = env
        store.dispatch(updateEnv(mEnv))
        console.log('fffffff ', globalLoginType, env, token)
        resolve(token)
      },
      fail: function (err) {
        console.log(`fetch ssoid fail: ${JSON.stringify(err)}`)
        resolve(null)
      }
    })
  })
}

export async function forceGetToken() {
  let appName = getKey('appName')
  // console.warn(' package-0 is  ' + appName)
  if (appName === undefined) {
    appName = await getAppPackInfo()
  }

  switch (appName) {
    case AppName.dx:
      const token = await getTokenAfterEnvFromDx()
      globalSSOid = token
      console.log('before')
      ttLog('before update token')
      store.dispatch(updateToken(token))
      ttLog('after update token')
      break
    case AppName.dingxiang:
    case AppName.youxuan:
    case AppName.qishou:
      await getTokenFromDingxiang()
      break
    case AppName.mws:
      await getTokenAfterEnvFromMws()
      break
    case AppName.pangu:
      await getTokenFromPangu()
      break
    case AppName.starfire:
      await getTokenFromStarFire()
      break
    case AppName.youxuanBD:
      await getTokenFromYouXuanBD()
      break
    case AppName.bee:
    case AppName.sinan:
      globalSSOid = await getTokenFromBee()
      store.dispatch(updateToken(globalSSOid))
      break
    case AppName.unknow:
    default:
      await getTokenFromDefault()
      break
  }
}

export async function fetchUser() {
  const appName = getKey('appName')
  console.warn('fetchUser package-0 is  ' + appName)
  if (AppName === undefined) {
    await getAppPackInfo()
  }

  switch (appName) {
    case AppName.dx:
      return new Promise((resolve, reject) => {
        KNB.use('dxmp.getUserInfo', {
          success: resolve,
          fail: reject
        })
      })
    case AppName.dingxiang:
    case AppName.youxuan:
    case AppName.qishou:
    case AppName.pangu:
    case AppName.starfire:
    case AppName.bee:
    case AppName.sinan:
    case AppName.unknow:
    default:
      break
    case AppName.mws:
      console.log('mws.getMwsUserInfo')
      return new Promise((resolve, reject) => {
        KNB.use('mws.getMwsUserInfo', {
          success: resolve,
          fail: reject
        })
      })
  }
}

export function getAppPackInfo() {
  return getAppPackageInfo().then(
    appName => {
      store.dispatch(updatePackage(appName))
      return appName
    },
    err => {
      console.warn('getAppPackFailed', err)
      Toast.open(`getAppInfo${JSON.stringify(err)}`)
      return Promise.reject(err)
    }
  )
}

export function getKey(key) {
  const { dxAuth } = store.getState()
  // console.warn(' store ' + JSON.stringify(dxAuth))
  for (let s in dxAuth) {
    if (s === key) {
      return dxAuth[s]
    }
  }
}

// TODO: 添加 jumper， 否则在外网访问会提示为 avatar
export enum DomainType {
  UNKNOWN = '',
  WEBPORTAL = 'WEBPORTAL',
  TT = 'tt'
}
