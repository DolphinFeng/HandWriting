<template>
    <div :class="['reply-field-edit-container', { 'common-reply-container': isReply }]">
        <Container @drop="onDropEvent" drag-handle-selector=".icon-handle">
            <Draggable v-for="(replyItem, index) in relayContentList" :key="index">
                <div class="reply-item-wrapper">
                    <i class="iconfont icon-handle" />
                    {{ replyItem && replyItem.content }}
                    <div class="edit-buttons">
                        <i class="mtdicon mtdicon-edit-o" @click="editContent(replyItem)" />
                        <i class="mtdicon mtdicon-delete-o" @click="deleteContent(replyItem)" />
                    </div>
                </div>
            </Draggable>
        </Container>
        <div class="fixed-bottom" style="display: flex; flex-direction: column; align-items: flex-start;">
            <div style="display: flex;">
                <mtd-button
                    style="margin-top: 0;"
                    icon="mtdicon mtdicon-file-add-o"
                    type="text"
                    :disabled="relayContentList.length >= limit"
                    @click="addReplyItem">添加</mtd-button>
                <template v-if="!isReply && type === 'CLOSED_REASON'">
                    <mtd-button
                        style="margin-top: 0;"
                        icon="mtdicon mtdicon-upload"
                        type="text"
                        @click="openImportModal">导入</mtd-button>
                    <mtd-button
                        style="margin-top: 0;"
                        icon="mtdicon mtdicon-download"
                        type="text"
                        @click="exportItems">导出</mtd-button>
                </template>
            </div>
            <span :style="{ paddingLeft: '12px', paddingBottom: '12px' }">{{ `最多可设置${limit}个` }}</span>
        </div>
        <mtd-modal
            :visible.sync="showImportModal"
            title="常用字段"
            v-model="showImportModal"
            :destroy-on-close="true"
            @close="cancel"
            class="import-archive-modal common-modal"
            width="530px">
            <mtd-button
                style="padding: 0; margin-top: 8px; margin-bottom: 4px;"
                type="text"
                :loading="templateBtnLoading"
                @click="onTemplateBtnClick"
                icon="mtdicon-file-export">下载常用字段模板</mtd-button>
            <mtd-upload
                class="drag-upload"
                style="text-align: center; padding-top: 16px;"
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
                :action="`/api/cti/1.0/rg/display/field/import?rgId=${rgId}&type=${type}`">
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
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Container, Draggable } from 'vue-smooth-dnd';
import { applyDrag } from '@/utils/helpers';
import * as api from '@/api';
import { parseInt } from 'lodash';
import { Upload } from '@ss/mtd-vue';
/**
 * 常用回复 字段设置
 *
 * @author liyuyao
 * @date 09/07/2020
 */
@Component({
    components: {
        Container,
        Draggable
    }
})
export default class ReplyFieldEdit extends Vue {
    @Prop({ default: 'PENDING_REASON' })
    type: string;
    @Prop({ default: false })
    isReply: boolean;
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: null })
    timestamp: Date;
    showImportModal: boolean = false;

    relayContentList: CommonTypes.replyItem[] = [];

    submitBtnLoading: boolean = false;
    templateBtnLoading: boolean = false;
    submitBtnDisabled: boolean = true;
    showValidateMsg: boolean = false;
    templateLink: string = '';
    fileLink: string = '';
    objectName: string = '';
    uploadHint: string = '';
    validateStatus: 'success' | 'error' = 'error';
    $refs: { archiveUpload: Upload };

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showImportModal = this.visible;
    }
    cancel () {
        this.showImportModal = false;
    }

    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }

    get limit () {
        if (this.isReply) {
            return 30;
        } else if (this.type === 'CLOSED_REASON') {
            return 1000;
        } else {
            return 10;
        }
    }

    get limitText () {
        return this.isReply ? 500 : 30;
    }

    get apiName () {
        return this.isReply ? 'Text' : 'Field';
    }

    mounted () {
        this.getRgReplyField();
    }

    onTemplateBtnClick () {
        this.templateBtnLoading = true;
        this.generateTemplate();
    }

    async generateTemplate () {
        try {
            const res = await api.oncallApi.getCloseTemplate({
                rgId: this.rgId,
                type: this.type
            });
            const { data, code } = res;
            if (code === 200 && data) {
                this.templateLink = data;
                this.templateBtnLoading = false;
                window.open(this.templateLink, '_blank');
            }
        } catch (error) {
            this.templateBtnLoading = false;
            console.log(error);
        }
    }

    async getRgReplyField () {
        const res = await api.rgApi[`getRgReply${this.apiName}`]({
            type: this.type,
            rgId: this.rgId
        });
        this.relayContentList = res.data.items;
    }

    onDropEvent (dropResult) {
        this.relayContentList = applyDrag(this.relayContentList, dropResult);
        const ids = this.relayContentList.map(item => item.id);
        this.sortContent(ids);
    }

    async sortContent (ids) {
        const res = await api.rgApi.sortFields({
            orderIds: ids,
            rgId: this.rgId,
            type: this.type
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message('操作成功！');
            this.getRgReplyField();
        }
    }
    deleteContent (replyItem) {
        const { id } = replyItem;
        if (!this.isReply && this.relayContentList.length <= 1) {
            this.$mtd.message.error('至少要保留一个字段');
            return;
        }
        this.$mtd.confirm({
            title: '删除选项',
            showCancelButton: true,
            type: 'error',
            message: `确定要删除选项“${replyItem.content}”吗？`,
            onOk: async () => {
                const res = await api.rgApi[`deleteReply${this.apiName}`](id, {
                    rgId: this.rgId
                });
                const { code } = res;
                if (code === 200) {
                    this.getRgReplyField();
                    this.$mtd.message.success('操作成功');
                }
            }
        }).catch(e => e);
    }

    addReplyItem () {
        this.$mtd.confirm({
            title: '添加选项',
            message: this.isReply ? '<textarea id="reply-edit-item" class="mtd-textarea" />' : '<input id="reply-edit-item" class="mtd-input" />',
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            onOk: async () => {
                const content = (document.getElementById('reply-edit-item') as HTMLInputElement).value;
                if (content.length && content.length <= this.limitText) {
                    const res = await api.rgApi[`addReply${this.apiName}`]({
                        content: content,
                        rgId: this.rgId,
                        type: this.type
                    });
                    const { code } = res;
                    if (code === 200) {
                        this.$mtd.message.success('操作成功');
                        this.getRgReplyField();
                    }
                } else {
                    this.$mtd.message.error(`选项内容限${this.limitText}字`);
                }
            }
        }).catch(e => e);
    }

    editContent (replyItem) {
        const { id } = replyItem;
        this.$mtd.confirm({
            title: '编辑选项',
            message: this.isReply ? `<textarea id="reply-edit-item" class="mtd-textarea">${replyItem.content}</textarea>` : `<input id="reply-edit-item" class="mtd-input" value="${replyItem.content}" />`,
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            onOk: async () => {
                const textareaElement = document.getElementById('reply-edit-item') as HTMLTextAreaElement;
                const content = textareaElement.value;
                if (content.length && content.length <= this.limitText) {
                    const res = await api.rgApi[`editReply${this.apiName}`]({
                        id: id,
                        content: content,
                        type: this.type,
                        rgId: this.rgId
                    });
                    const { code } = res;
                    if (code === 200) {
                        this.getRgReplyField();
                        this.$mtd.message.success('操作成功');
                    }
                } else {
                    this.$mtd.message.error(`选项内容限${this.limitText}字`);
                }
            }
        }).catch(e => e);
    }

    openImportModal () {
        this.showImportModal = true;
    }

    async exportItems () {
        const res = await api.ctiApi.exportReason({
            rgId: this.rgId,
            type: this.type
        });
        const { data, code } = res;
        if (code === 200 && data) {
            this.$mtd.message.success('导出成功');
            this.templateLink = data;
            window.open(this.templateLink, '_blank');
        }
    }

    async confirm () {
        this.submitBtnLoading = true;
        try {
            this.$refs.archiveUpload.submit();
        } catch (error) {
            this.submitBtnLoading = false;
            console.log(error);
        }
        this.showImportModal = false;
    }
    beforeUpload (file) {
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            this.$mtd.message.error('上传文件大小不能超过 10MB');
        }
        return isLt10M;
    }
    handleUploadSuccess (res) {
        if (res.code !== 200) {
            this.showValidateMsg = true;
            this.uploadHint = res.message || '上传失败请重试';
            this.submitBtnLoading = false;
            // 上传出错后不允许再次点击按钮
            this.submitBtnDisabled = true;
        } else {
            this.submitBtnLoading = false;
            this.$mtd.message.success(res.data || '导入成功');
            console.log('res.data.message', res.data);
            this.cancel();
        }
    }
    handleUploadError (error) {
        this.submitBtnLoading = false;
        let errorMessage = '上传失败，请重试';

        // 打印错误对象以检查其结构
        console.log('Upload error:', error);

        // 尝试解析错误消息中的 JSON 数据
        if (error && error.message) {
            try {
                const errorData = JSON.parse(error.message);
                if (errorData && errorData.data && errorData.data.errorMsg) {
                    errorMessage = errorData.data.errorMsg;
                }
            } catch (e) {
                console.error('Error parsing error message JSON:', e);
            }
        }

        console.log(errorMessage);
        this.$mtd.message.error(errorMessage);
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
}
</script>

<style lang="postcss">
.reply-field-edit-container {
    width: 520px;
    border: 1px solid rgba(0, 0, 0, 0.13);
    border-radius: 4px;
    max-height: 435px;
    overflow-y: auto;
    .icon-handle {
        cursor: move;
    }
    .reply-item-wrapper {
        line-height: 32px;
        padding: 2px 12px;
        &.relay-item-active {
            background: #F5F5F5;
        }
        &:hover {
            background: #F5F5F5;
        }
    }
    .edit-buttons {
        float: right;
        span,
        i {
            line-height: 32px;
            cursor: pointer;
            &:hover {
                color: #FF8800;
            }
        }
        i {
            font-size: 16px;
        }
    }
}
.fixed-bottom {
    position: sticky;
    bottom: 0;
    background: white;
    width: 100%;
}
.common-reply-container {
    width: 632px;
}
#reply-edit-item {
    width: 100%;
    padding: 0 4px;
    &.mtd-input {
        height: 32px;
    }
}
.import-archive-modal {
    /deep/.mtd-modal-content-wrapper {
        .mtd-modal-content {
            .drag-upload {
                margin-top: 4px;
                width: 480px;
                .mtd-upload {
                    width: 100%;
                    .sub-title {
                        font-size: 12px;
                        color: #ADADAD;
                    }
                }
                .mtd-upload-dragger {
                    width: 480px !important;
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
