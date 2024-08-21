<template>
    <div class="create-attachment-wrapper">
        <div style="margin-bottom: 10px;">
            <span class="attachment-title">{{ $getText('create_attachment_attachment_title', '附件') }}</span>
            <mtd-upload
                class="upload-title"
                :action="uploadApi"
                :headers="{
                    'X-Login-Type': loginType
                }"
                :on-exceed="handleExceed"
                :before-upload="beforeUpload"
                :on-remove="handelFileRemove"
                :on-change="handelFileChange"
                :on-success="handelFileSuccess"
                :on-error="handelFileError"
                :auto-upload="false"
                ref="upload"
                :limit="10">
                <span class="upload-title">
                    <i class="mtdicon mtdicon-export-o" />{{ $getText('create_attachment_upload_title', '上传附件') }}
                    <mtd-tooltip
                        trigger="hover"
                        theme="dark"
                        placement="right"
                        size="small">
                        <div slot="content">
                            {{ $getText('create_attachment_upload', '文件大小不超过50M，可上传的文件类型') }}<br>
                            {{ $getText('create_attachment_pic', '图片') }}：<br>
                            .jpg,.jpeg,.png,.gif,.bmp,.wbmp,.webp,.tif,.psd<br>
                            {{ $getText('create_attachment_text', '文本') }}：<br>
                            .svg,.js,.jsx,.json,.css,.less,.xml,.thrift,.php,.java,.go,.log<br>
                            {{ $getText('create_attachment_compress', '压缩文件：') }}：<br>
                            .apk,.zip,.gz,.tgz,.gzip,.rar,.7z<br>
                            {{ $getText('create_attachment_media', '多媒体文件：') }}：<br>
                            .mp3,.mp4,.avi,.mkv,.3gp,.mov<br>
                            {{ $getText('create_attachment_doc', '文档文件：') }}：<br>
                            .xmind,.xlsx,.xls,.pptx,.ppt,.docx,.doc,.key,.csv,.db,.txt,.pages,.eml,.rp,.pdf,.crash
                        </div>
                        <i class="mtdicon mtdicon-info-circle-o" />
                    </mtd-tooltip>
                </span>
            </mtd-upload>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import eventBus from '@/utils/event-bus';

/**
 * 新版创建附件展示
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class CreateAttachment extends Vue {
    @Getter loginType;
    @Getter spaceDomain;

    ticketId: number = 0;
    attachment: any[] = [];
    fileSizeOk: boolean = false;

    @Prop()
    isOrdinaryFile: boolean;

    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach`;
    }

    mounted () {
        eventBus.$on('ordinaryFileUpload', this.emitUpload);
    }
    beforeDestroy () {
        eventBus.$off('ordinaryFileUpload', this.emitUpload);
    }
    emitUpload (id: number) {
        this.ticketId = id;
        this.$nextTick(() => {
            this.$refs.upload && this.$refs.upload.submit();
        });
    }
    handleExceed () {
        this.$mtd.message.error(this.$getText('create_attachment_upload_limit_tip', '仅允许上传10个附件'));
    }
    handelFileRemove (file, files) {
        this.attachment = files;
        this.judgeFileList(file, files);
    }
    handelFileChange (file, files) {
        this.attachment = files;
        if (file.size / 1024 / 1024 > 50) {
            this.$mtd.message.error(this.$getText('create_attachment_upload_size_tip', '上传附件大小需控制在50M以内'));
            this.attachment.pop();
        }
        this.judgeFileList(file, files);
        this.$emit('change', this.attachment);
    }
    judgeFileList (file, files) {
        this.fileSizeOk = true;
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 50) {
                this.fileSizeOk = false;
                break;
            }
        }
    }
    handelFileSuccess () {
        this.successRedirect();
    }
    handelFileError (err) {
        this.$mtd.message({
            message: err,
            type: 'error',
            duration: 5000
        });
    }
    // 附件上传前校验
    beforeUpload (file) {
        const isLt50M = file.size / 1024 / 1024 <= 50;
        if (!isLt50M) {
            this.$mtd.message.error(this.$getText('create_attachment_upload_size_control_tip', '上传附件大小控制在50M以内'));
        }
        this.fileSizeOk = isLt50M;
        return isLt50M;
    }
    successRedirect () {
        if (this.isOrdinaryFile) {
            this.$router.push({
                name: 'tt_detail',
                params: {
                    space: this.spaceDomain
                },
                query: {
                    id: this.ticketId
                }
            }).catch(e => e);
        }
    }
}
</script>

<style lang="scss" scoped>
.create-attachment-wrapper {
    margin-top: 24px;
}
.upload-button {
    display: inline-block;
}
.attachment-title,
.upload-title {
    display: inline-block;
    margin-right: 8px;
    padding-right: 8px;
    border-right: 1px solid rgba(0, 0, 0, 0.12);
    font-family: PingFang SC;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    line-height: 1;
    font-weight: 500;
    vertical-align: top;
}
.upload-title {
    border: none;
    color: rgba(0, 0, 0, 0.84);
    .mtdicon {
        vertical-align: middle;
        color: rgba(0, 0, 0, 0.6);
    }
}
</style>
