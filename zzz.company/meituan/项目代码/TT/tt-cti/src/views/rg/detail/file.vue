<template>
    <div class="rg-file-container">
        <mtd-tabs
            v-model="activeName"
            size="large">
            <mtd-tab-pane label="归档内容" value="content">
                <mtd-announcement
                    title="问题归档功能用于处理方对收到的问题进行归档和分类管理。开启后，系统会在问题流转到已解决、已关闭等状态提示用户进行问题归档。"
                    type="info"
                    show-icon />
                <div class="open-file-wrapper">
                    <p>启用问题归档
                        <mtd-switch
                            v-model="openFile"
                            @input="openFileChange"
                            size="small" />
                    </p>
                </div>
                <div class="file-content-wrapper">
                    <div class="file-tree" v-if="openFile">
                        <h3>问题分类
                            <mtd-button
                                size="small"
                                icon="mtdicon mtdicon-download-o"
                                @click="openImportModal"
                                type="text">导入</mtd-button>
                            <mtd-button
                                icon="mtdicon mtdicon-export-o"
                                size="small"
                                @click="createExportTask"
                                type="text">导出</mtd-button></h3>
                        <mtd-tree
                            :data="data"
                            :load-data="loadData"
                            node-key="id"
                            :expand-on-click-node="false"
                            :props="{
                                isLeaf: 'leaf'
                            }"
                            @toggle-selected="clickHandler">
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
                                <mtd-tooltip
                                    theme="dark"
                                    content="删除分类"
                                    size="small">
                                    <i
                                        class="mtdicon mtdicon-delete-o"
                                        @click="confirmDeletion(node)"
                                        v-if="node.data.parentId && node.data.leaf" />
                                </mtd-tooltip>
                            </template>
                        </mtd-tree>
                    </div>
                    <rg-file-edit
                        ref="fileEdit"
                        @update="updateTree"
                        :node="node"
                        :show-edit="showEdit" />
                </div>
            </mtd-tab-pane>
            <mtd-tab-pane label="设置" value="setting">
                <mtd-announcement
                    title="为保证设置内容生效，请确认当前有可选的归档内容"
                    type="info"
                    show-icon />
                <div class="setting-file-wrapper">
                    <p>RG成员处理工单时，问题归档必填
                        <mtd-switch
                            v-model="archiveRequire"
                            @input="archiveRequireChange"
                            size="small" />
                    </p>
                    <p>归档时必须选择至最末级
                        <mtd-switch
                            v-model="archiveRequireEnd"
                            @input="archiveLastLevelChange"
                            size="small" />
                    </p>
                </div>
            </mtd-tab-pane>

        </mtd-tabs>
        <import-archive-modal
            v-if="showImportModal"
            :visible.sync="showImportModal" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TreeNodeDialog from './components/tree-node-dialog.vue';
import RgFileEdit from './fileEdit.vue';
import * as api from '@/api';
import ImportArchiveModal from './components/import-archive-modal.vue';
/**
 * rg问题归档
 *
 * @author liyuyao
 * @date 11/07/2020
 */
@Component({
    components: {
        TreeNodeDialog,
        RgFileEdit,
        ImportArchiveModal
    }
})
export default class RgFile extends Vue {
    openFile: boolean = false;
    fileRequired: boolean = false;
    archiveRequire: boolean = false;
    showImportModal: boolean = false;

    data: any = [];

    createDialogVisble: boolean = false;
    editDialogVisble: boolean = false;
    // 当前选中节点
    node: any = {
        ruleId: -1,
        depth: -1,
        itemId: 0,
        nodeName: '',
        inUse: false
    };
    $refs: { fileEdit: RgFileEdit };
    showEdit: boolean = false;
    checkNode: any = null;
    activeName: string = 'content';
    archiveRequireEnd: boolean = false;

    async mounted () {
        this.getRgFileSetting();
    }
    async getRgFileSetting () {
        const res = await api.ctiApi.getRgFileSetting(this.rgId);
        if (res && res.code === 200) {
            this.openFile = res.data.active;
            this.archiveRequire = res.data.archiveRequire;
            this.archiveRequireEnd = res.data.archiveRequireEnd;
            const root = res.data.rootNode;
            if (root) this.data = [root];
        }
    }
    async openFileChange (open) {
        this.showEdit = open && (this.node.ruleId !== -1);
        if (!open) {
            this.$refs.fileEdit.resetForm();
            this.node.ruleId = -1;
        }
        const res = await api.ctiApi.fileActive(this.rgId, open);
        if (res && res.code === 200) {
            this.$mtd.message.success('操作成功');
            const root = res.data.rootNode;
            if (root) this.data = [root];
        }
    }
    async archiveLastLevelChange () {
        const res = await api.ctiApi.setArchiveRequireEnd(this.rgId, this.archiveRequireEnd);
        if (res && res.code === 200) {
            this.$mtd.message.success('操作成功');
        }
    }
    async archiveRequireChange () {
        const res = await api.ctiApi.setArchiveSetting(this.rgId, this.archiveRequire);
        if (res && res.code === 200) {
            this.$mtd.message.success('操作成功');
        }
    }

    async loadData (node, callback) {
        const result = await this.getNodesByParent(node.data.id);
        callback(result);
    }
    async getNodesByParent (parentId: number) {
        const res = await api.ctiApi.getNodesByParent(parentId);
        return res.data.items || [];
    }
    openImportModal () {
        this.showImportModal = true;
    }
    async createExportTask () {
        const res = await api.ctiApi.exportArchive(this.rgId);
        const { data, code } = res;
        if (code === 200 && data) {
            this.$mtd.message.success(data);
        }
    }
    updateTree (id: number) {
        id && this.$set(this.checkNode.data, 'ruleId', id);
    }
    addNode (node, data) {
        const { id } = node.data;
        this.$mtd.confirm({
            title: '添加子分类',
            message: '分类名称：<input id="file-add-node" class="mtd-input" style="width: 280px" />',
            dangerouslyUseHTMLString: true,
            onOk: async () => {
                const inputElement = document.getElementById('file-add-node') as HTMLInputElement;
                const nodeText = inputElement.value;
                if (nodeText.length) {
                    try {
                        const res = await api.ctiApi.addNodes({
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
            message: `分类名称：<input id="file-edit-node" class="mtd-input" style="width: 280px" value="${node.data.name}" />`,
            dangerouslyUseHTMLString: true,
            onOk: async () => {
                const inputElement = document.getElementById('file-edit-node') as HTMLInputElement;
                const nodeText = inputElement.value;
                if (nodeText.length && nodeText.length < 200) {
                    const res = await api.ctiApi.updateNodes({
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
                const res = await api.ctiApi.updateNodes({
                    id: data.id,
                    inUse: !data.inUse
                });
                if (res && res.code === 200) {
                    this.$mtd.message({
                        message: '操作成功',
                        type: 'success'
                    });
                    if (data.id === this.node.itemId) {
                        this.node.inUse = !data.inUse;
                    }
                    this.$set(data, 'inUse', !data.inUse);
                }
            }
        }).catch(e => e);
    }
    confirmDeletion (node) {
        const { data } = node;
        this.$mtd.confirm({
            message: '<p>删除后历史数据无法保留 <br><br> 删除后，当前问题归档下存在的历史工单将处于“未分类”状态，是否确认删除？</p>',
            dangerouslyUseHTMLString: true,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确认',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                const res: any = await api.ctiApi.deleteArchiveNode({ id: data.id });
                if (res && res.code === 200) {
                    this.$mtd.message({
                        message: '操作成功',
                        type: 'success'
                    });

                    // 获取 parent 节点信息，并更新 parent 节点的 { children, leaf } 和属性
                    const parentNode = node.$parent;
                    const res = await api.ctiApi.getArchiveTreeByParent(parentNode.data.id);
                    const resData = res.data;

                    this.$set(parentNode.data, 'children', resData.children);
                    this.$set(parentNode.data, 'leaf', resData.leaf);
                }
            }
        }).catch(async (e) => {
            // 点击取消按钮会执行到这里（为啥要把取消按钮当成 error 来 catch 😒
            console.log(e);
        });
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    async clickHandler (node) {
        this.$refs.fileEdit.resetForm();
        this.checkNode = node;
        this.node = {
            itemId: node.data.id,
            depth: node.data.depth,
            ruleId: node.data.ruleId || 0,
            nodeName: node.data.name,
            inUse: node.data.inUse
        };
        this.showEdit = !!node.level;
    }
}
</script>

<style lang="postcss">
.rg-file-container {
    padding: 16px 0;
    .open-file-wrapper,
    .setting-file-wrapper {
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: 0;
        line-height: 22px;
        margin-top: 16px;
        .mtd-switch {
            vertical-align: middle;
        }
        p {
            margin-bottom: 16px;
        }
    }
    .file-content-wrapper {
        display: flex;
    }
    .file-tree {
        flex: 0 0 400px;
        width: 400px;
        padding: 12px 16px;
        background-color: #F7F7F7;
        border-radius: 1px;
        height: 100%;
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
#file-edit-node,
#file-add-node {
    height: 32px;
    padding: 0 4px;
    display: inline-block;
}
</style>
