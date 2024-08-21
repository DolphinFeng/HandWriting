<template>
    <div class="dx-member-group-wrapper">
        <div class="header group">大象群成员组</div>
        <mtd-button
            @click="createGroup"
            class="add-member-btn"
            icon="iconfont mtdicon-add"
            type="primary">添加</mtd-button>
        <mtd-table v-loading="tableLoading" :data="groupList">
            <mtd-table-column
                prop="groupName"
                min-width="30%"
                resizable
                label="成员组名称" />
            <mtd-table-column
                prop="description"
                min-width="30%"
                resizable
                label="描述" />
            <pm-table-column-member
                min-width="40%"
                label="群组成员"
                pm-avatar-key="avatar"
                pm-mis-key="mis"
                pm-name-key="name"
                pm-popper-class-name="group-member-popper"
                resizable
                :pm-max="6"
                prop="memberDetails" />
            <pm-table-column-operation
                label="操作"
                prop="operations"
                pm-type="text"
                min-width="15%"
                :pm-operations="operations" />
        </mtd-table>
        <div v-if="total > Math.min(...pageSizes)" class="pagination-container">
            <mtd-pagination
                :total="total"
                show-size-changer
                show-total
                :current-page.sync="currentPage"
                :page-size.sync="limit"
                @change="handleChange" />
        </div>
        <edit-group-modal
            :visible.sync="showModal"
            :data="groupData"
            :rg-id="rgId"
            @success="onSuccess" />
    </div>
</template>

<script lang='ts'>
import { Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import EditGroupModal from './editGroupModal.vue';
@Component({
    components: {
        EditGroupModal
    }
})

export default class DxMemberGroup extends PaginationMixin {
    tableLoading: boolean = false;
    showModal: boolean = false;
    groupList: any[] = [];
    groupData: any = {};
    created () {
        this.getDxGroupList();
    }
    async getDxGroupList () {
        const res = await api.rgApi.getXmGroupList({
            rgId: this.rgId,
            cn: this.currentPage,
            sn: this.limit
        });
        const { data, code } = res;
        if (code === 200 && data) {
            this.groupList = data.rgXmGroupMemberList || [];
            this.total = data.tn;
        }
    }
    createGroup () {
        this.groupData = {};
        this.showModal = true;
    }
    onSuccess () {
        this.showModal = false;
        this.getDxGroupList();
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getDxGroupList();
    }
    async deleteGroup (id, name) {
        const _this = this;
        this.$mtd.confirm({
            title: '确认删除成员组？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确认',
            message: `确认删除成员组“${name}”吗？`,
            onOk: async () => {
                try {
                    await api.rgApi.deleteXmGroup({
                        groupId: id,
                        rgId: this.rgId
                    });
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await _this.getDxGroupList();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }

    get operations () {
        return [{
            label: '编辑',
            action: 'edit',
            click: (action: string, scope: any) => {
                this.groupData = scope.row;
                this.showModal = true;
            }
        }, {
            label: '删除',
            action: 'delete',
            click: (action: string, scope: any) => {
                this.deleteGroup(scope.row.groupId, scope.row.groupName);
            }
        }];
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang='postcss'>
.dx-member-group-wrapper {
    padding-bottom: 50px;
    position: relative;
    .add-member-btn {
        position: absolute;
        top: 0;
        right: 0;
        font-weight: 500;
        font-family: PingFangSC-Medium;
    }
}
.group-member-popper {
    .member-list {
        max-height: 150px;
        overflow: auto;
    }
}
</style>
