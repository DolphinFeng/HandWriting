<template>
    <div>
        <div class="title-wrapper">值班报表</div>
        <mtd-form
            :model="exportForm"
            ref="exportForm"
            :rules="settingFormRules"
            class="oncall-data-export-form"
            :label-width="84">
            <mtd-form-item
                label="报表名称："
                prop="type">
                <mtd-radio-group v-model="exportForm.type" @change="onFormTypeChanged">
                    <mtd-radio value="DUTY_LOG">值班表</mtd-radio>
                    <mtd-radio value="WORK_TIME_LOG">实际值班工时</mtd-radio>
                    <!-- <mtd-radio value="DUTY_CHANGE_LOG">值班变更记录</mtd-radio> -->
                    <mtd-radio value="CHECK_IN_LOG">值班签到记录</mtd-radio>
                </mtd-radio-group>
            </mtd-form-item>
            <mtd-form-item
                label="报表描述："
                prop="desc">
                <div>{{ oncallExportTableDesc[exportForm.type] }}</div>
            </mtd-form-item>
            <mtd-form-item
                label="日期范围："
                prop="date">
                <mtd-date-picker
                    :options="dateOptions"
                    v-model="exportForm.date"
                    type="monthrange" />
            </mtd-form-item>
            <div class="submit-wrapper">
                <mtd-button
                    icon="mtdicon mtdicon-download-o"
                    class="export-submit-btn"
                    :loading="loading"
                    @click="submitDownloadTask"
                    type="primary">
                    下载报表
                </mtd-button>
                <template v-if="showProgress">
                    <span :class="['loading-text', { 'success' : downloadProgress === 100 }]">{{ loadingText }}</span>
                </template>
            </div>
        </mtd-form>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { OncallExportTableDesc } from '@/config/map.conf';
import { Form } from '@ss/mtd-vue';
import * as api from '@/api';

const TODAY: Date = new Date(new Date().setHours(0, 0, 0, 0));
// 可查看的最早时间为23年4月
const START_DATE: Date = new Date(2023, 3, 0);

const validateDate: Function = (_rule, value, callback) => {
    if (!value || !value.length) {
        return callback(new Error('日期范围不能为空'));
    }

    const startTimestamp = value[0].getTime();
    const endTimestamp = value[1].getTime();
    const monthSpan = Math.floor((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24 * 30));

    const errorSelect = monthSpan > 2;
    if (errorSelect) {
        return callback(new Error('日期选择范围不能超过三个月'));
    }
    return callback();
};

type ExportFormType = 'CHECK_IN_LOG' | 'DUTY_CHANGE_LOG' | 'WORK_TIME_LOG' | 'DUTY_LOG';

interface ExportForm {
    type: ExportFormType;
    desc: string;
    date: Date[];
}

@Component
export default class DataExport extends Vue {
    exportForm: ExportForm = {
        type: 'DUTY_LOG',
        desc: '',
        date: [TODAY, TODAY]
    };
    oncallExportTableDesc: CommonTypes.mapObject = OncallExportTableDesc;
    settingFormRules = {
        date: [
            { validator: validateDate }
        ]
    };
    $refs: {
        exportForm: Form;
    };
    loading: boolean = false;
    showProgress: boolean = false;
    downloadProgress: number = 0;
    exportTaskId: number = 0;
    intervalId: number = 0;
    timeoutId: number = 0;
    intervalDuration: number = 5000; // 每5s查询一次
    timeoutDuration: number = 180000; // 首次查询超过3min后取消定时任务

    onFormTypeChanged (val) {
        // 由于 值班表 的可选时间范围与其他表不同，因此如果截止时间超过当天，
        const hasInvalidEndDate = this.exportForm.date[1].getTime() > TODAY.getTime();
        if (val !== 'DUTY_LOG' && hasInvalidEndDate) {
            this.$set(this.exportForm.date, 1, TODAY);
            if (this.exportForm.date[0].getTime() > TODAY.getTime()) {
                this.$set(this.exportForm.date, 0, TODAY);
            }
            this.$refs.exportForm.validate().catch(e => {
                console.log('error: ', e);
            });
        }
    }
    disabledDate (date: Date) {
        // 仅值班表可选时间范围“不”截止到当天所在月
        const notOncallTable = this.exportForm.type !== 'DUTY_LOG';
        const startRule = date.getTime() < START_DATE.getTime();
        const endRule = date.getTime() > TODAY.getTime();
        return notOncallTable ? (startRule || endRule) : startRule;
    }
    submitDownloadTask () {
        this.$refs.exportForm.validate(valid => {
            if (valid) {
                this.loading = true;
                this.downloadProgress = 0;
                this.addOncallExportTask();
            }
        }).catch(e => {
            console.log('error: ', e);
        });
    }
    async addOncallExportTask () {
        try {
            const res = await api.oncallApi.addOncallExportTask({
                type: this.exportForm.type,
                rgId: this.rgId,
                startAt: this.formatDateParam(this.exportForm.date[0]),
                endAt: this.formatDateParam(this.exportForm.date[1])
            });
            const { code, data } = res;
            if (code === 200) {
                this.showProgress = true;
                this.exportTaskId = data.taskId;
                this.loading = false;
                this.getExportProgress();
            }
        } catch (error) {
            console.log(error);
            this.loading = false;
        }
    }
    async getExportProgress () {
        try {
            const res = await api.oncallApi.getOncallExportProgress({
                taskId: this.exportTaskId
            });
            const { code, data } = res;
            if (code === 200) {
                if (!this.intervalId) {
                    this.intervalId = setInterval(this.getExportProgress, this.intervalDuration);
                    this.timeoutId = setTimeout(() => {
                        clearInterval(this.intervalId);
                    }, this.timeoutDuration);
                }
                if (data.file) {
                    this.downloadProgress = 100;
                    clearInterval(this.intervalId);
                    this.intervalId = 0;
                    clearTimeout(this.timeoutId);
                    window.open(data.file);
                } else {
                    // 继续轮询
                    this.downloadProgress = data.progress || 0;
                }
            }
        } catch (error) {
            console.log(error);
            // 停止 轮询、停止轮询的定时器
            clearInterval(this.intervalId);
            clearTimeout(this.timeoutId);
        }
    }
    beforeDestory () {
        clearInterval(this.intervalId);
        clearTimeout(this.timeoutId);
    }
    formatDateParam (date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 月份从 0 开始，需要加 1
        const formattedMonth = month < 10 ? `0${month}` : month; // 如果月份小于 10，前面补零
        return `${year}-${formattedMonth}`;
    }
    get dateOptions () {
        return {
            disabledDate: this.disabledDate
        };
    }
    get loadingText () {
        return this.downloadProgress === 100 ? '下载成功！' : `下载中请稍候... ${this.downloadProgress}%`;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss" scoped>
.title-wrapper {
    padding: 12px 0;
    text-align: left;
    font-weight: 600;
    font-size: 16px;
    line-height: 32px;
}
.oncall-data-export-form {
    .submit-wrapper {
        display: flex;
        align-items: center;
        .export-submit-btn {
            margin-right: 10px;
        }
        .loading-text {
            font-size: 12px;
            display: inline-block;
            margin-left: 4px;
            color: rgba(0, 0, 0, 0.35);
            &.success {
                color: #00B365;
            }
        }
    }
}
</style>
