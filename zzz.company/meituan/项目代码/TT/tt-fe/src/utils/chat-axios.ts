import axios from 'axios';
import config from '../config/axios.chat.conf';
import { Message } from '@ss/mtd-vue';
import { isProd, isStaging } from '../env';
import store from '../store';
const chatService = axios.create(config);
const defaultSecCategory = 'TT_AJAX_ERROR';
const defaultExceptionLevel = (window as any).Owl?.errorModel.LEVEL.WARN;
function addOwlReport (secCategory = defaultSecCategory, exceptionLevel = defaultExceptionLevel, content = '', extra) {
    window.owl && window.owl(
        'addError',
        {
            name: secCategory,
            msg: extra || content || ''
        },
        {
            level: exceptionLevel,
            combo: true,
            tags: {
                userInfo: store.getters.misX,
                content: content || secCategory
            }
        }
    );
}
// 返回状态判断(添加响应拦截器)
chatService.interceptors.response.use(
    (res) => {
        const data = res.data;
        const errTip = '数据获取失败';
        if (!data) {
            addOwlReport(res?.request?.url, defaultExceptionLevel, res?.request?.url, JSON.stringify(res || {}));
            return Promise.reject(errTip);
        }
        if (data.code === 200) {
            return data;
        } else {
            const msg = data.message || errTip;
            // 仅当有errorMsg时抛出
            if (data.message) {
                Message({
                    showClose: true,
                    type: 'error',
                    message: msg
                });
            }
            addOwlReport('BAD_REQUAST', (window as any).Owl?.errorModel.LEVEL.INFO, msg);
            return Promise.reject(msg);
        }
    },
    (error) => {
        Message({
            showClose: true,
            type: 'error',
            message: '接口错误，请联系TT团队，抱歉给您造成不好的体验感受'
        });
        addOwlReport();
        return Promise.reject(error);
    }
);

chatService.interceptors.request.use((config: any) => {
    const allowMethods = ['post', 'put'];
    if (allowMethods.indexOf(config.method) !== -1) {
        config.headers['Content-Type'] = 'application/json';
        config.data = JSON.stringify(config.data);
    }
    // 从cookie中取tt域名的ssoid
    const clientId = (isProd || isStaging) ? '9504f696cb' : 'cc7fabacff';
    const ssoKey = `${clientId}_ssoid`;
    const ssoToken = document.cookie.split(';').find(val => val.includes(ssoKey));
    // 不再使用access-token，存在安全漏洞
    config.headers.common = {
        ...config.headers.common,
        'x-tenant-id': 'com.sankuai.ee.ticket.core',
        // 'access-token': ssoToken,
        'x-u-id': store.getters.misX
    };
    return config;
}, (error: any) => {
    addOwlReport();
    return Promise.reject(error);
});

// 对axios的实例重新封装成一个plugin ,方便 Vue.use(xxxx)
export default chatService;
