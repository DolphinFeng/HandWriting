<template>
    <div class="create-comment-container" v-loading="!replyReady">
        <div :class="['comment-input-' + repliedId, 'comment-input']">
            <editor
                v-if="replyReady"
                ref="editor"
                :placeholder="placeholder || $getText('comment_input_placeholder', '请输入评论内容')"
                :value="editorData.value"
                :action="action"
                :focus="editorFocus"
                :reply-list="replyList"
                @input="handleChange"
                @imgUpload="handleImgUpload"
                @reply-quick="replyQuick">
                <div slot="toolbar">
                    <slot name="toolbar" />
                </div>
            </editor>
        </div>
        <div class="comment-btn">
            <mtd-button
                @click="submit"
                type="primary"
                :disabled="(!submitAvailable) || commentStatus === 'submiting' || imgUploadStatus">{{ $getText('comment_input_submit_btn', '提交') }}</mtd-button>
            <mtd-button
                @click="cancelComment"
                :disabled="commentStatus === 'submiting'">{{ $getText('comment_input_cancel_btn', '取消') }}</mtd-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import editor from './quill-editor.vue';
import * as api from '@/api';

@Component({
    components: {
        editor
    }
})
export default class CommentInput extends Vue {
    @Prop({ default: 0 })
    id: number;
    @Prop({ default: '' })
    action: string;
    @Prop({ default: 'ADDED' })
    type: string;
    @Prop({ default: 0 })
    repliedId: number;
    @Prop({ default: 0 })
    parentId: number;
    @Prop({ default: false })
    editorFocus: Boolean;
    @Prop({ default: '' })
    placeholder: string;
    @Prop({ default: '' })
    repliedMis: string;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    replyList: string[] = [];

    commentContent: string = '';
    editorData: any = {
        value: '',
        disabled: false
    };
    commentStatus: string = 'editing';
    imgUploadStatus: Boolean = false;
    replyReady: boolean = false;

    get submitAvailable () {
        return this.commentContent && this.commentContent.length > 0;
    }

    activated () {
        this.focusEditor();
    }

    focusEditor () {
        this.$refs.editor && this.$refs.editor.focus();
    }

    @Watch('info.rgId', { immediate: true })
    getRgId (rgId) {
        if (rgId) {
            this.replyReady = false;
            this.getRgReplyText(rgId);
        }
    }

    async getRgReplyText (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyText({
            rgId: rgId,
            type: 'COMMENT'
        });
        let { code, data } = res;
        if (code === 200) {
            this.replyList = data.items.map(item => item.content);
            this.replyReady = true;
            this.$nextTick(() => {
                this.focusEditor();
            });
        }
    }
    replyQuick (value: string) {
        this.$set(this.editorData, 'value', value);
        this.handleChange(value);
    }
    handleChange (value) {
        this.commentContent = value;
        if (value) {
            this.$store.commit('SET_GUARD_STATUS', {
                comment: true
            });
        } else {
            this.cancelCommitGuard();
        }
    }
    cancelCommitGuard () {
        this.$store.commit('SET_GUARD_STATUS', {
            comment: false
        });
    }
    cancelComment () {
        this.cancelCommitGuard();
        this.commentContent = '';
        this.$refs.editor.clear();
        // Emit cancel event for Parent Component
        this.$emit('cancelComment');
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    async submit () {
        this.cancelCommitGuard();
        this.submiting();
        this.pushComment();
    }
    async pushComment () {
        try {
            let ql = document.querySelector(`.comment-input-${this.repliedId}`).querySelector('.ql-editor');
            await api.ticketApi.pushComment({
                commentType: this.type,
                text: this.commentContent,
                parentId: 0,
                repliedId: this.repliedId,
                parentId: this.parentId,
                repliedMis: this.repliedMis,
                ticketId: this.id,
                toUsers: this.getToUsers(ql),
                urls: this.getImages(ql)
            });
            this.submited();
        } catch (e) {
            this.submitError();
            console.log(e);
        }
    }
    getToUsers (ql) {
        let atUsers = ql.querySelectorAll('span.mention') || [];
        let users = [];
        for (let i = 0; i < atUsers.length; i++) {
            if (atUsers[i].dataset.id) {
                users.push(atUsers[i].dataset.id);
            }
        }
        return users;
    }
    getImages (ql) {
        let images = [].slice.call(ql.querySelectorAll('img'));
        if (images) {
            return images.map(el => {
                if (el.getAttribute('src')) {
                    return el.getAttribute('src');
                }
            });
        } else {
            return [];
        }
    }
    submiting () {
        this.editorData.disabled = true;
        this.commentStatus = 'submiting';
    }
    submited () {
        this.commentStatus = 'submited';
        this.editorData.disabled = false;
        this.commentContent = '';
        this.$refs.editor.clear();
        this.$mtd.message({
            message: this.$getText('comment_input_submit_success', '评论提交成功'),
            type: 'success'
        });
        this.$emit('finishedComment');
    }
    submitError () {
        this.commentStatus = 'error';
        this.editorData.disabled = false;
        // this.$mtd.message.error(error);
    }
}
</script>

<style lang="scss" scoped>
.comment-input {
    margin-bottom: 15px;
    /deep/ .quill-editor .ql-container .ql-editor {
        min-height: 104px;
        max-height: 280px;
        .comment-btn {
            text-align: right;
            .mtd-btn {
                margin-left: 5px;
            }
        }
    }
}
</style>
