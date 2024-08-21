<template>
    <mtd-modal
        title="导入问题归档"
        v-model="showModal"
        :destroy-on-close="true"
        @close="cancel"
        class="import-archive-modal common-modal"
        width="530px">
        <mtd-button
            class="upload-btn"
            type="text"
            size="large"
            :loading="templateBtnLoading"
            @click="createExportTask"
            icon="mtdicon mtdicon-file-export">下载问题归档模板</mtd-button>

        <mtd-upload
            class="drag-upload"
            drag
            ref="archiveUpload"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            :on-remove="handelFileRemove"
            :on-change="handleFileChanged"
            accept=".xlsx"
            :limit="1"
            :multiple="false"
            :auto-upload="false"
            :action="`/api/cti/1.0/archive/import?rgId=${rgId}`">
            <i class="mtdicon-export-o" />
            <div class="mtd-upload-text">拖动Excel文件至该区域，或<em>点击上传</em></div>
            <div class="mtd-upload-text sub-title">支持扩展名：.xlsx，最大上传10M，只允许上传一个文件</div>
        </mtd-upload>
        <div v-if="showValidateMsg" class="upload-hint"><i :class="`mtdicon mtdicon-error-circle`" /><span>{{ uploadHint }}</span></div>

        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="cancel">取消</mtd-button>
            <mtd-button
                type="primary"
                class="tt-pure-btn"
                :disabled="submitBtnDisabled"
                :loading="submitBtnLoading"
                @click="confirm">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { Upload } from '@ss/mtd-vue';
@Component
export default class ImportModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: null })
    timestamp: Date;

    showModal: boolean = false;
    templateBtnLoading: boolean = false;
    submitBtnLoading: boolean = false;
    submitBtnDisabled: boolean = true;
    showValidateMsg: boolean = false;
    fileLink: string = '';
    objectName: string = '';
    uploadHint: string = '';
    validateStatus: 'success' | 'error' = 'error';
    $refs: { archiveUpload: Upload };

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    cancel () {
        this.$emit('update:visible', false);
    }
    async confirm () {
        this.submitBtnLoading = true;
        try {
            this.$refs.archiveUpload.submit();
        } catch (error) {
            this.submitBtnLoading = false;
            console.log(error);
        }
    }
    async createExportTask () {
        try {
            const res = await api.ctiApi.getArchiveExportTemplate(this.rgId);
            const { data, code } = res;
            if (code === 200 && data) {
                this.templateBtnLoading = false;
                this.$mtd.message.success(data);
            }
        } catch (error) {
            this.templateBtnLoading = false;
            console.log(error);
        }
    }
    beforeUpload (file) {
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            this.$mtd.message.error('上传文件大小不能超过 10MB');
        }
        return isLt10M;
    }
    handleUploadSuccess (res) {
        if (!res.data.success) {
            this.showValidateMsg = true;
            this.uploadHint = res.data.message || '上传失败请重试';
            this.submitBtnLoading = false;
            // 上传出错后不允许再次点击按钮
            this.submitBtnDisabled = true;
        } else {
            this.submitBtnLoading = false;
            this.$mtd.message.success(res.data.message || '导入成功');
            this.cancel();
        }
    }
    handleUploadError () {
        this.submitBtnLoading = false;
        this.$mtd.message.error('上传失败，请重试');
    }
    handleExceed () {
        this.$mtd.message.error('仅允许上传一个文件，请删除后重新上传');
    }
    handelFileRemove () {
        this.showValidateMsg = false;
        this.submitBtnDisabled = true;
    }
    handleFileChanged (file, fileList) {
        if (this.showValidateMsg) return;
        this.submitBtnDisabled = !fileList.length;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss" scoped>
.import-archive-modal {
    /deep/.mtd-modal-content-wrapper {
        .mtd-modal-content {
            .upload-btn {
                padding: 0;
                margin-top: 8px;
            }
            .drag-upload {
                margin-top: 4px;
                width: 100%;
                .mtd-upload {
                    width: 100%;
                    .sub-title {
                        font-size: 12px;
                        color: #ADADAD;
                    }
                }
                .mtd-upload-dragger {
                    width: 100%;
                }
                .mtd-upload-list-item-status-text {
                    top: 0;
                }
            }
            .upload-hint {
                display: flex;
                align-items: center;
                margin-top: 4px;
                padding-left: 4px;
                .mtdicon {
                    margin-right: 6px;
                    &.mtdicon-error-circle {
                        color: #F5483B;
                    }
                }
            }
        }
    }
}
</style>
