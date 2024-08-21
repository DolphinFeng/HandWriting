import axios from 'axios';
import { axiosConfig, errorCode } from '../config/axios.conf';
import { Message } from '@ss/mtd-vue';
import { getSSOLoginUrl } from '@/sso';
import ssoWeb from '@/ssoWeb';
import store from '../store';
import router from '@/router/index';
import { loginType, passportLogin } from '@/env';
import { I18n, getCacheLocale } from '@sailor/i18n-vue';

// import getNs2Text from '@/index.ts'
let i18nClient;

export const setI18nClient = (client) => {
    i18nClient = client;
};

const service = axios.create(axiosConfig);
const defaultSecCategory = 'TT_AJAX_ERROR';
const defaultExceptionLevel = (window as any).Owl?.errorModel.LEVEL.WARN;
function addOwlReport (secCategory = defaultSecCategory, exceptionLevel = defaultExceptionLevel, content = '', response) {
    let extra = response ? JSON.stringify(response) : null;
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
// 返回状态判断(添加响应拦截器)
service.interceptors.response.use(
    res => {
        // // 补充结束时间
        // res.config.metadata.endTime = new Date();
        // logan 日志信息准备
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
        const errTip = '数据获取失败';
        if (data && data.status && data.status === 401) { // sso auth fail 定义的特殊情况
            if (loginType === 'PASSPORT') {
                window.location.href = passportLogin;
            } else {
                if (data.data.code === '30005' || data.data.code === '30006') {
                    window.location.href = data.data.url;
                } else {
                    // 重定向到sso登入页
                    window.location.href = getSSOLoginUrl(); // 默认登出后再登录是重定向到应用首页
                }
            }
        }
        if (res && res.status === 402) { // 空间域名非法
            router.push({
                name: 'no-match-space'
            }).catch(e => e);
            addOwlReport('ILLEGAL_SPACE', (window as any).Owl?.errorModel.LEVEL.INFO, res?.config?.url, res);
            return Promise.reject('空间域名非法');
        }
        if (!data) {
            addOwlReport(res?.config?.url, defaultExceptionLevel, res?.config?.url, res);
            return Promise.reject(errTip);
        }
        if (data.code === 200) {
            return data;
        } else {
            // 当后端返回为“本次无更新”时，不报错；当后端返回401时，表示是保密tt，不报错
            if (data.code === 400 && (data.data.errorCode === 10035 || data.data.errorCode === 401)) {
                return data;
            } else {
                let msg = data.data && data.data.errorMsg || errTip;
                // 仅当有errorMsg时抛出
                if (data.data && data.data.errorMsg) {
                    Message({
                        showClose: true,
                        type: 'error',
                        message: msg
                    });
                }
                // 接口返回400时，将data抛出
                addOwlReport(res?.config?.url, (window as any).Owl?.errorModel.LEVEL.INFO, msg, res);
                return Promise.reject(data.code === 400 ? data : msg);
            }
        }
    },
    error => {
        Message({
            showClose: true,
            type: 'error',
            message: i18nClient.t('interface_error_please_contact_the_tt_team_we_apologize_for_any_inconvenience_this_may_have_caused_you')
        });
        addOwlReport(defaultSecCategory, defaultExceptionLevel, '',error);
        return Promise.reject(error);
    }
);

service.interceptors.request.use((config: any) => {
    let allowMethods = ['post', 'put'];
    if (allowMethods.indexOf(config.method) !== -1) {
        config.headers['Content-Type'] = 'application/json';
        config.data = JSON.stringify(config.data);
    }
    if (['post', 'get'].indexOf(config.method) !== -1) {
        config.headers['X-Locale'] = store.getters.language;
        config.headers['X-Time-Zone'] = store.getters.timeZone;
    }
    // 添加时间
    // config.metadata = { startTime: new Date() };
    return config;
}, (error: any) => {
    addOwlReport(defaultSecCategory, defaultExceptionLevel, '', error);
    return Promise.reject(error);
});

// 对axios的实例重新封装成一个plugin ,方便 Vue.use(xxxx)
export default service;
