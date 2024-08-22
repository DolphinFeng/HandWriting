<template>
    <div class="catalog-group">
        <CatalogLevelSelect
            v-for="level in [1, 2, 3]"
            :common-list="commonList"
            :catalog-list="catalogList"
            :level="level"
            :flatten-tree="flattenTree"
            :ids="ids"
            :key="level"
            @change="handleCatalogChange"
            @no-choosen="setDefaultCti"
            ref="levelSelect" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Mutation, Getter } from 'vuex-class';
import * as api from '@/api';
import { COMMON_DIRECTORY } from '@/config/lx_map.conf';
import { Catalogs, BaseCti } from '@/config/map.conf';
import { getDataFromDb } from '@/utils/tools/indexedDB';
import CatalogLevelSelect from './catalog-level-select.vue';
import pick from 'lodash.pick';

/**
 * 级联目录选择器
 *
 * @author liyuyao
 * @date 10/15/2019
 */
@Component({
    components: {
        CatalogLevelSelect
    }
})
export default class CatalogGroup extends Vue {
    @Getter isPrivateSpace;
    @Getter env;
    @Getter spaceDomain;

    @Mutation setUserChooseCti;

    catalogList: any = [];
    flattenTree: any = [];
    commonList: any = [];

    selectResult: CommonTypes.DefaultObject = {};
    spaceCti: CommonTypes.ctiTreeItem[] = [];

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

    @Prop({ default: () => {
        return {};
    } })
    defaultCatalog: CommonTypes.mapObject;

    defaultCti: CommonTypes.mapObject = {};

    ids: number[] = [];

    NO_CHOOSEN_ID: number = 0;
    lastCti: CommonTypes.mapObject = {};

    async getSpaceCtiVersion () {
        const res: Ajax.AxiosResponse = await api.spaceApi.getSpaceCtiVersion();
        let { code, data } = res;
        if (code === 200) {
            let version = data.version;
            this.initSpaceTree(version);
        }
    }


    async initSpaceTree (version) {
        this.spaceCti = await getDataFromDb(version, {
            space: this.spaceDomain
        });
        if (this.spaceCti && this.spaceCti.length) {
            this.catalogList = this.handleTreeData(this.spaceCti, Catalogs, 0);
            const flatNodes = this.getFlattenNodes(this.catalogList);
            this.flattenTree = this.formatFlattenTree(flatNodes);
            if (Object.keys(this.defaultCatalog).length) this.setDefaultCatalog();
        }
    }

    @Watch('defaultCatalog', { immediate: true })
    getDefaultCatalog () {
        if (Object.keys(this.defaultCatalog).length && this.spaceCti.length) this.setDefaultCatalog();
    }

    created () {
        this.getSpaceCtiVersion();
        if (!this.isPrivateSpace) this.getRecommendList();
    }

    // 获取常用目录
    async getRecommendList () {
        const res: Ajax.AxiosResponse = await api.ticketApi.commonDirector();
        let { code, data } = res;
        if (code === 200) {
            this.commonList = data.items.map(item => {
                return {
                    value: {
                        categoryId: item.categoryId,
                        typeId: item.typeId,
                        itemId: item.itemId,
                        rg: {
                            rgId: item.rgId,
                            rgName: item.rgName
                        }
                    },
                    label: `${item.categoryName}/${item.typeName}/${item.itemName}`,
                    children: []
                };
            });
        }
    }
    // 平铺tree
    getFlattenNodes (nodes, paths = []) {
        let flatNodes = [];
        nodes.forEach((node) => {
            const children = node.children;
            const hasChildren = children && children.length;
            const related = node.related && Object.keys(node.related).length;
            const stack = paths.concat([node]);
            if (!hasChildren) {
                flatNodes.push(stack);
            } else {
                if (related) {
                    flatNodes.push(stack);
                }
                flatNodes = flatNodes.concat(this.getFlattenNodes(children, stack));
            }
        });
        return flatNodes;
    }
    // 格式化平铺结果
    formatFlattenTree (flatNodes) {
        return flatNodes.map((nodes) => {
            const labels = nodes.map((n) => n.label).join(' / ');
            let values = {};
            let defaultCti = {};
            nodes.forEach((n, i) => {
                values[Catalogs[i]] = n.value;
                if (n.rg) values['rg'] = n.rg;
                if (n.related) defaultCti = n.related;
            });
            return {
                label: labels,
                value: values,
                related: defaultCti
            };
        });
    }
    handleCatalogChange (val, label, type, level, rg) {
        const hasDefaultCti = Object.keys(this.defaultCti).length > 0;
        let cti = {};
        let ids = this.ids;
        if (type === 'select') { // 仅选择当前层级目录的情况
            ids[level - 1] = val[0];
            ids = ids.slice(0, level); // 截取选中项前的id，后面的id都要销毁
            const emptyIndex = ids.findIndex(id => !id);
            if (emptyIndex > -1) ids = ids.slice(0, emptyIndex);
            this.$set(this, 'ids', ids);
        } else {
            this.$set(this, 'ids', val);
        }
        if (hasDefaultCti) {
            cti = this.defaultCti;
            if (this.ids.length < 3) {
                const leftArr = [];
                for (let i = 0; i < 3 - this.ids.length; i++) {
                    leftArr.push(-1);
                }
                ids = this.ids.concat(leftArr);
                this.$set(this, 'ids', ids);
            }
        } else {
            cti = this.formatEmitCti(val, label, type === 'select' ? level : null);
            cti = Object.assign(cti, rg);
            if (type === 'select') { // 单层数据
                this.selectResult = Object.assign(this.selectResult, cti);
                const leftCatalog = Catalogs.slice(level);
                leftCatalog.forEach(catalog => {
                    this.selectResult[`${catalog}Id`] = 0;
                    this.selectResult[`${catalog}Name`] = '';
                });
                cti = JSON.parse(JSON.stringify(this.selectResult));
            } else {
                if (type === 'search') {
                    if (cti.categoryId && !cti.categoryName) cti.categoryName = this.lastCti.categoryName;
                    if (cti.typeId && !cti.typeName) cti.typeName = this.lastCti.typeName;
                }
                this.selectResult = {};
            }
        }
        cti = Object.assign(BaseCti, cti);
        this.$emit('change', cti, false);
        this.setUserChooseCti(this.ids);
        this.lastCti = cti;
    }
    formatEmitCti (vals, labels, level?) {
        let cti = {};
        vals.forEach((val, index) => {
            const catalog = level ? Catalogs[level - 1] : Catalogs[index];
            cti[`${catalog}Id`] = val;
            cti[`${catalog}Name`] = labels[index];
        });
        return cti;
    }
    setDefaultCti (cti) {
        this.defaultCti = cti;
    }
    // 埋点函数
    lxSubmit (eventName, type?) {
        let moduleType = type ? type : 'moduleClick';
        window.LXAnalytics && window.LXAnalytics(moduleType, COMMON_DIRECTORY[eventName]);
    }

    setDefaultCatalog () {
        let names = [];
        let ids = [];
        for (let key in this.defaultCatalog) {
            let value = this.defaultCatalog[key];
            if (key.includes('Id') && value) {
                ids.push(value);
            } else if (key.includes('Name') && value) {
                names.push(value);
            }
        }
        let keyArr = ids.length ? ids : names;
        let ctiRes = this.matchCti(keyArr);
        this.ids = Object.values(pick(ctiRes, ['categoryId', 'typeId', 'itemId']));
        this.$emit('update:defaultCatalog', {});
        this.$emit('change', ctiRes, true);
        this.lastCti = ctiRes;
        this.selectResult = ctiRes;
    }
    // 处理接口返回的树形数据 categoryId, categoryName ,typeId, typeName, itemId, itemName
    handleTreeData (currentArray, slugArr, level) {
        let result = [];
        currentArray.forEach((item) => {
            // 完全隐藏“找不到合适的目录”
            if (item.categoryName === '找不到合适的目录') {
                return ;
            }
            let obj = {};
            obj.value = item[slugArr[level] + 'Id'];
            obj.label = item[slugArr[level] + 'Name'];
            if (item.ticketRelated) obj.related = item.defaultCti;
            if (item.rgId) {
                obj.rg = {
                    rgId: item.rgId,
                    rgName: item.rgName
                };
            }
            if (item['children']) {
                obj.children = this.handleTreeData(item['children'], slugArr, level + 1);
            }
            result.push(obj);
        });
        return result;
    }
    matchCti (source) {
        const searchKey = source.length && isNaN(source[0]) ? 'label' : 'value';
        let result = [];
        this.catalogList.forEach((category) => {
            if (category[searchKey] === source[0]) {
                result.push(category);
                if (source[1] && category.children && category.children.length) {
                    category.children.forEach((type) => {
                        if (type[searchKey] === source[1]) {
                            result.push(type);
                            if (source[2] && type.children && type.children.length) {
                                type.children.forEach((item) => {
                                    if (item[searchKey] === source[2]) {
                                        result.push(item);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
        const catalogs = Catalogs;
        let cti = {};
        result.forEach((item, index) => {
            const catalog = catalogs[index];
            cti[`${catalog}Id`] = item.value;
            cti[`${catalog}Name`] = item.label;
        });
        if (result[2] && result[2]['rg']) {
            cti = Object.assign(cti, result[2]['rg']);
        }
        return cti;
    }
    reset () {
        this.ids = [];
        this.$refs.levelSelect.forEach(item => {
            item.reset();
        });
    }
}
</script>

<style lang="scss">
.catalog-level-select {
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
</style>
