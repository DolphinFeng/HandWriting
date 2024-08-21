import http from 'http';
import https from 'https';
import qs from 'qs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { loginType } from '../env';
import store from '../store';

export const axiosConfig: AxiosRequestConfig = {
    baseURL: loginType === 'PASSPORT' ? '/api/passport' : '/api',
    // 请求前的数据处理
    transformRequest: [function (data: any) {

        return data;
    }],
    // 请求后的数据处理
    transformResponse: [function (data: AxiosResponse) {
        return data;
    }],
    // 自定义的请求头
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Login-Type': loginType,
        'X-Space-Domain': store.getters.spaceDomain || 'ticket' // ticket表示tt.sankuai.com
    },
    // 查询对象序列化函数
    paramsSerializer: function (params: any) {
        return qs.stringify(params);
    },
    // 超时设置s
    timeout: 10000,
    // 跨域是否带Token
    withCredentials: true,
    // 自定义请求处理
    // adapter: function(resolve, reject, config) {},
    // 响应的数据格式 json / blob /document /arraybuffer / text / stream
    responseType: 'json',
    // xsrf 设置
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    // 下传和下载进度回调
    onUploadProgress: function (progressEvent: any) {
        Math.round(progressEvent.loaded * 100 / progressEvent.total);
    },
    onDownloadProgress: function (progressEvent: any) {
        Math.round(progressEvent.loaded * 100 / progressEvent.total);
    },
    // 最多转发数，用于node.js
    maxRedirects: 5,
    // 最大响应数据大小
    maxContentLength: 2000,
    // 自定义错误状态码范围
    validateStatus: function (status: number) {
        return status >= 200 && status < 600;
    },
    // 用于node.js
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
};

// SLA埋点 400错误码 除“工单创建失败”以外，其他情况均视作发起成功，需要上报埋点
export const errorCode = {
    10046: '原因不能为空',
    400: '该目录正在做迁移，暂不支持其他操作',
    10038: '抄送人不能多于20个',
    10045: '标签个数不能多于10个',
    10049: '目录名不能为空',
    10007: '字段枚举值不存在',
    10401: '权限不足',
    13001: '缺少必填字段',
    13011: 'id对应的字段不存在或已删除',
    10036: '注册rg失败',
    10062: '不能重复创建工单',
    10101: '工单创建失败',
    13016: '自定义字段赋值失败'
};
