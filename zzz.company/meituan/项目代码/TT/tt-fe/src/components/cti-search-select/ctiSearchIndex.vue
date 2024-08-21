<template>
    <mtd-dropdown
        style="width: 100%;"
        popper-class="cti-search-dropdown"
        v-model="visible">
        <mtd-input
            prefix-icon="mtdicon mtdicon-search"
            class="cti-search-input"
            :placeholder="$getText('cti_search_index_placeholder', '点击搜索 / 选择服务目录、处理人')"
            clearable
            ref="ctiInput"
            @input="inputChange"
            @focus="searchInputFocus"
            v-model="showQuery" />
        <div
            slot="dropdown"
            class="cti-search-dropdown-wrapper">
            <mtd-tabs @input="tabChange" v-model="searchType">
                <mtd-tab-pane :label="$getText('cti_search_index_cti_label', '服务目录')" value="cti">
                    <keep-alive>
                        <cti-search-panel
                            v-if="searchType === 'cti'"
                            :query="query"
                            :show-query="showQuery"
                            :cti="ctiInfo"
                            :create-type="createType"
                            :clear-cti="clearCti"
                            :show-desc="showDesc"
                            :category-list="categoryList"
                            :is-private-space="isPrivateSpace"
                            :form-type="formType"
                            @clear-cti-change="handleClearCti"
                            @change="ctiChange"
                            @noCatalog="handleNoCatalog"
                            @selectChange="visible = false" />
                    </keep-alive>
                </mtd-tab-pane>
                <mtd-tab-pane
                    :label="$getText('cti_search_index_assigned_label', '处理人')"
                    value="assigned"
                    v-if="createType === 'BASIC' && inside">
                    <keep-alive>
                        <assigned-search-result
                            v-if="searchType === 'assigned'"
                            :query="query"
                            @change="ctiFromAssigned" />
                    </keep-alive>
                </mtd-tab-pane>
            </mtd-tabs>
        </div>
    </mtd-dropdown>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import Clickoutside from '@/utils/tools/clickoutside';
import AssignedSearchResult from './assigned-search-result.vue';
import CtiSearchPanel from './cti-search-panel.vue';
import { NoCatalog } from '@/config/map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { CREATE_CTI_CHOOSE } from '@/config/lx_map.conf';
/**
 * 新版问题描述
 *
 * @author liyuyao
 * @date 06/24/2021
 */
@Component({
    components: {
        AssignedSearchResult,
        CtiSearchPanel
    },
    directives: { Clickoutside }
})
export default class CtiSearchIndex extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop({
        default: () => {
            return {};
        }
    })
    cti: CommonTypes.ctiItem;

    // 发起方式
    @Prop({ default: 'BASIC' })
    createType: string;

    @Prop({ default: false })
    isPrivateSpace: boolean;

    @Prop()
    clearCti: boolean;

    @Prop()
    showDesc: boolean;

    @Prop()
    formType: string;

    @Prop()
    categoryList: CommonTypes.DefaultObject[];

    visible: boolean = false;
    searchType: string = 'cti';

    query: string = '';
    showQuery: string = '';
    ctiInfo: any = {};
    focusFlag: boolean = false;
    lastQueryEmpty: boolean = true;
    @Watch('clearCti', { immediate: true })
    getCtiClear (flag) {
        if (flag) {
            this.showQuery = '';
        }
    }

    @Watch('cti', { immediate: true })
    getDefaultCti (cti) {
        if (!cti) return;
        cti.categoryId === NoCatalog.categoryId ? this.ctiChange(NoCatalog) : this.ctiChange(cti);
        this.ctiInfo = cti;
    }

    @Watch('showQuery')
    getQuery (query) {
        this.$emit('has-cti-content', query ? true : false);
    }

    searchInputFocus () {
        lxReportClick(CREATE_CTI_CHOOSE['cti_focus']);
        if (!this.focusFlag) {
            lxReportClick(CREATE_CTI_CHOOSE['cti_operate_start']);
            this.focusFlag = true;
        }
    }
    tabChange () {
        // this.query = '';
    }
    inputChange (val) {
        this.query = val;
        if (!val) {
            this.$emit('clear-value', true);
            this.lastQueryEmpty = true;
        } else {
            // 数据统计 上次为空才统计
            if (this.lastQueryEmpty) {
                lxReportClick(CREATE_CTI_CHOOSE['cti_search']);
            }
            this.lastQueryEmpty = false;
        }
        if (!this.visible) this.visible = true;
    }
    ctiChange (cti) {
        this.query = '';
        this.ctiInfo = cti;
        const { categoryName, typeName, itemName, i18nDisplayName, displayName, assigned } = cti;
        const isNoCatalog = cti.categoryId === NoCatalog.categoryId;
        const isNoCatalogAssigned = cti.categoryId === NoCatalog.categoryId && assigned;
        this.showQuery = i18nDisplayName && displayName
        ? (isNoCatalogAssigned
            ? (i18nDisplayName ? `${i18nDisplayName}/${assigned} | ${this.$getText('cti_search_index_tip_no_category', '不选择目录直接发起')}` : `${displayName}/${assigned} | ${this.$getText('cti_search_index_tip_no_category', '不选择目录直接发起')}`)
            : (i18nDisplayName ? `${i18nDisplayName}/${assigned} | ${categoryName}/${typeName}/${itemName}` : `${displayName}/${assigned} | ${categoryName}/${typeName}/${itemName}`))
        : isNoCatalog
            ? `${this.$getText('cti_search_index_tip_no_category', '不选择目录直接发起')}`
            : (itemName
                ? `${categoryName}/${typeName}/${itemName}`
                : typeName
                    ? `${categoryName}/${typeName}`
                    : categoryName);
        this.$emit('change', cti);
    }
    ctiFromAssigned (cti) {
        this.ctiChange(cti);
        this.visible = false;
    }
    handleNoCatalog (val) {
        this.$emit('noCatalog', val);
    }
    handleClearCti (flag) {
        this.showQuery = flag ? '' : this.showQuery;
    }
}
</script>

<style lang="scss" scoped>
.mtd-input-wrapper.cti-search-input {
    width: 100%;
    // font-size: 14px;
    /deep/.mtd-input-prefix-inner {
        width: 30px;
        display: inline-block;
        line-height: 28px;
        i {
            font-size: 16px;
            display: inline-block;
            vertical-align: middle;
        }
    }
}
.cti-search-dropdown-wrapper {
    padding: 0 16px 8px 12px;
    width: 756px;
    /deep/.mtd-tabs-content {
        padding: 4px 0 0;
    }
}
</style>

<style lang="scss">
.cti-search-dropdown {
    z-index: 2000 !important;
}
</style>