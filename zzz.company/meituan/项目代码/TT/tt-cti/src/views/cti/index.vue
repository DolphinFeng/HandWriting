<template>
    <div class="cti-container">
        <catalog-header :header="catalogHeader" @change="searchChange" />
        <div class="catalog-wrapper">
            <catalog
                :list="categoryList"
                :level="1"
                :active-id="currCategoryId"
                :allow-add="false"
                :allow-edit="false"
                @change-select="changeCategory"
                @add="addCategory"
                @edit="editCategory"
                @drop-handler="dropHandler"
                class="category-first-list" />
            <catalog
                v-if="show"
                :level="2"
                :list="typeList"
                :active-id="currTypeId"
                :allow-add="false"
                :allow-edit="false"
                :allow-delete="false"
                @add="addType"
                @edit="editType"
                @delete="handleDeleteType"
                @drop-handler="dropHandler"
                @change-select="changeType" />
            <catalog
                :list="itemList"
                :level="3"
                :allow-add="true"
                :allow-edit="itemAuth"
                :allow-delete="true"
                :active-id="currItemId"
                :has-next="false"
                @add="addItem"
                @edit="editItem"
                @delete="handleDeleteItem"
                @drop-handler="dropHandler"
                @change-select="changeItem" />
            <item-detail
                v-if="currItemId"
                :item-id="currItemId"
                @auth="getItemAuth" />
        </div>
        <!-- 编辑一级目录 -->
        <add-type-dialog
            :is-category="true"
            :is-edit="true"
            :id="currCategoryId"
            :list="typeList"
            :visible.sync="editCategoryVisible"
            @success="getCategoryList" />
        <!-- 添加一级目录 -->
        <add-type-dialog
            :is-category="true"
            :id="currCategoryId"
            :visible.sync="addCategoryVisible"
            @success="getCategoryList" />
        <!-- 编辑二级目录 -->
        <add-type-dialog
            :is-edit="true"
            :id="currTypeId"
            :visible.sync="editTypeVisible"
            :list="itemList"
            @success="getTypeList" />
        <!-- 添加二级目录 -->
        <add-type-dialog
            :id="currCategoryId"
            :visible.sync="addTypeVisible"
            @success="getTypeList" />
        <!-- 编辑三级目录 -->
        <add-item-dialog
            :parent-id="currTypeId"
            :item-id="itemId"
            :visible.sync="editItemVisible"
            :is-edit="true"
            @success="getItemList" />
        <!-- 添加三级目录 -->
        <add-item-dialog
            :parent-id="currTypeId"
            :visible.sync="addItemVisible"
            @success="getItemList" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { State } from 'vuex-class';
import Catalog from './components/catalog.vue';
import AddTypeDialog from './components/add-type.vue';
import AddItemDialog from './components/add-item.vue';
import CatalogHeader from './components/catalog-header.vue';
import ItemDetail from './components/item-detail.vue';
/**
 * CTI管理
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        Catalog,
        AddTypeDialog,
        AddItemDialog,
        CatalogHeader,
        ItemDetail
    }
})
export default class CtiConfig extends Vue {
    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;
    @State(state => state.cti.env)
    env: string;
    @State(state => state.cti.showAllCatalogs)
    showAllCatalogs: boolean;

    @Watch('showAllCatalogs', { immediate: true })
    showAllCatalogsChange () {
        this.currCategoryId = 0;
        this.currTypeId = 0;
        this.currItemId = 0;
        this.getFirstCatalog();
    }

    categoryList: CommonTypes.CatalogItem[] = [];
    typeList: CommonTypes.CatalogItem[] = [];
    itemList: CommonTypes.CatalogItem[] = [];
    currCategoryId: number = 0;
    currTypeId: number = 0;
    currItemId: number = 0;
    itemId: number = 0;

    currCategoryName: string = '';
    currTypeName: string = '';

    itemAuth: Boolean = false;

    addCategoryVisible: Boolean = false;
    addTypeVisible: Boolean = false;
    addItemVisible: Boolean = false;
    editCategoryVisible: Boolean = false;
    editTypeVisible: Boolean = false;
    editItemVisible: Boolean = false;

    show: Boolean = true;
    $mtd: any;

    async dropHandler (level: number, ctiIds, list?: any) {
        let parentId: number;
        const fetchFreshMap = ['getCategoryList', 'getTypeList', 'getItemList'];
        const listMap = ['categoryList', 'typeList', 'itemList'];
        switch (level) {
            case 1:
                parentId = 1;
                break;
            case 2:
                parentId = this.currCategoryId;
                break;
            case 3:
                parentId = this.currTypeId;
                break;
            default:
                parentId = -1;
                break;
        }
        const params = {
            level,
            parentId,
            ctiIds
        };
        this[listMap[level - 1]] = list;
        const { code } = await api.ctiApi.draggableSort([params]);
        if (code === 200) {
            this.$mtd.message.success('排序更新成功');
            this[fetchFreshMap[level - 1]]();
        }
    }
    async getCategoryList () {
        this.showAllCatalogs ? await this.getAllCategoryList() : await this.getCommonSpaceCategory();
    }
    async getAllCategoryList () {
        try {
            const res = await api.ctiApi.getCategoryList();
            this.categoryList = res.data.items;
        } catch (e) {
            this.categoryList = [];
            console.log(e);
        }
    }
    async getTypeList () {
        try {
            const res = await api.ctiApi.getCatalogLevel2Tree({ parentId: this.currCategoryId, states: 1 });
            this.typeList = res.data.items;
        } catch (e) {
            this.typeList = [];
            console.log(e);
        }
    }
    async getItemList () {
        try {
            const res = await api.ctiApi.getCatalogLevel3Tree({ parentId: this.currTypeId, states: 1 });
            this.itemList = res.data.items;
        } catch (e) {
            this.itemList = [];
            console.log(e);
        }
    }
    async getCommonSpaceCategory () {
        try {
            const res = await api.spaceApi.getSpaceCategoryList({
                domain: 'public',
                states: 1
            });
            this.categoryList = res.data.items;
        } catch (e) {
            this.categoryList = [];
            console.log(e);
        }
    }
    // 获取一级、二级、三级目录
    async getFirstCatalog () {
        await this.getCategoryList();
        if (this.categoryList.length) {
            this.currCategoryId = this.currCategoryId ? this.currCategoryId : this.categoryList[0].id;
            await this.getSecondCatalog(false);
        } else {
            this.typeList = [];
        }
    }
    // 获取二级、三级目录
    async getSecondCatalog (isSearch: Boolean) {
        this.show = false;
        await this.getTypeList();
        this.show = true;
        if (this.typeList.length) {
            this.currTypeId = isSearch ? this.currTypeId : this.typeList[0].id;
            await this.getThirdCatalog(isSearch);
        } else {
            this.itemList = [];
        }
    }
    // 获取三级目录
    async getThirdCatalog (isSearch: Boolean) {
        await this.getItemList();
        this.currItemId = isSearch ? this.currItemId : this.itemList[0] && this.itemList[0].id;
    }
    changeCategory (id: number, isSearch: Boolean) {
        this.currCategoryId = id;
        this.currTypeId = 0;
        this.currItemId = 0;
        this.getSecondCatalog(isSearch);
    }
    changeType (id: number, isSearch: Boolean) {
        this.currTypeId = id;
        this.currItemId = 0;
        this.getThirdCatalog(isSearch);
    }
    changeItem (id: number) {
        this.currItemId = id;
    }
    addCategory () {
        this.addCategoryVisible = true;
    }
    editCategory (id: number) {
        this.currCategoryId = id;
        this.categoryList.forEach(category => {
            if (category.id === id) {
                this.currCategoryName = category.name;
            }
        });
        this.editCategoryVisible = true;
    }
    addType () {
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_1isbhu59_mc', { custom: { mis: this.userInfo.username } });
        this.addTypeVisible = true;
    }
    editType (id: number) {
        this.currTypeId = id;
        this.typeList.forEach(type => {
            if (type.id === id) {
                this.currTypeName = type.name;
            }
        });
        this.editTypeVisible = true;
    }
    addItem () {
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_28x8jmpo_mc', { custom: { mis: this.userInfo.username } });
        this.addItemVisible = true;
    }
    editItem (id: number) {
        this.itemId = id;
        this.editItemVisible = true;
    }
    handleDeleteType (id) {
        this.currTypeId = id;
        this.handleDelete(id, true);
    }
    handleDeleteItem (id) {
        this.currItemId = id;
        this.handleDelete(id, false);
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_21zhyfrq_mc', { custom: { mis: this.userInfo.username } });
    }
    // 删除三级目录
    handleDelete (id, isType?) {
        const _this = this;
        this.$mtd.confirm({
            title: '你是否确认删除该目录？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    if (isType) {
                        await api.ctiApi.deleteType(id);
                        _this.getSecondCatalog(false);
                    } else {
                        await api.ctiApi.deleteItem(id);
                        _this.getThirdCatalog(false);
                    }
                    this.$mtd.message({
                        message: `删除${isType ? '二级' : '三级'}目录成功`,
                        type: 'success'
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    // 处理搜索
    searchChange (val) {
        // reset
        if (!val.categoryId) {
            this.currCategoryId = 0;
            this.currTypeId = 0;
            this.currItemId = 0;
            this.getFirstCatalog();
        } else {
            this.changeCategory(val.categoryId, true);
            this.changeType(val.typeId, true);
            this.changeItem(val.itemId);
        }
    }
    getItemAuth (auth) {
        this.itemAuth = auth;
    }
    // 获取目录头部信息
    get catalogHeader () {
        return [
            {
                title: '一级目录',
                title_First: 'C',
                title_En: 'ategory',
                count: this.categoryList.length
            },
            {
                title: '二级目录',
                title_First: 'T',
                title_En: 'ype',
                count: this.typeList.length
            },
            {
                title: '三级目录',
                title_First: 'I',
                title_En: 'tem',
                count: this.itemList.length
            }
        ];
    }
    get aboutUrl () {
        const url = this.env === 'prod' ? '//tt.sankuai.com/ticket/create?cid=112&tid=2190&iid=9397' : '//tt.cloud.test.sankuai.com/ticket/create?cid=2&tid=3&iid=15';
        return url;
    }
}
</script>

<style lang="postcss">
.cti-container {
    height: calc(100% - 155px);
    .catalog-wrapper {
        height: 100%;
        min-width: 1230px;
        margin: 0 20px;
        .category-first-list {
            .iconfont.icon-edit- {
                right: 18px !important;
            }
        }
    }
}
</style>
