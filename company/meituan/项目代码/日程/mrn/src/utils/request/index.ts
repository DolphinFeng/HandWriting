import merge from 'lodash.merge'
import appStore from '@src/store'
import { getEnv } from '@src/config'
import { debug, Request, IRequestState, info } from '@onejs/mrn-utils'
import { app } from '../../../mrn.config'

export const R = new Request({
  project: 'schedule-mrn',
  mrnChannel: 'oa',
  baseURL: app.baseURL[getEnv()],
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  useMRNRequest: false, // 优先使用fetch发起请求
  toast: {
    // success: '请求成功',
    fail: (state: IRequestState) => {
      const { data, message = '' } = state.result
      return data?.message || message
    }
  },
  tryTimes: 3, // 重试次数 = 3
  timeout: 10000, // 超时限制 = 10s
  timeoutResponse: {
    code: 400,
    data: {
      errorCode: 'REQUEST_TIMEOUT',
      message: '请求超时，请稍后再试'
    }
  },
  disconnectResponse: {
    code: 400,
    data: {
      errorCode: 'REQUEST_DISCONNECT',
      message: '网络异常，请稍后再试'
    }
  },
  requestInterceptor: async (state: IRequestState) => {
    const { ssoId } = appStore.ssoInfo
    const { mis } = appStore.dxUserInfo.user

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'access-token': ssoId,
      Cookie: `com.sankuai.oa.it.scheduleweb_gray=${app.gray}`, // 灰度链路标志
      userMis: mis
    }
    state.params = merge({}, state.params, { headers })

    return state
  },
  validateResponse: (state: IRequestState) => {
    const { result } = state
    debug('--validateresponse--', state)
    info('--validateresponse-- state.requestParams', state.requestParams)
    info('--validateresponse-- state.run', state.run)
    return result.code === 200 || result.rescode === 0
  },
  responseInterceptor: async (state: IRequestState) => {
    const { result } = state
    if (result.status === 401 || result.code === 401) {
      await appStore.ssoInfo.updateSSOId()
      debug('执行 responseInterceptor udpated sso token')
    }

    return Promise.resolve(state)
  }
})
