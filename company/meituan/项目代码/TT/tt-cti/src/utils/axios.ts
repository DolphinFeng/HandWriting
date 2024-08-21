import axios from 'axios';
import config from '../config/axios.conf';
import { Message } from '@ss/mtd-vue';
import store from '@/store';
import router from '@/router';

const defaultSecCategory = 'TT_AJAX_ERROR';
const defaultExceptionLevel = (window as any).Owl?.errorModel.LEVEL.WARN;
// eslint-disable-next-line @typescript-eslint/default-param-last
function addOwlReport (secCategory = defaultSecCategory, exceptionLevel = defaultExceptionLevel, content = '', response) {
    const extra = response ? JSON.stringify(response) : null;
    window.owl && window.owl(
        'addError',
        {
            name: secCategory,
            msg: extra || content || ''
        },
        {
            level: exceptionLevel,
            combo: true,
            category: 'ajaxError', // 对应错误的子分类
            traceid: response?.headers['m-traceid'],
            tags: {
                userInfo: store.getters.misX,
                content: content || secCategory,
                traceid: response?.headers['m-traceid']
            }
        }
    );
}

const service = axios.create(config);
// 返回状态判断(添加响应拦截器)
service.interceptors.response.use(
    res => {
        const reportEntity = {
            url: res?.config?.url, // 请求url
            method: res?.config?.method || 'get',
            params: res?.config?.params, // 请求参数
            statusCode: res?.data && (res?.data?.code || res?.data?.code),
            message: res?.data?.errorMsg || '',
            status: res?.status,
            tip: 'custom'
        };
        window.Logan.info(JSON.stringify(reportEntity));

        const data = res.data;
        const errorTip = '数据获取失败';
        const loginUrl = store.state.cti.loginUrl;
        if (!data) {
            addOwlReport(res?.config?.url, defaultExceptionLevel, res?.config?.url, res);
            return Promise.reject(errorTip);
        }
        if (data.status === 401) { // sso auth fail 定义的特殊情况
            window.location.href = loginUrl;
        } else if (res.status === 200) {
            return data;
        } else if (data.code === 400 && data.data.errorCode === 401) {
            router.push({
                name: 'blank'
            });
        } else {
            const msg = data.data && data.data.errorMsg || errorTip;
            // 仅当有errorMsg时抛出
            if (data.data && data.data.errorMsg) {
                Message({
                    showClose: true,
                    type: 'error',
                    message: msg
                });
            }
            addOwlReport(res?.config?.url, (window as any).Owl?.errorModel.LEVEL.INFO, msg, res);
            return Promise.reject(msg);
        }
    },
    error => {
        Message({
            showClose: true,
            type: 'error',
            message: '服务异常，请稍后再试~'
        });
        addOwlReport(defaultSecCategory, defaultExceptionLevel, '', error);
        return Promise.reject(error);
    }
);

service.interceptors.request.use((config: any) => {
    const allowMethods = ['post', 'put', 'delete'];
    if (allowMethods.indexOf(config.method) !== -1) {
        config.headers['Content-Type'] = 'application/json';
        config.data = JSON.stringify(config.data);
    }
    return config;
}, (error: any) => {
    addOwlReport(defaultSecCategory, defaultExceptionLevel, '', error);
    return Promise.reject(error);
});

// 对axios的实例重新封装成一个plugin ,方便 Vue.use(xxxx)
export default service;
