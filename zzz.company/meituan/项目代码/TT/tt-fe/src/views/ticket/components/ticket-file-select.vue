<template>
    <!-- 打开 “问题归档” 功能 -->
    <span v-if="openFile">
        <slot name="label" />
        <mtd-cascader
            :title="fullName"
            :disabled="!rgPermissionMap.archive"
            :data="cascaderData"
            :placeholder="$getText('ticket_file_select_placeholder', '未分类')"
            v-model="cascaderVal"
            expand-trigger="hover"
            filterable
            remote
            clearable
            :change-on-select="!rgPermissionMap.archiveRequireEnd"
            :style="`width: ${width}px`"
            :remote-method="searchNodesByKw"
            :formatter="labelFormatter"
            :visible="popperVisible"
            :size="size"
            :loading="searching"
            :popper-class="`${popperClass}`"
            @change="handleCascaderValChange"
            @update:visible="setPopperVisible" />
        <div class="recommend-archive-wrapper" v-if="showRecommend && rgPermissionMap.archive && recommendList.length">
            <div class="title">{{ $getText('ticket_file_select_recommend_archive', '推荐归档：') }}</div>
            <div
                v-for="(item, index) in recommendList"
                :key="item.id">
                <mtd-tooltip
                    :content="item.fullName"
                    :disabled="!item.showToolTip"
                    placement="top">
                    <div
                        class="recommend-item"
                        @click="handleItemClick(item, index)">
                        <span>{{ item.displayName }}</span>
                        <i class="mtdicon-check" v-show="item.checked || false" /></div>
                </mtd-tooltip>
            </div>
        </div>
    </span>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as api from '@/api';

interface CascaderOption {
    value: number;
    label: string;
    disabled?: boolean;
    isLeaf: boolean;
    children?: Array<CascaderOption>;
}

const mapNodeToCascaderOpt = (node) => {
    return {
        value: node.id,
        label: node.name,
        isLeaf: node.leaf
    };
};

/**
 * 把后端返回的节点树数据，转换成 Cascader 组件需要的格式
 */
const normalizeArchiveTree = (rawNode) => {
    const { id, name, leaf, children } = rawNode;
    if (!leaf && children && (children.length > 0)) {
        return {
            value: id,
            label: name,
            children: children.map(normalizeArchiveTree),
            isLeaf: false
        };
    } else {
        return { value: id, label: name, isLeaf: true };
    }
};

/**
 * 归档
 *
 * @author liyuyao
 * @date 06/30/2020
 */
@Component({})
export default class TicketFileSelect extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Prop()
    width: number;

    @Prop({ default: '' })
    size: string;

    @Prop({ default: true })
    showRecommend: boolean;

    @Prop({ default: '' })
    popperClass: string;

    @Getter rgPermissionMap;

    rootNodeOption: CascaderOption;
    treeData: CascaderOption;
    cascaderData: Array<CascaderOption> = [];
    openFile: boolean = false;
    fullName: string = '';
    recommendList: any = [];
    queryValue: string = '';
    searching: boolean = false;

    popperVisible: boolean = false;
    setPopperVisible (toggle) {
        this.popperVisible = toggle;
    }

    // 级联选项组件的数值
    cascaderVal = [];

    @Watch('info.rgId', { immediate: true })
    watchRgId (rgId) {
        rgId && this.getRgFileSetting(rgId);
    }

    @Watch('info.archiveFullName', { immediate: true })
    watchArchiveFullName (archiveFullName) {
        this.fullName = archiveFullName;
    }

    @Watch('info.archiveId', { immediate: true })
    watchArchiveId (archiveId) {
        this.cascaderVal = [archiveId];
    }

    hidePopper () {
        this.popperVisible = false;
    }

    handleCascaderValChange (val, selectedOptions) {
        this.recommendList = this.recommendList.map(ele => {
            ele.checked = false;
            return ele;
        });
        if (val.length === 0) {
            // 点击 clear 重置
            this.$emit('change', { id: 0, fullName: '未分类' });
            this.cascaderData = [this.treeData];
            this.$nextTick(() => {
                this.hidePopper();
            });
            return;
        }
        const archiveId = val[val.length - 1];
        this.$emit('change', {
            id: archiveId,
            fullName: selectedOptions.map(item => item.label).join('/')
        });
        this.hidePopper();
    }

    labelFormatter (labels, _, value) {
        // 初始化时，展示预填的 fullName
        if (value[0] === this.info.archiveId) {
            return this.info.archiveFullName;
        }

        // 其他情况下，按默认规则展示
        return labels.join('/');
    }
    handleItemClick (item, index) {
        this.recommendList = this.recommendList.map((ele, i) => {
            if (i === index) {
                this.cascaderVal = ele.checked ? [] : item.pathId.split('-').map(item => Number(item));
                this.fullName = ele.checked ? '' : item.fullName;
                ele.checked = !ele.checked;
            } else {
                ele.checked = false;
            }
            return ele;
        });
        this.$emit('change', {
            id: item.id,
            fullName: item.fullName
        });
    }

    // 初始化查询该问题所属的 RG 组是否开启了问题归档开关，如果有，返回分类树
    async getRgFileSetting (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgFileSetting(rgId);
        if (res && res.code === 200) {
            const active = res.data.active;
            this.openFile = active;

            if (!active) {
                return;
            }

            const { rootNode } = res.data;
            const rootNodeOption = mapNodeToCascaderOpt(rootNode);
            this.rootNodeOption = rootNodeOption;

            const parentId = rootNode.id;
            const treeData = await this.loadTree(parentId);

            if (this.showRecommend) this.getRecommendArchive();
            this.treeData = treeData;
            this.cascaderData = [treeData];
        }
    }

    async loadTree (parentId: number) {
        const res = await api.ctiApi.getArchiveTreeByParent(parentId);
        const rawNode = res.data;
        return normalizeArchiveTree(rawNode);
    }

    async loadData (node, callback) {
        const parentId = node.value;
        let result = await this.getNodesByParent(parentId);
        const options = result.map(mapNodeToCascaderOpt);
        callback(options);
    }
    async getNodesByParent (parentId: number) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getNodesByParent(parentId);
        return res.data.items || [];
    }
    hideExtraContent (content: string[], maxLength: number) {
        // 多层数组总字数超过maxLength时，优先展示最小层级的内容，其他层级隐藏
        let hasEllipsis: boolean = false;
        let lengthList = content.map(item => item.length).reverse();
        switch (content.length) {
            case 1:
                // 一层直接展示
                break;
            case 2:
                const isOverflow = (content[0].length + content[1].length) >= maxLength;
                if (isOverflow) {
                    content[0] = '...';
                    hasEllipsis = true;
                }
                break;
            default:
                // 从尾开始，逐个累加，加上后超过maxLength则替换为...，并修改lengthList
                const sum = lengthList.reduce((pre, cur, curIndex) => {
                    if (pre + cur >= maxLength && curIndex !== 0) {
                        content[content.length - curIndex] = '...';
                        lengthList[curIndex] = 1;
                        hasEllipsis = true;
                        return pre + 1;
                    }
                    return (pre + cur);
                });
                if (sum >= maxLength) {
                    content[0] = '...';
                    hasEllipsis = true;
                }
                break;
        }
        return { content, hasEllipsis };
    }
    async getRecommendArchive () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getRecommendArchive(this.info.id);
        if (res.data?.items?.length) {
            this.recommendList = res.data.items.map((item) => {
                const { content, hasEllipsis } = this.hideExtraContent(item.fullName.split('/'), 20);
                item.displayName = `${item.sequence}. ${content.join('/')}`;
                item.showToolTip = hasEllipsis;
                return item;
            }) || [];
        }
    }

    async searchNodesByKw (query: string) {
        // 如果 query 输入为空，把选项列表重置为默认值
        this.queryValue = query;
        this.$emit('search', this.queryValue);
        if (query === '') {
            this.cascaderData = [this.treeData];
            this.fullName = this.info.archiveFullName;
            return;
        }
        this.searching = true;

        const rootNodeId = this.rootNodeOption.value;
        const res = await api.ctiApi.searchNodesByKw(rootNodeId, query, this.rgPermissionMap?.archiveRequireEnd || false);
        interface ResponseItem {
            fullName: string;
            id: number;
            leaf: boolean;
            name: string;
            pathList: number[];
        }

        const items: Array<ResponseItem> = res.data.items;
        // 返回成组件需要的结构
        // 需要把扁平结构的搜索结果，构造成层级结构的
        const result: Array<CascaderOption> = items.map(item => {
            return {
                value: item.id,
                label: item.fullName,
                isLeaf: true
            };
        });

        this.cascaderData = result;
        this.searching = false;
    }
}
</script>
<style lang="scss" scoped>
.icon-qianxun {
    font-size: 12px;
    margin-right: 4px;
}
.mtd-btn-text {
    color: rgba(0, 0, 0, 0.84);
}
.recommend-archive-wrapper {
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: -14px;
    .title {
        margin-bottom: 2px;
    }
    .recommend-item {
        cursor: pointer;
        position: relative;
        line-height: 20px;
        &:hover {
            color: #f80;
            font-family: PingFangSC-Medium;
        }
        .mtdicon-check {
            line-height: 20px;
            position: absolute;
            right: 0;
        }
    }
}
</style>
