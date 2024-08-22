<template>
    <div id="app">
        <router-view />
        <div id="cti-watermark-repeat" style="background-image: url(/api-wm/image/visible);" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import '@bfe/mtd-theme-220/index.css';
import '@mt-material/pm-components/lib/theme-chalk/index.css';
import PMComponents from '@mt-material/pm-components';
Vue.use(PMComponents);

export default Vue.extend({
    name: 'App'
});
</script>

<style lang="postcss">
@import './assets/css/index.css';
#cti-watermark-repeat {
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
</style>
