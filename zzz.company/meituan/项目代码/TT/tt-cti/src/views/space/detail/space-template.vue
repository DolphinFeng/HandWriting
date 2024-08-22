<template>
    <div class="space-detail-template-container">
        <mtd-tabs v-model="activeType" @input="activeTypeChange">
            <mtd-tab-pane label="普通模板" value="ordinary" />
            <mtd-tab-pane label="自定义模板" value="custom" />
            <mtd-tab-pane label="设置" value="settings" />
        </mtd-tabs>
        <router-view />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { PaginationMixin } from '@/utils/mixin';
import templateOrdinary from './space-template-components/templateOrdinary.vue';
import templateCustom from './space-template-components/templateCustom.vue';
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
export default class SpaceTemplate extends PaginationMixin {
    activeType: string = 'ordinary';

    mounted () {
        this.mountedRouter();
    }

    mountedRouter () {
        const name = this.$route.name;
        const val = name.split('_')[2];
        this.activeType = val || 'ordinary';
        this.activeTypeChange(this.activeType);
    }

    activeTypeChange (val) {
        this.$router.replace({
            name: `space_template_${val}`
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
