<template>
    <div class="common-table-list">
        <div class="header group">大象群聊机器人配置</div>
        <mtd-button
            @click="createGroup"
            class="add-btn"
            icon="iconfont mtdicon-add"
            type="primary">新增群配置</mtd-button>
        <mtd-table v-loading="tableLoading" :data="settingList">
            <mtd-table-column
                prop="dxGroupName"
                resizable
                label="大象群名称" />
            <mtd-table-column
                prop="listenerRangeType"
                resizable
                label="TT生成范围">
                <template slot-scope="scope">
                    {{ scope.row.listenerRangeType === 'multiPre' ? '多条消息' : '单条消息' }}
                </template>
            </mtd-table-column>
            <pm-table-column-member
                label="创建人"
                pm-avatar-key="avatarUrl"
                pm-mis-key="creatorMis"
                pm-name-key="userName"
                resizable
                prop="creator" />
            <pm-table-column-date
                label="创建时间"
                prop="gmtCreate"
                show-overflow-tooltip
                pm-formatter="YYYY-MM-DD HH:mm" />
            <pm-table-column-operation
                label="操作"
                prop="operations"
                pm-type="text"
                :pm-operations="operations" />
        </mtd-table>
        <edit-group-robot-modal
            v-if="showModal"
            :visible.sync="showModal"
            :data="data"
            :rg-id="rgId"
            @success="onSuccess" />
        <add-robot-guide-modal
            :group-id="groupId"
            :visible.sync="showGuideModal" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EditGroupRobotModal from './editGroupRobotModal.vue';
import AddRobotGuideModal from './addRobotGuideModal.vue';
import * as api from '@/api';
@Component({
    components: {
        EditGroupRobotModal,
        AddRobotGuideModal
    }
})
export default class groupRobot extends Vue {
    tableLoading: boolean = false;
    showModal: boolean = false;
    showGuideModal: boolean = false;
    settingList: CommonTypes.mapObject[] = [];
    data: CommonTypes.mapObject = {};
    groupId: number = 0;
    created () {
        this.getDxGroupList();
    }
    async getDxGroupList () {
        this.tableLoading = true;
        try {
            const res = await api.rgApi.getDxGroupListener(this.rgId);
            const { data } = res;
            if (data) {
                this.settingList = data || [];
                this.tableLoading = false;
            }
        } catch (error) {
            this.tableLoading = false;
            console.log(error);
        }
    }
    onSuccess (id, needGuide) {
        this.showModal = false;
        this.getDxGroupList();
        this.groupId = id;
        // 新增配置 or 编辑配置修改了大象群 时，展示引导弹窗
        if (needGuide) this.showGuideModal = true;
    }
    createGroup () {
        this.data = {};
        this.showModal = true;
    }
    async deleteGroup (id) {
        const _this = this;
        this.$mtd.confirm({
            title: '是否确认删除',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确认',
            className: 'common-modal',
            okButtonProps: {
                type: 'danger',
                class: 'tt-pure-btn'
            },
            cancelButtonProps: {
                class: 'tt-pure-btn'
            },
            message: '删除后，对应群聊则无法通过大象机器人生成TT，是否确认删除',
            onOk: async () => {
                try {
                    await api.rgApi.deleteDxGroupListener(id);
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
    async editGroup (data) {
        this.tableLoading = true;
        try {
            const res = await api.rgApi.updateDxGroupListener({
                ...data,
                settingStatus: data.settingStatus === 1 ? 0 : 1
            });
            const { code } = res;
            if (code === 200) {
                this.tableLoading = false;
                this.getDxGroupList();
                this.$mtd.message.success(data.settingStatus === 1 ? '停用成功！' : '启用成功！');
            }
        } catch (error) {
            this.tableLoading = false;
            console.log(error);
        }
    }
    get operations () {
        return [{
            label: (scope) => {
                return scope.row.settingStatus === 1 ? '停用' : '启用';
            },
            action: 'control',
            click: (action: string, scope: any) => {
                this.editGroup(scope.row);
            }
        }, {
            label: '编辑',
            action: 'edit',
            click: (action: string, scope: any) => {
                this.data = { ...scope.row, minute: scope.row.features.multiPre };
                this.showModal = true;
            }
        }, {
            label: '删除',
            action: 'delete',
            click: (action: string, scope: any) => {
                this.deleteGroup(scope.row.id);
            }
        }];
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>
