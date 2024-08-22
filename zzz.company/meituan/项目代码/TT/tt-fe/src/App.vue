<template>
    <div id="app">
        <router-view />
        <div id="tt-watermark-repeat" style="background-image: url(/api-wm/image/visible);" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import MTD from '@ss/mtd-vue';
// import '@ss/mtd-vue/lib/theme2/index.css';
import '@bfe/mtd-theme-220/index.css';
Vue.use(MTD);

import MTDx from '@mt-material/mtdui-vue-ext';
Vue.use(MTDx);

import TT from '@mt-material/tt-work';
import '@mt-material/tt-work/lib/theme2/index.css';
Vue.use(TT);

import '@mt-material/pm-components/lib/theme-chalk/index.css';
import PMComponents from '@mt-material/pm-components';
Vue.use(PMComponents);

import { Loading, Upload } from 'element-ui';
Vue.use(Loading.directive);
Vue.use(Upload);

Vue.prototype.$loading = Loading.service;

export default Vue.extend({
    name: 'App',
    created () {
        import('./assets/css/index.css');
    }
});
</script>

<style lang="scss">
// @import './assets/css/index.css';
#tt-watermark-repeat {
    display: block;
    position: fixed;
    margin: 0;
    inset: 0;
    z-index: 9999;
    background-size: 350px;
    background-repeat: repeat;
    background-clip: border-box;
    pointer-events: none;
    opacity: 1;
}
// 自定义select样式
// .custom-select-no-tag {
//     .mtd-select-tags-ul {
//         overflow: auto;
//         height: 30px;
//         .mtdicon {
//             width: 14px !important;
//         }
//     }
// }
</style>