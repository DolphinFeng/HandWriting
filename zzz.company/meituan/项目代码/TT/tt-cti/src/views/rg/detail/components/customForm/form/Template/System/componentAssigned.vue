<template>
    <div class="category-assigned-search-container">
        <span v-if="!(categoryShow || assignedShow)">生成模板中已隐藏，点击可继续编辑“向谁发起”</span>
        <div class="category-search-container">
            <div class="info-item" v-if="categoryShow">
                <!-- <div class="info-label">服务目录</div> -->
                <div class="category-form-item">
                    <category-tree
                        v-if="categoryShow"
                        class="category-tree"
                        :cti-tree="categoryList"
                        :category-name="searchForm.categoryName"
                        :type-name="searchForm.typeName"
                        :item-name="searchForm.itemName"
                        :category-id="searchForm.categoryId"
                        :type-id="searchForm.typeId"
                        :item-id="searchForm.itemId"
                        :rg-id="searchForm.rgId"
                        :rg-name="searchForm.rgName"
                        :readonly="readonly"
                        @categoryChange="handleCategoryChange" />
                    <!-- <div v-else>{{ `${searchForm.categoryName}/${searchForm.typeName}/${searchForm.itemName}` }}</div> -->
                </div>
            </div>
            <div class="info-item" v-if="assignedShow">
                <!-- <div class="info-label">处理人</div> -->
                <div class="category-form-item">
                    <mtd-select
                        v-if="specificAssigned"
                        v-model="searchForm.assigned"
                        placeholder="请输入 MIS"
                        filterable
                        @change="withCtiChange"
                        class="rglist-select"
                        :disabled="readonly">
                        <mtd-option
                            v-for="item in withCtiRgList"
                            :key="item.identify"
                            :label="`${item.displayName}（${item.identify}）`"
                            :value="item.identify">
                            {{ `${item.displayName}（${item.identify}）` }}
                        </mtd-option>
                    </mtd-select>
                    <div v-else-if="!specificAssigned && assigned.identify">{{ `${assigned.displayName}（${assigned.identify}）` }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import TemplateMixin from '../TemplateMixin.vue';
import CategoryTree from './sysComponents/category-tree.vue';
import store from '@/store';

import * as api from '@/api';
/**
 * 服务目录 + 处理人
 *
 * @author liyuyao
 * @date 04/22/2019
 */

@Component({
    components: {
        CategoryTree
    }
})
export default class CategoryAssignedSearch extends TemplateMixin {
    @Prop({ required: false })
    defaultRgUsers: CommonTypes.mapObject[];

    @State(state => state.cti.allCategoryTree)
    allCategoryTree: CommonTypes.mapObject[];

    searchForm: any = {
        assigned: '',
        categoryName: '',
        categoryId: 0,
        typeName: '',
        typeId: 0,
        itemName: '',
        itemId: 0,
        rgId: 0,
        rgName: ''
    };
    assigned: any = {};
    withCtiRgList: any = [];
    personalRgList: any = [];
    specificAssigned: boolean = false;
    categoryShow: boolean = true;
    assignedShow: boolean = true;
    currentType: string = '';

    categoryList: any[] = [];
    rgCtiList: any[] = [];

    constDefault: any = {
        label: '暂无对应的服务目录',
        value: '',
        disabled: true
    };

    @Watch('field.extraSettings', { immediate: true })
    async watchExtraSettings () {
        this.searchForm = {
            assigned: '',
            categoryName: '',
            categoryId: 0,
            typeName: '',
            typeId: 0,
            itemName: '',
            itemId: 0,
            rgId: 0,
            rgName: ''
        };
        this.assigned = {};
        const extraSettings = this.field.extraSettings;
        if (extraSettings) {
            this.categoryShow = !extraSettings.isItemHidden;
            this.assignedShow = !extraSettings.isAssignedHidden;
            this.specificAssigned = extraSettings.specificAssigned;
            const itemsScope = extraSettings.itemsScope;
            if (itemsScope && itemsScope.items && itemsScope.items.length) { // 指定目录
                this.categoryList = this.abstractTree(itemsScope.items);
            } else if (itemsScope && !itemsScope.isItemHidden && itemsScope.rgId) { // rg绑定目录
                if (this.rgCtiList.length) {
                    this.categoryList = this.rgCtiList;
                } else {
                    this.getCategoryTreeByRg(itemsScope.rgId);
                }
            } else if (itemsScope && extraSettings.isItemHidden && itemsScope.itemId) { // 隐藏的默认目录
                // TODO: itemsScope 类型待确认
                await this.getSearchForm(extraSettings.itemsScope.itemId);
            } else {
                this.categoryList = this.allCategoryTree;
            }
        }
    }
    abstractTree (ctiItems) {
        const destList = [];
        ctiItems.forEach(cti => {
            let levelList = destList;
            let obj = levelList.find(item => item.categoryId === cti.categoryId);
            if (!obj) {
                obj = {
                    categoryId: cti.categoryId,
                    categoryName: cti.categoryName,
                    children: []
                };
                levelList.push(obj);
            }
            levelList = obj.children;
            let obj2 = levelList.find(item => item.typeId === cti.typeId);
            if (!obj2) {
                obj2 = {
                    typeId: cti.typeId,
                    typeName: cti.typeName,
                    children: []
                };
                levelList.push(obj2);
            }
            levelList = obj2.children;
            let obj3 = levelList.find(item => item.itemId === cti.itemId);
            if (!obj3) {
                obj3 = {
                    itemId: cti.itemId,
                    itemName: cti.itemName,
                    rgId: cti.rgId,
                    rgName: cti.rgName
                };
                levelList.push(obj3);
            }
        });
        return destList;
    }
    async mounted () {
        if (!this.allCategoryTree.length) {
            await this.getCategoryTree();
        }
    }

    async getSearchForm (itemId) {
        const res = await api.ctiApi.getItemInfo(itemId);
        const { data } = res;
        this.searchForm = {
            assigned: data.assigned,
            categoryName: data.categoryName,
            categoryId: data.categoryId,
            typeName: data.typeName,
            typeId: data.typeId,
            itemName: data.itemName,
            itemId: data.itemId,
            rgId: data.rgId,
            rgName: data.rgName
        };
    }

    async getCategoryTree () {
        try {
            const res = await api.ctiApi.getCategoryTreeTotal();
            const { code, data } = res;
            if (code === 200) {
                store.commit('GET_CATEGORY_TREE', data.items);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getCategoryTreeByRg (rgId: number) {
        try {
            const res = await api.ctiApi.getCategoryByRg(rgId);
            const { code } = res;
            if (code === 200) {
                this.rgCtiList = res.data.items;
                this.categoryList = res.data.items;
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 服务目录切换
    handleCategoryChange (val, manual) {
        for (const key in val) {
            this.searchForm[key] = val[key];
        }
        if (this.searchForm.rgId) {
            this.getRgUser();
            manual && this.setAssigned(this.searchForm.rgId);
        } else {
            this.searchForm.assigned = '';
        }
        this.$emit('change', this.searchForm, this.field);
    }
    // 设置处理人
    async setAssigned (val) {
        try {
            const res = await api.rgApi.getOncallUser({ rgId: val });
            this.searchForm.assigned = res.data.identify;
            this.assigned = res.data;
            this.$emit('change', this.searchForm, this.field);
        } catch (e) {
            console.log(e);
        }
    }
    // 获取当前rg下的用户列表
    async getRgUser () {
        this.withCtiRgList = [];
        try {
            const res = await api.rgApi.getRgUser({ identify: '', rgId: this.searchForm.rgId });
            const { code, data } = res;
            if (code === 200) {
                this.withCtiRgList = data.items;
            }
        } catch (e) {
            this.withCtiRgList = [];
            console.log(e);
        }
    }
    // MARK: 这里执行 npm run lint-fix:vue 报错了，但编辑器未报错
    withCtiChange () {
        console.log('this.searchForm', this.searchForm);
        this.$emit('change', this.searchForm, this.field);
    }
}
</script>

<style lang="postcss">
.category-assigned-search-container {
    .mtd-radio-group {
        &.with-label {
            margin-left: 70px;
        }
    }
    .category-form-item {
        display: inline-block;
        width: 400px;
        .mtd-select {
            width: 100%;
        }
    }
    .info-label {
        display: inline-block;
        width: 56px;
        margin-right: 8px;
        text-align: right;
        line-height: 34px;
        vertical-align: bottom;
    }
    .assigned-cascader {
        width: 100%;
        height: 34px;
        line-height: 34px;
        .el-input__icon {
            line-height: 34px;
        }
        .el-cascader__label {
            color: #464646;
        }
    }
    .rglist-select {
        margin-top: 12px;
    }
}
.assigned-popper {
    z-index: 10000 !important;
}
</style>
