import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 请求库
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-04 11:16:39
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2023-01-05 15:05:18
 * @FilePath: /scheduleweb/src/services/ajax.js
 */
import request from '@onejs/request';
import { deployEnv } from '@onejs/utils';
import { messageStore } from '@/store/global';
import { addResError } from '@/utils';
import dxJSSDK from '@/utils/dxJSSDK';
import { locales } from '@/utils/environment';

export const prefix = '/api/v2/xm';

const TIMEOUT_INTERVAL = 10 * 1000;
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split('=');
    const cookieName = parts.shift();
    const cookieValue = decodeURIComponent(parts.join('='));
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return '';
}

const myMessage = {
  error: ({ message }) => {
    messageStore.error(message);
  },
  success: ({ message }) => {
    messageStore.success(message);
  }
};

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getHeaders = () => {
  const accessToken = getCookie('scheduleWeb_accessToken');
  // 本地没有启用node服务， scheduleWeb_accessToken cookie 不更新
  if (accessToken && deployEnv !== 'development') {
    return {
      la: locales,
      tz: timezone,
      'X-Requested-With': 'XMLHttpRequest',
      'access-token': accessToken
    };
  }
  return {
    la: locales,
    tz: timezone,
    'X-Requested-With': 'XMLHttpRequest'
  };
};

// eslint-disable-next-line import/no-mutable-exports
let ajax = null;

if (deployEnv === 'development') {
  ajax = request.initAxios({
    message: myMessage,
    successCheck: (data) => {
      return data.code === 200 || data.rescode === 0;
    },
    codeFiled: 'rescode',
    timeout: TIMEOUT_INTERVAL,
    timeoutErrorMsg: i18nClient.t('schedule_edit_request_timeout', '请求超时，请稍后再试'),
    headers: getHeaders(),
    clientId: '530dc35936',
    ssoCallbackUrl: '/sso/callback',
    responseInterceptor: (response) => {
      // 当网络请求200时，走到这个里面
      response.data.message = response.data.data?.message
        ? response.data.data?.message
        : response.data.message;
      return true;
    }
  });
} else {
  ajax = request.initAxios({
    message: myMessage,
    successCheck: (data) => {
      return data.code === 200 || data.rescode === 0;
    },
    codeFiled: 'rescode',
    timeout: TIMEOUT_INTERVAL,
    timeoutErrorMsg: i18nClient.t(
      'schedule_edit_request_timeout',
      '请求超时，请稍后再试'
    ),
    headers: getHeaders(),
    handleAuthFail: () => {
      // 1. 当网络请求状态码为401时，走到这个里面（新版会议室如果access-token过期，则直接返回401）
      addResError('PageReLoad401', '页面刷新401');
      dxJSSDK.pageReload();
      throw new Error('OnejsRequestError: 401');
    },
    instanceHooks: (instance) => {
      // 拦截器更新请求头中的登录信息，续期成功后直接启用
      instance.interceptors.request.use((config) => {
        config.headers['access-token'] = getCookie('scheduleWeb_accessToken');
        return config;
      });
    },
    responseInterceptor: (response) => {
      // 当网络请求200时，走到这个里面
      response.data.message = response.data.data?.message
        ? response.data.data?.message
        : response.data.message;
      if (response.data?.status === 401 || response.data?.errorCode === 401) {
        addResError('PageReLoad401', '页面刷新401');
        dxJSSDK.pageReload();
        throw new Error('OnejsRequestError: 401');
      }
      return true;
    }
  });
}

export default ajax;
