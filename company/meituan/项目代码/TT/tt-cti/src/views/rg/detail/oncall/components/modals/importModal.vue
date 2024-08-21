<template>
    <mtd-modal
        title="导入值班表"
        v-model="showModal"
        :destroy-on-close="true"
        @close="cancel"
        class="import-oncall-table-modal common-modal"
        width="530px">
        <mtd-button
            class="upload-btn"
            type="text"
            :loading="templateBtnLoading"
            @click="onTemplateBtnClick"
            icon="mtdicon-file-export">下载值班表模板</mtd-button>
        <div class="type-setting">
            值班信息新增类型<mtd-tooltip
                content="选择在原值班上增加此次导入的值班信息，会将此次导入的与原信息做班次叠加处理；选择覆盖原值班信息， 会将原来值班表的信息完全替换成本次导入的班次。"
                placement="top">
                <i class="mtdicon mtdicon-info-circle-o" />
            </mtd-tooltip><mtd-radio-group v-model="submitType">
                <mtd-radio value="add">在原值班类型上增加</mtd-radio>
                <mtd-radio value="override">覆盖原值班信息</mtd-radio>
            </mtd-radio-group>
        </div>
        <mtd-upload
            class="drag-upload"
            drag
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            :on-remove="handelFileRemove"
            accept=".xlsx"
            :limit="1"
            :multiple="false"
            :action="`/api/oncall/1.0/excel/precheck?rgId=${rgId}`">
            <i class="mtdicon-export-o" />
            <div class="mtd-upload-text">拖动Excel文件至该区域，或<em>点击上传</em></div>
            <div class="mtd-upload-text sub-title">支持扩展名：.xlsx，最大上传1M，只允许上传一个文件</div>
        </mtd-upload>
        <div v-if="showValidateMsg" class="upload-hint"><i :class="`mtdicon mtdicon-${validateStatus}-circle`" /><span>{{ uploadHint }}</span></div>

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
import { lxReportClick } from '@/utils/directive/lxanaly';
import { OncallReportMap } from '@/config/lx.conf';

@Component
export default class ImportModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: null })
    timestamp: Date;
    @Prop({ default: 'WEEK' })
    type: 'WEEK' | 'MONTH';

    showModal: boolean = false;
    templateBtnLoading: boolean = false;
    submitBtnLoading: boolean = false;
    submitBtnDisabled: boolean = true;
    showValidateMsg: boolean = false;
    templateLink: string = '';
    fileLink: string = '';
    objectName: string = '';
    uploadHint: string = '';
    validateStatus: 'success' | 'error' = 'error';
    submitType: 'add' | 'override' = 'add';

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    cancel () {
        this.templateLink = '';
        this.$emit('update:visible', false);
    }
    async confirm () {
        this.submitBtnLoading = true;
        try {
            const res = await api.oncallApi.uploadOncallExcel(this.rgId, {
                file: this.fileLink,
                objectName: this.objectName,
                isOverride: this.submitType === 'override'
            });
            const { code } = res;
            if (code === 200) {
                this.submitBtnLoading = false;
                this.$mtd.message.success('导入值班表成功！');
                lxReportClick(OncallReportMap.submit_import_oncall);
                this.$emit('success');
                this.$emit('update:visible', false);
            }
        } catch (error) {
            this.submitBtnLoading = false;
            console.log(error);
        }
    }
    onTemplateBtnClick () {
        this.templateBtnLoading = true;
        this.generateTemplate();
    }
    async generateTemplate () {
        try {
            const res = await api.oncallApi.getOncallTemplate({
                rgId: [this.rgId],
                timestamp: this.timestamp.getTime(),
                timeType: this.type
            });
            const { data, code } = res;
            if (code === 200 && data) {
                this.templateLink = data.file;
                this.templateBtnLoading = false;
                window.open(this.templateLink, '_blank');
            }
        } catch (error) {
            this.templateBtnLoading = false;
            console.log(error);
        }
    }
    beforeUpload (file) {
        const isLtOneM = file.size / 1024 / 1024 < 1;
        if (!isLtOneM) {
            this.$mtd.message.error('上传文件大小不能超过 1MB');
        }
        return isLtOneM;
    }
    handleUploadSuccess (res) {
        this.fileLink = res.data.file;
        this.objectName = res.data.objectName;
        this.uploadHint = res.data.info || '校验成功！';
        this.validateStatus = this.fileLink ? 'success' : 'error';
        this.submitBtnDisabled = !this.fileLink;
        this.showValidateMsg = true;
    }
    handleUploadError () {
        this.$mtd.message.error('上传失败，请重试');
    }
    handleExceed () {
        this.$mtd.message.error('仅允许上传一个文件，请删除后重新上传');
    }
    handelFileRemove () {
        this.fileLink = '';
        this.objectName = '';
        this.showValidateMsg = false;
        this.submitBtnDisabled = true;
    }
    get btnText () {
        return this.templateBtnLoading ? '下载中...' : (this.templateLink ? '下载值班表模板' : '生成值班表模板');
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="scss">
.import-oncall-table-modal {
    .mtd-modal-content {
        .type-setting {
            display: inline-flex;
            .mtd-tooltip-rel {
                color: #ADADAD;
                margin: 0 14px 0 2px;
            }
        }
        .upload-btn {
            padding: 0;
            margin-top: 8px;
            margin-bottom: 4px;
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
                &.mtdicon-success-circle {
                    color: #00B365;
                }
                &.mtdicon-error-circle {
                    color: #F5483B;
                }
            }
        }
    }
}
</style>
