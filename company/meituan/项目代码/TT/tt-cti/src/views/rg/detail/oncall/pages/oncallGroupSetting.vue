<template>
    <div class="oncall-group-container">
        <div class="title-wrapper">
            <span>值班组信息</span>
            <mtd-button
                class="tt-pure-btn"
                icon="mtdicon mtdicon-add"
                @click="addOncallGroup"
                type="primary">新增值班组</mtd-button>
        </div>
        <mtd-table :loading="tableLoading" :data="groupList">
            <mtd-table-column
                prop="displayName"
                min-width="30%"
                label="值班组名称" />
            <mtd-table-column
                prop="userInfoList"
                min-width="50%"
                label="值班组成员">
                <template slot-scope="scope">
                    <span>{{ `(${scope.row.userInfoList.length}人)${scope.row.userInfoList.map(item => item.displayName).join('，')}` }}</span>
                </template>
            </mtd-table-column>
            <pm-table-column-operation
                label="操作"
                min-width="20%"
                prop="operations"
                pm-type="text"
                :pm-operations="operations" />
        </mtd-table>
        <add-group-modal
            v-if="showGroupModal"
            :form-data="groupData"
            :type="modalType"
            @success="onAddSuccess"
            :visible.sync="showGroupModal" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AddGroupModal from '../components/modals/addGroupModal.vue';
import * as api from '@/api';

@Component({
    components: {
        AddGroupModal
    }
})
export default class OncallGroupSetting extends Vue {
    groupList: CommonTypes.mapObject[] = [];
    groupData: CommonTypes.mapObject = {};
    modalType: 'add' | 'update' = 'add';
    showGroupModal: boolean = false;
    tableLoading: boolean = false;

    created () {
        this.getGroups();
    }
    async getGroups () {
        this.tableLoading = true;
        try {
            const res = await api.oncallApi.getRgGroups({
                rgId: this.rgId
            });
            const { data, code } = res;
            if (code === 200 && data) {
                this.tableLoading = false;
                this.groupList = data.items || [];
            }
        } catch (e) {
            this.tableLoading = false;
            console.log(e);
        }
    }
    onAddSuccess () {
        this.getGroups();
    }
    addOncallGroup () {
        this.groupData = {};
        this.modalType = 'add';
        this.showGroupModal = true;
    }
    get operations () {
        return [{
            label: '编辑',
            action: 'edit',
            props: {
                class: 'table-link'
            },
            click: (action: string, scope: any) => {
                this.groupData = scope.row;
                this.modalType = 'update';
                this.showGroupModal = true;
            }
        }, {
            label: '删除',
            action: 'delete',
            props: {
                class: 'table-link'
            },
            click: (action: string, scope: any) => {
                this.$mtd.confirm({
                    title: '是否确认删除该值班组？',
                    width: '433px',
                    showCancelButton: true,
                    type: 'warning',
                    className: 'common-modal',
                    okButtonProps: {
                        type: 'danger',
                        class: 'tt-pure-btn'
                    },
                    cancelButtonProps: {
                        class: 'tt-pure-btn'
                    },
                    onOk: async () => {
                        try {
                            const res = await api.oncallApi.deleteRgGroup(scope.row.identify);
                            const { code } = res;
                            if (code === 200) {
                                this.$mtd.message({
                                    message: '删除值班组成功',
                                    type: 'success'
                                });
                                this.getGroups();
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }).catch(e => e);
            }
        }];
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.oncall-group-container {
    .title-wrapper {
        padding: 12px 0;
        text-align: left;
        font-weight: 600;
        font-size: 16px;
        line-height: 32px;
        .mtd-btn {
            float: right;
        }
    }
    .mtd-table {
        .mtd-btn {
            font-size: 14px;
        }
    }
}
</style>
