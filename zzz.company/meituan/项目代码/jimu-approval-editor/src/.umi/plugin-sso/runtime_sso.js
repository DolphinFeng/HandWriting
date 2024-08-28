import SSOWeb from '@mtfe/sso-web';
import axios from 'axios';
import React from 'react';

export async function render(oldRender) {
  const ssoWeb = new SSOWeb({
    clientId: 'com.sankuai.it.saas.procc',
    rewriteLocation: '/approval/admin',
    accessEnv: 'test',
    isDebug: false, 
  });

  // ssoid过期跳登录
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  axios.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      // 业务要注意不要和业务代码状态冲突
      if (response.status === 401 || response?.data?.status === 401) {
        window.location.href = ssoWeb.getLoginUrl();
      }

      return response;
    },
    function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    },
  );
  const res = await ssoWeb.login();
  // 未登录
  if (res?.type === 'info') {
    throw {
      message: '未登录',
    };
  }

  oldRender();
}
