<template>
    <mtd-drawer
        v-model="showDrawer"
        class="inspection-task-drawer"
        width="600px"
        closable
        @close="close"
        :mask="false"
        ref="task-drawer"
        destroy-on-close>
        <div slot="title"> 
            <span class="name">{{ taskName }}</span>
            <mtd-tag
                v-if="showTotalProgress"
                class="inspection-tag"
                size="large"
                :theme="taskStatusThemeMap[taskDetail.state || 'TODO'].theme">
                {{ taskStatusThemeMap[taskDetail.state || 'TODO'].label }}</mtd-tag>
            <task-progress
                v-if="showTotalProgress"
                :part="taskDetail.completed"
                :total="taskDetail.total"
                :stroke-width="4"
                :color="progressColor"
                class="inspection-progress" />
            <div v-if="inCopy" class="copy-hint">请关注此复制任务的条件变化</div>
        </div> 
        <div class="scroll-content">
            <div class="progress" v-if="showProgressDetail">
                <div class="title-text">质检进度详情</div>
                <div
                    v-for="(item, index) in taskDetail.inspectorDetail"
                    :key="index"
                    class="inspector-wrapper">
                    <user-avatar
                        :username="item.name"
                        :display-name="item.displayName"
                        :avatar="item.avatarUrl" />
                    <mtd-tag
                        class="inspection-tag"
                        :theme="inspectorTaskMap[item.taskState || 'TODO'].theme">
                        {{ inspectorTaskMap[item.taskState || 'TODO'].label }}</mtd-tag>
                    <span class="count">{{ `${item.completedCount}/${item.totalCount}` }}</span>
                </div>
            </div>
            <task-detail-form
                :mode="mode"
                :form-data="taskDetail"
                ref="taskDetailForm"
                @change-template="onTemplateChanged"
                @change="onFormChanged" />
        </div>
        <div class="operation-btns">
            <mtd-button v-if="showCancelBtn" @click="cancel">取消任务</mtd-button>
            <mtd-button @click="copyOrClose">{{ ordinaryBtnText }}</mtd-button>
            <mtd-button
                v-if="primaryBtnText"
                type="primary"
                :loading="btnLoading"
                :disabled="disablePrimary"
                @click="onPrimaryClick">{{ primaryBtnText }}</mtd-button>
        </div>
    </mtd-drawer>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { TaskStatusThemeMap, TaskListInspectorTaskStatusOption } from '@/config/inspection.conf';
import * as api from '@/api';
import selectTemplate from '../component/selectTemplate.vue';
import UserAvatar from '@/components/user-avatar.vue';
import FilterCategoryTree from '@/components/filter-category-tree.vue';
import { formatTimeWithTimeZone } from '@/utils/filters/index';
import cloneDeep from 'lodash.clonedeep';
import TaskProgress from '../component/progress.vue';
import TaskDetailForm from './taskDetailForm.vue';
import get from 'lodash.get';
import without from 'lodash.without';
@Component({
    components: {
        selectTemplate,
        FilterCategoryTree,
        UserAvatar,
        TaskProgress,
        TaskDetailForm
    }
})
export default class TaskDetail extends Vue {
    @Prop() visible: boolean;
    @Prop() taskId: number;
    @Prop({ default: 'display' }) mode: 'create' | 'display' | 'edit' | 'copy';
    @Prop() copyData: any;
    inspectorTaskMap: any = TaskListInspectorTaskStatusOption;
    taskStatusThemeMap: any = TaskStatusThemeMap;
    inDisplay: boolean = false;
    inCopy: boolean = false;
    formatTimeFunc: any = formatTimeWithTimeZone;
    btnLoading: boolean = false;
    showDrawer: boolean = false;
    templateEdit: boolean = false;
    inspectorList: any[] = [];
    taskDetail: any = {
        name: '',
        total: 0,
        completed: 0,
        state: 'TODO',
        inspctor: [],
        dueAt: null,
        drawAt: null,
        drawType: 'COUNT',
        ticketFilter: {
            assigned: [],
            ctiNameList: [],
            createdAt: [],
            state: ['已解决', '已关闭']
        }
    };
    submitForm: any = {};
    @Watch('mode', { immediate: true })
    onModeChanged () {
        this.inDisplay = this.mode === 'display';
        this.inCopy = this.mode === 'copy';
    }
    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showDrawer = this.visible;
    }
    @Watch('copyData', { immediate: true })
    onData () {
        if (this.mode === 'copy' && this.copyData) {
            if (this.copyData.ticketFilter?.state.includes('暂停中')) {
                this.copyData.ticketFilter.state = without(this.copyData.ticketFilter?.state, '暂停中', '挂起中');
                this.copyData.ticketFilter.state = this.copyData.ticketFilter?.state.concat(['暂停']);
            }
            this.taskDetail = cloneDeep(this.copyData);
            this.submitForm = cloneDeep(this.copyData);
        }
    }
    created () {
        if (this.mode === 'edit' || this.mode === 'display') {
            this.getTaskDetail();
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    cancel () {
        this.$mtd.confirm({
            title: '是否确认取消此任务？',
            message: '是否确认取消此任务？取消后质检员无法继续质检',
            width: '400px',
            className: 'inspection-confirm',
            showCancelButton: true,
            onOk: () => {
                this.cancelTask();
            }
        }).catch(e => e);
    }
    onFormChanged (val) {
        this.submitForm = val;
    }
    onPrimaryClick () {
        if (!this.inDisplay) {
            this.submit();
        } else if (this.taskDetail.state === 'COMPLETED') {
            window.open(this.taskDetail.exportFile?.url);
        } else if (this.taskDetail.state === 'TO_DRAW') {
            this.$emit('update:mode', 'edit');
        }
    }
    onTemplateChanged () {
        this.templateEdit = true;
    }
    formatDisplayData (data) {
        this.taskDetail = {
            ...data,
            inspectorDetail: this.formatInspector(data.inspector),
            ticketCtiName: this.formatCtiName(data.ticketFilter.ctiNameList) || '-',
            ticketState: (data.ticketFilter.state || []).join('，') || '-',
            ticketAssigned: (data.ticketFilter.assigned || []).join('，') || '-',
            ticketCreated: this.formatTime(data.ticketFilter)
        };
    }
    formatTicketState (state: any[]) {
        if (state?.includes('暂停中')) {
            state = without(state, '暂停中', '挂起中');
            state = state.concat(['暂停']);
        }
        return state;
    }
    formatInspector (inspector: any[]) {
        const inspectorList: any[] = [];
        (inspector || []).forEach((item: any) => {
            if (item.totalCount) {
                item.taskState = item.state === 'TODO' ? (item.completedCount === 0 ? 'TODO' : 'IN_PROGRESS') : item.state;
                inspectorList.push(item);
            }
        });
        return inspectorList;
    }
    formatTime (filter: any) {
        return filter.createdAtStart
            ? (this.formatTimeFunc(filter.createdAtStart) + ' - ' + this.formatTimeFunc(filter.createdAtEnd))
            : '-';
    }
    formatCtiName (ctiList: any[]) {
        return ctiList.map(item => {
            if (!item.categoryName) {
                return '';
            }
            if (!item.typeName) {
                return item.categoryName;
            }
            if (!item.itemName) {
                return item.categoryName + '/' + item.typeName;
            }
            return item.categoryName + '/' + item.typeName + '/' + item.itemName;
        }).join('，');
    }
    copyOrClose () {
        if (this.mode === 'create' || this.mode === 'copy') {
            this.close();
        } else {
            if (this.inDisplay) {
                this.copy();
            } else {
                this.$emit('update:mode', 'display');
            }
        }
    }
    copy () {
        this.$emit('update:mode', 'copy');
        this.$emit('update:taskId', 0);
        this.taskDetail.drawAt = null;
        this.submitForm.drawAt = null;
    }
    submit () {
        this.$refs.taskDetailForm?.$refs.infoForm?.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                this.createOrEditTask((this.mode === 'create' || this.mode === 'copy') ? 'create' : 'edit');
            }
        }).catch(e => console.log(e));
    }
    async getTaskDetail () {
        const res: Ajax.AxiosResponse = await api.inspectApi.getInspectTask({
            taskId: this.taskId
        });
        const { code, data } = res;
        if (code === 200 && data) {
            if (data.ticketFilter?.state.includes('暂停中')) {
                data.ticketFilter.state = without(data.ticketFilter?.state, '暂停中', '挂起中');
                data.ticketFilter.state = data.ticketFilter?.state.concat(['暂停']);
            }
            this.formatDisplayData(data);
            this.submitForm = data;
            this.submitForm.ticketFilter['createdAt'] = [this.submitForm.ticketFilter.createdAtStart, this.submitForm.ticketFilter.createdAtEnd];
        }
    }
    async cancelTask () {
        const res: Ajax.AxiosResponse = await api.inspectApi.updateInspectTask({
            taskId: this.taskId,
            state: 'CANCELLED'
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('取消质检任务成功');
            this.$emit('success');
        }
    }
    async createOrEditTask (type: 'create' | 'edit') {
        const taskApi = `${type}InspectTask`;
        let state = get(this, 'submitForm.ticketFilter.state', []);
        // 将暂停翻译为后端的两个状态
        if (state.includes('暂停')) {
            state = without(state, '暂停');
            state = state.concat(['暂停中', '挂起中']);
        }
        try {
            const res: Ajax.AxiosResponse = await api.inspectApi[taskApi]({
                ticketFilter: {
                    assigned: this.submitForm.ticketFilter.assigned,
                    ctiNameList: this.submitForm.ticketFilter.ctiNameList,
                    state,
                    createdAtStart: this.submitForm.ticketFilter.createdAt && this.submitForm.ticketFilter.createdAt[0],
                    createdAtEnd: this.submitForm.ticketFilter.createdAt && this.submitForm.ticketFilter.createdAt[1]
                },
                objectId: Number(this.spaceId),
                templateId: this.submitForm.templateId,
                name: this.submitForm.name,
                drawAt: this.submitForm.drawAt,
                dueAt: this.submitForm.dueAt,
                inspectorList: this.submitForm.inspectorList,
                drawType: this.submitForm.drawType,
                drawNumber: this.submitForm.drawNumber,
                templateEdit: this.templateEdit
            }, this.taskId);
            const { code } = res;
            if (code === 200) {
                this.btnLoading = false;
                this.$mtd.message.success(`${type === 'create' ? '创建' : '编辑'}质检任务成功`);
                this.$emit('success');
            }
        } catch (error) {
            console.log('error:', error);
            this.btnLoading = false;
        }
    }
    get progressColor () {
        if (!this.taskDetail.completed) {
            return 'gray';
        } else if (this.taskDetail.completed === this.taskDetail.total) {
            return 'green';
        } else {
            return 'blue';
        }
    }
    get primaryBtnText () {
        if (!this.inDisplay) {
            return '确定';
        } else if (this.taskDetail.state === 'COMPLETED') {
            return '下载质检结果';
        } else if (this.taskDetail.state === 'TO_DRAW') {
            return '编辑';
        }
        return '';
    }
    get taskName () {
        return this.inDisplay ? (this.taskDetail.name || '质检任务') : '创建质检任务';
    }
    get disablePrimary () {
        // 已完成任务无可下载URL
        return this.taskDetail.state === 'COMPLETED' && !this.taskDetail.exportFile?.url && this.inDisplay;
    }
    get ordinaryBtnText () {
        return this.inDisplay ? '复制' : '取消';
    }
    get showCancelBtn () {
        return this.inDisplay && ['TO_DRAW', 'TODO', 'IN_PROGRESS'].includes(this.taskDetail.state);
    }
    get showTotalProgress () {
        // 展示态 + 除 待抽取、已取消、已失败
        const inWrongState = this.taskDetail.state === 'TO_DRAW' || this.taskDetail.state === 'CANCELLED' || this.taskDetail.state === 'FAILED';
        return this.inDisplay ? (inWrongState ? false : true) : false;
    }
    get showProgressDetail () {
        // 展示态 + 进行中/待提交
        const inRightState = this.taskDetail.state === 'IN_PROGRESS' || this.taskDetail.state === 'TO_SUBMIT';
        return this.inDisplay ? (inRightState ? true : false) : false;
    }
    get spaceId () {
        return (this.$route.query.filter || '').slice(6);
    }
}
</script>
<style lang="scss">
.inspection-task-drawer {
    .mtd-drawer-close {
        right: 18px;
        top: 18px;
    }
    .operation-btns {
        position: absolute;
        bottom: 12px;
        right: 24px;
        text-align: right;
        .mtd-btn {
            border-radius: 6px;
            margin: 0 4px;
            border: none;
            font-weight: 500;
            font-family: PingFangSC-Medium;
            min-width: 80px;
            &:not(.mtd-btn-primary) {
                background: rgba(0, 0, 0, 0.06);
            }
        }
    }
    .mtd-drawer-header {
        margin-bottom: 8px;
        font-weight: 500;
        font-family: PingFangSC-Medium;
        font-size: 20px;
        display: flex;
        align-items: center;
        position: relative;
        .inspection-tag {
            margin-left: 8px;
        }
        .inspection-progress {
            margin-left: 8px;
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
        .copy-hint {
            position: absolute;
            top: 38px;
            font-size: 12px;
            font-weight: 400;
            font-family: PingFangSC-Regular;
            color: rgba(0, 0, 0, 0.35);
        }
    }
    .mtd-drawer-content {
        padding: 20px 24px 46px 24px;
        height: calc(100% - 48px);
        position: relative;
        .scroll-content {
            height: 100%;
            overflow: auto;
        }
        .title-text {
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 16px;
            margin-bottom: 16px;
        }
        .title-tips {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.35);
            margin-bottom: 16px;
            margin-top: 4px;
        }
        .progress,
        .info,
        .filter {
            margin-bottom: 32px;
        }
        .filter {
            .title-text {
                margin-bottom: 0;
            }
            .display-wrapper {
                margin-top: 16px;
            }
            .mtd-input-suffix-inner {
                width: 32px;
                line-height: 32px;
                font-size: 16px;
            }
            .mtd-select-search-field {
                margin: 0 0 0 4px;
            }
        }
        .progress {
            .inspector-wrapper {
                background: rgba(0, 0, 0, 0.04);
                border-radius: 8px;
                padding: 10px 12px;
                max-width: 208px;
                margin-top: 8px;
                .user-wrapper {
                    .user-name {
                        font-size: 14px;
                    }
                }
                .count {
                    font-size: 12px;
                    color: rgba(0, 0, 0, 0.5);
                    float: right;
                    line-height: 22px;
                }
            }
        }
        .rules {
            .mtd-input-number-wrapper {
                width: 48px;
                margin: 0 8px;
                .mtd-input-number {
                    padding: 0;
                }
            }
            .draw-amount-item {
                .mtd-form-item-label,
                .mtd-form-item-content {
                    line-height: 44px;
                }
                .mtd-radio-group {
                    flex-direction: column;
                }
                .mtd-input-number-wrapper {
                    margin-top: 5px;
                }
            }
            .mtdicon-question-circle-o {
                line-height: 20px;
                vertical-align: text-bottom;
            }
            .mtd-input-suffix-inner {
                width: 32px;
                line-height: 30px;
                font-size: 16px;
            }
            .mtd-select-tags {
                padding-left: 4px;
                .mtd-select-search-field {
                    margin: 0;
                }
            }
        }
        .mtd-form {
            .mtd-input-wrapper {
                width: 100%;
            }
        }
        .display-wrapper {
            .item {
                line-height: 22px;
                margin-bottom: 12px;
            }
            .label {
                color: rgba(0, 0, 0, 0.5);
                width: 98px;
                display: inline-block;
                text-align: right;
            }
            .user-wrapper {
                margin-right: 12px;
                .user-name {
                    font-size: 14px;
                }
            }
        }
    }
}
</style>