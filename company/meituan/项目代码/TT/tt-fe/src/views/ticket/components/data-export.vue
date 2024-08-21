<template>
    <div class="data-export-container">
        <div class="data-export-title-wrapper">
            <div class="operate-icon">
                <i
                    :class="['mtdicon', {'mtdicon-up': fold, 'mtdicon-down': !fold}]"
                    @click="foldFiles" />
                <i class="mtdicon mtdicon-close" @click="close" />
            </div>
            <h3>{{ exportState }}</h3>
        </div>
        <mtd-collapse
            type="sample"
            v-model="active"
            v-show="!fold">
            <mtd-collapse-item
                :key="task.id"
                v-for="(task, index) in taskList"
                :value="index">
                <div class="export-task-item" slot="title">
                    <span>{{ $getText('data_export_export_task', {index: index + 1}) }}</span>
                    <mtd-progress
                        type="circle"
                        :width="32"
                        :stroke-width="4"
                        :percentage="task.percentage"
                        :class="['data-prepare-progress', {'progress-success': task.percentage === 100 }]"
                        :status="task.finished ? 'success' : ''" />
                </div>
                <ul class="data-download-list-wrapper">
                    <li
                        :key="downloadIndex"
                        v-for="(download, downloadIndex) in downloadLinks[index]">
                        <a
                            :href="download.downloadUrl"
                            class="download-button">
                            {{ download.fileName }}
                            <span class="file-size">{{ download.fileSize | bytesFilter }}</span>
                        </a>
                    </li>
                </ul>
            </mtd-collapse-item>
        </mtd-collapse>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import * as api from '@/api';

/**
 * 数据导出
 *
 * @author liyuyao
 * @date 10/27/2020
 */
@Component
export default class DataExport extends Vue {
    @State(state => state.tt.downloadTasks)
    downloadTasks: string[];

    @Mutation setDownloadTask;

    downloadLinks: any[] = [];
    taskList: any = [];
    fold: boolean = false;
    interval: any = [];
    active: number = null;

    get exportState () {
        return this.allFinished ? this.$getText('data_export_load_complete', '加载完成') : this.$getText('data_export_loading', '数据加载中...');
    }

    get allFinished () {
        return this.taskList.every(task => !!task.finished);
    }

    @Watch('downloadTasks', { immediate: true })
    getTaskId (downloadTasks) {
        if (!downloadTasks.length) {
            this.taskList = [];
        } else {
            const index = this.downloadTasks.length - 1;
            const id = downloadTasks[index];
            this.taskList.push({
                taskId: id,
                percentage: 0,
                finished: false
            });
            this.interval[index] = setInterval(this.getDataExportProgress, 5000, id, index);
        }
    }

    async getDataExportProgress (taskId: string, index: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getDataExportProgress(taskId);
            const { code, data } = res;
            if (code === 200 && data) {
                this.taskList[index]['percentage'] = data.progress === -1 ? 0 : data.progress;
                this.taskList[index]['finished'] = data.progress === 100;
                if (data.progress === -1) {
                    this.$mtd.message({
                        type: 'error',
                        message: this.$getText('data_export_export_exception', '导出数据异常，请重试'),
                        duration: 0,
                        showClose: true
                    });
                    clearInterval(this.interval[index]);
                } else if (data.progress === 100) {
                    this.downloadLinks[index] = [data];
                    this.active = index;
                    clearInterval(this.interval[index]);
                }
            }
        } catch (e) {
            clearInterval(this.interval[index]);
        }
    }
    close () {
        if (this.allFinished) {
            this.setDownloadTask([]);
            return ;
        }
        this.$mtd.confirm({
            title: this.$getText('data_export_close_confirm_title', '关闭后导出任务将停止且无法恢复，是否退出'),
            width: '433px',
            showCancelButton: true,
            type: 'error',
            okButtonText: this.$getText('data_export_confirm', '确定'),
            cancelButtonText: this.$getText('ticket_clone_custom_btn_cancel', '取消'),
            onOk: async () => {
                this.setDownloadTask([]);
                this.interval.forEach(item => {
                    clearInterval(item);
                });
                this.taskList = [];
                this.$emit('close');
            }
        }).catch(e => e);
    }
    foldFiles () {
        this.fold = !this.fold;
    }
    // 从内存中销毁定时器
    beforeDestroy () {
        this.interval.forEach(item => {
            clearInterval(item);
        });
    }
    created () {
        window.onbeforeunload = () => {
            if (!this.allFinished) {
                // 导出任务未结束
                return this.$getText('data_export_unfinished_task', '仍有在进行中的数据导出任务，是否确认退出，退出后已导出的数据无法找回');
            } else {
                return null;
            }
        };
    }
}
</script>

<style lang="scss" scoped>
.data-export-container {
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: 580px;
    background: #fff;
    box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.02), 0 2px 6px 6px rgba(0, 0, 0, 0.02), 0 2px 6px 0 rgba(0, 0, 0, 0.06);
    border-radius: 10px;
    z-index: 2000;
    padding-bottom: 6px;
    .data-export-title-wrapper {
        padding: 8px 12px;
        background-color: #ffc300;
        border-radius: 10px 10px 0 0;
        .operate-icon {
            float: right;
            i {
                font-size: 16px;
                cursor: pointer;
            }
        }
        h3 {
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            letter-spacing: 0;
            line-height: 26px;
        }
    }
    .data-download {
        height: 24px;
    }
    .file-size {
        color: rgba(0, 0, 0, 0.36);
        font-size: 12px;
        float: right;
    }
    .download-button {
        width: 100%;
        display: block;
        color: rgba(0, 0, 0, 0.84);
        line-height: 24px;
    }
    .export-task-item {
        padding: 0 12px;
        font-size: 14px;
        font-family: PingFangSC-Medium;
        span {
            vertical-align: middle;
            line-height: 34px;
        }
        .data-prepare-progress {
            vertical-align: middle;
            float: right;
        }
    }
    /deep/ .mtd-collapse-item-content {
        padding: 0 12px 0 36px;
    }
    /deep/ .mtd-collapse-item .mtd-collapse-item-header {
        padding: 0 0 0 24px;
        .mtd-collapse-arrow {
            line-height: 34px;
            width: 38px;
        }
    }
    .mtd-collapse {
        border: none;
    }
    /deep/ .mtd-progress-icon {
        font-weight: 1000;
    }
    /deep/ .progress-success .mtd-progress-icon {
        &::before {
            content: "\e108";
        }
    }
}
</style>
