<template>
    <div id="home">
        <homePageInside v-if="loginType === 'SSO' && inside" />
        <homePageOutside v-else />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import homePageInside from './homePageInside.vue';
import homePageOutside from './homePageOutside.vue';
import eventBus from '@/utils/event-bus';


/**
 * 系统首页
 *
 * @author liyuyao
 * @date 04/20/2019
 */
@Component({
    components: {
        homePageInside,
        homePageOutside
    }
})
export default class Home extends Vue {
    @Getter inside;
    @Getter loginType;

    mounted () {
        eventBus.$emit('changeTab', '');
    }
}
</script>

<style lang="scss">
#home {
    background-color: #f5f5f5;
    min-height: 100%;
}
</style>
