<!-- 
    20191021 重构后已废弃
-->
<template>
    <div class="catalog-filter">
        <span class="catalog-filter-label">服务目录</span>
        <mtd-select
            @change="handleCategoryChanged" 
            v-model="currCategoryId" 
            class="category-select catalog-item">
            <mtd-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id" />
        </mtd-select>
        <mtd-select
            clearable
            @change="handleTypeChanged"
            placeholder="待选择"
            v-model="currTypeId"
            class="type-select catalog-item">
            <mtd-option
                v-for="item in typeList"
                :key="item.id"
                :label="item.name"
                :value="item.id" />
        </mtd-select>
        <mtd-select
            clearable
            @change="handleItemChanged"
            placeholder="待选择"
            v-model="currItemId"
            class="item-select catalog-item">
            <mtd-option
                v-for="item in itemList"
                :key="item.id"
                :label="item.name"
                :value="item.id" />
        </mtd-select>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { CHART_LX_MAP } from '@/config/lx_map.conf';
import { State } from 'vuex-class';
import * as api from '@/api';
/**
 * 三级目录筛选器
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component
export default class TicketFilter extends Vue {
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @Prop({ default: 0 })
    categoryId: number;
    @Prop({ default: 0 })
    typeId: number;
    @Prop({ default: 0 })
    itemId: number;
    categoryList: CommonTypes.CatalogItem[] = [];
    typeList: CommonTypes.CatalogItem[] = [];
    itemList: CommonTypes.CatalogItem[] = [];
    currCategoryId: any = 0;
    currTypeId: any = 0;
    currItemId: any = 0;

    handleCategoryChanged (val: number) {
        this.lxSubmit('cti_catalog_category');
        this.currItemId = 0;
        this.itemList = [];
        this.$emit('update:categoryId', val);
        this.$emit('update:itemId', 0);
        this.$emit('update:typeId', 0);
        this.$nextTick(() => {
            this.$emit('refresh');
        });
        this.currTypeId = 0;
        this.getTypeList(val);
    }
    handleTypeChanged (val: number) {
        this.lxSubmit('cti_catalog_type');
        this.$emit('update:typeId', val);
        this.$emit('update:itemId', 0);
        this.$nextTick(() => {
            this.$emit('refresh');
        });
        this.currItemId = 0;
        this.getItemList(val);
    }
    handleItemChanged (val: number) {
        this.lxSubmit('cti_catalog_item');
        this.$emit('update:itemId', val);
        this.$nextTick(() => {
            this.$emit('refresh');
        });
    }
    async getCategoryList () {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getCategoryList();
            this.categoryList = res.data.items;
            this.categoryList.unshift({
                name: '全部',
                active: true,
                id: 0
            });
            this.categoryId = 0;
            this.$emit('update:categoryId', 0);
        } catch (e) {
            this.categoryList = [];
            console.log(e);
        }
    }
    async getTypeList (id: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getTypeList({
                parentId: id
            });
            this.typeList = res.data.items;
        } catch (e) {
            this.typeList = [];
            console.log(e);
        }
    }
    async getItemList (id: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getItemList({
                parentId: id
            });
            this.itemList = res.data.items;
        } catch (e) {
            this.itemList = [];
            console.log(e);
        }
    }
    lxSubmit (eventName) {
        window.LXAnalytics && window.LXAnalytics('moduleClick', CHART_LX_MAP[eventName], { custom: { mis: this.userInfo.username } });
    }
    created () {
        this.getCategoryList();
    }
}
</script>

<style lang="scss">
.catalog-filter {
    display: inline-block;
    float: left;
    .catalog-filter-label {
        margin-right: 10px;
        font-family: PingFangSC-Medium;
        color: #666;
    }
}
</style>