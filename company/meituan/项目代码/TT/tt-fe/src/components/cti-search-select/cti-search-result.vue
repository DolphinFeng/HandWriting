<template>
    <ul class="cti-search-result">
        <mtd-loading
            v-if="loading"
            size="small"
            :message="$getText('cti_search_result_searching', '搜索中')" />
        <div class="empty-tip" v-if="showNoResult">{{ $getText('cti_search_result_no_result', '暂无服务目录结果') }}</div>
        <li
            class="cti-search-item"
            :key="cti.itemId"
            v-for="cti in ctiSearchList"
            @click="ctiChange(cti)">
            <span class="cti-search-item-span" v-html="createType === 'CUSTOM' ? cti.ctiNamePath : cti.highlight" />
        </li>
    </ul>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import debounce from 'lodash.debounce';
import * as api from '@/api';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { CREATE_CTI_CHOOSE } from '@/config/lx_map.conf';
/**
 * 新版问题描述的cti搜索
 *
 * @author liyuyao
 * @date 06/24/2021
 */
@Component
export default class CtiSearchResult extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop({ default: '' })
    query: string;

    @Prop({ default: 'BASIC' })
    createType: string;

    @Prop()
    categoryList: CommonTypes.DefaultObject[];

    debounceSearchCti: Function = debounce(this.searchCti, 500);
    debounceFilterCti: Function = debounce(this.filterCti, 500);

    ctiSearchList: CommonTypes.ctiItem[] = [];

    loading: Boolean = false;
    showNoResult: boolean = false;

    @Watch('query', { immediate: true })
    getQueryChange (query: string) {
        if (query) {
            this.createType === 'CUSTOM' ? this.debounceFilterCti(query) : this.debounceSearchCti(query);
        }
    }

    filterCti (query: string) {
        // 拼接ctiNamePath
        this.loading = true;
        this.categoryList.forEach(val => {
            val.ctiNamePath = val.categoryName + ' / ' + val.typeName + ' / ' + val.itemName;
        });
        // 筛选匹配的list
        this.ctiSearchList = this.categoryList.filter(val => val.ctiNamePath.includes(query));
        this.loading = false;
        this.showNoResult = !this.loading && !this.ctiSearchList.length;
        this.$emit('noResult', this.showNoResult);
    }

    async searchCti (query: string) {
        this.loading = true;
        const res: Ajax.AxiosResponse = await api.ctiApi.searchCti({
            keyword: query,
            sceneId: 1
        });
        let { code, data } = res;
        if (code === 200) {
            this.ctiSearchList = data.items;
            this.loading = false;
            this.showNoResult = !this.loading && !this.ctiSearchList.length;
            lxReportClick(CREATE_CTI_CHOOSE[this.ctiSearchList.length ? 'cti_search_result' : 'cti_search_empty']);
            this.$emit('noResult', this.showNoResult);
        }
    }

    ctiChange (cti) {
        lxReportClick(CREATE_CTI_CHOOSE['cti_search_hit']);
        this.$emit('change', cti);
    }
}
</script>

<style lang="scss" scoped>
.cti-search-item {
    padding: 0 8px;
    line-height: 36px;
    &:hover {
        cursor: pointer;
        background: rgba(0, 0, 0, 0.04);
    }
}
.cti-search-item-span {
    /deep/ em {
        font-style: normal;
        font-family: PingFangSC-Medium;
        color: #f80;
    }
}
.empty-tip {
    text-align: center;
    margin-top: 8px;
}
/deep/ .mtd-loading-message {
    font-size: 12px;
}
</style>
