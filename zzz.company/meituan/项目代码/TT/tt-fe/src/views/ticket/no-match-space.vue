<template>
    <div id="no-match-space">
        {{ $getText('no_match_space_tip', '您访问的空间不存在') }}
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import TopNav from '@/components/topnav.vue';

/**
 * 系统首页
 *
 * @author liyuyao
 * @date 08/14/2020
 */
@Component({
    components: {
        TopNav
    }
})
export default class NoMatchSpace extends Vue {
    @Getter inside;
}
</script>
