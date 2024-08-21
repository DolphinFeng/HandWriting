<template>
    <div v-if="notCancelled" class="inspection-detail-container">
        <div class="header">
            <i class="mtdicon mtdicon-arrow-left" @click="backToPage" />
            <span class="name">{{ taskDetail.taskName || '质检任务' }}</span>
            <mtd-tag
                class="inspection-tag"
                size="large"
                :theme="inspectorTaskThemeMap[taskDetail.inspectorTaskState || 'TODO']">{{ inspectorTaskStatusMap[taskDetail.inspectorTaskState || 'TODO'] }}</mtd-tag>
            <task-progress
                v-if="taskDetail.inspectorTaskState === 'TODO'"
                :part="taskDetail.ttCompletedCount"
                :total="taskDetail.ttTotalCount"
                :stroke-width="4"
                :color="progressColor"
                class="inspection-progress" />
            <mtd-button
                type="primary"
                @click="onBtnClick"
                :disabled="disableBtn">{{ btnText }}</mtd-button>
        </div>
        <div class="info">
            <span class="space">所属空间：{{ taskDetail.spaceName }}</span>
            <span class="split">任务创建人：<user-avatar
                :username="taskDetail.creator && taskDetail.creator.name"
                :display-name="taskDetail.creator && taskDetail.creator.displayName"
                :avatar="taskDetail.creator && taskDetail.creator.avatarUrl || userAvatar" /></span>
            <span class="split">任务抽取时间：{{ taskDetail.taskDrawAt | formatTime }}</span>
            <span class="split">任务截止时间：{{ taskDetail.taskDueAt | formatTime }}</span>
        </div>
        <div class="filter">
            <inspector-detail-filter :current-page.sync="currentPage" @change="onFilterChanged" />
        </div>
        <div class="table">
            <mtd-table
                v-loading="tableLoading"
                :data="inspectorTicketList"
                :cell-class="cellClass"
                :row-class="rowClass">
                <mtd-table-column
                    prop="inspectorTicketId"
                    width="110px"
                    label="质检工单ID" />
                <pm-table-column-enum
                    label="质检工单状态"
                    prop="inspectorTicketState"
                    pm-type="dot"
                    width="110px"
                    :pm-options="statusOption" />
                <mtd-table-column
                    prop="inspectorTicketPoint"
                    min-width="10%"
                    label="质检评分">
                    <template slot-scope="scope">
                        <span>{{ scope.row.inspectorTicketPoint === null ? '-' : scope.row.inspectorTicketPoint }}</span>
                    </template>
                </mtd-table-column>
                <pm-table-column-date
                    label="质检完成时间"
                    prop="completedAt"
                    min-width="15%"
                    pm-formatter="YYYY-MM-DD HH:mm:ss" />
                <pm-table-column-link
                    label="TT标题"
                    prop="ticketName"
                    show-overflow-tooltip
                    resizable
                    min-width="30%"
                    :pm-to="toPage" />
                <pm-table-column-member
                    min-width="15%"
                    label="TT处理人"
                    pm-avatar-key="avatarUrl"
                    pm-mis-key="name"
                    pm-name-key="displayName"
                    prop="ticketAssigned" />
                <pm-table-column-operation
                    label="操作"
                    prop="operations"
                    pm-type="text"
                    width="130px"
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
    <ticket-blank
        :from-detail="false"
        hint="本质检任务已取消"
        v-else />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TicketBlank from '@/views/ticket/components/ticket-blank.vue';
import QualityList from '../inspectionContainer.vue';
import TaskProgress from '../component/progress.vue';
import { InspectorTaskStatusMap, RouteInspectionStatusMap, InspectorTaskOptionBtnMap, InspectorTaskThemeMap, InspectorTicketOperationMap, InspectorTicketStatusMap, InspectorTicketStatusOption } from '@/config/inspection.conf';
import userAvatar from '@/components/user-avatar.vue';
import { DEFAULT_AVATAR } from '@/config/map.conf';
import { PaginationMixin } from '@/utils/mixin';
import InspectorDetailFilter from './inspectorDetailFilter.vue';
import * as api from '@/api';

@Component({
    components: {
        QualityList,
        TicketBlank,
        TaskProgress,
        userAvatar,
        InspectorDetailFilter
    }
})
export default class InspectorTaskDetail extends PaginationMixin {
    inspectorTaskStatusMap: any = InspectorTaskStatusMap;
    inspectorTaskThemeMap: any = InspectorTaskThemeMap;
    inspectorTicketStatusMap: any = InspectorTicketStatusMap;
    inspectorTicketOperationMap: any = InspectorTicketOperationMap;
    inspectorTaskOptionBtnMap: any = InspectorTaskOptionBtnMap;
    routeInspectionStatusMap: any = RouteInspectionStatusMap;
    statusOption: any = InspectorTicketStatusOption;
    taskDetail: any = {};
    inspectorTicketList: any[] = [];
    userAvatar: string = DEFAULT_AVATAR;
    tableLoading: boolean = false;
    filterForm: any = {
        inspectorTicketId: null,
        inspectorTicketState: [],
        ticketName: '',
        ticketAssigned: []
    };
    created () {
        this.getInspectorTaskDetail();
        this.updateTable(this.filterForm);
    }
    onFilterChanged (filter: any) {
        this.filterForm = filter;
        this.updateTable(this.filterForm);
    }
    onPageChanged () {
        this.updateTable(this.filterForm);
    }
    onBtnClick () {
        switch (this.taskDetail.inspectorTaskState) {
            case 'TODO':
                this.getNextUndoTTId();
                break;
            case 'COMPLETED':
                window.open(this.taskDetail.exportFile?.url);
                break;
            case 'TO_SUBMIT':
                this.submit();
                break;
            default:
                break;
        }
    }
    async updateTable (filter: any) {
        this.tableLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.inspectApi.filterInspectorTicket(this.currentPage, this.limit, {
                inspectorTaskId: Number(this.inspectorTaskId),
                ...filter
            });
            const { code, data } = res;
            if (code === 200 && data) {
                this.inspectorTicketList = data.items || [];
                this.total = data.tn || 0;
            }
            this.tableLoading = false;
        } catch (error) {
            this.tableLoading = false;
        }
    }
    async getInspectorTaskDetail () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getInspectorTaskDetail({
            inspectorTaskId: Number(this.inspectorTaskId)
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.taskDetail = data;
        }
    }
    async submit () {
        this.$mtd.confirm({
            title: '是否确认提交',
            message: '确定要提交质检结果吗？提交质检结果后，质检管理员和相关工单处理人可下载查看最终质检结果',
            width: '400px',
            className: 'inspection-confirm',
            showCancelButton: true,
            onOk: async () => {
                const res: Ajax.AxiosResponse = await api.inspectApi.submitInspectorTask({
                    inspectorTaskId: Number(this.inspectorTaskId)
                });
                const { code } = res;
                if (code === 200) {
                    this.$mtd.message.success('质检结果提交成功');
                    this.getInspectorTaskDetail();
                }
            }
        }).catch(e => e);
    }
    async getNextUndoTTId () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getNextUndoInspectorTicketId({
            inspectorTaskId: Number(this.inspectorTaskId)
        });
        const { code, data } = res;
        if (code === 200 && data && data.inspectorTicketId && data.ticketId) {
            this.jumpToTicketPage(data.inspectorTicketId, data.ticketId);
        }
    }
    toPage ({ row }: any) {
        this.jumpToTicketPage(row.inspectorTicketId, row.ticketId);
    }
    // 跳转质检工单页
    jumpToTicketPage (inspectorTicketId, ticketId) {
        this.$router.push(`/quality/inspection/ticket?inspectorTaskId=${this.inspectorTaskId}&inspectorTicketId=${inspectorTicketId}&id=${ticketId}`);
    }
    // 回退工作台
    backToPage () {
        const query = this.routeInspectionStatusMap[this.taskDetail.inspectorTaskState] || 'toInspect';
        this.$router.push(`/quality/inspection/list?filter=${query}`);
    }
    rowClass (scope) {
        const row = scope.row;
        if (row.inspectorTicketPoint && row.inspectorTicketPoint !== row.inspectorTicketTotalPoints) {
            return 'highlight-row';
        }
        return '';
    }
    cellClass (scope) {
        const column = scope.column;
        if (column.prop === 'inspectorTicketPoint') {
            return 'bold-cell';
        }
        return '';
    }
    get notCancelled () {
        return this.taskDetail.inspectorTaskState !== 'CANCELLED';
    }
    get disableBtn () {
        return this.taskDetail.inspectorTaskState === 'COMPLETED' && !this.taskDetail.exportFile?.url;
    }
    get inspectorTaskId () {
        return this.$route.query.inspectorTaskId;
    }
    get btnText () {
        return this.inspectorTaskOptionBtnMap[this.taskDetail.inspectorTaskState || 'TODO'];
    }
    get operations () {
        return [{
            label: ({ row }: any) => {
                return this.inspectorTicketOperationMap[row.inspectorTicketState];
            },
            click: (action: string, scope: any) => {
                this.jumpToTicketPage(scope.row.inspectorTicketId, scope.row.ticketId);
            }
        }];
    }
    get progressColor () {
        if (!this.taskDetail.ttCompletedCount) {
            return 'gray';
        } else if (this.taskDetail.ttCompletedCount === this.taskDetail.ttTotalCount) {
            return 'green';
        } else {
            return 'blue';
        }
    }
}
</script>

<style lang="scss">
.inspection-detail-container {
    padding: 12px 24px 28px 24px;
    .header {
        font-weight: 500;
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 26px;
        display: flex;
        align-items: center;
        position: relative;
        .mtdicon {
            font-size: 20px;
            margin-right: 8px;
            &:hover {
                cursor: pointer;
            }
        }
        .progress-wrapper {
            width: 100px;
            .text {
                font-weight: 400;
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.5);
            }
        }
        .mtd-tag {
            padding: 0 4px;
            margin: 0 4px;
        }
        .mtd-btn {
            position: absolute;
            right: 0;
        }
    }
    .info {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 9px;
        padding-left: 29px;
        .split {
            padding: 0 12px;
            border-left: 1px solid rgba(0, 0, 0, 0.12);
        }
        .space {
            padding-right: 12px;
        }
        .user-wrapper {
            img {
                width: 16px;
                height: 16px;
            }
        }
    }
    .filter {
        margin-top: 14px;
        background: #fff;
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        padding: 11px 4px;
        .task-detail-filter-form {
            display: flex;
            .mtd-form-item {
                margin: 5px 12px;
                flex: 0 1 375px;
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
    }
    .table {
        margin-top: 12px;
        .mtd-table {
            border-radius: 4px 4px 0 0;
            th {
                background-color: #fff;
                font-weight: 500;
                font-family: PingFangSC-Medium;
            }
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
            tbody {
                tr {
                    &.highlight-row {
                        background: #fff6f5;
                        box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.06);
                        .bold-cell {
                            .mtd-table-cell {
                                font-family: MEITUANTYPE-REGULAR;
                                color: #d41e21;
                            }
                        }
                    }
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
    }
}
</style>
