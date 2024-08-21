<template>
    <div class="category-assigned-search-container">
        <div class="category-search-container">
            <div class="info-item" v-if="categoryShow">
                <!-- <div class="info-label">服务目录</div> -->
                <div class="category-form-item">
                    <!-- <div v-if="categoryAssigned">{{ `${searchForm.categoryName}/${searchForm.typeName}/${searchForm.itemName}` }}</div> -->
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
                        @categoryChange="handleCategoryChange" />
                </div>
            </div>
            <div class="info-item" v-show="assignedShow">
                <!-- <div class="info-label">处理人</div> -->
                <div class="category-form-item">
                    <mtd-select
                        v-if="specificAssigned"
                        v-model="searchForm.assigned"
                        placeholder="请输入 MIS"
                        filterable
                        @change="withCtiChange"
                        class="rglist-select">
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
import { Getter } from 'vuex-class';

import { getDataFromDb } from '@/utils/tools/indexedDB';
import TemplateMixin from '../TemplateMixin.vue';
import CategoryTree from './sysComponents/category-tree.vue';

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
    @Getter isPrivateSpace;
    @Getter spaceDomain;

    @Prop({ required: false })
    defaultRgUsers: CommonTypes.mapObject[];

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
    categoryAssigned: boolean = false;
    categoryShow: boolean = true;
    assignedShow: boolean = true;

    categoryList: CommonTypes.DefaultObject[] = [];
    hasCategoryInfo: boolean = false;

    constDefault: any = {
        label: '暂无对应的服务目录',
        value: '',
        disabled: true
    };

    showSpaceCti: boolean = false;
    spaceCti: CommonTypes.ctiTreeItem[] = [];

    @Watch('field.extraSettings', { immediate: true })
    async getExtraSettings (extraSettings) {
        this.hasCategoryInfo = !!this.$route.query.categoryInfo || this.value && this.value.toString() === '[object Object]';
        if (this.hasCategoryInfo) {
            this.mountedHasCategoryInfo();
        }
        if (extraSettings) {
            this.categoryShow = !extraSettings.isItemHidden;
            this.assignedShow = !extraSettings.isAssignedHidden;
            this.specificAssigned = extraSettings.specificAssigned;
            const itemsScope = extraSettings.itemsScope;
            if (extraSettings.isItemHidden && itemsScope.itemId) { // 隐藏的默认目录
                for (let key in this.searchForm) {
                    this.searchForm[key] = extraSettings.itemsScope[key];
                    if (this.searchForm.rgId) {
                        // (!this.defaultRgUsers) && this.getRgUser();
                        await this.getRgUser();
                        // 有处理人信息时，不需要将处理人设置为值班人
                        if (!this.searchForm.assigned) {
                            this.setAssigned(this.searchForm.rgId);
                        }
                    }
                }
            } else if (itemsScope && itemsScope.items && itemsScope.items.length) { // 指定目录
                this.categoryList = this.abstractTree(itemsScope.items);
            }
            //  else if (itemsScope && !itemsScope.isItemHidden && itemsScope.rgId) { // rg绑定目录
            //     this.getCategoryTreeByRg(itemsScope.rgId);
            // } else {
            //     if (this.spaceCti && this.spaceCti.length) {
            //         this.categoryList = this.spaceCti;
            //     } else {
            //         this.showSpaceCti = true; // 避免因为field计算导致重复请求tree接口
            //     }
            // }
        }
    }

    @Watch('showSpaceCti', { immediate: true })
    async showSpaceCtiChange () {
        if (this.showSpaceCti) this.categoryList = this.spaceCti.length ? this.spaceCti : await this.getSpaceCtiByVersion();
    }

    @Watch('categoryList', { immediate: true })
    categoryListChange () {
        if (this.categoryList.length === 0) {
            this.searchForm.assigned = '';
        }
    }

    async getSpaceCtiByVersion () {
        const res: Ajax.AxiosResponse = await api.spaceApi.getSpaceCtiVersion();
        let { code, data } = res;
        if (code === 200) {
            let version = data.version;
            this.spaceCti = await getDataFromDb(version, {
                space: this.spaceDomain
            });
        }
        return this.spaceCti;
    }

    mountedHasCategoryInfo () {
        try {
            this.searchForm = this.value && this.value.toString() === '[object Object]' ? this.value : JSON.parse(this.$route.query.categoryInfo);
            if (this.categoryList.length === 0) {
                this.searchForm.assigned = '';
            }
        } catch (e) {
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
            console.log(e);
        }
    }
    abstractTree (ctiItems) {
        let destList = [];
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
    async getCategoryTreeByRg (rgId: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getCategoryTreeByRg(rgId);
            let { code, data } = res;
            if (code === 200) {
                this.categoryList = data.items;
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 服务目录切换
    async handleCategoryChange (val, manual) {
        if (!val.itemId) return;
        let template = await this.getTemplate(val.itemId);
        for (let key in val) {
            this.searchForm[key] = val[key];
        }
        if (this.searchForm.rgId) {
            await this.getRgUser();
            manual && await this.setAssigned(this.searchForm.rgId);
        } else {
            this.searchForm.assigned = '';
        }
        this.$emit('change', this.searchForm, this.field, template?.data);
    }
    // 设置处理人
    async setAssigned (val) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getOncallUser({ rgId: val });
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
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgUser({ identify: '', rgId: this.searchForm.rgId });
            let { code, data } = res;
            if (code === 200) {
                this.withCtiRgList = data.items;
            }
        } catch (e) {
            this.withCtiRgList = [];
            console.log(e);
        }
    }
    withCtiChange (val) {
        this.$emit('change', this.searchForm, this.field);
    }
    // 获取模板信息
    async getTemplate (itemId: number) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getTemplateByItem(itemId);
        return res;
    }
}
</script>

<style lang="scss">
.category-assigned-search-container {
    .info-item {
        margin-top: 0;
    }
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
