<template>
    <div class="space-detail-catalog-container">
        <div class="detail-catalog__sidebar">
            <div class="slidebar-header">
                <h2>所有目录</h2>
                <span>
                    <mtd-button
                        v-if="isSysAdmin"
                        type="text-primary"
                        @click="bindRg">
                        绑定已有目录
                    </mtd-button>
                    <mtd-button
                        @click="() => addCatalogLevel(1)"
                        type="text-primary">
                        <i class="mtdicon mtdicon-file-add-o" />
                        <span>新建一级目录</span>
                    </mtd-button>
                </span>
            </div>
            <mtd-tree
                :data="treeData"
                :props="{title: 'name'}"
                node-key="key"
                draggable
                :allow-drop="dropHandler"
                @node-drop="dropSuccessHander"
                :load-data="loadData"
                :loaded-keys.sync="loadedKeys"
                :expand-on-click-node="true"
                @toggle-selected="clickHandler"
                :expanded-keys.sync="expandedKeys">
                <div class="tree-item__content" slot-scope="{ node, data }">
                    <span>{{ data.name }} <mtd-tag v-if="data.state === 2" size="small">停用</mtd-tag></span>
                    <span class="tree-item__action">
                        <mtd-icon-button
                            v-if="node.level !== 2"
                            size="small"
                            icon="mtdicon mtdicon-file-add-o"
                            @click.stop="addCatalogLevel(node.level + 2, data, node)" />
                        <mtd-icon-button
                            size="small"
                            icon="mtdicon mtdicon-edit-o"
                            @click.stop="editNode(node, data)" />
                        <!-- 删除 icon 每一个节点都展示，代表可删除 -->
                        <mtd-icon-button
                            size="small"
                            icon="mtdicon mtdicon-delete-o"
                            @click.stop="confirmDeletion(node, data)" />
                    </span>
                </div>
            </mtd-tree>
        </div>
        <div class="detail-catalog__content">
            <Catalog
                ref="catalog"
                :key="keyTimeStamp"
                :no-children="noChildren"
                :edit="editable"
                :level="level"
                :node="node"
                :current-catalog="currentCatalog"
                @updateCatalog="updateCatalogHandler" />
        </div>
        <CatalogModal
            :level="level"
            :show="newCatalog"
            v-bind="parentObj"
            @updateTree="updateTreeHandler" />
        <BindRg
            :show="showBindRg"
            @update="reloadCatalogTree"
            @clodeModal="clodeModalHandler" />
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { findIndex, get, pick } from 'lodash';
import Catalog from '../components/catalog.vue';
import CatalogModal from '../components/catalogModal.vue';
import BindRg from '../components/bindRg.vue';
import * as api from '@/api';

@Component({
    components: {
        Catalog,
        CatalogModal,
        BindRg
    }
})
export default class SpaceDetailCatalog extends Vue {
    treeData: any = [];
    expandedKeys: any = [];
    currentParentNode: any = '';
    node: any = {};
    level: number = 1;
    editable: boolean = false;
    newCatalog: boolean = false;
    catalogData: any = {};
    parentObj: any = {};
    noChildren: boolean = false;
    isSysAdmin: boolean = false;
    showBindRg: boolean = false;
    currentCatalog: any = {};
    loadedKeys: any = [];
    keyTimeStamp: any = (() => {
        return (new Date()).getTime();
    })();

    $refs: { catalog: Catalog };

    get getSpaceId (): number {
        return parseInt(this.$route.params.id, 10);
    }

    created () {
        this.checkIsAdmin();
        this.reloadCatalogTree();
    }

    async dropSuccessHander (dragging, drop) {
        if (dragging.$parent === undefined && drop.$parent === undefined) {
            const parentId = this.getSpaceId;
            const level = 1;
            const ctiIds = this.treeData.map(item => {
                return item.id;
            });
            const params = {
                parentId,
                level,
                ctiIds
            };
            await api.ctiApi.draggableSort([params]);
            this.$mtd.message.success('排序成功');
        } else if (dragging.$parent.key === drop.$parent.key) {
            const parentId = drop.$parent.key;
            const level = drop.$parent.level + 2;
            const ctiIds = drop.$parent.children.map(i => i.key);
            const params = {
                parentId: parentId?.split('-')[0],
                level,
                ctiIds: ctiIds?.map(id => id.split('-')[0])
            };
            await api.ctiApi.draggableSort([params]);
            this.$mtd.message.success('排序成功');
        }
    }

    dropHandler (dragging, drop, type) {
        if (type === 'inner') {
            return false;
        }
        if (dragging.$parent === undefined && drop.$parent === undefined) {
            return true;
        } else if (dragging.$parent.key === drop.$parent.key) {
            return true;
        }
        return false;
    }

    async checkIsAdmin () {
        const res = await api.ctiApi.isAdmin();
        this.isSysAdmin = get(res, ['data', 'sysAdmin']);
    }

    async loadData (node, cb) {
        const { data: { id }, level } = node;
        const list = await this.getChildTreeData(level, id);
        let res = list;
        if (!res.length) {
            this.noChildren = true;
        } else {
            this.noChildren = false;
        }
        if (level === 1) {
            res = list.map(item => {
                item.isLeaf = true;
                return item;
            });
        }
        cb(res);
    }

    async getChildTreeData (level, parentId) {
        let childList;
        if (level === 0) {
            childList = await api.ctiApi.getCatalogLevel2Tree({ parentId });
        } else if (level === 1) {
            childList = await api.ctiApi.getCatalogLevel3Tree({ parentId });
        } else {
            return [];
        }
        return get(childList, ['data', 'items'], []).map(item => {
            return {
                ...item,
                key: `${item.id}-${item.name}`
            };
        });
    }

    bindRg () {
        this.showBindRg = !this.showBindRg;
    }

    async updateCatalogHandler (data, level, node) {
        let fetchStatus: boolean = true;
        const pickList = ['name', 'defaultItemId', 'ticketRelated', 'state', 'rgId', 'templateId', 'templateType', 'mainSpaceVisible'];
        const form = pick(data, pickList);
        let res = null;
        try {
            switch (level) {
                case 1:
                    res = await api.ctiApi.editCategory(data.id, form);
                    break;
                case 2:
                    res = await api.ctiApi.editType(data.id, form);
                    break;
                case 3:
                    res = await api.ctiApi.editItem(data.id, form);
                    break;
            }
        } catch (e) {
            // 400大概率是启用状态没有绑定rg
            fetchStatus = false;
            console.log(e);
        }
        if (fetchStatus) {
            this.$mtd.message.success('保存成功');
            this.editable = false;
            // this.reloadCatalogTree();
            const indexList = this.findTargetNode(node);
            const [parentList, targetNode] = this.getParentChildNode(indexList);
            if (form.state === 1 && targetNode.state !== 1) {
                // 父节点停用变启用
                this.enableParentState(indexList);
            } else if (form.state === 2 && targetNode.state !== 2) {
                // 所有子节点启用变停用
                this.disableChildState(indexList);
            }
            const newData = Object.assign({}, targetNode, form, res.data);
            console.log(newData);
            this.currentCatalog = newData;
            Vue.set(parentList, indexList[indexList.length - 1], newData);
        } else {
            // 子节点 resetForm
            this.$refs.catalog.resetForm();
        }
    }

    disableChildState (list) {
        switch (list.length) {
            case 1: {
                const list1 = this.treeData[list[0]].children;
                for (let i = 0; i < list1.length; i++) {
                    Vue.set(list1, i, Object.assign(list1[i], {
                        state: 2
                    }));
                    const list2 = list1[i].children;
                    if (list2) {
                        for (let j = 0; j < list2.length; j++) {
                            Vue.set(list2, j, Object.assign(list2[j], {
                                state: 2
                            }));
                        }
                    }
                }
                break;
            }
            case 2: {
                const list1 = this.treeData[list[0]].children;
                const list2 = list1[list[1]].children;
                for (let i = 0; i < list2.length; i++) {
                    Vue.set(list2, i, Object.assign(list2[i], {
                        state: 2
                    }));
                }
                break;
            }
            case 3:
                break;
            default:
                break;
        }
    }

    enableParentState (list) {
        switch (list.length) {
            case 1:
                break;
            case 2:
                Vue.set(this.treeData, list[0], Object.assign(this.treeData[list[0]], {
                    state: 1
                }));
                break;
            case 3: {
                Vue.set(this.treeData, list[0], Object.assign(this.treeData[list[0]], {
                    state: 1
                }));
                const middleList = this.treeData[list[0]].children;
                Vue.set(middleList, list[1], Object.assign(middleList[list[1]], {
                    state: 1
                }));
                break;
            }
            default:
                break;
        }
    }

    getParentChildNode (indexList) {
        let list = this.treeData;
        if (indexList.length === 1) {
            return [list, list[indexList[0]]];
        } else {
            let targetNode = null;
            let parentList = null;
            for (let i = 0; i < indexList.length; i++) {
                const index = indexList[i];
                targetNode = list[index];
                list = targetNode.children;
                if (i === indexList.length - 2) {
                    parentList = list;
                }
            }
            return [parentList, targetNode];
        }
    }

    clodeModalHandler () {
        this.showBindRg = !this.showBindRg;
    }

    async confirmDeletion (node, data) {
        this.$mtd.confirm({
            title: '是否确认删除？',
            message: '目录删除后，目录下工单数据无法保留',
            // dangerouslyUseHTMLString: true,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确认删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    const level = node.level;
                    let execDeletion = () => null;

                    if (level === 0) {
                        execDeletion = () => api.ctiApi.deleteCategory({ categoryIds: data.id });
                    } else if (level === 1) {
                        execDeletion = () => api.ctiApi.deleteType(data.id);
                    } else if (level === 2) {
                        execDeletion = () => api.ctiApi.deleteItem(data.id);
                    }

                    await execDeletion();

                    // 获取 parent 节点信息，并执行调用 splice() 方法删除子节点
                    const siblings = node.level === 0 ? this.treeData : (get(node, '$parent.data.children') || []);
                    const deleteIndex = siblings.indexOf(node.data);
                    if (deleteIndex > -1) {
                        // ⚠️ parentNode.data.children 才是响应式的, parentNode.children 并不是
                        siblings.splice(deleteIndex, 1);
                    }

                    this.$mtd.message({
                        message: `删除${node.level + 1}级目录成功`,
                        type: 'success'
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => {
            console.log(e);
        });
    }

    async reloadCatalogTree () {
        this.loadedKeys = [];
        this.expandedKeys = [];
        const res = await api.ctiApi.getCatalogLevel1Tree({
            spaceId: this.getSpaceId
        });
        this.treeData = get(res, ['data', 'items'], []).map(item => {
            return {
                ...item,
                key: `${item.id}-${item.name}`
            };
        });
    }
    editNode (node, data) {
        this.clickHandler(node, data, true);
    }
    async clickHandler (node, data, editable = false) {
        let detail = {};
        if (node.level === 2) {
            const info = await api.ctiApi.getDetailItem(node.data.id, {
                spaceId: this.getSpaceId
            });
            detail = pick(info.data, ['rgId', 'templateId', 'templateType', 'ticketCreateLink']);
        } else {
            const res = await api.ctiApi.getCatalogDetail({
                id: node.data.id,
                level: node.level + 1
            });
            const defaultCti = get(res, ['data', 'defaultCti'], {});
            const level = get(res, ['data', 'level']);
            const ticketRelated = get(res, ['data', 'ticketRelated']);
            const mainSpaceVisible = get(res, ['data', 'mainSpaceVisible']);
            if (level === 1) {
                detail = {
                    defaultCatalog: defaultCti.typeId,
                    defaultLevel3: defaultCti.itemId,
                    ticketRelated,
                    mainSpaceVisible
                };
            } else {
                detail = {
                    defaultCatalog: defaultCti.itemId,
                    ticketRelated
                };
            }
        }
        this.level = node.level + 1;
        this.node = node;
        this.editable = editable;
        this.currentCatalog = { ...node.data, ...detail };
        this.keyTimeStamp = (new Date()).getTime();
    }
    async updateTreeHandler (data, level, id) {
        let res: any = {};
        switch (level) {
            case 1:
                res = await api.ctiApi.addCategory({
                    name: data.name
                }, {
                    spaceId: this.getSpaceId
                });
                break;
            case 2:
                res = await api.ctiApi.addType({
                    name: data.name,
                    parentId: id
                });
                break;
            case 3:
                res = await api.ctiApi.addItem({
                    name: data.name,
                    parentId: id,
                    rgId: data.rgId
                });
                break;
        }
        if (res.code === 200) {
            // this.reloadCatalogTree();
            const newNode = Object.assign({}, res.data, {
                state: res.data.active
            });
            this.addChildrenNodes(newNode, this.currentParentNode);
            this.currentParentNode = null;
            this.toggleModal();
        }
    }
    findTargetNode (node) {
        const id = get(node, ['data', 'id']);
        let pindex = -1;
        let currentNode = node;
        const idLists = [id];
        const indexList = [];
        while (currentNode.$parent) {
            const pid = get(currentNode.$parent, ['data', 'id'], null);
            if (pid) {
                idLists.unshift(pid);
            }
            currentNode = currentNode.$parent;
        }

        let list = this.treeData;
        for (let i = 0; i < idLists.length; i++) {
            pindex = findIndex(list, {
                id: idLists[i]
            });
            if (~pindex) {
                indexList.push(pindex);
                list = list[pindex].children;
                if (!list) {
                    break;
                }
            } else {
                break;
            }
        }
        return indexList;
    }
    addChildrenNodes (newNode, node?) {
        if (!node) {
            return this.treeData.push(newNode);
        }
        const id = get(node, ['data', 'id']);
        let pindex = -1;
        let index = -1;
        let insertNode: any = {};
        if (node.$parent) {
            const parentId = get(node, ['$parent', 'data', 'id']);
            pindex = findIndex(this.treeData, {
                id: parentId
            });
        }
        if (~pindex) {
            newNode = Object.assign(newNode, {
                isLeaf: true
            });
            index = findIndex(this.treeData[pindex].children, {
                id
            });
            insertNode = this.treeData[pindex].children[index];
        } else {
            index = findIndex(this.treeData, {
                id
            });
            insertNode = this.treeData[index];
        }
        if (Array.isArray(insertNode.children)) {
            insertNode.children.push(newNode);
        } else {
            insertNode.children = [newNode];
        }
    }
    addCatalogLevel (level, data?, node?) {
        if (node) {
            this.currentParentNode = node;
        } else {
            this.currentParentNode = null;
        }
        if (data) {
            this.parentObj = data;
        }
        this.level = level;
        this.toggleModal();
    }
    toggleModal () {
        this.newCatalog = !this.newCatalog;
    }
}
</script>
<style lang="postcss" scoped>
.space-detail-catalog-container {
    background: #FFFFFF;
    display: flex;
    flex-direction: row;
    align-items: top;
    justify-content: space-between;
    .detail-catalog__sidebar {
        overflow-y: scroll;
        flex-basis: 360px;
        background-color: #EEEEEE;
        height: 500px;
        padding: 16px;
        margin-top: 16px;
    }
    .detail-catalog__content {
        flex-grow: 1;
        padding: 16px;
    }
    .slidebar-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .tree-item__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .mtd-input-small {
            font-size: 14px;
            margin-top: -3px;
            margin-bottom: -3px;
        }
        >>> .mtdicon {
            color: #0A70F5;
        }
    }
    .mtd-tree-node-content {
        &:hover {
            .tree-item__action {
                visibility: visible;
                opacity: 1;
            }
        }
    }
    .tree-item__action {
        display: inline-flex;
        margin-right: 20px;
        visibility: hidden;
        opacity: 0;
        .mtd-icon-btn {
            width: 20px;
            height: 20px;
            padding: 3px;
            font-size: 14px;
        }
    }
    >>> .mtd-btn-text-primary {
        color: #0A70F5;
    }
}
</style>
