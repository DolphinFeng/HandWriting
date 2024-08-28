import request from '@onejs/request';
import { notification } from '@ss/mtd-react';

export { searchAjax } from '@onejs/components-kuaida';

export default request.getAxiosInstance({
  // data.code = 200 或者data.status = 0成功的返回
  timeout: 30000,
  clientId: 'com.sankuai.it.saas.procc',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  successCheck: (data) => {
    return data.code === 200 || data.status === 1;
  },
  // 此参数可以关闭网络库内部对业务码出错时的出错 notification , 但由于业务侧后端接口尚未统一，所以需要在 responseIntercetor 里手动捕捉
  // responseInterceptor 里支持 data.message 和 data.data.message 两种格式(网络库里只支持 data.message)
  withErrorMessage: false,
  message: notification,
  responseInterceptor: (response) => {
    const { data } = response;
    if (data.status === 401) {
      notification.error({
        title: '登录信息失效',
        message: '账号已失效,将为您自动刷新页面'
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      throw new Error('登录信息失效，请刷新重试');
    }

    if (data.code === 201200) {
      notification.error({
        title: '审核结果异常',
        message: '内控审核结果返回异常，请联系内控内审系统公众号：流程肖邦'
      });
      return true;
    }

    if (data.code === 7000) {
      notification.error({
        title: '审核结果异常',
        message:
          '流程已发布过，不允许修改授权事项，如有需求请联系公众号：流程肖邦'
      });
      return true;
    }

    // 401 handleAuthFail处理了
    if (data.code !== 200 && data.status !== 1 && data.status !== 401) {
      const msg = data?.message || data?.data?.message || '系统异常';

      notification.error({
        title: '系统错误',
        message: msg
      });
      return true;
    }

    return true;
  }
});
