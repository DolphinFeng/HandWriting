<template>
    <div class="cti-result-container">
        <div class="empty-tip" v-if="showEmpty">{{ $getText('cti_search_result_empty_tip', '暂无发起权限') }}</div>
        <el-cascader-panel
            v-else
            v-model="selectCti"
            class="all-cti-cascader-panel"
            :options="ctiTreeOptions"
            :key="cascaderKey"
            @change="emitChange"
            :props="panelProps"
            ref="cascader" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as api from '@/api';
import { Catalogs, NoCatalog } from '@/config/map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { CREATE_CTI_CHOOSE } from '@/config/lx_map.conf';
import { CascaderPanel } from 'element-ui';
Vue.use(CascaderPanel);


/**
 * 新版问题描述的cti搜索
 *
 * @author liyuyao
 * @date 06/24/2021
 */
@Component
export default class CtiSearchResult extends Vue {
    @Getter inside;
    @Getter loginType;
    @Getter spaceDomain;

    @Prop({ default: () => {
        return {};
    } })
    cti: CommonTypes.ctiItem;

    // 发起方式
    @Prop({ default: 'BASIC' })
    createType: string;

    @Prop({ default: false })
    isPrivateSpace: boolean;

    @Prop()
    clearCti: boolean;

    @Prop()
    showDesc: boolean;

    @Prop()
    categoryList: CommonTypes.DefaultObject[];

    @Prop()
    formType: string;

    @Prop({ default: '' })
    showQuery: string;

    showEmpty: boolean = false;
    cascaderKey: number = 0;
    ctiTreeOptions: CommonTypes.mapObject[] = [];
    selectCti: Number[] = [];
    defaultCti: Number[] = []; // 从URL中获取的需要回显的目录ID
    panelProps: any = {
        lazy: true,
        lazyLoad: this.lazyLoad
    };

    @Watch('clearCti', { immediate: true })
    getCtiClear (flag) {
        if (flag) {
            this.selectCti = [];
        }
    }

    @Watch('cti', { immediate: true, deep: true })
    async getCtiChange (cti) {
        this.selectCti = cti.categoryId !== NoCatalog.categoryId ? [cti.categoryId, cti.typeId, cti.itemId] : [NoCatalog.categoryId];
        // 是否有完整三级目录并且不为“不选择目录直接发起”
        const isAllCti = cti.categoryId && cti.typeId && cti.itemId && cti.categoryId !== 14;
        // 通过推荐目录选择、通过defaultCti回显
        if (this.createType !== 'CUSTOM' && this.formType !== 'custom' && isAllCti) {
            // 根据一级节点，传typeId更新三层数据
            const store = this.$refs.cascader?.store;
            const categoryNode = store?.nodes?.find(item => item.value === cti.categoryId);
            if (categoryNode && !categoryNode.children.length) {
                const tree = await this.getNextLevelData(categoryNode, { typeIds: [cti.typeId], categoryIds: [cti.categoryId] });
                this.appendChildren(categoryNode, tree);
                this.$refs.cascader.handleExpand(categoryNode);
                const typeNode = categoryNode.children.find(item => item.value === cti.typeId);
                this.$refs.cascader.handleExpand(typeNode);
            }
        }
    }

    @Watch('categoryList', { immediate: true })
    getAssignedCategory (cti) {
        // 模板发起的情况下，不需要请求tree接口，直接从表单内容接口获取目录范围
        if (cti.length) {
            this.ctiTreeOptions = this.handleTreeData(this.abstractTree(cti), Catalogs, 0);
            const node = cti.find(val => {
                return val.categoryId === this.cti.categoryId && val.typeId === this.cti.typeId && val.itemId === this.cti.itemId;
            });
            if (!node) {
                this.$emit('clear-cti-change', true);
                this.selectCti = [];
            } else {
                this.$emit('clear-cti-change', false);
            }
        } else if (!cti.length && (this.formType === 'custom' || this.createType === 'CUSTOM')) {
            this.showEmpty = true;
            this.$emit('noTreeResult', true);
        }
    }
    // 当cascader的options改变的时候，需要改变key重新渲染组件
    @Watch('ctiTreeOptions', { immediate: true })
    getOptionsChange () {
        ++ this.cascaderKey;
    }
    // 普通发起、URL发起并且当前并未加载自定义表单时启动懒加载
    @Watch('formType', { immediate: true })
    getFormTypeChange () {
        const needLazyLoad = this.createType !== 'CUSTOM' && this.formType !== 'custom';
        this.$set(this.panelProps, 'lazy', needLazyLoad);
    }

    getCtiDefaultValue () {
        const { categoryId, typeId, itemId } = this.cti;
        this.selectCti = Object.assign([], itemId ? [categoryId, typeId, itemId] : typeId ? [categoryId, typeId] : categoryId ? [categoryId] : []);
        this.defaultCti = Object.assign([], this.selectCti);
    }

    created () {
        this.initTreeOptions();
        this.getCtiDefaultValue();
    }

    async lazyLoad (item, resolve) {
        if (item.level === 0) {
            // 获取初始一级目录，通过resolve方法存入store中
            const children = await this.getNextLevelData(item, {});
            // cascader-panel组件在具有默认值时，会错误调用cascader组件方法，catch报错
            try {
                if (children.length) {
                    this.$emit('noTreeResult', false);
                } else {
                    this.showEmpty = true;
                    this.$emit('noTreeResult', true);
                }
                resolve(children);
            } catch (error) {
                console.log(error);
            }
            return;
        }
        // 非初始节点时，重写resolve方法
        this.loadData(item);
    }
    // 更新node的children属性
    appendChildren (node: any, children: any) {
        const store = this.$refs.cascader.store;
        store?.appendNodes(children, node);
        node.loaded = true;
        node.loading = false;
    }
    async loadData (node: any) {
        const store = this.$refs.cascader.store;
        // 节点children内有数据，说明该节点已请求过，直接展开即可
        if (node.children?.length) {
            node.loaded = true;
            node.loading = false;
            this.$refs.cascader.handleExpand(node);
            return;
        }
        // URL发起不论有几级都只会触发一次懒加载
        // 手动或者自动触发一级目录的click事件
        if (node.level === 1) {
            const categoryNode = store.nodes.find(item => item.value === node.value);
            if (!this.defaultCti.length || this.defaultCti[0] !== node.value || this.defaultCti.length === 1) {
                // 手动选中一级目录：无defaultCti参数 或者 点击的node和defaultCTI不同
                // 自动选中一级目录：URL发起
                const { tree, defaultCti } = await this.getNextLevelData(node, { categoryIds: [node.value] }, true);
                if (node.data.related) {
                    this.$emit('change', defaultCti);
                    return;
                }
                this.appendChildren(categoryNode, tree);
                this.$refs.cascader.handleExpand(categoryNode);
            } else {
                // 二级或者三级目录链接发起
                // 根据一级节点更新三层数据，传参typeId
                const tree = await this.getNextLevelData(node, { typeIds: [this.defaultCti[1]], categoryIds: [this.defaultCti[0]] });
                this.appendChildren(categoryNode, tree);
                this.$refs.cascader.handleExpand(categoryNode);
                const typeNode = node.children.find(item => item.value === this.defaultCti[1]);
                if (typeNode.data.related) {
                    this.$emit('change', typeNode.data.defaultCti);
                }
                this.$refs.cascader.handleExpand(typeNode);
            }
        } else if (node.level === 2) {
            // 手动点击二级目录
            const { tree, defaultCti } = await this.getNextLevelData(node, { typeIds: [node.value] }, true);
            if (node.data.related) {
                this.$emit('change', defaultCti);
            }
            this.appendChildren(node, tree);
            this.$refs.cascader.handleExpand(node);
        }
    }

    async initTreeOptions () {
        if (this.createType === 'CUSTOM' && !this.categoryList.length) {
            return;
        }
        if (this.categoryList.length) {
            // 普通发起或者URL发起时切换到自定义表单
            this.ctiTreeOptions = this.handleTreeData(this.abstractTree(this.categoryList), Catalogs, 0);
            this.$emit('noTreeResult', false);
        }
    }
    async getTreeData (requestParam: any) {
        const res: Ajax.AxiosResponse = await api.spaceApi.getAuthSpaceCti(this.spaceDomain, requestParam, this.spaceDomain === 'ticket');
        const { data } = res;
        return data.items || [];
    }
    async getNextLevelData (item: any, requestParam: any, needParent: boolean = false) {
        // 根据当前点击节点请求两级或三级数据
        // needParent字段专门用于更新当前item的defaultCti属性
        const data = await this.getTreeData({
            ...requestParam,
            createScene: true
        });
        switch (item.level) {
            case 0:
                return this.handleTreeData(data, Catalogs, item.level);
            case 1:
                const node = data.find(e => e.categoryId === item.value);
                const categoryChildren = this.handleTreeData(node?.children || [], Catalogs, item.level);
                return needParent ? {
                    tree: categoryChildren,
                    defaultCti: node?.ticketRelated ? node?.defaultCti : {}
                } : categoryChildren;
            case 2:
                const category = data.find(e => e.categoryId === item.parent?.value);
                if (category && category.children) {
                    const type = category.children.find(e => e.typeId === item.value);
                    const typeChildren = this.handleTreeData(type?.children || [], Catalogs, item.level);
                    return needParent ? {
                        tree: typeChildren,
                        defaultCti: type?.ticketRelated ? type?.defaultCti : {}
                    } : typeChildren;
                } else {
                    return [];
                }
            default:
                return [];
        }
    }

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
            obj.leaf = level === 2;
            if (level === 2) {
                // 需要在叶子结点加上rgId
                obj.extra = {
                    rgId: item.rgId
                };
            }
            if (item.ticketRelated) {
                obj.related = item.ticketRelated;
                obj.defaultCti = item.defaultCti;
            }
            if (item['children']) {
                obj.children = this.handleTreeData(item['children'], slugArr, level + 1);
            }
            result.push(obj);
        });
        if (this.createType === 'BASIC' && level === 0 && !this.isPrivateSpace && this.inside && this.formType !== 'custom') {
            let noChoice = {};
            noChoice.value = NoCatalog.categoryId; // 14-172-524-342
            noChoice.label = '不选择目录直接发起';
            noChoice.leaf = true;
            result.unshift(noChoice);
        }
        return result;
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

    emitChange (cti) {
        lxReportClick(CREATE_CTI_CHOOSE['cti_select']);
        if (cti.length < 3 && cti[0] !== NoCatalog.categoryId) {
            return;
        }
        const checkedNodes = this.$refs.cascader && this.$refs.cascader.getCheckedNodes();
        const { pathLabels, data } = checkedNodes[0];
        const { extra } = data;
        const isNoCatalog: boolean = cti[0] === NoCatalog.categoryId;
        lxReportClick(CREATE_CTI_CHOOSE[isNoCatalog ? 'cti_no_catalog' : 'cti_select_hit']);
        this.$emit('change', {
            categoryName: isNoCatalog ? NoCatalog.categoryName : pathLabels[0],
            typeName: isNoCatalog ? NoCatalog.typeName : pathLabels[1],
            itemName: isNoCatalog ? NoCatalog.itemName : pathLabels[2],
            categoryId: isNoCatalog ? NoCatalog.categoryId : cti[0],
            typeId: isNoCatalog ? NoCatalog.typeId : cti[1],
            itemId: isNoCatalog ? NoCatalog.itemId : cti[2],
            rgId: isNoCatalog ? NoCatalog.rgId : extra?.rgId
        }, isNoCatalog);
        this.$emit('selectChange');
        this.$emit('noCatalog', isNoCatalog ? true : false);
    }
}
</script>

<style lang="scss" scoped>
.cti-result-container {
    max-height: 290px;
    overflow: auto;
    .empty-tip {
        text-align: center;
        margin-top: 8px;
    }
}
.all-cti-cascader-panel {
    border: none;
}
/deep/ .el-cascader-panel {
    &.is-bordered {
        border: none;
    }
    .el-cascader-menu {
        max-height: 294px;
        max-width: 240px;
        min-width: 240px;
        padding: 4px 0;
        border-right: none;
        height: auto;
        flex: none;
        .el-cascader-menu__wrap {
            height: 280px;
        }
        .el-cascader-node {
            color: rgba(0, 0, 0, 0.87);
            padding: 9px 0;
            .el-radio__inner {
                border: 0;
                background-color: inherit;
            }
            .el-radio__input.is-checked .el-radio__inner {
                background: none;
            }
            .el-radio {
                height: 100%;
                width: 240px;
                position: absolute;
                z-index: 10;
            }
            &.in-active-path {
                color: #f80;
            }
            &:hover {
                background: rgba(0, 0, 0, 0.04);
                // color: #f80;
            }
            .el-cascader-menu__item__keyword {
                color: #f80;
            }
            .el-icon-check {
                visibility: hidden;
            }
            // .el-cascader-node__label {
            //     padding: 0 8px 0 0;
            // }
        }
        .el-cascader-menu__item--extensible::after {
            right: 3px;
        }
    }
}

</style>
