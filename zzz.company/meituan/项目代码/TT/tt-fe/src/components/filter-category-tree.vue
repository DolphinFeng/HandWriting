<template>
    <div class="category-tree-container">
        <el-cascader
            v-model="selectOptions"
            :disabled="listLoading"
            :placeholder="$getText('filter_category_tree_placeholder', '请选择/搜索服务目录')"
            :options="categoryList"
            class="category-cascader"
            @change="categoryOptionChange"
            @visible-change="visibleChangeInitData"
            ref="cascader"
            :props="{ multiple: true, checkStrictly: true }"
            :filter-method="filterMethod"
            popper-class="category-tree-popper"
            filterable
            clearable
            collapse-tags />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
// import { lxReportClick, lxReportView } from '@/utils/directive/lxanaly';
import { Getter } from 'vuex-class';
import * as api from '@/api';

import { getDataFromDb } from '@/utils/tools/indexedDB';
import { Cascader } from 'element-ui';
Vue.use(Cascader);



/**
 * 级联目录选择器
 *
 * @author liyuyao
 * @date 10/15/2019
 */
interface CatalogItem {
    categoryId: number;
    categoryName: string;
    typeId: number;
    typeName: string;
    itemId: number;
    itemName: string;
}

@Component
export default class FilterCategoryTree extends Vue {
    @Getter ctiVersion;

    @Getter env;
    @Getter isPrivateSpace;

    selectOptions: any = [];
    categoryList: any = [];
    categoryInfo: CatalogItem[] = [];

    @Prop({ default: false })
    listLoading: boolean;

    @Prop({ default: [] })
    defaultVal: any;
    @Prop({ default: false })
    fromInspection: boolean;

    ctiTree: any = [];

    get currentSpaceId () {
        const toFilter = this.$route.query.filter || '';
        if (toFilter.includes('space')) {
            return toFilter.split('-')[1];
        }
        return null;
    }

    @Watch('ctiVersion', { immediate: true })
    initQueryWithCti () {
        if (this.ctiVersion && (!this.currentSpaceId) && this.defaultCatalog.length) {
            this.initCtiTree();
        }
    }

    visibleChangeInitData (visible) {
        if (visible && !this.currentSpaceId && !this.ctiTree.length) {
            this.initCtiTree();
        }
    }

    async initCtiTree () {
        this.ctiTree = await getDataFromDb(this.ctiVersion, {
            space: 'ALL'
        });
        if (this.ctiTree.length) this.initTreeData(this.ctiTree);
    }

    // 筛选空间的管理员太少了先不管了
    @Watch('currentSpaceId', { immediate: true })
    async getCurrentSpaceId (val) {
        if (val) {
            const spaceTree = await this.getSpaceCti(val);
            this.initTreeData(spaceTree || []);
            // 质检引入时，主动回显
            if (this.fromInspection) {
                this.selectOptions = this.defaultVal.map((cti) => {
                    return this.matchOptionKey(cti.categoryName, cti.typeName, cti.itemName);
                });
            }
        } else if (this.ctiTree && this.ctiTree.length) {
            this.initTreeData(this.ctiTree);
        }
    }

    async getSpaceCti (spaceId: number) {
        try {
            const res: Ajax.AxiosResponse = await api.spaceApi.getSpaceCti({
                spaceId: spaceId,
                isFilterTicket: true
            });
            return res.data.items;
        } catch (e) {
            console.log(e);
        }
    }

    setDefaultCatalog () {
        this.selectOptions = this.defaultCatalog.map((cti) => {
            return this.matchOptionKey(cti.categoryName, cti.typeName, cti.itemName);
        });
    }
    @Watch('categoryList')
    onGetCategoryList () {
        this.defaultCatalog.length && this.setDefaultCatalog();
    }
    @Watch('defaultVal')
    setDefaultVal () {
        this.selectOptions = this.defaultVal.map((cti) => {
            return this.matchOptionKey(cti.categoryName, cti.typeName, cti.itemName);
        });
    }
    initTreeData (data) {
        this.categoryList = this.handleTreeData(data, ['category', 'type', 'item'], 0);
    }
    // 处理接口返回的树形数据 categoryId, categoryName ,typeId, typeName, itemId, itemName
    handleTreeData (currentArray, slugArr, level) {
        let result = [];
        currentArray.forEach((item) => {
            let obj = {};
            obj.value = item[slugArr[level] + 'Id'];
            obj.label = item[slugArr[level] + 'Name'];
            // 对最末层的rgName单独处理
            if (item.rgName) {
                obj.label += '（' + item.rgName + '）';
                obj.value = item[slugArr[level] + 'Id'];
            }
            if (item['children']) {
                // “找不到合适的目录”隐藏二三级目录
                if (!(obj.label === '找不到合适的目录' && slugArr[level] === 'category')) {
                    obj.children = this.handleTreeData(item['children'], slugArr, level + 1);
                }
            }
            result.push(obj);
        });
        return result;
    }
    // element代码
    categoryOptionChange (val) {
        let keyArr = val;
        let labelArr = val.length ? this.$refs['cascader'].getCheckedNodes() : [];
        this.categoryInfo = keyArr.map((key, index) => {
            return this.handleMapCatalog(key, labelArr[index]);
        });
        this.$emit('categoryChange', this.categoryInfo);
    }
    handleMapCatalog (keys, labels) {
        let labelArr = labels && labels['pathLabels'] || [];
        let catalogItem = {
            categoryId: keys[0] || 0,
            categoryName: labelArr[0] || '',
            typeId: keys[1] || 0,
            typeName: labelArr[1] || '',
            itemId: keys[2] || 0,
            itemName: labelArr[2] ? labelArr[2].split('（')[0] : ''
        };
        //  对 找不到合适的目录 特殊处理，为了分别匹配到测试环境和线上环境的info
        if (catalogItem.categoryName === '找不到合适的目录') {
            catalogItem.typeId = this.env === 'prod' ? 172 : 907;
            catalogItem.typeName = '找不到合适的目录';
            catalogItem.itemId = this.env === 'prod' ? 524 : 1324;
            catalogItem.itemName = '找不到合适的目录';
        }
        return catalogItem;
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
        return [result.categoryId, result.typeId, result.itemId].filter((id) => {
            return id !== 0;
        });
    }
    filterMethod (node, keyword) {
        let reg = new RegExp(keyword, 'gi');
        return reg.test(node.text);
    }
    reset () {
        this.selectOptions = [];
        this.categoryInfo = [];
    }
    get defaultCatalog () {
        let ctiQuery = this.$route.query.ctiNameList;
        return this.formatCtiNameList(ctiQuery);
    }
    formatCtiNameList (ctiStr) {
        let ctiArr = ctiStr ? ctiStr.split(';') : [];
        return ctiArr.map((cti) => {
            return JSON.parse(cti);
        });
    }
}
</script>

<style lang="scss">
.category-tree-container {
    width: 100%;
    .category-cascader {
        width: 100%;
        height: 32px;
        line-height: 32px;
        .el-input__inner {
            height: 32px !important;
        }
        .el-input__icon.el-icon-arrow-down,
        .el-input__icon.el-icon-circle-close {
            line-height: 32px !important;
            width: 28px;
            font-size: 12px !important;
            color: rgba(0, 0, 0, 0.38);
        }
        .el-cascader__label {
            color: #464646;
        }
        .el-tag {
            background-color: rgba(0, 0, 0, 0.06);
            color: rgba(0, 0, 0, 0.84);
            .el-tag__close {
                background-color: transparent;
                color: rgba(0, 0, 0, 0.84);
                font-size: 16px;
                top: 0;
            }
            .el-icon-circle-close {
                border: none;
            }
        }
    }
}
.category-tree-popper {
    z-index: 10000 !important;
}
.category-tree-popper.el-popper {
    .el-cascader__suggestion-panel {
        .el-cascader__suggestion-item {
            span {
                white-space: nowrap;
            }
            &.is-checked {
                color: #fea92d;
            }
        }
    }
}
.category-tree-popper .el-cascader-menu {
    max-height: 302px;
    padding: 4px 0;
    border-right: none;
    height: auto;
    .el-cascader-menu__item {
        color: #6f6f6f;
        padding: 9px 15px;
        &:hover {
            background-color: #edf0f7;
        }
        .el-cascader-menu__item__keyword {
            color: #fea92d;
        }
    }
    .el-cascader-menu__item--extensible::after {
        right: 3px;
    }
}
</style>
