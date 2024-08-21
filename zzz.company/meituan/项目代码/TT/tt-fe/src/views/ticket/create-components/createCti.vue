<template>
    <div class="create-cti-wrapper create-content-wrapper">
        <div class="create-title">
            <i slot="icon" class="iconfont icon-a-01" /><h1 class="cti-title"> {{ $getText('create_cti_select_tip', '请选择问题分类') }}</h1>
        </div>
        <CtiSearchSelect
            :cti="ctiInfo"
            :create-type="type"
            :clear-cti="clearCti"
            :show-desc="showDesc"
            :category-list="categoryList"
            :is-private-space="isPrivateSpace"
            :form-type="formType"
            @noCatalog="handleNoCatalog"
            @clear-value="clearValue"
            @has-cti-content="handleCti"
            @change="ctiInfoChange" />
        <div 
            class="mtd-form-item-error-tip"
            v-if="showCtiCheck">{{ $getText('create_cti_select_tip', '请选择问题分类') }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import CtiSearchSelect from '@/components/cti-search-select/ctiSearchIndex.vue';

/**
 * 新版问题描述
 *
 * @author liyuyao
 * @date 06/24/2021
 */
@Component({
    components: {
        CtiSearchSelect
    }
})
export default class CreateCti extends Vue {
    @Getter inside;
    @Getter loginType;

    // 发起方式
    @Prop({ default: 'BASIC' })
    type: string;

    @Prop({ default: false })
    isPrivateSpace: boolean;

    @Prop({ default: () => {
        return {};
    } })
    cti: any;

    @Prop()
    formType: string;

    @Prop()
    showCtiCheck: boolean;

    @Prop()
    clearCti: boolean;

    @Prop()
    ctiIndex: number;

    @Prop()
    showDesc: boolean;

    @Prop()
    categoryList: CommonTypes.DefaultObject[];

    ctiInfo: any = {};

    @Watch('cti', { immediate: true })
    getDefaultCti (cti) {
        this.ctiInfo = cti;
    }

    ctiInfoChange (cti) {
        this.$emit('change', cti);
    }
    recommendChange (cti) {
        this.ctiInfo = cti;
    }
    handleCti (val) {
        this.$emit('has-cti-content', val);
    }
    clearValue (val) {
        this.$emit('clear-value', val);
    }
    handleNoCatalog (val) {
        this.$emit('noCatalog', val);
    }
}
</script>

<style lang="scss">
.create-cti-wrapper {
    // padding: 16px 20px;
    background-color: #fff;
    // box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    // border-radius: 4px;
    .create-title {
        margin-bottom: 12px;
        h1 {
            display: inline;
            vertical-align: middle;
        }
        .icon-a-01 {
            font-size: 22px;
            vertical-align: middle;
            display: inline-block;
            color: rgba(0, 0, 0, 0.72);
        }
    }
}
</style>
