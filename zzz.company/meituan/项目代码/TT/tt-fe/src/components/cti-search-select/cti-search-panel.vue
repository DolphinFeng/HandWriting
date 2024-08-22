<template>
    <div class="cti-search-panel">
        <div class="panel-title" v-if="!showNoResult">{{ query ? $getText('cti_search_panel_search_result', '搜索结果') : $getText('cti_search_panel_all_catalog', '全部目录') }}</div>
        <keep-alive>
            <cti-search-result
                v-if="query"
                :query="query"
                :category-list="categoryList"
                :create-type="createType"
                @noResult="handleNoResult"
                @change="searchResultChange" />
            <cti-all-tree
                v-else
                :cti="cti"
                :clear-cti="clearCti"
                :create-type="createType"
                :show-desc="showDesc"
                :category-list="categoryList"
                :is-private-space="isPrivateSpace"
                :form-type="formType"
                :show-query="showQuery"
                @clear-cti-change="handleClearCti"
                @noTreeResult="handleNoResult"
                @noCatalog="handleNoCatalog"
                @change="ctiChange"
                @selectChange="selectChange" />
        </keep-alive>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import CtiAllTree from './cti-all-tree.vue';
import CtiSearchResult from './cti-search-result.vue';


/**
 * 新版问题描述的cti搜索
 *
 * @author liyuyao
 * @date 06/24/2021
 */
@Component({
    components: {
        CtiAllTree,
        CtiSearchResult
    }
})
export default class CtiSearchPanel extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop({ default: '' })
    query: string;

    @Prop({ default: '' })
    showQuery: string;

    @Prop({ default: () => {
        return {};
    } })
    cti: CommonTypes.ctiItem;

    @Prop()
    categoryList: CommonTypes.DefaultObject[];

    @Prop()
    showDesc: boolean;

    @Prop()
    formType: string;

    // 发起方式
    @Prop({ default: 'BASIC' })
    createType: string;

    @Prop({ default: false })
    isPrivateSpace: boolean;

    @Prop()
    clearCti: boolean;

    showNoResult: boolean = false;

    ctiChange (cti) {
        this.$emit('change', cti);
    }
    selectChange () {
        this.$emit('selectChange');
    }
    searchResultChange (cti) {
        this.ctiChange(cti);
        this.selectChange();
    }
    handleNoCatalog (val) {
        this.$emit('noCatalog', val);
    }
    handleNoResult (val) {
        this.showNoResult = val;
    }
    handleClearCti (flag) {
        this.$emit('clear-cti-change', flag);
    }
}
</script>

<style lang="scss" scoped>
.cti-search-panel {
    max-height: 320px;
    overflow: auto;
}
.panel-title {
    font-family: PingFang SC;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.36);
    line-height: 20px;
    margin-top: 8px;
}
.mtd-tabs-large .mtd-tabs-content {
    padding: 0;
}

</style>
