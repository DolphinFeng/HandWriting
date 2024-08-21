<template>
    <div class="inspection-ticket-container">
        <div class="steps-header">
            <div class="header-title">
                <i
                    class="mtdicon mtdicon-arrow-left"
                    @click="cancelBack" />
                <span class="name">{{ inspectorTicketDetail.taskName }}</span>
                <mtd-tag
                    class="inspection-tag"
                    size="large"
                    :theme="inspectorTaskThemeMap[inspectorTaskStatusEn]">{{ inspectorTaskStatusCn }}</mtd-tag>
                <task-progress
                    v-if="inspectorTaskStatusEn === 'TODO'"
                    :part="inspectorTicketDetail.completedCount"
                    :total="inspectorTicketDetail.totalCount"
                    :stroke-width="4"
                    :color="progressColor"
                    class="inspection-progress" />
            </div>
            <mtd-button
                :loading="btnLoading"
                :disabled="disableBtn"
                type="primary"
                class="operate-btn"
                @click="submitOrDownload">{{ inspectorTaskStatusEn === 'COMPLETED' ? '下载质检结果' : '提交质检结果' }}</mtd-button>
        </div>
        <div class="preview-container">
            <div class="preview-img-container">
                <span
                    :class="['jump-icon left', { 'disabled': !showBeforeBtn}]"
                    @click="jumpPage(true)"><i class="mtdicon mtdicon-arrow-left" /></span>
                <div class="content-wrapper">
                    <div class="title"><span>质检ID：{{ inspectorTicketId }}</span><mtd-tag
                        class="inspection-tag"
                        :theme="inspectorTaskThemeMap[inspectorTicketStatusEn]">{{ inspectorTicketStatusCn }}</mtd-tag></div>
                    <ticket-detail
                        v-if="showDetail"
                        class="detail-in-inspection" />
                </div>
                <span
                    :class="['jump-icon right', { 'disabled': !showNextBtn}]"
                    @click="jumpPage(false)"><i class="mtdicon mtdicon-arrow-right" /></span>
            </div>
            <deduction-form
                :is-already-check="inspectorTicketStatusEn === 'COMPLETED'"
                :is-already-submit="inspectorTaskStatusEn === 'COMPLETED'"
                :display-mode="displayMode"
                :is-last-item="isLastUndoTicket"
                :all-completed="inspectorTicketDetail.completedCount === inspectorTicketDetail.totalCount"
                @display="updateDisplayStatus"
                @update="updateTicket"
                :deduction-form="deductionForm"  />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import cloneDeep from 'lodash.clonedeep';
import TaskProgress from '../component/progress.vue';
import TicketDetail from '../../ticket-detail.vue';
import DeductionForm from './deductionForm.vue';
import { InspectorTaskStatusMap, InspectorTaskThemeMap, InspectorTicketStatusMap } from '@/config/inspection.conf';
@Component({
    components: {
        TaskProgress,
        TicketDetail,
        DeductionForm
    }
})
export default class InspectorTicket extends Vue {
    btnLoading: boolean = false;
    showDetail: boolean = false;
    displayMode: 'display' | 'edit' = 'display';
    inspectorTicketDetail: CommonTypes.mapObject = {};
    deductionForm: CommonTypes.mapObject = {
        systemFields: [],
        deduction: []
    };
    inspectorTaskThemeMap: any = InspectorTaskThemeMap;
    inspectorTaskStatusMap: any = InspectorTaskStatusMap;
    inspectorTicketStatusMap: any = InspectorTicketStatusMap;
    @Watch('inspectorTicketDetail.inspectorTicket.ticketId')
    onTicketIdChanged () {
        this.showDetail = false;
        this.$nextTick(() => {
            this.showDetail = true;
        });
    }
    created () {
        this.getTicketDetail();
    }
    submitOrDownload () {
        if (this.inspectorTaskStatusEn === 'COMPLETED') {
            window.open(this.inspectorTicketDetail.exportFile?.url);
        } else {
            this.submit();
        }
    }
    submit () {
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
                    this.$mtd.message.success(this.inspectorTaskStatusEn === 'COMPLETED' ? '重新质检并提交质检结果成功' : '质检结果提交成功');
                    this.cancelBack();
                }
            }
        }).catch(e => e);
    }
    updateDisplayStatus (mode: 'display' | 'edit') {
        this.displayMode = mode;
    }
    async updateTicket (type: string) {
        if (type === 'next') {
            this.getNextUndo();
        } else {
            await this.getTicketDetail();
            this.updateDisplayStatus('display');
        }
    }
    async getTicketDetail () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getInspectorTicketDetail({
            inspectorTicketId: Number(this.inspectorTicketId)
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.inspectorTicketDetail = data;
            this.handleFormData();
        }
    }
    async getNextUndo () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getNextUndoInspectorTicket({
            inspectorTicketId: Number(this.inspectorTicketId),
            inspectorTaskId: Number(this.inspectorTaskId)
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.inspectorTicketDetail = cloneDeep(data);
            this.handleFormData();
            this.updateRouter();
        }
    }
    async jumpPage (previous: boolean) {
        const res: Ajax.AxiosResponse = await api.inspectApi.getAroundInspectorTicket({
            inspectorTicketId: Number(this.inspectorTicketId),
            previous
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.inspectorTicketDetail = cloneDeep(data);
            this.handleFormData();
            this.updateRouter();
        }
    }
    updateRouter () {
        this.$router.push({
            name: this.$route.name,
            query: {
                ...this.$route.query,
                inspectorTicketId: this.inspectorTicketDetail.inspectorTicket.id,
                id: this.inspectorTicketDetail.inspectorTicket.ticketId
            }}).catch(e => e);
    }
    handleFormData () {
        const noteField = this.inspectorTicketDetail.inspectorTicket?.systemFieldInfo.find(item => item.name === 'NOTE');
        this.deductionForm.systemFields = {
            totalCount: this.inspectorTicketDetail.inspectorTicket?.point,
            noteSwitch: noteField?.display,
            noteRequired: noteField?.required,
            noteContent: noteField?.content
        };
        this.deductionForm.deduction = [];
        this.inspectorTicketDetail.inspectorTicket?.customFieldInfo.forEach(item => {
            item.checked = item.content === '1' ? true : false;
            this.deductionForm.deduction.push(item);
        });
        this.displayMode = this.inspectorTicketStatusEn === 'TODO' ? 'edit' : 'display';
    }
    cancelBack () {
        this.$router.push(`/quality/inspection/detail?inspectorTaskId=${this.inspectorTaskId}`);
    }
    get progressColor () {
        if (!this.inspectorTicketDetail.completedCount) {
            return 'gray';
        } else if (this.inspectorTicketDetail.completedCount === this.inspectorTicketDetail.totalCount) {
            return 'green';
        } else {
            return 'blue';
        }
    }
    // 质检员子任务ID
    get inspectorTaskId () {
        return this.$route.query.inspectorTaskId || 0;
    }
    // 质检员子任务状态[英文]
    get inspectorTaskStatusEn () {
        return this.inspectorTicketDetail.inspectorTaskState || 'TODO';
    }
    // 质检员子任务状态[中文]
    get inspectorTaskStatusCn () {
        return this.inspectorTaskStatusMap[this.inspectorTaskStatusEn];
    }
    // 质检员子任务工单ID
    get inspectorTicketId () {
        return this.$route.query.inspectorTicketId || 0;
    }
    // 质检员子任务工单状态[英文]
    get inspectorTicketStatusEn () {
        return this.inspectorTicketDetail.inspectorTicket?.state || 'TODO';
    }
    // 质检员子任务工单状态[中文]
    get inspectorTicketStatusCn () {
        return this.inspectorTicketStatusMap[this.inspectorTicketStatusEn];
    }
    // 质检员子任务工单是否为最后一条待质检
    get isLastUndoTicket () {
        return this.inspectorTicketDetail.inspectorTicket?.lastUndo || false;
    }
    // 是否禁用按钮
    get disableBtn () {
        const noResult = this.inspectorTaskStatusEn === 'COMPLETED' && !this.inspectorTicketDetail.exportFile?.url;
        return this.inspectorTaskStatusEn === 'TODO' || noResult;
    }
    // 是否展示“上一条”
    get showBeforeBtn () {
        return !this.inspectorTicketDetail.inspectorTicket?.first;
    }
    // 是否展示“下一条”
    get showNextBtn () {
        return !this.inspectorTicketDetail.inspectorTicket?.last;
    }
}
</script>

<style lang="scss">
.inspection-ticket-container {
    height: 100%;
    .steps-header {
        width: 100%;
        padding: 11px 24px;
        background: #fff;
        position: relative;
        z-index: 5;
        height: 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.02), 0 2px 6px 6px rgba(0, 0, 0, 0.02), 0 2px 6px 0 rgba(0, 0, 0, 0.06);
        .header-title {
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 18px;
            display: flex;
            align-items: center;
            color: rgba(0, 0, 0, 0.84);
            i {
                margin-right: 8px;
                line-height: 28px;
                font-size: 20px;
            }
            .name {
                line-height: 28px;
                display: inline-block;
                vertical-align: top;
                margin-right: 4px;
            }
        }
        .inspection-progress {
            margin-left: 10px;
            .mtd-progress-bar {
                width: 94px;
            }
            .text {
                font-weight: 400;
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.5);
            }
        }
        .operate-btn {
            float: right;
            min-width: 80px;
            margin-left: 8px;
            border-radius: 6px;
            span {
                font-weight: 500;
                opacity: 0.9;
                font-family: PingFangSC-Medium;
                font-size: 14px;
                color: #000;
                letter-spacing: 0;
                text-align: center;
                line-height: 22px;
            }
        }
    }
    .preview-container {
        display: flex;
        flex: auto;
        height: calc(100% - 48px);
        .preview-img-container {
            flex: auto;
            background: #f7f7f7;
            padding: 14px 0 48px 0;
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            position: relative;
            max-width: calc(100% - 304px);
            .content-wrapper {
                width: calc(100% - 120px);
                height: 100%;
                max-width: 1024px;
            }
            .title {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 16px;
                .mtd-tag {
                    margin-left: 4px;
                }
            }
            .detail-in-inspection {
                margin: 0;
                height: calc(100% - 32px);
                min-width: 776px;
            }
            .jump-icon {
                font-size: 22px;
                background: rgba(0, 0, 0, 0.06);
                border-radius: 18px;
                width: 36px;
                height: 36px;
                flex: 0 0 36px;
                text-align: center;
                margin: 0 12px;
                cursor: pointer;
                &.disabled {
                    cursor: not-allowed;
                    opacity: 0.4;
                }
            }
        }
    }
}
</style>
