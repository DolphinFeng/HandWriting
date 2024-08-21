<template>
    <div class="ticket-desc-container">
        <div
            class="const-content ql-editor"
            ref="editorArea"
            v-html="ticketDesc"
            v-if="!edit"
            v-viewer="{ movable: true }" />
        <div v-else>
            <editor
                :is-comment="false"
                @input="handleDescChange"
                @imgUpload="handleImgUpload"
                :value="currentContent"
                :action="uploadApi" />
            <div class="save-button-container" v-if="!globalEdit">
                <mtd-button
                    @click="contentSave"
                    type="primary"
                    :disabled="imgUploadStatus || (!currentContent)">{{ $getText('ticket_info_desc_edit_save', '保存') }}</mtd-button>
                <mtd-button
                    @click="cancelContentSave">{{ $getText('ticket_info_desc_edit_cancel', '取消') }}</mtd-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { markHyperLink } from '@/utils/tools';
import { Getter } from 'vuex-class';

import Editor from '@/components/quill-editor.vue';
import 'quill/dist/quill.snow.css';


/**
 * Ticket详情
 *
 * @author liyuyao
 * @date 04/18/2020
 */
@Component({
    components: {
        Editor
    }
})
export default class TicketDesc extends Vue {
    @Prop({ default: '' })
    ticketDesc: string;

    @Prop({ default: false })
    edit: boolean;

    @Prop({ default: false })
    globalEdit: boolean;

    @Getter loginType;

    currentContent: string = '';
    imgUploadStatus: Boolean = false;

    get ticketId () {
        return this.$route.query.id;
    }

    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=desc` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=desc`;
    }

    mounted () {
        window.addEventListener('keydown', this.bindCodeEvent, false);
    }
    beforeDestroy () {
        window.removeEventListener('keydown', this.bindCodeEvent);
    }

    bindCodeEvent (e) {
        if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            if (this.edit) {
                this.contentSave();
            }
        }
    }

    @Watch('ticketDesc', { immediate: true })
    getTicketDesc (val) {
        this.currentContent = val;
    }

    changeEditStatus (edit: boolean) {
        this.$emit('update:edit', edit);
    }
    // 原位编辑 暂时下掉
    clickContent ($event) {
        const node = $event.target.nodeName;
        // 点击到图片时，不触发编辑
        if (node !== 'IMG') {
            this.changeEditStatus(true);
        }
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    handleDescChange (value) {
        this.currentContent = value;
    }
    contentSave () {
        if (!this.currentContent) {
            this.$mtd.message.warning(this.$getText('ticket_info_desc_tip_save_fail', '保存失败：描述不能为空！'));
            return ;
        } else if (this.imgUploadStatus) {
            this.$mtd.message.warning(this.$getText('ticket_info_desc_tip_save_loading', '请等待图片上传完成'));
            return ;
        }
        let desc = markHyperLink(this.currentContent);
        this.$emit('update:ticketDesc', desc);
        this.$emit('submit');
        this.changeEditStatus(false);
    }
    cancelContentSave () {
        // 内容无修改时，不出现确认离开的弹窗
        if (this.currentContent === this.ticketDesc) {
            this.changeEditStatus(false);
        } else {
            this.$mtd.confirm({
                title: this.$getText('ticket_info_desc_tip_save_confirm', '确定要取消保存吗？系统不会保存您所做的更改'),
                width: '433px',
                showCancelButton: true,
                type: 'warning',
                okButtonText: this.$getText('ticket_info_desc_cancel_edit_btn', '确定'),
                cancelButtonText: this.$getText('ticket_info_desc_edit_cancel', '取消'),
                onOk: () => {
                    this.changeEditStatus(false);
                    this.currentContent = this.ticketDesc;
                }
            }).catch(e => { console.log(e); });
        }
    }
}
</script>

<style lang="scss">
.ticket-desc-container {
    margin: 10px 0;
    .const-content {
        height: auto;
        border-radius: 4px;
        padding: 8px 12px 8px 0;
        border: 1px solid #fff;
        // &:hover {
        //     background: #f5f5f5;
        //     border: 1px solid rgba(0, 0, 0, 0.12);
        //     cursor: pointer;
        // }
    }
    img {
        height: auto;
        max-width: 100%;
    }
    .save-button-container {
        margin-top: 10px;
        .mtd-btn {
            width: 80px;
        }
    }
}
</style>
