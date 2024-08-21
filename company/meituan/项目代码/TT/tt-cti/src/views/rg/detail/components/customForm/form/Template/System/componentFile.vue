<template>
    <el-upload
        class="upload-attachment"
        :action="`/api/tt/1.0/file/upload/desc?area=attach`"
        :on-exceed="handleExceed"
        :before-upload="beforeUpload"
        :on-remove="handelFileRemove"
        :on-change="handelFileChange"
        :on-success="handelFileSuccess"
        :auto-upload="false"
        ref="upload"
        :limit="10"
        :disabled="readonly">
        <span class="text-button upload-button"><i class="iconfont icon-export" /> 上传附件</span>
    </el-upload>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentName extends TemplateMixin {
    // 占位用，实际上是没有ticketid的
    ticketId: number = 0;

    attachment: any[] = [];
    fileSizeOk: boolean = false;

    handleExceed () {
        this.$mtd.message.error('仅允许上传10个附件');
    }
    handelFileRemove (file, files) {
        this.attachment = files;
        this.judgeFileList(files);
    }
    handelFileChange (file, files) {
        this.attachment = files;
        if (file.size / 1024 / 1024 > 10) {
            this.$mtd.message.error('上传附件大小需控制在10M以内');
        }
        this.judgeFileList(files);
    }
    judgeFileList (files) {
        this.fileSizeOk = true;
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 10) {
                this.fileSizeOk = false;
                break;
            }
        }
    }
    handelFileSuccess () {
        console.log('file upload success');
        // this.successRedirect();
    }
    // 附件上传前校验
    beforeUpload (file) {
        const isLt10M = file.size / 1024 / 1024 <= 10;
        if (!isLt10M) {
            this.$mtd.message.error('上传附件大小控制在10M以内');
        }
        this.fileSizeOk = isLt10M;
        return isLt10M;
    }
}
</script>

<style lang="postcss" scoped>
.upload-attachment {
    display: inline-block;
}
</style>
