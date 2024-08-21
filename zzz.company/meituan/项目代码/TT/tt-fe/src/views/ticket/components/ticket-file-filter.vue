<template>
    <div v-if="expand" class="ticket-file-filter-wrapper">
        <h3>{{ $getText('ticket_file_filter_problem_category', '问题分类') }} <i class="iconfont icon-close1" @click="foldFilter" /></h3>
        <tree-select
            :data="treeData"
            :only-use="false"
            @nodeClick="chooseNode" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import TreeSelect from './tree-select.vue';
import * as api from '@/api';
/**
 * 归档
 *
 * @author liyuyao
 * @date 06/30/2020
 */
@Component({
    components: {
        TreeSelect
    }
})
export default class TicketFileFilter extends Vue {
    @Prop({ default: 0 })
    rgId: Number;

    @Prop({ default: false })
    expand: Boolean;

    treeData: CommonTypes.fileNode[] = [];
    // openFile: boolean = false;

    get ticketId () {
        return this.$route.query.id;
    }

    @Watch('rgId', { immediate: true })
    getAboutOnes (rgId) {
        this.$emit('update:expand', false);
        this.$emit('show-expand', false);
        rgId && this.getRgFileSetting(rgId);
    }

    // NOTE: 获取根结点，并硬编码拼接上 “未分类” 类别
    async getRgFileSetting (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgFileSetting(rgId);
        if (res && res.code === 200) {
            let rootNode = res.data.rootNode;
            const unclassifiedNode = {
                id: 0,
                inUse: true,
                leaf: true,
                name: this.$getText('ticket_file_filter_unclassified', '未分类')
            };
            if (rootNode) {
                this.treeData = [rootNode, unclassifiedNode];
            }
            this.$emit('show-expand', res.data.active);
        }
    }
    async loadData (node, callback) {
        let result = await this.getNodesByParent(node.data.id);
        callback(result);
    }
    async getNodesByParent (parentId: number) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getNodesByParent(parentId);
        return res.data.items || [];
    }
    async chooseNode (data) {
        this.$emit('change', data);
    }
    foldFilter () {
        this.$emit('update:expand', false);
    }
}
</script>
<style lang="scss" scoped>
.ticket-file-filter-wrapper {
    margin-right: 12px;
    padding: 8px 12px;
    width: 200px;
    // min-width: 200px;
    background: #fff;
}
.icon-close1 {
    float: right;
    cursor: pointer;
}
</style>