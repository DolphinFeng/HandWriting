<template>
    <div class="catalog-static">
        <div
            class="catalog-level-select"
            :key="level"
            v-for="level in [1, 2, 3]">
            <div class="level-title">{{ $getText(NUM_CN[level - 1], '一级目录') }}:</div>
            <mtd-input
                class="catalog-level-cascader"
                :readonly="true"
                v-model="cti[CTI_MAP[level - 1]]" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
/**
 * 纯展示CTI
 *
 * @author liyuyao
 * @date 09/11/2020
 */
@Component
export default class CatalogStatic extends Vue {
    @Prop({ default: () => {
        return {};
    }})
    cti: any;

    NUM_CN: string[] = ['category_select_level_one_title', 'category_select_level_two_title', 'category_select_level_three_title'];
    CTI_MAP: string[] = ['category', 'type', 'item'];


}
</script>

<style lang="scss">
.catalog-static {
    .catalog-level-select {
        width: 100%;
        margin-bottom: 10px;
        display: flex;
    }
    .level-title {
        line-height: 34px;
        width: 72px;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        letter-spacing: 0;
    }
    .catalog-level-cascader {
        flex: 1;
        line-height: 34px;
    }
}
</style>
