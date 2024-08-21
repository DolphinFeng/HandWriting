<!-- 忽略 用不到 -->
<template>
    <div class="category-assigned-search-container">
        <div class="category-search-container">
            <div class="info-item">
                <div class="category-form-item">
                    <mtd-select
                        v-model="searchForm.assigned"
                        placeholder="请输入 MIS"
                        filterable
                        @change="withCtiChange">
                        <mtd-option
                            v-for="item in withCtiRgList"
                            :key="item.identify"
                            :label="`${item.displayName}（${item.identify}）`"
                            :value="item.identify">
                            {{ `${item.displayName}（${item.identify}）` }}
                        </mtd-option>
                    </mtd-select>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import eventBus from '@/utils/event-bus';
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
    mounted () {
        eventBus.$on('updateAssigned', this.updateAssigned);
    }

    beforeDestroy () {
        eventBus.$off('updateAssigned', this.updateAssigned);
    }
    updateAssigned (res) {
        this.searchForm.assigned = res.identify;
        this.assigned = res;
        this.$emit('change', this.searchForm.assigned, this.field);
    }
    showSpaceCti: boolean = false;
    spaceCti: CommonTypes.ctiTreeItem[] = [];

    @Watch('field.extraSettings', { immediate: true })
    async getExtraSettings (extraSettings) {
        if (extraSettings && !extraSettings.isAssignedHidden && extraSettings.specificAssigned) {
            // 显示处理人选项，加载处理组成员
            if (this.rgId) {
                await this.getRgUser();
                if (!this.searchForm.assigned) {
                    this.setAssigned(this.rgId);
                }
            }
        }
    }

    @Watch('categoryList', { immediate: true })
    categoryListChange () {
        if (this.categoryList.length === 0) {
            this.searchForm.assigned = '';
        }
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
    // 设置处理人
    async setAssigned (val) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getOncallUser({ rgId: val });
            this.searchForm.assigned = res.data.identify;
            this.assigned = res.data;
            this.$emit('change', this.searchForm.assigned, this.field);
        } catch (e) {
            console.log(e);
        }
    }
    // 获取当前rg下的用户列表
    async getRgUser () {
        this.withCtiRgList = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgUser({ identify: '', rgId: this.rgId });
            let { code, data } = res;
            if (code === 200) {
                this.withCtiRgList = data.items;
                eventBus.$emit('getAssignedList', this.withCtiRgList,'');
            }
        } catch (e) {
            this.withCtiRgList = [];
            console.log(e);
        }
    }
    withCtiChange (val) {
        eventBus.$emit('getAssignedList', this.withCtiRgList, val);
        this.$emit('change', this.searchForm.assigned, this.field);
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
        width: 100%;
        .mtd-select {
            width: 280px;
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
}
.assigned-popper {
    z-index: 10000 !important;
}
</style>
