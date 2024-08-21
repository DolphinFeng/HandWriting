<template>
    <div class="space-detail-file-container">
        <mtd-announcement
            title="问题归档功能用于处理方对收到的问题进行归档和分类管理。开启后，系统会在问题流转到已解决、已关闭等状态提示用户进行问题归档。"
            type="info"
            show-icon />
        <div class="open-file-wrapper">
            启用问题归档 <mtd-switch
                v-model="openFile"
                @input="openFileChange"
                size="small" />
        </div>
        <div class="file-tree" v-if="openFile">
            <h3>问题分类</h3>
            <mtd-tree
                :data="data"
                :load-data="loadData"
                node-key="id"
                :expand-on-click-node="false"
                :props="{
                    isLeaf: 'leaf'
                }">
                <template slot-scope="{ node, data }">
                    {{ node.data.name }}
                    <mtd-tag theme="gray" v-if="!node.data.inUse">停用</mtd-tag>
                    <mtd-tooltip
                        theme="dark"
                        content="添加子分类"
                        size="small">
                        <i class="mtdicon mtdicon-file-add-o" @click.stop="addNode(node, data)" />
                    </mtd-tooltip>
                    <mtd-tooltip
                        theme="dark"
                        content="编辑分类"
                        size="small">
                        <i class="mtdicon mtdicon-edit-o" @click.stop="editNode(node, data)" />
                    </mtd-tooltip>
                    <mtd-tooltip
                        theme="dark"
                        :content="node.data.inUse ? `停用分类` : `启用分类`"
                        size="small">
                        <i
                            :class="['mtdicon', {'mtdicon-error-o': node.data.inUse, 'mtdicon-success-o': !node.data.inUse} ]"
                            @click="useStatusChange(node)"
                            v-if="node.data.parentId" />
                    </mtd-tooltip>
                </template>
            </mtd-tree>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import SpaceFileNode from '../components/space-file-node.vue';
import * as api from '@/api';

/**
 * rg问题归档
 *
 * @author liyuyao
 * @date 11/07/2020
 */
@Component({
    components: {
        SpaceFileNode
    }
})
export default class SpaceDetailFile extends Vue {
    openFile: boolean = false;

    // data: any = [{
    //     title: '唐诗',
    //     id: '0',
    // }, {
    //     title: '宋词',
    //     id: '1',
    // }, {
    //     title: '绝句',
    //     id: '2',
    // }];

    data: any = [];

    createDialogVisble: boolean = false;
    editDialogVisble: boolean = false;

    async mounted () {
        this.getSpaceFileSetting();
    }
    async getSpaceFileSetting () {
        const res = await api.spaceApi.getSpaceFileSetting(this.spaceId);
        if (res && res.code === 200) {
            this.openFile = res.data.active;
            const root = res.data.rootNode;
            if (root) this.data = [root];
        }
    }
    async openFileChange (open) {
        const res = await api.spaceApi.spaceFileActive(this.spaceId, open);
        if (res && res.code === 200) {
            this.$mtd.message.success('操作成功');
            const root = res.data.rootNode;
            if (root) this.data = [root];
        }
    }

    async loadData (node, callback) {
        const result = await this.getNodesByParent(node.data.id);
        callback(result);
    }
    async getNodesByParent (parentId: number) {
        const res = await api.spaceApi.getNodesByParent(parentId);
        return res.data.items || [];
    }
    addNode (node, data) {
        const { id } = node.data;
        this.$mtd.confirm({
            title: '添加子分类',
            message: '分类名称：<input id="space-file-add" class="mtd-input" style="width: 280px" />',
            dangerouslyUseHTMLString: true,
            onOk: async () => {
                const inputElement = document.getElementById('space-file-add') as HTMLInputElement;
                const nodeText = inputElement.value;
                if (nodeText.length) {
                    try {
                        const res = await api.spaceApi.addNodes({
                            parentId: id,
                            name: nodeText
                        });
                        if (res && res.code === 200) {
                            const newData = res.data;
                            const newChildren = data.children ? data.children.concat(newData) : newData;
                            // data.children = newChildren;
                            this.$nextTick(() => {
                                this.$set(data, 'children', newChildren);
                                this.$set(data, 'leaf', false);
                            });
                            // this.$set(data, 'children', newChildren);
                            this.$mtd.message.success('操作成功');
                        }
                    } catch (e) {
                        console.log('e', e);
                    }
                }
            }
        }).catch(e => e);
    }
    editNode (node, data) {
        const { id } = node.data;
        this.$mtd.confirm({
            title: '编辑分类名称',
            message: `分类名称：<input id="space-file-edit" class="mtd-input" style="width: 280px" value="${node.data.name}" />`,
            dangerouslyUseHTMLString: true,
            onOk: async () => {
                const inputElement = document.getElementById('space-file-edit') as HTMLInputElement;
                const nodeText = inputElement.value;
                if (nodeText.length && nodeText.length < 200) {
                    const res = await api.spaceApi.updateNodes({
                        id: id,
                        name: nodeText
                    });
                    if (res && res.code === 200) {
                        this.$nextTick(() => {
                            this.$set(data, 'name', nodeText);
                        });
                        this.$mtd.message.success('操作成功');
                    }
                } else {
                    this.$mtd.message.error('分类名称限200字');
                }
            }
        }).catch(e => e);
    }
    useStatusChange (node) {
        const { data } = node;
        this.$mtd.confirm({
            message: `${data.inUse ? '停用' : '启用'}此分类吗？`,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: data.inUse ? '停用' : '启用',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                const res = await api.spaceApi.updateNodes({
                    id: data.id,
                    inUse: !data.inUse
                });
                if (res && res.code === 200) {
                    this.$mtd.message({
                        message: '操作成功',
                        type: 'success'
                    });
                    this.$set(data, 'inUse', !data.inUse);
                }
            }
        }).catch(e => e);
    }
    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }
}
</script>

<style lang="postcss">
.space-detail-file-container {
    padding: 16px 0;
    .open-file-wrapper {
        padding: 16px 0;
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: 0;
        line-height: 22px;
        .mtd-switch {
            vertical-align: middle;
        }
    }
    .file-tree {
        width: 400px;
        padding: 12px 16px;
        background-color: #F7F7F7;
        border-radius: 1px;
        h3 {
            font-family: PingFangSC-Semibold;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.84);
            letter-spacing: 0;
            line-height: 22px;
        }
    }
    .tree-empty-wrapper {
        text-align: center;
        .mtdicon-barschart-o {
            margin-top: 40px;
            display: block;
            font-size: 60px;
            color: rgba(0, 0, 0, 0.24);
        }
        p {
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.36);
            letter-spacing: 0;
            line-height: 22px;
        }
        .create-button {
            margin: 20px 0;
        }
    }
}
#space-file-edit,
#space-file-add {
    height: 32px;
    padding: 0 4px;
    display: inline-block;
}
</style>
