<template>
    <div class="category-tree-container">
        <mtd-cascader
            :placeholder="placeholder"
            v-model="selectOptions"
            :max-tag-count="maxTagCount"
            :data="categoryList"
            :debounce="600"
            @change="categoryOptionChange"
            @focus="focusEmit"
            @blur="blurEmit"
            class="category-cascader"
            ref="cascader"
            :check-strictly="allowAnyLevel"
            filterable
            :clearable="clearable" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
/**
 * 基于mtd-cascader的目录选择器
 * 组件使用范围：触发器详情页
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

    @Prop({ default: '请输入目录关键字' })
    placeholder: string;

    @Prop({ default: 10 })
    maxTagCount: number;

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
    isMw: boolean;

    @Prop({ default: false })
    isMwgd: boolean;

    @Prop({ default: 0 })
    index: number;

    @Prop()
    categoryTree: any;

    @Watch('categoryTree', { immediate: true })
    onGetCategoryTree () {
        if (this.categoryTree && this.categoryTree.length) {
            this.initTreeData(this.categoryTree);
            console.log('1');
            this.categoryName && this.setDefaultCatalog();
        } else {
            this.getCategoryTree();
        }
    }
    // 看不出这段逻辑的用处，但会影响三级目录回显，先注释
    // @Watch('categoryName', { immediate: true })
    // onGetCategoryName () {
    //     if (this.categoryTree && this.categoryTree.length) {
    //         this.initTreeData(this.categoryTree);
    //         console.log('2');
    //         this.setDefaultCatalog();
    //     }
    // }

    setDefaultCatalog () {
        // 原先使用name字段匹配会导致目录改名后无法回显，删除该逻辑
        // this.selectOptions = this.matchOptionKey(this.categoryName, this.typeName, this.itemName);
        this.selectOptions = [this.categoryId, this.typeId, this.itemId];
    }
    async getCategoryTree () {
        try {
            // 以前用的接口不会返回rgId
            const res = await api.ctiApi.getCategoryTreeTotal();
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
            value: number;
            data: any; // 将rgId字段放在data里，放在value会影响回显
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
                    obj.data = {
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
    categoryOptionChange (val, selectedOptions?) {
        this.categoryInfo = this.handleMapCatalog(val, selectedOptions || []);
        this.$emit('categoryChange', this.categoryInfo, this.index);
    }
    handleMapCatalog (keys, options) {
        const catalogItem = {
            categoryId: keys[0] || 0,
            categoryName: options[0]?.label || '',
            typeId: keys[1] || 0,
            typeName: options[1]?.label || '',
            itemId: keys[2]?.itemId || keys[2] || 0,
            rgId: options[2]?.data?.rgId || 0,
            itemName: options[2]?.label ? options[2]?.label?.split('（')[0] : ''
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
    focusEmit (event) {
        this.$emit('focus', event);
    }
    blurEmit (event) {
        this.$emit('blur', event);
    }
    filterMethod (node, keyword) {
        const label = node.pathLabels.join().toLowerCase();
        const key = keyword.toLowerCase();
        return label.includes(key);
    }
}
</script>
