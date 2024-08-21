<template>
    <div class="category-tree-container">
        <el-cascader
            v-model="selectOptions"
            placeholder="请输入目录关键字"
            :options="categoryList"
            class="category-cascader"
            @change="categoryOptionChange"
            @focus="focusEmit"
            @blur="blurEmit"
            :before-filter="beforeFilter"
            :filter-method="filterMethod"
            :key="cascaderKey"
            ref="cascader"
            :popper-class="(isMw && categoryTree.length) ? 'mw-category-popper' : 'cti-search-category-popper'"
            filterable
            collapse-tags
            :clearable="clearable"
            :props="{
                checkStrictly: allowAnyLevel,
                multiple: multiple
            }" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Cascader } from 'element-ui';
import * as api from '@/api';
/**
 * 级联目录选择器
 *
 * @author liyuyao
 * @date 03/05/2019
 */
@Component
export default class CategoryTree extends Vue {
    selectOptions: any = [];
    categoryList: any = [];
    categoryInfo: any = {
        categoryId: 0,
        categoryName: '',
        typeId: 0,
        typeName: '',
        itemId: 0,
        itemName: '',
        rgId: 0
    };
    cascaderKey: number = 0;
    @Prop({ default: false })
    allowAnyLevel: boolean;
    @Prop({ default: true })
    clearable: boolean;
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
    @Prop({ default: 3 })
    displayLevel: number;

    @Prop({ default: false })
    multiple: boolean;

    @Prop({ default: false })
    isMw: boolean;

    @Prop({ default: false })
    isMwgd: boolean;

    @Prop({ default: 0 })
    index: number;

    @Prop()
    categoryTree: any;

    $refs: {
        cascader: Cascader & {
            // NOTE: element-ui 库的 ts 声明文件缺少这个 method
            getCheckedNodes(): any;
        };
    };

    @Watch('categoryTree', { immediate: true })
    onGetCategoryTree () {
        if (this.categoryTree && this.categoryTree.length) {
            this.initTreeData(this.categoryTree);
            console.log('1');
            this.categoryName && this.setDefaultCatalog({ init: true });
        } else {
            this.getCategoryTree();
        }
    }

    @Watch('categoryName', { immediate: true })
    onGetCategoryName () {
        if (this.categoryTree && this.categoryTree.length) {
            this.initTreeData(this.categoryTree);
            console.log('2');
            this.setDefaultCatalog();
        }
    }
    @Watch('categoryList', { immediate: true })
    getOptionsChange () {
        ++this.cascaderKey;
    }

    setDefaultCatalog (options: { init: boolean } = { init: false }) {
        this.selectOptions = this.matchOptionKey(this.categoryName, this.typeName, this.itemName);
        // 如果已有初始值
        if (options.init && this.selectOptions[0] !== 0) {
            this.$nextTick(() => {
                // 等待 selectOptions 应用至实际 dom 上
                this.categoryOptionChange(this.selectOptions, true);
            });
        }
    }
    async getCategoryTree () {
        try {
            const res = await api.ctiApi.getCategoryTree();
            this.initTreeData(res.data.items);
        } catch (e) {
            console.log(e);
        }
    }
    initTreeData (data) {
        const slugArr = ['category', 'type', 'item'];
        slugArr.length = this.displayLevel;
        this.categoryList = this.handleTreeData(data, slugArr, 0);
    }
    // 处理接口返回的树形数据 categoryId, categoryName ,typeId, typeName, itemId, itemName
    handleTreeData (currentArray, slugArr, level) {
        const result = [];
        interface CtiNode {
            label: string;
            value: any;
            children?: Array<CtiNode>;
        }
        currentArray.forEach((item) => {
            const obj: Partial<CtiNode> = {};
            obj.value = item[slugArr[level] + 'Id'];
            obj.label = item[slugArr[level] + 'Name'];
            // 对最末层的rgId单独处理
            if (this.displayLevel === 3 && (!this.isMwgd)) {
                if (item.rgId && item.rgName) {
                    obj.label += '（' + item.rgName + '）';
                    obj.value = {
                        itemId: item[slugArr[level] + 'Id'],
                        rgId: item.rgId
                    };
                }
            }
            if (item.children && (level < (slugArr.length - 1))) {
                obj.children = this.handleTreeData(item.children, slugArr, level + 1);
            }
            result.push(obj);
        });
        return result;
    }
    // ifManual参数：判断是为更新视图 主动出发的change
    categoryOptionChange (val, ifManual?) {
        const keyArr = val;
        const labelArrs = val.length ? this.$refs.cascader.getCheckedNodes() : [];
        if (this.multiple) {
            // console.log('labelArrs', labelArrs);
            // let labelArr = labelArrs.filter(item => !item.hasChildren);
            this.categoryInfo = keyArr.map((key, index) => {
                return this.handleMapCatalog(key, labelArrs[index]);
            });
        } else {
            const labelArr = labelArrs && labelArrs[0] || [];
            this.categoryInfo = this.handleMapCatalog(keyArr, labelArr);
        }
        this.$emit('categoryChange', this.categoryInfo, this.index, ifManual);
    }
    handleMapCatalog (keys, labels) {
        const labelArr = labels && labels.pathLabels || [];
        const catalogItem = {
            categoryId: keys[0] || 0,
            categoryName: labelArr[0] || '',
            typeId: keys[1] || 0,
            typeName: labelArr[1] || '',
            itemId: (keys[2] && keys[2].itemId) || keys[2] || 0,
            rgId: (keys[2] && keys[2].rgId) || 0,
            itemName: labelArr[2] ? labelArr[2].split('（')[0] : ''
        };
        return catalogItem;
    }
    matchOptionKey (categoryName, typeName, itemName?) {
        const result = {
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
                                    const nameArr = item.label.split('（');
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
    reset () {
        this.selectOptions = [];
    }
    focusEmit (event) {
        this.$emit('focus', event);
        this.beforeFilter();
    }
    blurEmit (event) {
        this.$emit('blur', event);
    }
    beforeFilter (val?) {
        const dropdown = document.getElementsByClassName('cti-search-category-popper')[0];
        if (dropdown) {
            if (val) {
                dropdown.classList.add('show-category-popper');
            } else {
                dropdown.classList.remove('show-category-popper');
            }
        }
    }
    filterMethod (node, keyword) {
        const label = node.pathLabels.join().toLowerCase();
        const key = keyword.toLowerCase();
        return label.includes(key);
    }
}
</script>

<style lang="postcss">
.category-tree-container {
    width: 100%;
    .category-cascader {
        width: 100%;
        height: 34px;
        line-height: 34px;
        .el-input input {
            width: 100%;
            height: 34px;
            padding-left: 11px;
            border-color: #D3D8E4;
            border-radius: 4px;
        }
        .el-input__inner::-webkit-input-placeholder {
            color: #B5BBD1;
        }
        .el-input__inner::-moz-placeholder {
            color: #B5BBD1;
        }
        .el-input__inner:-ms-input-placeholder {
            color: #B5BBD1;
        }
        .el-input__inner::placeholder {
            color: #B5BBD1;
        }
        .el-input__icon {
            line-height: 34px;
        }
        .el-cascader__label {
            color: #464646;
        }
        .el-cascader .el-input .el-input__inner:focus,
        .el-cascader .el-input.is-focus .el-input__inner {
            border-color: #FF8800;
        }
    }
}
.mw-category-popper,
.cti-search-category-popper {
    z-index: 10000 !important;
}
.cti-search-category-popper {
    display: none;
}
.cti-search-category-popper.show-category-popper {
    display: block;
}
.mw-category-popper .el-cascader-menu,
.cti-search-category-popper .el-cascader-menu {
    max-height: 294px;
    padding: 4px 0;
    border-right: none;
    height: auto;
    .el-cascader-node {
        color: #6F6F6F;
        padding: 9px 15px;
        .el-radio__inner {
            border: 0;
            background-color: inherit;
        }
        .el-radio__input.is-checked .el-radio__inner {
            background: none;
        }
        .el-radio {
            height: 100%;
            width: 150px;
            position: absolute;
        }
        &.in-active-path {
            color: #FF8800;
        }
        &:hover {
            background-color: #EDF0F7;
        }
        .el-cascader-menu__item__keyword {
            color: #FF8800;
        }
    }
    .el-cascader-menu__item--extensible::after {
        right: 3px;
    }
}
</style>
