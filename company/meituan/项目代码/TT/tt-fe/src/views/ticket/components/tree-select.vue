<template>
    <mtd-tree
        :data="data"
        :load-data="loadData"
        :props="{
            isLeaf: 'leaf'
        }"
        node-key="id"
        :expand-on-click-node="false"
        @node-click="emitClick">
        <template slot-scope="{ node }">
            {{ node.data.name }}
            <mtd-tag theme="gray" v-if="!node.data.inUse">{{ $getText('tree_select_tag_stop', '停用') }}</mtd-tag>
        </template>
    </mtd-tree>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import * as api from '@/api';
/**
 * 归档
 *
 * @author liyuyao
 * @date 06/30/2020
 */
@Component
export default class TreeSelect extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Prop()
    data: CommonTypes.fileNode[];

    @Prop({ default: false })
    onlyUse: boolean;

    async loadData (node, callback) {
        let result = await this.getNodesByParent(node.data.id);
        if (this.onlyUse) {
            result = result.filter(item => item.inUse);
        }
        callback(result);
    }
    async getNodesByParent (parentId: number) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getNodesByParent(parentId);
        return res.data.items || [];
    }
    emitClick (node) {
        this.$emit('nodeClick', node.data);
    }
}
</script>
