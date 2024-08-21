<template>
    <div class="category-tree-container">
        <mtd-cascader
            :data="categoryList"
            v-model="selectOptions"
            :disabled="readonly || listLoading"
            :readonly="readonly"
            placeholder="请选择/搜索服务目录"
            :options="categoryList"
            class="category-cascader"
            @change="categoryOptionChange"
            ref="cascader"
            :change-on-select="allowAnyLevel"
            popper-class="category-tree-popper"
            filterable
            clearable />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';

/**
 * 级联目录选择器
 *
 * @author liyuyao
 * @date 10/15/2019
 */
@Component
export default class CategoryTree extends Vue {
    @Prop()
    ctiTree: any[];

    selectOptions: any = [];
    categoryList: any = [];
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
    @Prop({ default: false })
    readonly: boolean;

    @Watch('ctiTree', { immediate: true })
    getCtiTree (val) {
        if (val && val.length) {
            this.initTreeData(val);
            this.setDefaultCatalog();
        }
    }
    // mounted () {
    //     this.getCategoryTree();
    // }

    async getCategoryTree () {
        try {
            const res = await api.ctiApi.getCategoryTreeTotal();
            const { code, data } = res;
            if (code === 200) {
                this.initTreeData(data.items);
                this.setDefaultCatalog();
            }
            // localStorage.cti = JSON.stringify(res.data.items);
            // store.commit('SET_CTI_TREE', res.data.items);
        } catch (e) {
            console.log(e);
        }
    }

    async setDefaultCatalog () {
        const formatLabel = this.formatLabelOptions([this.categoryName, this.typeName, this.itemName]);
        this.selectOptions = this.matchOptionKey(this.categoryName, this.typeName, this.itemName);
        if (this.categoryId && this.typeId && this.itemId) { // detail
            this.categoryOptionChange(this.selectOptions, formatLabel, false);
        } else if (this.categoryName) { // create
            this.categoryOptionChange(this.selectOptions, formatLabel, true);
        }
    }
    // 填补rgName
    async getRgName (rgId: number) {
        const res = await api.rgApi.getRgList({
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
        this.categoryList = this.handleTreeData(data, ['category', 'type', 'item'], 0);
        // 按服务目录查看统计分析 需要有“全部”选项
        this.withAll && this.categoryList.unshift({
            label: '全部',
            value: 0,
            children: []
        });
    }
    // 处理接口返回的树形数据 categoryId, categoryName ,typeId, typeName, itemId, itemName
    handleTreeData (currentArray, slugArr, level) {
        const result = [];
        currentArray.forEach((item) => {
            const obj: { value: any; label: string; children?: any[] } = {
                value: item[slugArr[level] + 'Id'],
                label: item[slugArr[level] + 'Name']
            };
            // 对最末层的rgId单独处理
            if (item.rgId && item.rgName) {
                obj.label += '（' + item.rgName + '）';
                obj.value = {
                    itemId: item[slugArr[level] + 'Id'],
                    rgId: item.rgId
                };
            }
            if (item.children) {
                // “找不到合适的目录”隐藏二三级目录
                if (!(obj.label === '找不到合适的目录' && slugArr[level] === 'category')) {
                    obj.children = this.handleTreeData(item.children, slugArr, level + 1);
                }
            }
            result.push(obj);
        });
        return result;
    }
    // mtd代码
    async categoryOptionChange (val, options, manual) {
        const keyArr = val;
        const category = options[0];
        const type = options[1];
        const item = options[2];
        const itemLabel = item && item.label ? item.label.split('（') : [];
        this.categoryInfo.categoryId = keyArr[0] || 0;
        this.categoryInfo.categoryName = category ? category.label : '';
        this.categoryInfo.typeId = keyArr[1] || 0;
        this.categoryInfo.typeName = type ? type.label : '';
        this.categoryInfo.itemId = keyArr[2] ? keyArr[2].itemId : 0;
        this.categoryInfo.itemName = itemLabel[0] || '';
        this.categoryInfo.rgId = keyArr[2] ? keyArr[2].rgId : 0;
        this.categoryInfo.rgName = itemLabel[1] ? itemLabel[1].split('）')[0] : '';
        if (this.categoryInfo.rgId && (!this.categoryInfo.rgName)) {
            if (!this.rgName) {
                this.categoryInfo.rgName = await this.getRgName(this.categoryInfo.rgId);
            } else {
                this.categoryInfo.rgName = this.rgName;
            }
        }
        // 为了分别匹配到测试环境和线上环境的info
        if (this.categoryInfo.categoryName === '找不到合适的目录') {
            this.categoryInfo.typeId = this.isNodeEnvProd ? 172 : 907;
            this.categoryInfo.typeName = '找不到合适的目录';
            this.categoryInfo.itemId = this.isNodeEnvProd ? 524 : 1324;
            this.categoryInfo.itemName = '找不到合适的目录';
            this.categoryInfo.rgId = this.isNodeEnvProd ? 342 : 1702;
            this.categoryInfo.rgName = '';
        }
        this.$emit('categoryChange', this.categoryInfo, manual);
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
    get isNodeEnvProd () {
        return process.env.NODE_ENV === 'production';
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
        .el-input__icon.el-icon-arrow-down {
            line-height: 34px;
            width: 28px;
            font-family: mtdicon !important;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.38);
            &::before {
                content: "\e927";
            }
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
            color: #6F6F6F;
            &:hover {
                background-color: #EDF0F7;
            }
        }
    }
}
</style>
