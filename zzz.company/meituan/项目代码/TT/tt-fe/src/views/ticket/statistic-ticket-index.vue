<template>
    <div class="statistic-custom-reports-container">
        <DynamicComponent
            edc-id="yuntu-custom-reports"
            theme="mtd-yellow-base"
            expand-theme="mtd-yellow-expand"
            action="new"
            :is-have-header="true"
            :edc-cache="false"
            source="tt" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { env } from '@/env';
import { lxReportView, lxReportClick, lxReportPV } from '@/utils/directive/lxanaly';
import router from '@/router';
/**
 * 统计分析
 *
 * @author liyuyao
 * @date 04/20/2020
 */
import DynamicComponent from '@era/edc-vue';
const EDCRegistry = window.__EDC__;
let judgeSSOid = (() => {
    let ssoid = '';
    // const ONLINE_ENV: string = 'tt.sankuai.com';
    // 不同环境的clientId
    let cookieName = 'tt_ssoid';
    if (document.cookie) {
        let cookies = document.cookie;
        let cookieList = cookies.split('; ');
        cookieList.forEach((item) => {
            let itemName = item.split('=')[0];
            if (itemName === cookieName) {
                ssoid = item.split('=')[1];
            }
        });
    }
    if (typeof localStorage === 'object') {
        try {
            localStorage['ssoid'] = ssoid;
        } catch (error) {
            console.log(error);
        }
    }
});
judgeSSOid();
EDCRegistry.addService('Vue', Vue);
// 将点击事件埋点方法暴露给 EDC 组件使用
EDCRegistry.addService('clickReport', lxReportClick);
// 将曝光事件埋点方法暴露给 EDC 组件使用
EDCRegistry.addService('moduleViewReport', lxReportView);
// 将页面埋点方法暴露给 EDC 组件使用
EDCRegistry.addService('pvReport', lxReportPV);
EDCRegistry.addService('Router', router);
EDCRegistry.config({
    env: env === 'prod' ? 'production' : 'dev', // 标记当前项目运行的环境，如 test, staging, production
    projectId: 'com.sankuai.tt.core.fe', // 当前项目的appkey，就是第一步中给到云图的Appkey
    ssoId: localStorage['ssoid'] || ''
});
Vue.use(DynamicComponent);

@Component
export default class StatisticsIndex extends Vue {
}
</script>
<style lang="scss">
.statistic-custom-reports-container {
    height: 100%;
}
</style>