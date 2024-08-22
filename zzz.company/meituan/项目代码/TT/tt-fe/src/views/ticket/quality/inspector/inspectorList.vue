<template>
    <div class="list-content">
        <div class="filter-title">
            <span class="title" v-html="title" />
            <span class="empty-line" v-if="inspectionQuery !== 'cancelled'" />
            <mtd-button
                class="reset-btn"
                v-if="inspectionQuery !== 'cancelled'"
                @click="resetFilter"
                size="small">重置</mtd-button>
        </div>
        <div class="filter-items" v-if="inspectionQuery !== 'cancelled'">
            <inspector-filter
                :current-page.sync="currentPage"
                @change="onFilterChanged"
                ref="inspectorTaskFilter" />
        </div>
        <div class="filter-table">
            <mtd-table
                class="inspector-list-table"
                v-loading="tableLoading"
                :data="inspectorTaskList">
                <mtd-table-column
                    prop="taskId"
                    width="110px"
                    resizable
                    label="质检任务ID" />
                <mtd-table-column
                    label="质检任务名称"
                    prop="taskName"
                    resizable
                    show-overflow-tooltip
                    min-width="20%">
                    <template slot-scope="scope">
                        <span @click="toPage(scope)" :class="{'pm-table-column-link': inspectionQuery !== 'cancelled'}">{{ scope.row.taskName }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    prop="progress"
                    min-width="15%"
                    resizable
                    key="taskProgress"
                    v-if="inspectionQuery !== 'cancelled'"
                    label="我的质检进度">
                    <template slot-scope="scope">
                        <task-progress
                            :part="scope.row.ttCompletedCount"
                            :total="scope.row.ttTotalCount"
                            :stroke-width="3"
                            :color="progressColor(scope.row)"
                            class="inspection-progress" />
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    prop="spaceName"
                    min-width="10%"
                    resizable
                    show-overflow-tooltip
                    label="所属空间" />
                <pm-table-column-date
                    label="任务抽取时间"
                    prop="taskDrawAt"
                    min-width="15%"
                    resizable
                    show-overflow-tooltip
                    v-if="inspectionQuery !== 'cancelled'"
                    pm-formatter="YYYY-MM-DD HH:mm:ss" />
                <pm-table-column-date
                    label="任务截止时间"
                    prop="taskDueAt"
                    resizable
                    v-if="inspectionQuery !== 'cancelled'"
                    min-width="15%"
                    show-overflow-tooltip
                    pm-formatter="YYYY-MM-DD HH:mm:ss" />
                <pm-table-column-date
                    label="任务提交时间"
                    prop="inspectorTaskCompletedAt"
                    min-width="15%"
                    resizable
                    show-overflow-tooltip
                    v-if="inspectionQuery === 'finished'"
                    pm-formatter="YYYY-MM-DD HH:mm:ss" />
                <pm-table-column-member
                    min-width="10%"
                    label="任务取消人"
                    pm-avatar-key="avatarUrl"
                    pm-mis-key="name"
                    v-if="inspectionQuery === 'cancelled'"
                    pm-name-key="displayName"
                    prop="cancelledBy" />
                <pm-table-column-date
                    label="任务取消时间"
                    prop="taskCancelledAt"
                    min-width="15%"
                    resizable
                    show-overflow-tooltip
                    v-if="inspectionQuery === 'cancelled'"
                    pm-formatter="YYYY-MM-DD HH:mm:ss" />
                <pm-table-column-member
                    min-width="15%"
                    label="任务创建人"
                    pm-avatar-key="avatarUrl"
                    pm-mis-key="name"
                    pm-name-key="displayName"
                    prop="creator" />
                <pm-table-column-operation
                    label="操作"
                    prop="operations"
                    pm-type="text"
                    width="120px"
                    resizable
                    v-if="inspectionQuery !== 'cancelled'"
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
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import TaskProgress from '../component/progress.vue';
import InspectorFilter from './inspectorFilter.vue';
import { DEFAULT_AVATAR } from '@/config/map.conf';
import { PaginationMixin } from '@/utils/mixin';
import * as api from '@/api';
import { INSPECTION_KNOWLEDGE_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { InspectionRouteStatusMap } from '@/config/inspection.conf';
@Component({
    components: {
        TaskProgress,
        InspectorFilter
    }
})
export default class InspectorList extends PaginationMixin {
    @State(state => state.tt.inspectionFilterTitle) title;

    inspectionRouteStatusMap: any = InspectionRouteStatusMap;
    inspectorTaskList: any[] = [];
    tableLoading: boolean = false;
    userAvatar: string = DEFAULT_AVATAR;
    filterForm: any = {
        taskName: '',
        taskSpaceIdList: [],
        taskCreatorMisList: [],
        drawTime: [],
        dueTime: []
    };
    @Watch('$route.query.filter', { immediate: true })
    onQueryChanged (query) {
        if (query === 'cancelled') {
            this.updateTable(this.filterForm);
        } else {
            this.resetFilter();
        }
    }
    onFilterChanged (filter: any) {
        this.filterForm = filter;
        this.updateTable(this.filterForm);
    }
    onPageChanged () {
        this.updateTable(this.filterForm);
    }
    submit (inspectorTaskId: number) {
        this.$mtd.confirm({
            title: '是否确认提交',
            message: '确定要提交质检结果吗？提交质检结果后，质检管理员和相关工单处理人可下载查看最终质检结果',
            width: '400px',
            className: 'inspection-confirm',
            showCancelButton: true,
            onOk: async () => {
                const res: Ajax.AxiosResponse = await api.inspectApi.submitInspectorTask({
                    inspectorTaskId
                });
                const { code } = res;
                if (code === 200) {
                    this.$mtd.message.success('提交质检结果成功');
                    this.updateTable(this.filterForm);
                    this.$emit('update');
                }
            }
        }).catch(e => e);
    }
    async updateTable (filter: any) {
        this.tableLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.inspectApi.filterInspectorTask(this.currentPage, this.limit, {
                inspectorTaskState: this.inspectorTaskStatus,
                taskDrawAtStart: Date.parse(filter.drawTime[0]),
                taskDrawAtEnd: Date.parse(filter.drawTime[1]),
                taskDueAtStart: Date.parse(filter.dueTime[0]),
                taskDueAtEnd: Date.parse(filter.dueTime[1]),
                taskName: filter.taskName,
                taskSpaceIdList: filter.taskSpaceIdList,
                taskCreatorMisList: filter.taskCreatorMisList
            });
            const { code, data } = res;
            if (code === 200) {
                this.inspectorTaskList = data.items || [];
                this.total = data.tn || 0;
            }
            this.tableLoading = false;
        } catch (error) {
            this.tableLoading = false;
        }
    }
    async getNextUndoTTId (id) {
        const res: Ajax.AxiosResponse = await api.inspectApi.getNextUndoInspectorTicketId({
            inspectorTaskId: id
        });
        const { code, data } = res;
        if (code === 200 && data && data.inspectorTicketId && data.ticketId) {
            this.$router.push(`/quality/inspection/ticket?inspectorTaskId=${id}&inspectorTicketId=${data.inspectorTicketId}&id=${data.ticketId}`);
        }
    }
    disableMethod (action: string, { row }: any) {
        return action === 'download' && !row.exportFile?.url;
    }
    toPage ({ row }: any) {
        if (this.inspectionQuery !== 'cancelled') {
            this.$router.push(`/quality/inspection/detail?inspectorTaskId=${row.inspectorTaskId}`);
        }
    }
    resetFilter () {
        this.$refs.inspectorTaskFilter?.resetFilter();
    }
    progressColor (row: any) {
        if (!row.ttCompletedCount) {
            return 'gray';
        } else if (row.ttCompletedCount === row.ttTotalCount) {
            return 'green';
        } else {
            return 'blue';
        }
    }
    get operations () {
        switch (this.inspectionQuery) {
            case 'toInspect':
                return [{
                    label: '去质检',
                    click: (action: string, scope: any) => {
                        this.getNextUndoTTId(scope.row.inspectorTaskId);
                    }
                }];
            case 'toSubmit':
                return [{
                    label: '提交质检结果',
                    click: (action: string, scope: any) => {
                        this.submit(scope.row.inspectorTaskId);
                    }
                }];
            case 'finished':
                return [{
                    label: '下载质检结果',
                    action: 'download',
                    tip: '数据准备中，请稍后再试',
                    click: (action: string, scope: any) => {
                        window.open(scope.row.exportFile?.url);
                        lxReportClick(INSPECTION_KNOWLEDGE_MAP['download_inspector_task']);
                    }
                }];
            default:
                return [];
        }
    }
    get inspectionQuery () {
        return this.$route.query.filter || 'toInspect';
    }
    get inspectorTaskStatus () {
        return this.inspectionRouteStatusMap[this.inspectionQuery as any];
    }
}
</script>

<style lang="scss">
.inspector-list-table {
    thead {
        th {
            padding: 12px 0;
        }
    }
    .inspection-progress {
        .mtd-progress-bar {
            width: 94px;
        }
    }
}
.pagination-container {
    margin: 0;
    background: #fff;
    padding: 12px 24px 16px 0;
    border-radius: 0 0 4px 4px;
}
.mtd-pagination-total {
    font-size: 14px;
}
</style>
