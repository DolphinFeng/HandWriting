<template>
    <div>
        <el-upload
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
            <span class="text-button upload-button"><i class="iconfont icon-export" /> {{ $getText('component_file_upload_attachment', '上传附件') }}</span>
        </el-upload>
        <ul v-if="value && value.length">
            <li
                class="mtd-upload-list-item-name"
                :key="file.id"
                v-for="file in value">
                <i class="mtdicon mtdicon-link-o" />{{ file.name }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import { State, Getter, Mutation } from 'vuex-class';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentFile extends TemplateMixin {
    @Mutation uploadFileSuccess;
    @Mutation uploadFileFail;
    @State(state => state.tt.uploadFile) uploadFile;
    // 占位用，实际上是没有ticketid的: number = 0;
    @Getter uploadTicketId;
    @Getter loginType;

    attachment: any[] = [];
    fileSizeOk: boolean = false;

    @Watch('uploadFile')
    onUploadChange () {
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
        }
        this.judgeFileList(file, files);
        this.value = {
            attachment: this.attachment,
            fileSizeOk: this.fileSizeOk
        };
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
    handelFileSuccess (file) {
        this.uploadFileSuccess(true);
    }
    handelFileError (err) {
        this.$mtd.message({
            message: err,
            type: 'error',
            duration: 5000
        });
        this.uploadFileFail(true);
    }
    // 附件上传前校验
    beforeUpload (file) {
        const isLt50M = file.size / 1024 / 1024 <= 50;
        if (!isLt50M) {
            this.$mtd.message.error(this.$getText('create_attachment_upload_size_tip', '上传附件大小需控制在50M以内'));
        }
        this.fileSizeOk = isLt50M;
        return isLt50M;
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.uploadTicketId}&area=attach` : `/api/tt/1.0/file/upload?ticketId=${this.uploadTicketId}&area=attach`;
    }
}
</script>

<style lang="scss" scoped>
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
