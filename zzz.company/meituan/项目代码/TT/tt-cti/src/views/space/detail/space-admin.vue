<template>
    <div class="space-detail-admin-container">
        <div class="button-wrapper">
            <mtd-button
                @click="handleAddUser"
                class="add-user-btn"
                icon="mtdicon mtdicon-add"
                type="primary">添加空间管理员</mtd-button>
        </div>
        <mtd-table v-loading="tableLoading" :data="userList">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                min-width="25%"
                label="成员">
                <template slot-scope="scope">
                    <span>{{ scope.row.displayName }} ({{ scope.row.username }}) <span class="quit-tag" v-if="!scope.row.active">离职</span></span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="30%"
                label="部门"
                prop="orgPath">
                <template slot-scope="scope">
                    <span>{{ formatOrg(scope.row.orgPath) }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="20%"
                label="角色"
                prop="userRole">
                <template slot-scope="scope">
                    {{ userRoleMap[scope.row.userRole] }}
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="20%"
                label="添加时间">
                <template slot-scope="scope">
                    <span>{{ scope.row.createdAt | formatTime }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="5%"
                label="操作">
                <template slot-scope="scope">
                    <mtd-tooltip
                        :disabled="scope.row.deletable"
                        content="此用户有未完成的质检任务，请确认其任务均完成后再进行删除"
                        size="small"
                        placement="top">
                        <span><mtd-button
                            type="text-primary"
                            class="table-link"
                            size="small"
                            :disabled="!scope.row.deletable"
                            @click="handleDeleteRg(scope.row)">删除</mtd-button></span>
                    </mtd-tooltip>
                </template>
            </mtd-table-column>
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
        <add-space-admin
            :visible.sync="addSpaceAdminVisible"
            :id="spaceId"
            @success="getSpaceAdmin" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { SpaceUserRole } from '@/config/map.conf';
import AddSpaceAdmin from '../components/add-space-admin.vue';

/**
 * rg成员列表
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        AddSpaceAdmin
    }
})
export default class SpaceDetailAdmin extends PaginationMixin {
    // @State(state => state.cti.permission.rg_user)
    permission: boolean = true;

    userList: CommonTypes.RgUserItem[] = [];
    addSpaceAdminVisible: Boolean = false;

    userRoleMap: CommonTypes.mapObject = SpaceUserRole;

    tableLoading: Boolean = true;
    $mtd: any;

    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }

    mounted () {
        this.getSpaceAdmin();
    }
    async getSpaceAdmin () {
        this.tableLoading = true;
        try {
            const res = await api.spaceApi.getSpaceAdmin(this.spaceId, {
                cn: this.currentPage,
                sn: this.limit
            });
            const { code, data } = res;
            if (code === 200) {
                this.userList = data.items;
                this.total = data.tn;
                if (this.total > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getSpaceAdmin();
                }
            }
            this.userList = res.data.items;
            this.total = res.data.tn;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
        this.tableLoading = false;
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getSpaceAdmin();
    }
    // 删除rg成员
    handleDeleteRg (row) {
        const _this = this;
        this.$mtd.confirm({
            title: `你是否确认删除管理员：${row.username}？`,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    await api.spaceApi.deleteSpaceAdmin(this.spaceId, row.username);
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await _this.getSpaceAdmin();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    handleAddUser () {
        this.addSpaceAdminVisible = true;
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
}
</script>

<style lang="postcss" scope>
.space-detail-admin-container {
    .button-wrapper {
        padding: 12px 0;
        text-align: right;
    }
    .disabled-text {
        color: rgba(17, 25, 37, 0.3);
        cursor: not-allowed;
    }
    .table-link {
        padding: 0;
    }
    .mtd-table {
        .mtd-btn {
            font-size: 14px;
        }
    }
}
</style>
