<template>
    <mtd-modal
        :title="`添加指定目录(${selectOptions.length})`"
        class="special-cti-dialog"
        @close="handleClose"
        v-model="visible">
        <el-cascader-panel
            :options="ctiOptionsList"
            :props="{
                multiple: true
            }"
            v-model="selectOptions"
            ref="cascaderPanel" />
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="cancel">取消</mtd-button>
            <mtd-button type="primary" @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { ElCascaderPanel } from 'element-ui/types/cascader-panel';
import { State } from 'vuex-class';

// import * as api from '@/api';

/**
 * 选择指定目录
 *
 * @author liyuyao
 * @date 06/09/2020
 */
@Component
export default class SpecialCtiDialog extends Vue {
    @State(state => state.cti.allCategoryTree)
    allCategoryTree: CommonTypes.mapObject[];

    @Prop()
    specialCti: CommonTypes.mapObject[];

    visible: Boolean = true;
    searchLoading: boolean = false;
    userList: CommonTypes.UserInfoItem[] = [];

    ctiOptionsList: CommonTypes.mapObject[] = [];
    selectOptions: CommonTypes.mapObject[] = [];

    checkedArr: any = null;

    $refs: {
        cascaderPanel: ElCascaderPanel & {
            // NOTE: element-ui 库的 ts 声明文件缺少这个 method
            getCheckedNodes(): any;
        };
    };

    mounted () {
        this.initTreeData(this.allCategoryTree);
        this.specialCti.length && this.setDefaultCatalog();
    }
    handleClose () {
        this.$emit('close');
    }
    submit () {
        const labels = this.$refs.cascaderPanel.getCheckedNodes();
        const checkedArr = labels.filter(item => {
            return !(item.parent && item.parent.checked);
        }).map(item => item);
        const itemsScope = {
            categoryIds: [],
            typeIds: [],
            itemIds: []
        };
        const catalogs = ['categoryIds', 'typeIds', 'itemIds'];
        checkedArr.forEach(option => {
            const item = option.value;
            const level = option.level - 1;
            const id = level < 2 ? item : item.itemId;
            itemsScope[catalogs[level]].push(id);
        });
        // 处理为平铺对象形式
        const labelArr = labels.filter((item) => {
            return item.level === 3;
        }).map((item) => item.pathLabels);
        const formatRes = this.selectOptions.map((option, index) => {
            const labelitem = labelArr[index];
            const itemRg = labelitem[2] ? labelitem[2].split('（') : [];
            return {
                categoryId: option[0],
                typeId: option[1],
                itemId: option[2].itemId,
                rgId: option[2].rgId,
                categoryName: labelitem[0],
                typeName: labelitem[1],
                itemName: itemRg[0],
                rgName: itemRg[1] && itemRg[1].split('）')[0]
            };
        });
        this.$emit('success', itemsScope, formatRes);
        this.$emit('close');
    }
    initTreeData (data) {
        this.ctiOptionsList = this.handleTreeData(data, ['category', 'type', 'item'], 0);
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
            if (item.categoryName === '找不到合适的目录') {
                return;
            }
            if (item.children) {
                obj.children = this.handleTreeData(item.children, slugArr, level + 1);
            }
            result.push(obj);
        });
        return result;
    }
    setDefaultCatalog () {
        this.selectOptions = this.specialCti.map((cti) => {
            return this.matchOptionKey(cti.categoryName, cti.typeName, cti.itemName);
        });
    }
    matchOptionKey (categoryName, typeName, itemName?) {
        const result = {
            categoryId: 0,
            typeId: 0,
            itemId: 0
        };
        this.ctiOptionsList.forEach((category) => {
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
        return [result.categoryId, result.typeId, result.itemId].filter((id) => {
            return id !== 0;
        });
    }
    cancel () {
        this.visible = false;
        this.handleClose();
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.special-cti-dialog .mtd-modal-content-wrapper {
    min-width: 700px;
}
</style>
