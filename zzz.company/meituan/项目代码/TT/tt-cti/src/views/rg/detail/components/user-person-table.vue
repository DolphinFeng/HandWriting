<template>
    <div>
        <div class="rg-user-person">
            <h2 class="rg-user-person-title">个人</h2>
            <mtd-button
                v-lxay
                @click="handleAddUser"
                class="add-user-btn"
                icon="mtdicon mtdicon-add"
                lxay-act="moduleClick"
                lxay-bid="b_onecloud_bpowh0u0_mc"
                :disabled="!permission"
                type="primary">添加个人</mtd-button>
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
                    <span>{{ scope.row.displayName }} ({{ scope.row.identify }}) <span class="quit-tag" v-if="!scope.row.active">离职</span></span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="30%"
                label="部门">
                <template slot-scope="scope">
                    <span>{{ setDept(scope.row.bgName, scope.row.buName, scope.row.orgName) }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="20%"
                label="角色">
                <template slot-scope="scope">
                    <span :class="{ isAdmin: scope.row.role === 'RGADMIN' }">
                        <mtd-select
                            v-if="permission"
                            v-model="scope.row.role"
                            @change="changeUserRole(scope.row.id, scope.row.role)"
                            class="origin-change-role">
                            <mtd-option
                                v-for="item in userRoleArr"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value" />
                        </mtd-select>
                        <span v-else>{{ userRole[scope.row.role] }}</span>
                    </span>
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
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        :disabled="!permission"
                        @click="handleDeleteRg(scope.row.id)">删除</mtd-button>
                </template>
            </mtd-table-column>
        </mtd-table>
        <!-- v-if="total > Math.min(...pageSizes)" -->
        <div class="pagination-container">
            <mtd-pagination
                :total="total"
                show-total
                :show-size-changer="userType !== 'ASSIST'"
                :current-page.sync="currentPage"
                :page-size.sync="limit"
                @change="handleChange" />
        </div>
        <add-rg-user
            v-if="addUserVisible"
            :visible.sync="addUserVisible"
            :id="rgId"
            :user-type="userType"
            @success="getRgUser" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import { UserRole, UserRoleArr } from '@/config/map.conf';
import { State } from 'vuex-class';
import AddRgUser from './add-rg-user.vue';

/**
 * rg成员个人列表
 *
 * @author wb_zahnghongwei
 * @date 07/15/2021
 */
@Component({
    components: {
        AddRgUser
    }
})
export default class UserPersonTable extends PaginationMixin {
    @State(state => state.cti.permission.rg_user)
    permission: boolean;

    @Prop()
    rgId: number;
    @Prop({ default: '' })
    userType: string;

    limit: number = 5;
    userList: CommonTypes.RgUserItem[] = [];
    addUserVisible: Boolean = false;
    userRole: CommonTypes.mapObject = UserRole;
    userRoleArr: any[] = UserRoleArr;
    tableLoading: Boolean = true;
    $mtd: any;

    @Watch('userType', { immediate: true })
    onUserType () {
        // 切换外部tab，表格页数需要重置
        this.currentPage = 1;
        this.getRgUser();
    }

    async getRgUser () {
        this.tableLoading = true;
        try {
            const res = await api.rgApi.getRgUser({
                cn: this.currentPage,
                sn: this.limit,
                rgId: this.rgId,
                roles: this.userType
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
                    this.getRgUser();
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
        this.getRgUser();
    }
    // 删除rg成员
    handleDeleteRg (id: number) {
        const _this = this;
        this.$mtd.confirm({
            title: '你是否确认删除该 RG 成员？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    await api.rgApi.deleteRgUser(id);
                    this.$mtd.message({
                        message: '删除成功',
                        type: 'success'
                    });
                    await _this.getRgUser();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    handleAddUser () {
        this.addUserVisible = true;
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
    async changeUserRole (id: number, role: string) {
        try {
            const res = await api.rgApi.updateRgUser(id, role);
            const { code } = res;
            if (code === 200) {
                this.$mtd.message({
                    message: '修改成功',
                    type: 'success'
                });
                this.getRgUser();
            }
        } catch (e) {
            this.getRgUser();
            console.log(e);
        }
    }
}
</script>
<style lang="postcss">
    .origin-change-role {
        width: 75px;
        .mtd-input-wrapper.mtd-input-suffix .mtd-input {
            border: none;
            padding: 0 16px 0 0;
            background: none;
        }
        .mtd-input-wrapper {
            height: 16px;
        }
        .mtd-input-suffix-inner {
            width: 16px;
            display: none;
        }
        &.mtd-select-disabled .mtd-input-disabled {
            cursor: auto !important;
            input {
                cursor: auto !important;
            }
        }
    }
    .mtd-table-row:hover {
        .mtd-input-suffix-inner {
            line-height: 16px;
            display: block;
        }
    }
    .user-role-state {
        margin: 8px 0;
    }
</style>
