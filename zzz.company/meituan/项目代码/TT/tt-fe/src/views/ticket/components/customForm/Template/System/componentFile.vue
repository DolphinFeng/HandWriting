<template>
    <mtd-upload
        class="upload-attachment"
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
            <i class="iconfont icon-upload" slot="icon" /><span class="upload-text">{{ $getText('ticket_info_attachment_upload_btn', '上传附件') }}</span>
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
                <i class="mtdicon mtdicon-info-circle-o" />
            </mtd-tooltip>
        </span>
    </mtd-upload>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import { Getter } from 'vuex-class';
import eventBus from '@/utils/event-bus';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentFile extends TemplateMixin {
    @Getter loginType;
    @Getter spaceDomain;

    ticketId: number = 0;
    attachment: any[] = [];
    fileSizeOk: boolean = false;
    uploadedNum: number = 0;

    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach`;
    }

    mounted () {
        eventBus.$on('customFileUpload', this.emitUpload);
    }
    beforeDestroy () {
        eventBus.$off('customFileUpload', this.emitUpload);
    }
    emitUpload (id: number) {
        this.ticketId = id;
        this.$nextTick(() => {
            this.$refs.upload && this.$refs.upload.submit();
        });
    }
    handleExceed () {
        this.$mtd.message.error(this.$getText('ticket_info_attachment_tip_upload_max_10', '仅允许上传10个附件'));
    }
    handelFileRemove (file, files) {
        this.attachment = files;
        this.judgeFileList(file, files);
    }
    handelFileChange (file, files) {
        this.attachment = files;
        if (file.size / 1024 / 1024 > 50) {
            this.$mtd.message.error(this.$getText('ticket_info_attachment_tip_size_limit', '上传附件大小需控制在50M以内'));
            this.attachment.pop();
        }
        this.judgeFileList(file, files);
        this.value = this.attachment;
        this.valueChange();
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
        this.uploadedNum ++;
        if (this.uploadedNum === this.attachment.length) {
            this.$emit('finish-upload');
            // this.successRedirect();
        }
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
            this.$mtd.message.error(this.$getText('ticket_info_attachment_tip_size_limit', '上传附件大小控制在50M以内'));
        }
        this.fileSizeOk = isLt50M;
        return isLt50M;
    }
    successRedirect () {
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
</script>

<style lang="scss" scoped>
.upload-title {
    display: inline-block;
    vertical-align: middle;
    .upload-text {
        margin-left: 4px;
    }
    .icon-upload {
        color: rgba(0, 0, 0, 0.6);
    }
    /deep/.mtd-tooltip-rel {
        width: 16px;
        display: inline-block;
        line-height: 20px;
        .mtdicon-info-circle-o {
            color: rgba(0, 0, 0, 0.36);
            display: inline;
            vertical-align: middle;
            font-size: 16px;
        }
    }
}
.field-icon {
    display: inline-block;
    width: 72px;
    height: 72px;
    padding: 12px 0;
    margin: 5px 5px 0 0;
    text-align: center;
    font-size: 12px;
    cursor: grab;
    border: 1px solid #ccc;
    border-radius: 4px;
    i {
        font-size: 20px;
    }
}
</style>
