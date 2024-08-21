<template>
    <div class="space-inspection-admin-container">
        <div v-for="table in tableList " :key="table.key">
            <div class="title-wrapper">
                <span>{{ table.label }}</span>
                <span class="hint">{{ table.hint }}</span>
                <mtd-button
                    @click="handleAddUser(table.key)"
                    class="add-user-btn"
                    icon="mtdicon mtdicon-add"
                    type="primary">添加</mtd-button>
            </div>
            <mtd-table :data="userMap[table.key]">
                <div slot="empty">
                    <i class="iconfont icon-hulk-zanwushuju" />
                    <p class="no-data">暂无数据</p>
                </div>
                <mtd-table-column
                    min-width="25%"
                    label="成员">
                    <template slot-scope="scope">
                        <span>{{ scope.row.displayName || scope.row.name }} ({{ scope.row.name }})</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="40%"
                    label="部门"
                    show-overflow-tooltip
                    prop="orgPath">
                    <template slot-scope="scope">
                        <span>{{ `${scope.row.bgName}/${scope.row.buName}/${scope.row.orgName}` }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="20%"
                    label="角色类型"
                    prop="userRole">
                    <template slot-scope="scope">
                        {{ userRoleMap[scope.row.role] }}
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="15%"
                    label="操作">
                    <template slot-scope="scope">
                        <mtd-tooltip
                            :disabled="scope.row.deletable"
                            content="此质检员有未完成的质检任务，请确认其任务均完成后再进行删除"
                            size="small"
                            placement="top">
                            <span><mtd-button
                                type="text-primary"
                                size="small"
                                :disabled="!scope.row.deletable"
                                @click="deleteMember(scope.row)">删除</mtd-button></span>
                        </mtd-tooltip>
                    </template>
                </mtd-table-column>
            </mtd-table>
        </div>
        <add-admin-modal
            :visible.sync="addSpaceAdminVisible"
            :id="spaceId"
            :type="modalType"
            @success="updateMembers" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import * as api from '@/api';
import { SpaceInspectionUserRole, InspectionMemberTable } from '@/config/map.conf';
import AddAdminModal from './addAdminModal.vue';

@Component({
    components: {
        AddAdminModal
    }
})
export default class SpaceInspectionAdmin extends Vue {
    $mtd: any;
    modalType: 'admin' | 'inspector' = 'admin';
    addSpaceAdminVisible: boolean = false;
    userRoleMap: CommonTypes.mapObject = SpaceInspectionUserRole;
    tableList: CommonTypes.mapObject [] = InspectionMemberTable;
    userMap: CommonTypes.mapObject = {
        admin: [],
        inspector: []
    };

    created () {
        this.getMembers();
    }
    async getMembers (role?: string) {
        const res = await api.inspectApi.getInspector({ objectId: this.spaceId, role: role ? [role] : [] });
        const { code, data } = res;
        if (code === 200) {
            if (role) {
                this.userMap[role.toLowerCase()] = data[role.toLowerCase()] || [];
            } else {
                this.userMap.admin = data.admin || [];
                this.userMap.inspector = data.inspector || [];
            }
        }
    }
    updateMembers () {
        if (this.modalType === 'admin') {
            this.getMembers('ADMIN');
        } else {
            this.getMembers('INSPECTOR');
        }
    }
    deleteMember (row) {
        const _this = this;
        this.$mtd.confirm({
            title: `是否确认删除：${row.name}？`,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    await api.inspectApi.deleteInspector({
                        nameList: [row.name],
                        role: row.role,
                        objectId: this.spaceId
                    });
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await _this.getMembers(row.role);
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    handleAddUser (type: 'admin' | 'inspector') {
        this.addSpaceAdminVisible = true;
        this.modalType = type;
    }
    // 设置成员组织架构信息
    setDept (bg: string, bu: string, org: string) {
        let dept: string = '';
        if (bg) {
            dept += `${bg}/`;
        }
        if (bu) {
            dept += `${bu}/`;
        }
        if (org) {
            dept += `${org}`;
        }
        return dept;
    }
    formatOrg (org) {
        const orgArr = org && org.split('-') || [];
        if (orgArr[0] === 'IPH') {
            orgArr.shift();
        }
        return orgArr.join('/');
    }
    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }
}
</script>

<style lang="postcss" scope>
.space-inspection-admin-container {
    .title-wrapper {
        padding: 16px 0;
        text-align: left;
        font-weight: 600;
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        .mtd-btn {
            float: right;
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 14px;
        }
        .hint {
            font-size: 12px;
            font-weight: 400;
            font-family: PingFangSC-Regular;
            color: rgba(0, 0, 0, 0.35);
            margin-left: 5px;
        }
    }
    .disabled-text {
        color: rgba(17, 25, 37, 0.3);
        cursor: not-allowed;
    }
    .link {
        padding: 0;
    }
    .mtd-table {
        margin-bottom: 20px;
        .mtd-btn {
            font-size: 14px;
        }
    }
}
</style>
