// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import * as filters from '@/utils/filters';
import { SSOGuard } from '@mtfe/sso-web';
import { isProd, isStaging } from './env';
import { lxanalyMethod } from '@/utils/directive/lxanaly';
import resources from '@/assets/locales/resources';
import { i18nPlugin } from '@sailor/i18n-vue';
import ChainedBackend from 'i18next-chained-backend';
import OpenAPIBackend from '@sailor/i18n-web-openapi-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { setI18nClient } from './utils/axios';

// element-ui 的全局组件, 多语言, css 样式注入. 后续移除组件库一起移除
import './inject-element-ui';

// 全局注册埋点指令
Vue.directive('lxay', lxanalyMethod);
Vue.config.productionTip = false;
// 注册全局过滤器
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key]);
});

Vue.use(i18nPlugin, (i18nClient) => {
    i18nClient.use(ChainedBackend).init({
        fallbackLng: 'zh',
        lng: 'zh',
        ns: 'tt_fe',
        defaultNS: 'tt_fe',
        backend: {
            backends: [
                OpenAPIBackend,
                resourcesToBackend(resources)
            ],
            backendOptions: [
                {
                    namespaces: [{
                        name: 'tt_fe',
                        projectId: 23,
                        apiKey: '5bf27684785a4a219c2bdfbcfdcc9027',
                        namespaceId: 'z5a0x0qnmk'
                    }],
                    env: isProd ? 'prod' : 'test'
                }
            ]
        }
    }, () => {
        setI18nClient(i18nClient);
        console.log('初始化成功');
    });
});
// $getText('key');
// const getNs2Text = this.$i18nClient.getFixedT(null, "tt_fe");

// export default getNs2Text

let vue = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
    components: { App }
});

const ssoGuard = (isProd || isStaging) ? new SSOGuard({
    clientId: '9504f696cb',
    accessEnv: 'product',
    appkey: 'com.sankuai.tt.core.fe',
    h5GuardOptions: {
        domains: ['tt.fetc.st.sankuai.com', 'tt.sankuai.com'],
        xhrHook: true,
        fetchHook: true
    }
}) : new SSOGuard({
    clientId: 'cc7fabacff',
    accessEnv: 'test',
    appkey: 'com.sankuai.tt.core.fe',
    h5GuardOptions: {
        domains: ['dev-tt.cloud.test.sankuai.com', 'tt.cloud.test.sankuai.com'],
        xhrHook: true,
        fetchHook: true
    },
    isDebug: true
});
// ssoGuard.init();

Vue.config.errorHandler = (error, vm, info) => {
    window.owl && window.owl(
        'addError',
        error,
        {
            level: window.Owl.errorModel.LEVEL.ERROR,
            combo: true,
            tags: {
                userInfo: store.getters.misX,
                content: error.message,
                component: vm.$options.name,
                info: info
            }
        }
    );
    console.warn('VUE ERROR', error, vm, info);
};
