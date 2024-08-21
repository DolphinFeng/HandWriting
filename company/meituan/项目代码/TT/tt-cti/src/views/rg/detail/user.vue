<template>
    <div class="rg-user-container">
        <div class="plan-switch">
            <mtd-tabs
                v-model="userType">
                <mtd-tab-pane label="管理员" value="RGADMIN" />
                <mtd-tab-pane label="普通成员" value="NORMAL" />
                <mtd-tab-pane label="协作成员" value="ASSIST" />
            </mtd-tabs>
        </div>
        <mtd-announcement
            class="user-role-state"
            :title="userRoleState[userType]"
            type="info" />
        <person-table
            :rg-id="rgId"
            :user-type="userType" />
        <organization-table
            v-if="userType === 'ASSIST'"
            :rg-id="rgId"
            :user-type="userType" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { PaginationMixin } from '@/utils/mixin';
import { UserRole, UserRoleArr, UserRoleState } from '@/config/map.conf';
import { State } from 'vuex-class';
import AddRgUser from './components/add-rg-user.vue';
import PersonTable from './components/user-person-table.vue';
import OrganizationTable from './components/user-organization-table.vue';

/**
 * rg成员列表
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        AddRgUser,
        PersonTable,
        OrganizationTable
    }
})
export default class RgUser extends PaginationMixin {
    @State(state => state.cti.permission.rg_user)
    permission: boolean;

    userList: CommonTypes.RgUserItem[] = [];
    addUserVisible: Boolean = false;
    rgId: number = 0;
    userRole: CommonTypes.mapObject = UserRole;
    userRoleArr: any[] = UserRoleArr;
    tableLoading: Boolean = true;
    $mtd: any;
    userType: string = 'RGADMIN';
    userRoleState: any = UserRoleState;

    created () {
        this.rgId = parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.rg-user-container {
    position: relative;
    margin-top: 8px;
    /* .add-user-btn { */
    /* position: absolute; */
    /* top: -49px; */
    /* right: 0; */
    /* z-index: 999; */
    /* } */
    .rg-user-person {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 8px;
        border-left: 3px solid #FFC300;
        padding-left: 8px;
        .rg-user-person-title {
            font-weight: 600;
        }
    }
    .isAdmin {
        position: relative;
        padding-left: 12px;
        &::before {
            position: absolute;
            content: '';
            width: 8px;
            height: 8px;
            background: #FF8800;
            border-radius: 50%;
            left: 0;
            top: 6px;
        }
        .origin-change-role {
            width: 62px;
            .mtd-input-wrapper {
                height: 22px;
            }
        }
    }
    .table-link {
        padding: 0;
        min-width: 0;
        height: 14px;
        &:hover {
            background: none;
        }
    }
    .pagination-container {
        padding: 24px 0;
        margin: 0;
    }
}
</style>
