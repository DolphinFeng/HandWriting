<template>
    <div class="list-content">
        <div class="filter-title">
            <span class="title" v-html="title" />
            <span class="empty-line" />
            <mtd-button
                class="reset-btn"
                @click="resetFilter"
                size="small">重置</mtd-button>
            <mtd-button
                type="primary"
                @click="createTask"
                icon="mtdicon mtdicon-add">新建质检任务</mtd-button>
        </div>
        <div class="filter-items">
            <task-filter
                :current-page.sync="currentPage"
                @change="onFilterChanged"
                ref="taskFilter" />
        </div>
        <div class="filter-table">
            <mtd-table
                class="inspection-task-table"
                v-loading="tableLoading"
                :data="taskList">
                <mtd-table-column
                    prop="id"
                    width="110px"
                    resizable
                    label="质检任务ID" />
                <pm-table-column-link
                    label="质检任务名称"
                    prop="name"
                    resizable
                    show-overflow-tooltip
                    min-width="15%"
                    :pm-to="toPage" />
                <pm-table-column-enum
                    label="质检任务状态"
                    prop="state"
                    pm-type="dot"
                    min-width="15%"
                    resizable
                    :pm-options="taskStatusOption" />
                <mtd-table-column
                    prop="progress"
                    min-width="15%"
                    resizable
                    label="任务进度">
                    <template slot-scope="scope">
                        <task-progress
                            v-if="showTotalProgress(scope.row)"
                            :part="scope.row.completed"
                            :total="scope.row.total"
                            :stroke-width="3"
                            :color="progressColor(scope.row)"
                            class="inspection-progress" />
                        <span v-else>-</span>
                        <mtd-popover
                            v-if="showProgressDetail(scope.row)"
                            size="small"
                            @input="onPopoverShow(scope.row.id)"
                            popper-class="inspection-progress-popover"
                            placement="bottom">
                            <mtd-tooltip
                                trigger="hover"
                                content="点击查看进度详情"
                                size="small"
                                placement="top">
                                <mtd-icon-button
                                    type="secondary"
                                    size="small"
                                    class="more-progress-btn"
                                    icon="mtdicon mtdicon-ellipsis" />
                            </mtd-tooltip>
                            <div slot="content" class="inspection-progress-popover-content">
                                <mtd-loading v-if="!progressList.length" />
                                <template v-else>
                                    <div class="title">质检进度详情</div>
                                    <div
                                        v-for="(item, index) in progressList"
                                        :key="index"
                                        class="inspector-wrapper">
                                        <user-avatar
                                            :username="item.userName"
                                            :display-name="item.userDisplayName"
                                            :avatar="item.userAvatarUrl" />
                                        <mtd-tag
                                            class="inspection-tag"
                                            :theme="inspectorTaskMap[item.taskState || 'TODO'].theme">
                                            {{ inspectorTaskMap[item.taskState || 'TODO'].label }}</mtd-tag>
                                        <span class="count">{{ `${item.completedCount}/${item.totalCount}` }}</span>
                                    </div>
                                </template>
                            </div>
                        </mtd-popover>
                    </template>
                </mtd-table-column>
                <pm-table-column-member
                    min-width="15%"
                    label="质检员"
                    pm-avatar-key="avatarUrl"
                    pm-mis-key="name"
                    pm-name-key="displayName"
                    pm-popper-class-name="inspector-popper"
                    resizable
                    :pm-max="1"
                    prop="inspector" />
                <pm-table-column-member
                    min-width="15%"
                    label="创建人"
                    pm-avatar-key="avatarUrl"
                    pm-mis-key="name"
                    resizable
                    pm-name-key="displayName"
                    prop="createdBy" />
                <pm-table-column-date
                    label="任务抽取时间"
                    prop="drawAt"
                    min-width="10%"
                    resizable
                    show-overflow-tooltip
                    pm-formatter="YYYY-MM-DD HH:mm:ss" />
                <pm-table-column-operation
                    label="操作"
                    prop="operations"
                    pm-type="text"
                    width="240px"
                    :pm-disable-method="disableMethod"
                    :pm-operations="operations" />
            </mtd-table>
            <div v-if="total > Math.min(...pageSizes)" class="pagination-container">
                <mtd-pagination
                    size="small"
                    show-total
                    show-size-changer
                    @change="onPageChanged"
                    :total="total"
                    :current-page.sync="currentPage"
                    :page-size.sync="limit" />
            </div>
            <task-detail
                v-if="visible"
                :visible.sync="visible"
                :mode.sync="drawerMode"
                :task-id.sync="taskId"
                :copy-data="copyData"
                @success="onSuccess" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import TaskProgress from '../component/progress.vue';
import TaskFilter from './taskListFilter.vue';
import TaskDetail from './taskDetail.vue';
import { DEFAULT_AVATAR } from '@/config/map.conf';
import { PaginationMixin } from '@/utils/mixin';
import * as api from '@/api';
import { TaskListInspectorTaskStatusOption, TaskListOperationMap, TaskStatusOptionMap } from '@/config/inspection.conf';
import userAvatar from '@/components/user-avatar.vue';
import { INSPECTION_KNOWLEDGE_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
@Component({
    components: {
        TaskProgress,
        TaskFilter,
        userAvatar,
        TaskDetail
    }
})
export default class TaskList extends PaginationMixin {
    @State(state => state.tt.inspectionFilterTitle) title;

    userAvatar: string = DEFAULT_AVATAR;
    inspectorTaskMap: any = TaskListInspectorTaskStatusOption;
    taskListOperationMap: any = TaskListOperationMap;
    taskStatusOption: any = TaskStatusOptionMap;
    taskList: any = [];
    progressList: any = [];
    visible: boolean = false;
    tableLoading: boolean = false;
    drawerMode: 'create' | 'display' | 'edit' | 'copy' = 'display';
    taskId: number = 0;
    copyData: any = {};
    filterForm: any = {
        name: '',
        state: [],
        inspectorList: [],
        createdByList: [],
        drawTime: []
    };
    @Watch('$route.query.filter')
    onQueryChanged () {
        this.resetFilter();
    }

    mounted () {
        this.updateTable(this.filterForm);
    }
    createTask () {
        this.visible = true;
        this.drawerMode = 'create';
    }
    onPageChanged () {
        this.updateTable(this.filterForm);
    }
    onPopoverShow (id: number) {
        id && this.getTaskProgress(id);
    }
    onSuccess () {
        this.visible = false;
        this.updateTable(this.filterForm);
    }
    onFilterChanged (filter: any) {
        this.filterForm = filter;
        this.updateTable(filter);
    }
    toPage ({ row }: any) {
        this.drawerMode = 'display';
        this.taskId = row.id;
        this.visible = true;
    }
    resetFilter () {
        this.$refs.taskFilter?.resetFilter();
    }
    async updateTable (filter: any) {
        this.tableLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.inspectApi.filterInspectMainTask(this.currentPage, this.limit, {
                ...filter,
                drawAtStart: Date.parse(filter.drawTime[0]),
                drawAtEnd: Date.parse(filter.drawTime[1]),
                objectId: this.spaceId
            });
            const { code, data } = res;
            if (code === 200) {
                this.taskList = data?.items || [];
                this.total = data?.tn || 0;
            }
            this.tableLoading = false;
        } catch (error) {
            this.tableLoading = false;
        }
    }
    async getTaskDetail (taskId) {
        const res: Ajax.AxiosResponse = await api.inspectApi.getInspectTask({
            taskId
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.copyData = {
                ...data,
                state: 'TO_DRAW',
                drawAt: null
            };
            this.copyData.ticketFilter['createdAt'] = [this.copyData.ticketFilter.createdAtStart, this.copyData.ticketFilter.createdAtEnd];
            this.taskId = 0;
            this.drawerMode = 'copy';
            this.visible = true;
        }
    }
    async getTaskProgress (id: number) {
        const res: Ajax.AxiosResponse = await api.inspectApi.getAllInspectorTasks(id);
        const { code, data } = res;
        if (code === 200 && data) {
            this.progressList = (data.items || []).map((item: any) => {
                if (item.state === 'TODO') {
                    item.taskState = item.completedCount === 0 ? 'TODO' : 'IN_PROGRESS';
                } else {
                    item.taskState = item.state;
                }
                return item;
            });
        }
    }

    async updateTaskState (row: any) {
        const inCancelledState = row.state === 'CANCELLED';
        const res: Ajax.AxiosResponse = await api.inspectApi.updateInspectTask({
            taskId: row.id,
            state: inCancelledState ? 'DELETED' : 'CANCELLED'
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success(`${inCancelledState ? '删除' : '取消'}质检任务成功`);
        }
    }
    disableMethod (action: string, { row }: any) {
        const editDisabled = action === 'edit' && row.state !== 'TO_DRAW';
        const thirdDisabled = action === 'third' && (row.state === 'TO_SUBMIT' || row.state === 'FAILED');
        const exportDisabled = action === 'third' && row.state === 'COMPLETED' && !row.exportFile?.url;
        return editDisabled || thirdDisabled || exportDisabled;
    }
    showTotalProgress (row) {
        // 除 待抽取、已取消、已失败
        return !(row.state === 'TO_DRAW' || row.state === 'CANCELLED' || row.state === 'FAILED');
    }
    showProgressDetail (row) {
        // 仅 进行中、待提交
        return row.state === 'IN_PROGRESS' || row.state === 'TO_SUBMIT';
    }
    progressColor (row: any) {
        if (!row.completed) {
            return 'gray';
        } else if (row.completed === row.total) {
            return 'green';
        } else {
            return 'blue';
        }
    }
    get operations () {
        return [{
            label: '复制',
            action: 'copy',
            click: (action: string, scope: any) => {
                // 带入数据打开抽屉，创建状态
                this.getTaskDetail(scope.row.id);
                lxReportClick(INSPECTION_KNOWLEDGE_MAP['copy_inspection_task']);
            }
        }, {
            label: '编辑',
            action: 'edit',
            click: (action: string, scope: any) => {
                // 带入数据打开抽屉，编辑状态
                this.taskId = scope.row.id;
                this.visible = true;
                this.drawerMode = 'edit';
            },
            tip: '仅待抽取任务可编辑'
        }, {
            label: (scope) => {
                return this.taskListOperationMap[scope.row.state];
            },
            action: 'third',
            click: (action: string, scope: any) => {
                // 取消、删除、下载
                if (scope.row.state === 'COMPLETED') {
                    window.open(scope.row.exportFile?.url);
                    lxReportClick(INSPECTION_KNOWLEDGE_MAP['download_inspection_task']);
                } else {
                    const inCancelledState = scope.row.state === 'CANCELLED';
                    this.$mtd.confirm({
                        title: `是否确认${inCancelledState ? '删除' : '取消'}此任务？`,
                        message: inCancelledState ? '' : '是否确认取消此任务？取消后质检员无法继续质检',
                        width: '400px',
                        className: 'inspection-confirm',
                        showCancelButton: true,
                        onOk: () => {
                            this.updateTaskState(scope.row);
                        }
                    }).catch(e => e);
                }
            },
            tip: ({ row }) => {
                if (row.state === 'COMPLETED' && !row.exportFile?.url) {
                    return '数据准备中，请稍后再试';
                } else {
                    return '仅已完成的任务支持下载质检结果';
                }
            }
        }];
    }
    get spaceId () {
        return (this.$route.query.filter || '').slice(6);
    }
}
</script>

<style lang="scss">
.list-content {
    .filter-title {
        position: relative;
        .mtd-btn-primary {
            position: absolute;
            right: 0;
            .mtdicon-add {
                vertical-align: top;
                line-height: 30px;
            }
        }
    }
}
.task-list-filter-form {
    .mtd-form-item {
        margin: 5px 12px;
        width: 30%;
        .item {
            width: 100%;
        }
        .mtd-input-suffix-inner {
            width: 32px;
            line-height: 30px;
            font-size: 16px;
        }
        .mtd-select-tags {
            padding-left: 8px;
            .mtd-select-search-field {
                margin: 0;
            }
        }
    }
}
.inspection-task-table {
    thead {
        th {
            padding: 12px 0;
        }
    }
    .mtd-table-cell {
        .inspection-progress {
            display: inline-flex;
            .mtd-progress-bar {
                width: 94px;
            }
        }
        .more-progress-btn {
            vertical-align: middle;
        }
    }
}
.inspection-progress-popover {
    padding: 8px 16px 16px 16px;
    min-width: 200px;
    .inspection-progress-popover-content {
        .title {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.36);
            margin-bottom: 8px;
        }
        .inspector-wrapper {
            &:not(:last-child) {
                margin-bottom: 18px;
            }
            .inspection-tag {
                margin-right: 20px;
            }
            .count {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.5);
            }
        }
        .user-wrapper {
            .user-name {
                font-size: 14px;
            }
        }
    }
}
.inspector-popper {
    .member-list {
        max-height: 175px;
        overflow: auto;
    }
}
</style>
