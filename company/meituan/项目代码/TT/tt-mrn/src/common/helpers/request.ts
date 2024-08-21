import { request } from '@mrn/mrn-utils'
import { getKey, getAppPackInfo, forceGetToken, getClientId } from './api'
import { ttLog } from '@src/pages/tt/components/common/TTHelper'
import { AppName } from './app'
import { JudgeNetForVpn } from './vpn'
import { Platform } from '@mrn/react-native'
import { i18nClient } from '@sailor/i18n-mrn'
import { customInfo, sendLog } from './customError'

// 根据当前登录方式确定baseUrl
export const getBaseUrl = (): string => {
  const loginType = getKey('loginType') || 'sso'
  const env = getKey('env') || 'prod'
  switch (loginType) {
    case 'sso':
      return env === 'test'
        ? 'http://tt.cloud.test.sankuai.com/'
        : 'https://tt.sankuai.com/'
    case 'passport':
      return env === 'test'
        ? 'http://tt-meituan.cloud.test.sankuai.com/'
        : 'https://tt.meituan.com/'
  }
}

// 将TT原先的请求路径处理为蜜蜂网关的格式
export const changeUrlForBee = (url: string) => {
  if (url.includes('api/tt/1.0')) {
    return url.replace('api/tt/1.0', 'bee/v1/tt')
  } else if (url.includes('api/cti/1.0')) {
    return url.replace('api/cti/1.0', 'bee/v1/tt')
  }
}

async function checkAppInfo() {
  const appName = getKey('appName')
  if (appName === undefined) {
    ttLog('before getAppInfo')
    return await getAppPackInfo()
  }
  return appName
}

const handlerRequest = async (
  url,
  method,
  params?,
  data?,
  contentType?,
  extra?,
  isImRequest?
) => {
  const appName = await checkAppInfo()

  if (!(getKey('token')?.length > 0)) {
    await forceGetToken()
  }
  ttLog('after sso')

  const isTest = getKey('env') === 'test'
  const tempSSO = getKey('token')
  const baseUrl = getBaseUrl()
  const spaceDomain = getKey('spaceDomain') || 'ticket'
  const loginType = getKey('loginType') || 'sso'

  let headerParam = {}
 

  if (loginType === 'sso') {
    let prefixClientId = getClientId(getKey('env'))
    let clientValue = `${prefixClientId}_ssoid=${tempSSO}`

    if (url.includes('api/tt/1.0/file/upload')) {
      headerParam = {
        Cookie: clientValue,
        'Content-Type': 'multipart/form-data'
      }
    } else if (url.includes('api/cti/1.0/user/current')) {
      headerParam = { Cookie: clientValue, Referer: baseUrl }
    } else {
      headerParam = { Cookie: clientValue }
    }
  } else {
    // passport
    let clientValue = `lt=${tempSSO}`
    headerParam = { Cookie: clientValue, 'X-Login-Type': 'PASSPORT' }

    if (url.includes('api/tt/1.0/file/upload')) {
      Object.assign(headerParam, {
        'Content-Type': 'multipart/form-data'
      })
    } else if (url.includes('api/cti/1.0/user/current')) {
      Object.assign(headerParam, {
        Referer: baseUrl
      })
    }

    if (appName === AppName.dingxiang || appName === AppName.qishou) {
      Object.assign(headerParam, {
        'X-Passport-Source': 'maicai'
      })
    }
    if (appName === AppName.youxuan || appName === AppName.youxuanBD) {
      Object.assign(headerParam, {
        'X-Passport-Source': 'youxuan'
      })
    }
  }
  if (isImRequest) {
    // 聊天服务相关接口需要额外的两个请求头
    headerParam = {
      ...headerParam,
      'x-tenant-id': 'com.sankuai.ee.ticket.core',
      'x-u-id': getKey('userMis')
    }
  }
  headerParam = { ...headerParam, 'X-Space-Domain': spaceDomain }

  console.log('i18n locale: ', i18nClient.getCurrentLocale());
  if (['GET', 'POST'].includes(method)) {
    Object.assign(headerParam, {
      'X-Locale': i18nClient.getCurrentLocale()
    })
  }

  let newUrl = url as string
  if (loginType === 'passport') {
    if (newUrl.includes('/api/tt/1.0')) {
      newUrl = url.replace(/api\/tt\/1.0/, 'api/passport/tt/1.0')
    } else if (newUrl.includes('/api/cti/1.0')) {
      newUrl = url.replace(/api\/cti\/1.0/, 'api/passport/cti/1.0')
    }
  }
  // 蜜蜂Service仅提供get和post方法，因此仅将这两类请求通过蜜蜂发送
  // 部分接口配置shepherd有问题，也不通过蜜蜂发送
  // chat服务暂不走蜜蜂网关
  const excludeURL = [
    '/api/tt/1.0/file/upload',
    '/api/tt/1.0/file/upload/desc',
    '/api/tt/1.0/ticket'
  ]
  if (
    (appName === AppName.bee || appName === AppName.sinan) &&
    ['GET', 'POST'].includes(method) &&
    !excludeURL.includes(url) &&
    !isImRequest
  ) {
    return requestForBee(url, isTest, method, params, data)
      .then(res => {
        return res
      })
      .catch(e => {
        console.log('beeHandleRequest, error=', e)
        JudgeNetForVpn('tt', e)
        return null
      })
  } else {
    const requestConfig = {
      url: newUrl,
      method: method,
      baseURL: baseUrl,
      params: params,
      data: data,
      headers: headerParam,
      contentType: contentType
    }
    if (Platform.OS === 'ios') {
      // 适配 ios阿波罗5.2以上版本, get请求移除data字段
      if (
        (appName === AppName.aboluo || appName === AppName.tiangong) &&
        method.toLowerCase() === 'get'
      ) {
        delete requestConfig.data
      }
    }

    ttLog('before request')

    return request(requestConfig)
      .then(res => {
        let reportEntity = {
          url: requestConfig.url,
          header: requestConfig.headers,
          data: res.data
        }
        sendLog(JSON.stringify(reportEntity))
        if (res.data) {
          console.log('REQUEST_URL =====', JSON.stringify(requestConfig.url))
          console.log('REQUEST_HEADER =====', JSON.stringify(requestConfig.headers))
          console.log('REQUEST_RESPONSE =====', res.data)
          return res.data
        }
      })
      .catch(e => {
        console.log('handleRequest, error=', e)
        // TODO: reject的时候也要抛给外部
        JudgeNetForVpn('tt', e)
        return null
      })
  }
}

// 使用蜜蜂提供的方法发起请求
const requestForBee = (
  url: string,
  isTest: boolean,
  method: string,
  params?: any,
  data?: any
) => {
  const { Service } = require('@mfe/waimai-mfe-bee-common')
  const requestUrl = changeUrlForBee(url)
  const beeBaseUrl = isTest
    ? 'http://beeapi.m.waimai.test.sankuai.com'
    : 'https://beewaimai.meituan.com'
  let res: any = null
  let queryString: string = ''
  if (JSON.stringify(params) !== '{}') {
    queryString =
      '?' +
      Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')
  }
  if (method === 'GET') {
    res = Service.get(`${beeBaseUrl}${requestUrl}${queryString}`)
  } else if (method === 'POST') {
    res = Service.postConstructor(
      `${beeBaseUrl}${requestUrl}${queryString}`,
      data,
      err => {
        console.log('err', err)
      },
      'application/json'
    )
  }
  return res
}

export const get = async (url, params, extra?, isImRequest?) => {
  return handlerRequest(
    url,
    'GET',
    params,
    undefined,
    undefined,
    extra,
    isImRequest
  )
}

export const post = (url, params, data, contentType?, extra?, isImRequest?) => {
  // 慎用content-type为application/x-www-form-urlencoded的形式
  // 因为app在发送请求的时候会给url query加上一些参数, 与body的参数重复的话后端会解析成数组
  return handlerRequest(
    url,
    'POST',
    params,
    data,
    contentType,
    extra,
    isImRequest
  )
}

export const put = (url, params, data, extra?, isImRequest?) => {
  return handlerRequest(url, 'PUT', params, data, undefined, extra, isImRequest)
}

export const del = (url, params, data, extra?, isImRequest?) => {
  return handlerRequest(
    url,
    'DELETE',
    params,
    data,
    undefined,
    extra,
    isImRequest
  )
}

export default request
