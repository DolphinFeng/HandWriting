<template>
    <div class="comment-container" ref="container">
        <div
            class="comment-content"
            v-loading="loading">
            <ul>
                <li
                    v-for="(item, index) in commentList"
                    class="comment-list parent-comment"
                    :key="index">
                    <CommentItem 
                        :info="item"
                        :id="ticketId"
                        @reply="handleReply"
                        @focus="handleFocus"
                        @updateComment="resetComment" />
                    <div
                        class="comment-list-child"
                        v-if="item.children && item.children.length">
                        <ul>
                            <li
                                v-for="(item2, index2) in item.children"
                                class="comment-list"
                                :key="index2">
                                <CommentItem
                                    :info="item2"
                                    :id="ticketId"
                                    @reply="handleReply"
                                    @focus="handleFocus"
                                    @updateComment="resetComment" />
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
        <div class="comment-edit-input">
            <img :src="userAvatar || defaultAvatar" class="user-avatar">
            <div
                class="comment-show-input"
                v-if="!editStatus"
                @click="editStatus = true">{{ $getText('ticket_info_comment_placement', 'Command+V粘贴截图，@提醒TA查看评论') }}</div>
            <keep-alive>
                <comment-input
                    v-if="editStatus"
                    class="new-comment"
                    :placeholder="$getText('ticket_info_comment_placement', 'Command+V粘贴截图，@提醒TA查看评论')"
                    ref="newComment"
                    :info="info"
                    :id="ticketId"
                    :replied-id="repliedId"
                    :parent-id="parentId"
                    :action="uploadApi"
                    :type="type"
                    :replied-mis="parentMis"
                    :reply-list="replyList"
                    @finishedComment="resetComment"
                    @cancelComment="editStatus = false">
                    <span
                        v-show="type === 'REPLIED'"
                        class="reply-to"
                        slot="toolbar">{{ $getText('ticket_info_comment_reply_tip', {person: parentName}) }}
                        <mtd-tooltip :content="$getText('ticket_info_comment_cancel_reply', '取消回复')" placement="top">
                            <i @click="handleClose" class="mtdicon mtdicon-close" />
                        </mtd-tooltip>
                    </span>
                </comment-input>
            </keep-alive>
        </div>
    </div>
</template>

<script lang="ts">
import CommentInput from '@/components/comment-input.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import { DEFAULT_AVATAR } from '@/config/map.conf';

import * as api from '@/api';
import CommentItem from '@/components/comment-item.vue';
import eventBus from '@/utils/event-bus';
/**
 * Ticket评论
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component({
    components: {
        CommentItem,
        CommentInput
    }
})
export default class Comment extends Vue {
    @State(state => state.tt.userInfo.avatar)
    userAvatar: CommonTypes.UserInfoItem;

    @Getter loginType;

    @Prop({ default: 0 })
    count: number;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    ticketId: number = 0;
    loading: Boolean = false;
    commentList: any[] = [];
    type: 'ADDED' | 'REPLIED' = 'ADDED';
    repliedId: number = 0;
    parentId: number = 0;
    parentName: string = '';
    parentMis: string = '';

    editStatus: boolean = false;
    defaultAvatar: string = DEFAULT_AVATAR;
    width: number = 700;
    replyList: string[] = [];

    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment`;
    }

    @Watch('info')
    onInfoChange () {
        this.width = this.$refs.container && this.$refs.container.clientWidth;
        this.getCommentRecord();
    }

    mounted () {
        this.ticketId = parseInt(this.$route.query.id, 10);
        this.getCommentRecord();
        eventBus.$on('message', this.getCommentMessage);
    }
    resetComment () {
        this.editStatus = false;
        this.type = 'ADDED';
        this.$emit('update');
        this.getCommentRecord();
    }
    // 获取评论
    async getCommentRecord () {
        if (!this.ticketId) return;
        this.loading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getCommentRecord(this.ticketId);
            let { code, data } = res;
            if (code === 200) {
                this.commentList = data.items;
                this.$emit('update:count', this.commentList.length);
            }
        } catch (e) {
            console.log(e);
        }
        this.loading = false;
    }
    handleFocus () {
        this.editStatus = true;
        this.$nextTick(() => {
            this.$refs.newComment && this.$refs.newComment.$refs.editor && this.$refs.newComment.$refs.editor.focus();
        });
    }
    handleReply (id: number, name: string, mis: string, parentId: number) {
        this.editStatus = true;
        // 首层回复时 parentId = repliedId
        if (id && !parentId) {
            parentId = id;
        }
        this.repliedId = id;
        this.parentName = name;
        this.parentMis = mis;
        this.parentId = parentId;
        this.type = 'REPLIED';
    }
    handleClose () {
        this.repliedId = 0;
        this.parentName = '';
        this.parentId = 0;
        this.type = 'ADDED';
    }
    getCommentMessage (data) {
        const { ticketId, isNewComment } = data;
        if (ticketId === this.ticketId && isNewComment) {
            this.getCommentRecord();
            this.$mtd.notify.info({
                title: this.$getText('ticket_info_comment_new_comment', '您有一条新评论'),
                message: '',
                className: 'tt-new-message-notify',
                duration: 5000,
                showClose: false
            });
        }
    }
    beforeDestroy () {
        eventBus.$off('message', this.getCommentMessage);
    }
}
</script>

<style lang="scss" scoped>
.comment-container {
    text-align: left;
    padding-bottom: 30px;
    .comment-content {
        ul {
            margin: 0;
        }
    }
    .comment-list {
        list-style: none;
        &.parent-comment {
            &:not(:last-child) {
                padding-bottom: 8px;
            }
        }
    }
    .comment-list-child {
        margin-left: 34px;
    }
    .reply-to {
        position: absolute;
        top: 11px;
        right: 14px;
    }
    .comment-edit-input {
        position: absolute;
        bottom: 0;
        background: #fff;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        margin-left: -16px;
        padding: 16px;
        z-index: 99;
        width: calc(100% - 274px);
        .user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            vertical-align: middle;
        }
        .comment-show-input {
            display: inline-block;
            width: calc(100% - 36px);
            line-height: 23px;
            padding: 0 12px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.24);
            cursor: text;
        }
        .create-comment-container {
            display: inline-block;
            width: calc(100% - 36px);
        }
    }
}
</style>