<template>
    <div class="template-container">
        <mtd-tabs v-model="activeType" @input="activeTypeChange">
            <mtd-tab-pane label="普通模板" value="ordinary" />
            <mtd-tab-pane label="自定义模板" value="custom" />
        </mtd-tabs>
        <router-view />
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { PaginationMixin } from '@/utils/mixin';
import templateOrdinary from './templateOrdinary.vue';
import templateCustom from './templateCustom.vue';
/**
 * rg模板列表
 *
 * @author  liyuyao
 * @date 03/11/2020
 */
@Component({
    components: {
        templateOrdinary,
        templateCustom
    }
})
export default class RgTemplate extends PaginationMixin {
    activeType: string = 'ordinary';

    @Watch('$route.name', { immediate: true })
    onRouterChange (name) {
        this.activeType = name === 'rg_template_custom' ? 'custom' : 'ordinary';
    }

    activeTypeChange (val) {
        this.$router.push({
            name: `rg_template_${val}`,
            query: {
                rgId: `${this.rgId}`
            }
        }).catch(e => e);
    }

    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss" scoped>
.template-container {
    position: relative;
    margin-top: 8px;
    .template-check-header {
        .switch-button {
            display: inline-block;
            color: #FF8800;
            cursor: pointer;
        }
    }
}
</style>
