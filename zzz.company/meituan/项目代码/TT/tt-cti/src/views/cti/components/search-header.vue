<template>
    <div class="search-header-container">
        <p class="search-header-tip">服务黄页（CTI）是目录系统，每一个提供服务的小组（RG），都可以添加自己团队对应的目录。添加、编辑一二三级目录，新建服务小组，请<a :href="aboutUrl" target="_blank">发TT</a>给我们</p>
        <div class="catagory-search-container">
            <span class="search-label">目录查询：</span>
            <category-tree
                class="header-catagory-tree"
                :allow-any-level="true"
                :category-tree="categoryList"
                :display-level="3"
                @categoryChange="handleCategoryChange" />
            <div style="float: right;" v-if="userInfo.sysAdmin">
                <mtd-button type="primary" @click="showAllCatalogstoVuex(!showAllCatalogs)">{{ buttonText }}</mtd-button>
                <mtd-button @click="ctiTransfer">目录迁移</mtd-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import CategoryTree from './category-tree.vue';
import * as api from '@/api';

/**
 * CTI目录搜索
 *
 * @author liyuyao
 * @date 09/06/2019
 */

@Component({
    components: {
        CategoryTree
    }
})
export default class SearchHeader extends Vue {
    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @State(state => state.cti.env)
    env: string;

    @State(state => state.cti.showAllCatalogs)
    showAllCatalogs: boolean;

    @Mutation setShowAllCatalogs;

    categoryList: any = [];

    mounted () {
        this.getCategoryTree();
    }
    get buttonText () {
        return this.showAllCatalogs ? '仅查看公共目录' : '查看全部目录';
    }

    handleCategoryChange (val) {
        this.$emit('change', val);
    }
    ctiTransfer () {
        this.$router.push({
            name: 'cti_transfer'
        }).catch(e => e);
    }
    showAllCatalogstoVuex (val) {
        this.setShowAllCatalogs(val);
        this.getCategoryTree();
    }
    get aboutUrl () {
        const url = this.env === 'prod' ? '//tt.sankuai.com/ticket/create?cid=112&tid=2190&iid=9397' : '//tt.cloud.test.sankuai.com/ticket/create?cid=2&tid=3&iid=15';
        return url;
    }
    async getCategoryTree () {
        try {
            const res = this.showAllCatalogs ? await api.ctiApi.getCategoryTree() : await api.spaceApi.getSpaceCatalogTree({
                domain: 'public',
                states: 1
            });
            this.categoryList = res.data.items;
        } catch (e) {
            console.log(e);
        }
    }
}
</script>

<style lang="postcss">
.search-header-container {
    padding: 16px 32px;
    border-bottom: 1px solid #D3D8E4;
    .search-header-tip {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 22px;
    }
    .catagory-search-container {
        margin-top: 16px;
        .search-label {
            color: rgba(0, 0, 0, 0.6);
        }
        .category-tree-container {
            display: inline-block;
            width: 540px;
        }
    }
}
</style>
