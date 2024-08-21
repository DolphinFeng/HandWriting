<template>
    <div :class="['catalog-level-container', { 'last-item': level === 3}]">
        <div class="catalog-level-select">
            <div class="level-title">{{ $getText(NUM_CN[level - 1], '一级目录') }}:</div>
            <mtd-cascader
                :data="catalogData"
                v-model="selectOptions"
                :disabled="disabled"
                :placeholder="$getText('category_select_placeholder', '请选择/搜索服务目录')"
                class="catalog-level-cascader"
                @change="categoryOptionChange"
                @focus="inputFocus"
                @update:visible="droDownUpdate"
                ref="cascader"
                popper-class="category-tree-popper"
                :props="{
                    children: 'showChildren'
                }"
                clearable
                filterable
                remote
                :remote-method="filterMethod"
                expand-trigger="hover"
                :no-data-text="noDataText"
                separator="：">
                <template slot-scope="{ node }">
                    <i v-if="node.label === '常用目录'" class="mtdicon mtdicon-file-o" />
                    <span> {{ node.label }} </span>
                </template>
            </mtd-cascader>
        </div>
        <div class="no-choosen-tip" v-if="selectOptions[0] === NO_CHOOSEN_ID && level === 1">{{ $getText('category_select_no_select_tip', 'TT团队将帮您寻找问题处理方') }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { NoCatalog, Catalogs } from '@/config/map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { CREATE_CTI_CHOOSE } from '@/config/lx_map.conf';

/**
 * 级联目录选择器
 *
 * @author liyuyao
 * @date 10/15/2019
 */
@Component
export default class CatalogLevelSelect extends Vue {
    @Getter isPrivateSpace;
    @Getter inside;

    @Prop({ default: () => {
        return [];
    } })
    ids: number[];

    @Prop({ default: '' })
    name: string;

    // N级目录 1 - 3
    @Prop({ default: 1 })
    level: number;

    @Prop({ default: () => {
        return [];
    } })
    commonList: any;

    @Prop({ default: () => {
        return [];
    } })
    catalogList: any;

    @Prop({ default: () => {
        return [];
    } })
    flattenTree: any;

    flattenSearchList: any = [];


    NO_CHOOSEN_ID = -1; // 不选择目录直接发起时的key

    recommandTreeItem: CommonTypes.cascaderValue = {
        label: '常用目录',
        value: 'recommand',
        showChildren: []
    };

    noChoosenItem: CommonTypes.cascaderValue = {
        label: this.$getText('category_select_no_select_item', '※不选择目录直接发起※'),
        value: -1
    };


    @Prop({ default: false })
    listLoading: boolean;

    catalogData: CommonTypes.cascaderValue[] = [];
    catalogSelectData: CommonTypes.cascaderValue[] = [];
    selectOptions: any = [];

    NUM_CN: string[] = ['category_select_level_one_title', 'category_select_level_two_title', 'category_select_level_three_title'];
    oldVal: number[] = [];
    lastQueryEmpty: boolean = true;
    focusFlag: boolean = false;
    // RECOMMEND_ID: number = 0;
    // debounceRemoteMethod: Function = debounce(this.remoteMethod, 200);
    queryStr: string = '';

    get disabled () {
        const currentIndex = this.level - 1;
        return (currentIndex > this.ids.length);
    }

    get isFirstLevel () {
        return this.level === 1;
    }

    get noDataText () {
        return this.$getText(this.queryStr.length > 0 ? 'category_select_tip_no_result' : 'category_select_tip_no_auth', '暂无发起权限');
    }
    @Watch('commonList', { immediate: true })
    getCommonList (list) {
        if (this.isFirstLevel && list.length) {
            this.recommandTreeItem.showChildren = list;
            this.catalogSelectData.unshift(this.recommandTreeItem);
        }
    }

    @Watch('catalogList', { immediate: true })
    getCatalogList (list) {
        if (list.length) {
            this.catalogSelectData = this.catalogSelectData.concat(this.initLevelData(list));
            this.catalogData = this.catalogSelectData;
            if (this.isFirstLevel) this.flattenSearchList = this.formatFirstLevelFlatten(this.flattenTree);
        }
    }

    mountFlattenData (allFlattenTree) {
        let flattenTree = JSON.parse(JSON.stringify(allFlattenTree));
        const lastId = this.ids[this.level - 2];
        const lastKey = Catalogs[this.level - 2];
        let filterList = flattenTree.filter(item => {
            return item.value[lastKey] === lastId;
        }).map(item => {
            let arr = item.label.split(' / ').slice(this.level - 1);
            // const label = this.level === 3 ? (arr.join(' / ') || item.label) : arr.join(' / ');
            const label = arr.join(' / ');
            const value = item.value[Catalogs[this.level - 1]];
            return Object.assign(item, {
                label: label,
                value: value,
                ctiValues: item.value
            });
        });
        return filterList;
    }

    formatFirstLevelFlatten (allFlattenTree) {
        let flattenTree = JSON.parse(JSON.stringify(allFlattenTree));
        let filterList = flattenTree.map(item => {
            const value = item.value[Catalogs[this.level - 1]];
            return Object.assign(item, {
                value: value,
                ctiValues: item.value
            });
        });
        return filterList;
    }

    @Watch('ids', { immediate: true })
    getSelectIds (ids: number[], oldIds: number[]) {
        if (!ids.length && oldIds && oldIds.length) this.reset();
        if (!ids.length) return;
        const lastId = ids[this.level - 2];
        const currentId = ids[this.level - 1];

        // 如果上一级被清空，本级也要清空
        if (!this.isFirstLevel && !lastId || !currentId) this.reset();
        // if (ids.length + 1 === this.level || (currentId && currentId !== oldId)) {
        if (ids.length + 1 === this.level || currentId) {
            if (this.isFirstLevel && this.recommandTreeItem.showChildren.length) {
                this.catalogSelectData = [this.recommandTreeItem].concat(this.initLevelData(this.catalogList));
            } else {
                this.catalogSelectData = this.initLevelData(this.catalogList);
            }
            this.catalogData = this.catalogSelectData;
        }
        if (!this.isFirstLevel && lastId) {
            this.$nextTick(() => {
                this.flattenSearchList = this.mountFlattenData(this.flattenTree);
            });
        }
        this.$nextTick(() => {
            // 如果上一级为「不选择目录直接发起」 那么下一级也是
            if (lastId === this.NO_CHOOSEN_ID) {
                this.selectOptions = [this.NO_CHOOSEN_ID];
                return ;
            }
            if (currentId) {
                this.selectOptions = [currentId];
            }
        });
    }
    // 分级选择模式下，当前level应该展示的下拉列表
    initLevelData (list: CommonTypes.cascaderValue[]) {
        const ids = this.ids.slice(0, this.level - 1);
        if (!this.isFirstLevel && ids.length) {
            if (ids[ids.length - 1] === this.NO_CHOOSEN_ID) {
                return [this.noChoosenItem];
            } else {
                let result = list;
                ids.forEach(id => {
                    let resultList = result.find(item => item.value === id);
                    if (resultList && resultList.children) {
                        result = resultList.children;
                        if (resultList.related) { // 能否「不选择目录直接发起」
                            const related = Object.assign(this.noChoosenItem, {
                                defaultCti: resultList.related
                            });
                            result = [related].concat(result);
                        }
                    }
                });
                return result;
            }
        } else if (!this.isPrivateSpace && this.inside) {
            // 第一级默认带「不选择目录直接发起」
            const firstNoChoosen = Object.assign(this.noChoosenItem, {
                defaultCti: NoCatalog
            });
            return [firstNoChoosen].concat(this.catalogList);
        } else {
            return this.catalogList;
        }
    }

    filterMethod (query) {
        this.queryStr = query;
        if (query.length) {
            this.catalogData = this.flattenSearchList.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
            // 数据统计 上次为空才统计
            if (this.lastQueryEmpty) {
                lxReportClick(CREATE_CTI_CHOOSE['cti_search']);
                if (this.catalogData.length) {
                    lxReportClick(CREATE_CTI_CHOOSE['cti_search_result']);
                } else {
                    lxReportClick(CREATE_CTI_CHOOSE['cti_search_empty']);
                }
            }
            this.lastQueryEmpty = false;
        } else {
            this.lastQueryEmpty = true;
            this.catalogData = this.catalogSelectData;
        }
    }
    categoryOptionChange (val, options) {
        let type = 'select';
        let values = val;
        const firstOption = options[0] || {};
        let labels = firstOption['label'] ? [firstOption['label']] : [];
        let rg = firstOption['rg'] || {
            rgName: '',
            rgId: 0
        };
        if (val.length === 2 && val[0] === 'recommand') { // 选择「常用目录」的情况
            lxReportClick(CREATE_CTI_CHOOSE['cti_common']);
            type = 'recommand';
            values = Object.values(val[1]);
            rg = values.pop(); // rg单独处理
            labels = options[1].label.split('/');
        } else if (firstOption['ctiValues']) { // 搜索目录的情况
            lxReportClick(CREATE_CTI_CHOOSE['cti_search_hit']);
            type = 'search';
            values = Object.values(firstOption.ctiValues);
            labels = options[0].label.split(' / ');
            if (labels.length < 3) {
                for (let i = 0; i <= 3 - labels.length; i++) {
                    labels.unshift('');
                }
            }
            if (values.length > 3) rg = values.pop();
        } else {
            lxReportClick(CREATE_CTI_CHOOSE['cti_select']);
            if (this.level === 3) {
                lxReportClick(CREATE_CTI_CHOOSE['cti_select_hit']);
            }
        }
        // 是否选择「不选择目录直接发起」
        if (values[0] === this.NO_CHOOSEN_ID) {
            lxReportClick(CREATE_CTI_CHOOSE['no_cti']);
            const defaultCti = firstOption['defaultCti'] || {};
            this.$emit('no-choosen', defaultCti);
        } else if (type === 'search' && values.length < 3) {
            const lastOption = options[options.length - 1] || {};
            const defaultCti = lastOption && lastOption.related || {};
            this.$emit('no-choosen', defaultCti);
        } else if (type === 'select' && firstOption.related) {
            this.$emit('no-choosen', firstOption.related);
        } else {
            this.$emit('no-choosen', {});
        }
        this.$emit('change', values, labels, type, this.level, rg);
    }
    reset () {
        this.$nextTick(() => {
            this.$set(this, 'selectOptions', []);
        });
    }
    inputFocus () {
        lxReportClick(CREATE_CTI_CHOOSE['cti_focus']);
        if (this.level === 1 && !this.focusFlag) {
            lxReportClick(CREATE_CTI_CHOOSE['cti_operate_start']);
            this.focusFlag = true;
        }
    }
    droDownUpdate () {
        this.catalogData = this.catalogSelectData;
        this.queryStr = '';
    }
}
</script>

<style lang="scss">
.catalog-level-container {
    width: 100%;
    margin-bottom: 10px;
    .catalog-level-select {
        display: flex;
    }
    .level-title {
        line-height: 34px;
        width: 72px;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        letter-spacing: 0;
    }
    .catalog-level-cascader {
        flex: 1;
        height: 34px;
        line-height: 34px;
        // display: inline-block;
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
    .no-choosen-tip {
        margin-left: 72px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.36);
        letter-spacing: 0;
        line-height: 20px;
    }
}
</style>
