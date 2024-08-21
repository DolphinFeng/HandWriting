<template>
    <div class="assigned-extra-setting">
        <h5>服务目录设置：</h5>
        <div class="extra-setting-wrapper">
            <mtd-radio-group v-model="isItemHidden" @input="changeCtiHidden">
                <mtd-radio :value="true">对发起人隐藏</mtd-radio>
                <mtd-radio :value="false">对发起人可见</mtd-radio>
            </mtd-radio-group>
            <mtd-form :label-width="82" @submit.native.prevent>
                <div v-if="isItemHidden">
                    <mtd-form-item label="默认目录：">
                        <mtd-select
                            value-key="itemId"
                            v-model="ctiInfo"
                            :debounce="200"
                            filterable
                            remote
                            :remote-method="searchCTIbyName"
                            auto-clear-query
                            placeholder="请搜索指定目录"
                            @change="settingChange"
                            style="width: 100%;">
                            <mtd-option
                                :key="index"
                                :value="item"
                                v-for="(item, index) in searchList"
                                :label="`${item.categoryName}/${item.typeName}/${item.itemName}`" />
                        </mtd-select>
                    </mtd-form-item>
                </div>
                <div v-else>
                    <mtd-form-item label="目录范围：">
                        <mtd-radio-group
                            v-model="settingType"
                            @input="settingChange"
                            style="margin-bottom: 0;">
                            <mtd-radio value="special">指定目录</mtd-radio>
                            <mtd-radio value="rg">RG绑定目录</mtd-radio>
                            <mtd-radio value="all">全部目录</mtd-radio>
                        </mtd-radio-group>
                    </mtd-form-item>
                    <mtd-form-item label="指定目录：" v-if="settingType === 'special'">
                        <mtd-cascader
                            placeholder="请选择指定目录"
                            v-model="ctiSpecialList"
                            :max-tag-count="10"
                            :remote-method="searchCti"
                            :load-data="loadData"
                            :data="categoryList"
                            :formatter="formatLabel"
                            :debounce="600"
                            @update:visible="onVisibleChanged"
                            @change="onCategoryChanged"
                            class="category-cascader"
                            popper-class="assigned-category-popper"
                            ref="cascader"
                            check-strictly
                            remote
                            multiple
                            filterable
                            clearable />
                    </mtd-form-item>
                </div>
            </mtd-form>
        </div>
        <h5>处理人设置：</h5>
        <div style="padding-left: 16px;">
            <mtd-radio-group v-model="isAssignedHidden" @input="settingChange">
                <mtd-radio :value="true">对发起人隐藏</mtd-radio>
                <mtd-radio :value="false">对发起人可见</mtd-radio>
            </mtd-radio-group>
            <mtd-checkbox
                v-if="!isAssignedHidden"
                v-model="appointAssigned"
                @input="settingChange">
                允许发起人指定处理人
            </mtd-checkbox>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as api from '@/api';
/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component({
    components: {}
})
export default class AssignedExtraSetting extends Vue {
    @Prop({
        default: () => {
            return {
                name: '单行文本',
                type: '1',
                inputType: 'SINGLE_LINE_TEXT',
                defaultValue: '',
                isRequired: false,
                isHidden: false,
                validator: ''
            };
        }
    })
    data: CommonTypes.customField;

    settingType: string = 'special';
    appointAssigned: boolean = true;
    ctiInfo: any = {};
    rgItemId: number = null;
    searchList: any = [];
    searchType: string = 'allCti';

    isItemHidden: boolean = false;
    isAssignedHidden: boolean = false;

    ctiSpecialList: CommonTypes.mapObject[] = [];
    itemsScope: CommonTypes.mapObject = [];
    treeParams: any = {};
    categoryList: any[] = [];

    mounted () {
        const extraSettings = this.data.extraSettings;
        if (extraSettings) {
            this.appointAssigned = extraSettings.specificAssigned;
            this.isAssignedHidden = extraSettings.isAssignedHidden || false;
            this.isItemHidden = extraSettings.isItemHidden || false;
            const itemsScope = extraSettings.itemsScope;
            if (!itemsScope) {
                this.settingType = 'all';
            } else if (itemsScope.ctiSpecialList) {
                // ctiSpecialList字段返回带有父级节点的已选目录，用于回显
                this.ctiSpecialList = this.formatCtiSpecialList(itemsScope.ctiSpecialList);
                this.itemsScope = itemsScope;
                this.formatLayerRequestParams();
                this.settingType = 'special';
            } else if (itemsScope.itemId) {
                if (extraSettings.isItemHidden) {
                    this.ctiInfo = itemsScope;
                    this.searchCTIbyName(itemsScope.itemName);
                } else {
                    console.log('itemsScope', itemsScope);
                    this.settingType = 'special';
                    this.ctiSpecialList = [itemsScope];
                }
            } else if (itemsScope.rgId) {
                this.settingType = 'rg';
            }
        }
    }
    onVisibleChanged (visible: boolean) {
        // 点击输入框后再请求数据
        if (visible && !this.categoryList.length) {
            this.getOptionData({
                categoryIds: this.treeParams.categoryIds,
                typeIds: this.treeParams.typeIds,
                itemIds: this.treeParams.itemIds
            });
        }
    }
    onCategoryChanged () {
        this.formatFormRequestParams();
        this.formatLayerRequestParams();
        this.settingChange();
    }
    formatFormRequestParams () {
        // 根据ctiSpecialList字段结构处理form接口的传参
        this.itemsScope = {
            categoryIds: [],
            typeIds: [],
            itemIds: []
        };
        const catalogs = ['categoryIds', 'typeIds', 'itemIds'];
        this.ctiSpecialList.forEach(option => {
            const level = option.length - 1;
            this.itemsScope[catalogs[level]].push(Number(option[level].split('/')[0]));
        });
    }
    formatLayerRequestParams () {
        // 根据ctiSpecialList字段结构处理layer接口的传参
        this.treeParams = {
            categoryIds: [],
            typeIds: [],
            itemIds: []
        };
        const catalogs = ['categoryIds', 'typeIds', 'itemIds'];
        this.ctiSpecialList.forEach(option => {
            // 选中二级或三级目录的情况，要将其父节点ID都传至layer接口，否则影响二级、三级兄弟节点的回显
            option.forEach((item, index) => {
                this.treeParams[catalogs[index]].push(Number(item.split('/')[0]));
            });
        });
    }
    formatCtiSpecialList (items) {
        // 通过字段个数判断已选项的层级
        return items.map(item => {
            const result = [];
            result.push(`${item.categoryId || 0}/${item.categoryName}`);
            if (item.typeId) {
                result.push(`${item.typeId || 0}/${item.typeName}`);
                if (item.itemId) {
                    result.push(`${item.itemId || 0}/${item.itemName}`);
                }
            }
            return result;
        });
    }
    formatLabel (labels, selectedOptions, value) {
        return value.map(item => item.split('/')[1]).join('/');
    }
    formatParams () {
        let obj = {
            specificAssigned: this.appointAssigned,
            isItemHidden: this.isItemHidden,
            isAssignedHidden: this.isAssignedHidden
        };
        let itemsScope = {};
        if (this.isItemHidden) {
            itemsScope = this.ctiInfo || {};
        } else {
            if (this.settingType === 'rg') {
                itemsScope = {
                    rgId: this.rgId
                };
            } else if (this.settingType === 'special') {
                itemsScope = this.itemsScope;
            }
        }
        obj = Object.assign(obj, {
            itemsScope: itemsScope
        });
        console.log('obj', obj);
        return obj;
    }

    // 处理接口返回的树形数据 categoryId, categoryName ,typeId, typeName, itemId, itemName
    handleTreeData (currentArray, slugArr, level) {
        const result = [];
        currentArray.forEach((item) => {
            const obj: any = {};
            obj.value = `${item[slugArr[level] + 'Id']}/${item[slugArr[level] + 'Name']}`;
            obj.label = item[slugArr[level] + 'Name'];
            obj.isLeaf = level === 2;
            obj.level = level + 1;
            obj.parent = item.parentId || 0;
            // 对最末层的rgId单独处理
            if (item.rgId && item.rgName) {
                obj.label += '（' + item.rgName + '）';
                obj.data = {
                    itemId: item[slugArr[level] + 'Id'],
                    rgId: item.rgId
                };
            }
            if (item.children) {
                // “找不到合适的目录”隐藏二三级目录
                if (!(obj.label === '找不到合适的目录' && slugArr[level] === 'category')) {
                    obj.children = this.handleTreeData(item.children, slugArr, level + 1);
                    obj.isLeaf = true;
                }
            }
            result.push(obj);
        });
        return result;
    }
    settingChange (type?: string) {
        if (type === 'scope' && !this.categoryList.length) {
            // 首次选中“指定目录”时，查询所有的一级目录
            this.getCidList();
        }
        this.$emit('change', this.formatParams());
    }

    async getOptionData (requestParam: any) {
        const tree = await this.getTreeData(requestParam);
        this.categoryList = this.handleTreeData(tree, ['category', 'type', 'item'], 0);
    }
    async loadData (item, callback) {
        let requestParam = {};
        if (!item || item.level === 0) {
            requestParam = {};
        } else if (item.level === 1) {
            requestParam = {
                categoryIds: [Number(item.value.split('/')[0])]
            };
        } else if (item.level === 2) {
            requestParam = {
                typeIds: [Number(item.value.split('/')[0])]
            };
        }
        const data = await this.getNextLevelData(item, requestParam);
        callback(data);
    }
    async getNextLevelData (item: any, requestParam: any) {
        // 根据当前点击节点的value请求二级、三级数据
        const data = await this.getTreeData(requestParam);
        switch (item.level) {
            case 0:
                return this.handleTreeData(data, ['category', 'type', 'item'], item.level);
            case 1: {
                const node = data.find(e => e.categoryId === Number(item.value.split('/')[0]));
                const categoryChildren = this.handleTreeData(node?.children || [], ['category', 'type', 'item'], item.level);
                return categoryChildren;
            }
            case 2: {
                const category = data.find(e => e.categoryId === item.parent);
                if (category && category.children) {
                    const type = category.children.find(e => e.typeId === Number(item.value.split('/')[0]));
                    const typeChildren = this.handleTreeData(type?.children || [], ['category', 'type', 'item'], item.level);
                    return typeChildren;
                } else {
                    return [];
                }
            }
            default:
                return [];
        }
    }
    async searchCti (query: string) {
        if (!query) {
            // 清空query后，根据当前的value请求数据进行回显
            this.getOptionData({
                categoryIds: this.treeParams.categoryIds,
                typeIds: this.treeParams.typeIds,
                itemIds: this.treeParams.itemIds
            });
            return;
        }
        const res = await api.ctiApi.searchCti({
            keyword: query,
            sceneId: 1
        });
        const { code, data } = res;
        if (code === 200) {
            this.categoryList = this.handleTreeData(data.items, ['category', 'type', 'item'], 0);
        }
    }
    async getTreeData (requestParam: any) {
        const res = await api.spaceApi.getAuthSpaceCti('ticket', {
            ...requestParam,
            createScene: false,
            filterByAuth: false,
            queryAllChild: true
        }, true);
        const { data } = res;
        return data.items || [];
    }
    async getCidList () {
        const tree = await this.getTreeData({});
        this.categoryList = this.handleTreeData(tree, ['category', 'type', 'item'], 0);
    }

    async searchCTIbyName (query: string) {
        const res = await api.ctiApi.searchCTIbyName(query);
        this.searchList = res.data.items;
    }
    changeCtiHidden () {
        this.ctiSpecialList = [];
        this.settingChange();
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.assigned-extra-setting h5 {
    margin: 10px;
}
.search-cti-wrapper {
    .mtd-select {
        margin-bottom: 15px;
        width: calc(100% - 20px);
    }
}
.extra-setting-wrapper {
    padding-left: 16px;
    .mtd-radio-group {
        margin-bottom: 10px;
    }
    .category-cascader {
        line-height: 24px;
        width: 100%;
        position: absolute;
        .mtd-tag {
            background-color: rgba(0, 0, 0, 0.06);
            color: rgba(0, 0, 0, 0.84);
            border: none;
        }
        .mtd-multiple-input-placeholder {
            padding-left: 0;
        }
    }
}
.assigned-category-popper {
    label.mtd-checkbox {
        margin-right: 8px;
    }
}
</style>
