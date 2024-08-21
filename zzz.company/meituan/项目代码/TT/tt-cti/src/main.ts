// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue';
import resources from '@/assets/locales/resources';
import { i18nPlugin } from '@sailor/i18n-vue';
import ChainedBackend from 'i18next-chained-backend';
import OpenAPIBackend from '@sailor/i18n-web-openapi-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import router from './router';
import store from './store';
import { formatOncallTime, formatTime } from '@/utils/filters';
import LXanaly from '@/utils/directive/lxanaly';
import SSOWeb from '@mtfe/sso-web';
import App from './App.vue';
import '@/plugins/error-handler';
import '@/plugins/owl-guards';
import '@/plugins/mtd';
import '@/plugins/axios';
import '@/plugins/element';
import DynamicComponent from '@era/edc-vue';

// 设置环境信息
const ONLINE_ENV: string = 'cti.sankuai.com';
const isProd: Boolean = window.location.host.indexOf(ONLINE_ENV) > -1;

Vue.use(i18nPlugin, (i18nClient) => {
    i18nClient.use(ChainedBackend).init({
        fallbackLng: 'zh',
        lng: 'zh',
        ns: 'cti_fe',
        defaultNS: 'cti_fe',
        backend: {
            backends: [
                OpenAPIBackend,
                resourcesToBackend(resources)
            ],
            backendOptions: [
                {
                    namespaces: [{
                        name: 'cti_fe',
                        projectId: 23,
                        apiKey: '5bf27684785a4a219c2bdfbcfdcc9027',
                        namespaceId: 'ql67plnecx'
                    }],
                    env: isProd ? 'prod' : 'test'
                }
            ]
        }
    }, () => { console.log('初始化成功'); });
});

// 全局注册埋点指令
Vue.directive('lxay', LXanaly);
Vue.config.productionTip = false;

// 注册全局过滤器
Vue.filter('formatOncallTime', formatOncallTime);
Vue.filter('formatTime', formatTime);

const STAGING_ENV: string = 'cti.fetc.st.sankuai.com';
const isStaging: Boolean = window.location.host.indexOf(STAGING_ENV) > -1;
// const TEST_ENV: string = 'cti.cloud.test.sankuai.com';
// const DEV_ENV: string = 'dev-cti.cloud.test.sankuai.com';
const env: string = isProd ? 'prod' : isStaging ? 'staging' : 'test';
const testClientId = 'cc7fabacff';
const prodClientId = '9504f696cb';
// const ctiAppkey = 'com.sankuai.tt.cti.fe';
store.commit('GET_ENV', env);
// 接入SSO websdk
const ssoWeb = (isProd || isStaging) ? SSOWeb({
    clientId: prodClientId,
    accessEnv: 'product',
    callbackUrl: window.location.pathname
}) : SSOWeb({
    clientId: testClientId,
    accessEnv: 'test',
    callbackUrl: window.location.pathname
});
ssoWeb.login().then(ssoid => {
    if (ssoid && typeof ssoid === 'string') {
        new Vue({
            router,
            store,
            render: h => h(App)
        }).$mount('#app');
        store.commit('GET_LOGIN_URL', ssoWeb.getLoginUrl());
    }
});

// const ssoGuard = (isProd || isStaging) ? new SSOGuard({
//     clientId: prodClientId,
//     accessEnv: 'product',
//     appkey: ctiAppkey,
//     h5GuardOptions: {
//         domains: [STAGING_ENV, ONLINE_ENV],
//         xhrHook: true,
//         fetchHook: true
//     },
// }) : new SSOGuard({
//     clientId: testClientId,
//     accessEnv: 'test',
//     appkey: ctiAppkey,
//     h5GuardOptions: {
//         domains: [TEST_ENV, DEV_ENV],
//         xhrHook: true,
//         fetchHook: true
//     },
//     isDebug: true
// });
// ssoGuard.init();

const EDCRegistry = (window as any).__EDC__;
const envEnums: any = {
    prod: 'production'
};

EDCRegistry.addService('Vue', Vue);
EDCRegistry.userInfo = {
    bgId: '0'
};
EDCRegistry.config({
    env: envEnums[env] || env, // 标记当前项目运行的环境，如 test, staging, production
    projectId: 'com.sankuai.tt.core.fe', // 当前项目的appkey，就是第一步中给到云图的Appkey
});

Vue.use(DynamicComponent);
