<template>
    <div class="category-tree-container">
        <mtd-cascader
            :data="categoryList"
            v-model="selectOptions"
            :disabled="listLoading"
            :placeholder="placeholder || $getText('category_tree_placeholder', '请选择/搜索服务目录')"
            :options="categoryList"
            class="category-cascader"
            @change="categoryOptionChange"
            remote
            :remote-method="debounceSearchCti"
            ref="cascader"
            :change-on-select="allowAnyLevel"
            :load-data="loadData"
            popper-class="category-tree-popper"
            filterable
            clearable />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as api from '@/api';
import debounce from 'lodash.debounce';

/**
 * 级联目录选择器
 * 引用范围：流转、大象转TT发起、不在处理范围弹框、旧版统计分析CTI
 * @author liyuyao
 * @date 10/15/2019
 */
@Component
export default class CategoryTree extends Vue {
    @Getter env;
    @Getter ctiVersion;
    @Getter spaceDomain;

    selectOptions: any = [];
    categoryList: any = [];
    commonList: any = [];
    value: any = null;
    categoryInfo: any = {
        categoryId: 0,
        categoryName: '',
        typeId: 0,
        typeName: '',
        itemId: 0,
        itemName: '',
        rgId: 0,
        rgName: ''
    };
    ctiTree: any = [];
    cidList: any = [];
    debounceSearchCti: Function = debounce(this.searchCti, 500);

    @Prop({ default: false })
    withAll: boolean;
    @Prop({ default: false })
    allowAnyLevel: boolean;
    @Prop({ default: '' })
    categoryName: string;
    @Prop({ default: 0 })
    categoryId: number;
    @Prop({ default: '' })
    typeName: string;
    @Prop({ default: 0 })
    typeId: number;
    @Prop({ default: '' })
    itemName: string;
    @Prop({ default: 0 })
    itemId: number;
    @Prop({ default: 0 })
    rgId: number;
    @Prop({ default: '' })
    rgName: string;
    @Prop({ default: false })
    listLoading: boolean;
    @Prop({ default: true })
    renderAssigned: boolean;
    // 是否为选择“不在处理范围”时展示的目录选择
    @Prop({ default: false })
    isNotInScope: boolean;
    @Prop({ default: '' })
    placeholder: string;

    // 定义 searching 全局变量
    searching: boolean = false;

    @Watch('categoryId', { immediate: true })
    async getDefaultCatalog () {
        this.$emit('searchedChanged', true); // 拿到初始数据开始加载
        if (this.categoryId && this.typeId && this.itemId) {
            this.ctiTree = await this.getTreeData({
                typeIds: [this.typeId || 0],
                categoryIds: [this.categoryId || 0],
                createScene: false
            });
            if (this.ctiTree.length) {
                this.ctiTree = this.handleTreeData(this.ctiTree, ['category', 'type', 'item'], 0);
                this.initTreeData(this.ctiTree);
                this.cidList = Object.assign([], this.ctiTree);
                this.setDefaultCatalog();
            }
        }
    }

    async searchCti (query: string) {
        this.$emit('searchedChanged', true);
        if (!query) {
            this.categoryList = Object.assign([], this.cidList);
            return;
        }
        const res: Ajax.AxiosResponse = await api.ctiApi.searchCti({
            keyword: query,
            sceneId: 2
        });
        let { code, data } = res;
        if (code === 200) {
            this.categoryList = data.items.map(item => {
                return {
                    label: `${item.ctiNamePath}（${item.rgName}）`,
                    value: [item.categoryId, item.typeId, item.itemId],
                    isLeaf: true,
                    rgId: item.rgId
                };
            });
        }
    }
    formatter (labels) {
        return labels.join('/');
    }
    async loadData (item, callback) {
        let requestParam = {};
        if (!item || item.level === 0) {
            requestParam = {};
        } else if (item.level === 1) {
            requestParam = {
                categoryIds: [item.value]
            };
        } else if (item.level === 2) {
            requestParam = {
                typeIds: [item.value]
            };
        }
        const data = await this.getNextLevelData(item, requestParam);
        callback(data);
    }
    async getTreeData (requestParam: any) {
        const res: Ajax.AxiosResponse = await api.spaceApi.getAuthSpaceCti(this.spaceDomain, requestParam, this.spaceDomain === 'ticket');
        const { data } = res;
        return data.items || [];
    }
    async getNextLevelData (item: any, requestParam: any) {
        // 根据当前点击节点的value请求二级、三级数据
        const data = await this.getTreeData({
            ...requestParam,
            createScene: false
        });
        switch (item.level) {
            case 0:
                return this.handleTreeData(data, ['category', 'type', 'item'], item.level);
            case 1:
                const node = data.find(e => e.categoryId === item.value);
                const categoryChildren = this.handleTreeData(node?.children || [], ['category', 'type', 'item'], item.level);
                return categoryChildren;
            case 2:
                const category = data.find(e => e.categoryId === item.parent);
                if (category && category.children) {
                    const type = category.children.find(e => e.typeId === item.value);
                    const typeChildren = this.handleTreeData(type?.children || [], ['category', 'type', 'item'], item.level);
                    return typeChildren;
                } else {
                    return [];
                }
            default:
                return [];
        }
    }

    // 没有默认id时
    async mounted () {
        if (!this.categoryId) {
            this.ctiTree = await this.getTreeData({
                createScene: false
            });
            this.ctiTree.length && this.initTreeData(this.handleTreeData(this.ctiTree, ['category', 'type', 'item'], 0));
            this.cidList = Object.assign([], this.ctiTree);
        }
    }

    async setDefaultCatalog () {
        let formatLabel = []; // 回显change事件第二个参数 options
        // 原先使用name字段匹配会导致目录改名后无法回显，删除该逻辑
        this.selectOptions = [this.categoryId, this.typeId, this.itemId];
        formatLabel = this.formatLabelOptions([this.categoryName, this.typeName, `${this.itemName}（${this.rgName}）`]);
        this.categoryOptionChange([...this.selectOptions, this.rgId], formatLabel, this.renderAssigned);
    }
    // 填补rgName
    async getRgName (rgId: number) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgList({
            id: rgId
        });
        return (res.data.items[0] && res.data.items[0].name) || '';
    }
    formatLabelOptions (catalogLabelArr) {
        return catalogLabelArr.map((catalog) => {
            return {
                label: catalog
            };
        });
    }
    initTreeData (data) {
        this.categoryList = data;
        // 按服务目录查看统计分析 需要有“全部”选项
        this.withAll && this.categoryList.unshift({
            label: '全部',
            value: 0,
            children: [],
            isLeaf: true
        });
    }
    // 处理接口返回的树形数据 categoryId, categoryName ,typeId, typeName, itemId, itemName
    handleTreeData (currentArray, slugArr, level) {
        let result = [];
        currentArray.forEach((item) => {
            let obj = {};
            obj.value = item[slugArr[level] + 'Id'];
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
            if (item['children']) {
                // “找不到合适的目录”隐藏二三级目录
                if (!(obj.label === '找不到合适的目录' && slugArr[level] === 'category')) {
                    obj.children = this.handleTreeData(item['children'], slugArr, level + 1);
                    obj.isLeaf = true;
                }
            }
            result.push(obj);
        });
        return result;
    }
    // mtd代码
    async categoryOptionChange (val, options, renderAssigned) {
        this.$emit('searchedChanged', true);
        let keyArr = val;
        let category = options[0];
        let type = options[1];
        let item = options[2];
        if (options.length === 1 && keyArr[0].length === 3) {
            // 搜索后选中的情况
            const data = await this.getNextLevelData({
                level: 0
            }, {
                typeIds: [keyArr[0][1]]
            });
            this.categoryList = Object.assign([], data);
            const label = category.label.split(' / ');
            this.categoryInfo.categoryId = keyArr[0][0] || 0;
            this.categoryInfo.categoryName = label[0] || '';
            this.categoryInfo.typeId = keyArr[0][1] || 0;
            this.categoryInfo.typeName = label[1] || '';
            this.categoryInfo.itemId = keyArr[0][2] || 0;
            this.categoryInfo.itemName = label[2].split('（')[0] || '';
            this.categoryInfo.rgId = category.rgId || 0;
            this.categoryInfo.rgName = label[2].split('（')[1].split('）')[0] || '';
            this.selectOptions = Object.assign([], keyArr[0]);
            this.$emit('searchedChanged', false);
        } else {
            // 点选情况
            let itemLabel = item && item.label ? item.label.split('（') : [];
            this.categoryInfo.categoryId = keyArr[0] || 0;
            this.categoryInfo.categoryName = category ? category.label : '';
            this.categoryInfo.typeId = keyArr[1] || 0;
            this.categoryInfo.typeName = type ? type.label : '';
            this.categoryInfo.itemId = keyArr[2] || 0;
            this.categoryInfo.itemName = itemLabel[0] || '';
            this.categoryInfo.rgId = keyArr[3] ? keyArr[3] : item?.data?.rgId;
            this.categoryInfo.rgName = itemLabel[1] ? itemLabel[1].split('）')[0] : '';
            this.$emit('searchedChanged', false); // 防止搜索完后点击清除，点选情况被禁用掉
        }
        if (this.categoryInfo.rgId && (!this.categoryInfo.rgName)) {
            if (!this.rgName) {
                this.categoryInfo.rgName = await this.getRgName(this.categoryInfo.rgId);
            } else {
                this.categoryInfo.rgName = this.rgName;
            }
        }
        // 为了分别匹配到测试环境和线上环境的info
        if (this.categoryInfo.categoryName === '找不到合适的目录') {
            this.categoryInfo.typeId = this.env === 'prod' ? 172 : 907;
            this.categoryInfo.typeName = '找不到合适的目录';
            this.categoryInfo.itemId = this.env === 'prod' ? 524 : 1324;
            this.categoryInfo.itemName = '找不到合适的目录';
            this.categoryInfo.rgId = this.env === 'prod' ? 342 : 342;
            this.categoryInfo.rgName = '';
        }
        this.$emit('categoryChange', this.categoryInfo, renderAssigned);
    }
    matchOptionKey (categoryName, typeName, itemName?) {
        let result = {
            categoryId: 0,
            typeId: 0,
            itemId: 0
        };
        this.categoryList.forEach((category) => {
            if (category.label === categoryName) {
                result.categoryId = category.value;
                if (category.children && category.children.length) {
                    category.children.forEach((type) => {
                        if (type.label === typeName) {
                            result.typeId = type.value;
                            if (itemName && type.children && type.children.length) {
                                type.children.forEach((item) => {
                                    let nameArr = item.label.split('（');
                                    if (nameArr.length > 0 && nameArr[0] === itemName) {
                                        result.itemId = item.value;
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
        return [result.categoryId, result.typeId, result.itemId];
    }
    matchLabels (categoryId, typeId?, itemId?) {
        let result = {
            categoryName: '',
            typeName: '',
            itemName: ''
        };
        this.categoryList.forEach((category) => {
            if (category.value === categoryId) {
                result.categoryName = category.label;
                if (category.children && category.children.length) {
                    category.children.forEach((type) => {
                        if (type.value === typeId) {
                            result.typeName = type.label;
                            if (itemId && type.children && type.children.length) {
                                type.children.forEach((item) => {
                                    if (item.value.itemId === itemId) {
                                        result.itemName = item.label.split('（')[0];
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
        return [result.categoryName, result.typeName, result.itemName];
    }
    reset () {
        this.selectOptions = [];
    }
}
</script>

<style lang="scss">
.category-tree-container {
    width: 100%;
    .category-cascader {
        width: 100%;
        height: 34px;
        line-height: 34px;
        .el-input__icon.el-icon-arrow-down,
        .el-input__icon.el-icon-circle-close {
            line-height: 34px;
            width: 28px;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.38);
        }
        .el-cascader__label {
            color: #464646;
        }
    }
}
.category-tree-popper {
    z-index: 10000 !important;
}
.category-tree-popper.mtd-cascader-menus {
    height: auto !important;
    .mtd-cascader-menu {
        max-height: 302px;
        padding: 4px 0;
        border-right: none;
        height: auto;
        .mtd-cascader-menu-item {
            color: #6f6f6f;
            &:hover {
                background-color: #edf0f7;
            }
        }
    }
}
.common-group__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #eee;
    .common-group__title {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
    }
    .common-group__operator {
        color: #f80;
        font-size: 14px;
    }
}
</style>
