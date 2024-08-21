<template>
    <div class="ticket-attachment-container">
        <div class="attachment-container">
            <div class="upload-container">
                <h3>{{ $getText('ticket_info_attachment_label', '附件') }}</h3>
                <el-upload
                    :class="['upload-attachment', { 'not-uploading': !onUploadStart }]"
                    :action="uploadApi"
                    :headers="{
                        'X-Login-Type': loginType
                    }"
                    :on-exceed="handleExceed"
                    :before-upload="beforeUpload"
                    :before-remove="beforeRemove"
                    :on-change="handelFileChange"
                    :on-success="handelFileSuccess"
                    :on-error="handelFileError"
                    ref="upload"
                    :limit="9 - attachmentLength"
                    v-if="itemPermission('attachment').editable">
                    <div class="button-container">
                        <span
                            class="text-button upload-button"
                            v-lxay
                            lxay-act="moduleClick"
                            lxay-bid="b_onecloud_xdpun9pj_mc"><i class="mtdicon mtdicon-export-o" />{{ $getText('ticket_info_attachment_upload_btn', '上传附件') }}</span>
                    </div>
                </el-upload>
                <mtd-tooltip
                    trigger="hover"
                    theme="dark"
                    placement="right"
                    size="small">
                    <div slot="content">
                        {{ $getText('ticket_info_attachment_tip_upload', '文件大小不超过50M，可上传的文件类型') }}<br>
                        {{ $getText('ticket_info_attachment_tip_pic', '图片') }}：<br>
                        .jpg,.jpeg,.png,.gif,.bmp,.wbmp,.webp,.tif,.psd<br>
                        {{ $getText('ticket_info_attachment_tip_text', '文本') }}：<br>
                        .svg,.js,.jsx,.json,.css,.less,.xml,.thrift,.php,.java,.go,.log<br>
                        {{ $getText('ticket_info_attachment_tip_compress', '压缩文件：') }}：<br>
                        .apk,.zip,.gz,.tgz,.gzip,.rar,.7z<br>
                        {{ $getText('ticket_info_attachment_tip_media', '多媒体文件：') }}：<br>
                        .mp3,.mp4,.avi,.mkv,.3gp,.mov<br>
                        {{ $getText('ticket_info_attachment_tip_doc', '文档文件：') }}：<br>
                        .xmind,.xlsx,.xls,.pptx,.ppt,.docx,.doc,.key,.csv,.db,.txt,.pages,.eml,.rp,.pdf,.crash
                    </div>
                    <i class="mtdicon mtdicon-question-circle-o" />
                </mtd-tooltip>
            </div>
            <div class="attachment-wrapper" v-viewer="options">
                <div class="attachment-item" v-show="onUploadStart" />
                <div
                    class="attachment-item"
                    v-for="item in info.attachment"
                    :key="item.id">
                    <div class="attachment-info-container">
                        <div class="attachment-icon">
                            <img
                                v-if="item.thumbnailUrl"
                                :src="item.thumbnailUrl"
                                :data-src="item.url">
                            <i
                                v-else
                                :class="`iconfont ${AttachmentIconMap[getAttachType(item)] || 'icon-text'}`"
                                @click="attachmentPreview(item.id)" />
                        </div>
                        <div class="attachment-info">
                            <h5 class="item-name">{{ item.name }}</h5>
                            <p class="attachment-upload-info">
                                <span>{{ getFileSize(item.size) }}</span>
                                <span style="margin-left:12px;">{{ item.createdBy }}</span>
                                <span class="create-user">{{ item.createdAt | formatTimeWithoutYear }}</span>
                            </p>
                        </div>
                    </div>
                    <div class="attachment-operate-container">
                        <a :href="item.url" class="attachment-operate-icon">
                            <i class="mtdicon mtdicon-download-o" />
                        </a>
                        <i
                            class="mtdicon mtdicon-delete-o attachment-operate-icon"
                            v-if="itemPermission('attachment').editable"
                            @click="deleteAttachment(item)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { itemPermission } from '@/utils/tools';
import * as api from '@/api';
import { attachmentIconMap } from '@/config/map.conf';
import { getFileSize } from '@/utils/tools/index';

/**
 * Ticket附件
 *
 * @author liyuyao
 * @date 04/23/2019
 */
@Component
export default class TicketAttachment extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Getter misX;
    @Getter loginType;

    ticketId: number = 0;
    editVisible: Boolean = false;
    onUploadStart: Boolean = false;

    options: CommonTypes.mapObject = {
        movable: true,
        url: 'data-src'
    };
    AttachmentIconMap: CommonTypes.mapObject = attachmentIconMap;
    getFileSize: Function = getFileSize;
    itemPermission: Function = itemPermission;

    mounted () {
        this.onUploadStart = false;
        this.ticketId = this.$route.query.id;
    }
    handleExceed () {
        this.$mtd.message.error(this.$getText('ticket_info_attachment_tip_upload_max_10', '仅允许上传10个附件'));
    }
    handelFileChange (file, files) {
        this.onUploadStart = true;
    }
    handelFileSuccess (file) {
        this.$mtd.message.success(this.$getText('ticket_info_attachment_tip_upload_success', '附件上传成功'));
        this.$refs.upload?.clearFiles();
        this.$emit('upload');
    }
    handelFileError (err) {
        this.$mtd.message.error(err);
        this.$emit('upload');
    }
    // 附件上传前校验
    beforeUpload (file) {
        const isLt50M = (file.size / 1024 / 1024) <= 50;
        if (!isLt50M) {
            this.$mtd.message.error(this.$getText('ticket_info_attachment_tip_size_limit', '上传附件大小控制在'));
        }
        return isLt50M;
    }
    // 删除上传文件的事件
    beforeRemove () {
        this.$emit('upload');
    }
    get attachmentLength () {
        let length = this.info.attachment ? this.info.attachment.length : 0;
        return length;
    }
    reMounted () {
        this.onUploadStart = false;
    }
    getAttachType (item) {
        const name = item.name || '';
        let type = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
        return type || 'default';
    }
    matchAttachType (item, fileTypes) {
        let isMatch = true;
        let name = item.name || '';
        let type = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
        if (fileTypes.indexOf(type) < 0) {
            isMatch = false;
        }
        return isMatch;
    }
    async deleteAttachment (item) {
        const res: Ajax.AxiosResponse = await api.ticketApi.deleteAttachment(item.id);
        let { code } = res;
        if (code === 200) {
            this.$mtd.message({
                type: 'success',
                message: this.$getText('ticket_info_attachment_tip_delete_success', '删除成功')
            });
            this.$emit('upload');
        } else {
            this.$mtd.message({
                type: 'error',
                message: this.$getText('ticket_info_attachment_tip_delete_fail', '删除失败')
            });
        }
    }
    async attachmentPreview (attachmentId: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.attachmentPreview(attachmentId);
            let { code, data } = res;
            if (code === 200 && data.convertStatus) {
                const convertStatus = data.convertStatus;
                if (convertStatus === 'CONVERTED') {
                    window.open(data.previewUrl, '_blank');
                } else if (convertStatus === 'FAILED') {
                    this.$mtd.message.error(this.$getText('ticket_info_attachment_tip_preview_fail', '转码失败，请下载查看'));
                } else if (convertStatus === 'CONVERTING' || convertStatus === 'UNCONVERT') {
                    this.$mtd.message.info(this.$getText('ticket_info_attachment_tip_preview_loading', '转码中，请稍后查看'));
                }
            } else if (data.resDesc) {
                this.$mtd.message.info(data.resDesc);
            }
        } catch (e) {
            this.$mtd.message.error(this.$getText('ticket_info_attachment_tip_preview_fail', '转码失败，请下载查看'));
        }
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach`;
    }
}
</script>

<style lang="scss">
.ticket-attachment-container {
    .text-button {
        display: inline-block;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        cursor: pointer;
    }
    .mtdicon-export-o {
        font-size: 15px;
    }
    .mtdicon-question-circle-o {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.24);
    }
    .attachment-container {
        position: relative;
        h3 {
            display: inline-block;
            margin-right: 8px;
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
        }
        .el-upload__tip {
            display: inline-block;
            margin-top: 0;
        }
        .upload-container {
            margin-bottom: 8px;
            ul.el-upload-list {
                position: absolute;
                top: 32px;
                left: 0;
                width: calc(50% - 12px);
                min-height: 60px;
                line-height: 32px;
                padding: 10px;
                margin: 0 12px 12px 0;
                border: 1px solid #edf0f7;
                border-radius: 2px;
                color: #464646;
                vertical-align: top;
                z-index: 5;
                .el-upload-list__item.is-uploading {
                    margin-top: 0;
                    .el-progress-bar__inner {
                        background: #1c6cdc;
                    }
                }
            }
        }
        .upload-attachment {
            display: inline-block;
            &.not-uploading {
                ul.el-upload-list {
                    display: none;
                }
            }
        }
    }
    .attachment-wrapper {
        div:nth-child(odd) {
            margin-right: 0;
        }
    }
    .attachment-item {
        display: inline-flex;
        align-items: center;
        position: relative;
        width: calc(50% - 12px);
        min-height: 60px;
        padding: 8px;
        margin: 0 12px 12px 0;
        border-radius: 4px;
        color: rgba(0, 0, 0, 0.87);
        background: #f7f7f7;
        vertical-align: top;
        .item-name {
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: PingFangSC-Medium;
            font-size: 14px;
            line-height: 20px;
            color: rgba(0, 0, 0, 0.84);
        }
        .attachment-operate-container {
            .attachment-operate-icon {
                padding: 4px;
                color: #000;
                font-size: 16px;
                cursor: pointer;
            }
        }
        .attachment-info-container {
            flex: 1;
            display: flex;
            align-items: center;
            width: calc(100% - 60px);
            .attachment-icon {
                max-width: 44px;
                height: 44px;
                // line-height: 1;
                cursor: pointer;
                .iconfont {
                    display: block;
                    font-size: 36px;
                    line-height: 44px;
                    &.icon-pdf {
                        color: #f52;
                    }
                    &.icon-ppt {
                        color: #fd3c1c;
                    }
                    &.icon-word {
                        color: #1753d4;
                    }
                    &.icon-numbers,
                    &.icon-excel {
                        color: #16a852;
                    }
                    &.icon-pages {
                        color: #fd7409;
                    }
                    &.icon-mov1 {
                        color: #7825e3;
                    }
                }
                img {
                    border-radius: 2px;
                    background: #fff;
                }
            }
            .attachment-info {
                flex: 1;
                padding-left: 8px;
                width: calc(100% - 60px);
            }
        }
        .attachment-upload-info {
            font-size: 12px;
            line-height: 17px;
            color: rgba(0, 0, 0, 0.38);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: flex;
            .create-user {
                display: inline-block;
                margin-left: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}
</style>