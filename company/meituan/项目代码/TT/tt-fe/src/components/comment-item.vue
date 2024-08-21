<template>
    <div class="comment-item">
        <div class="comment-title">
            <i class="icon">
                <img
                    :src="userAvatar"
                    class="user-avatar"
                    v-if="inside">
            </i>
            <span class="name">{{ info.i18nDisplayName || info.displayName }}<span v-if="inside">/{{ info.createdBy }}</span></span>
            <span class="reply-tag" v-if="info.repliedId && info.commentType === 'REPLIED'"><span class="replied-mis">{{ `${$getText('ticket_info_comment_reply_tag', '回复')} ${info.replied.displayName}` }} <span v-if="inside">({{ info.replied.name }})</span></span></span>
            <span class="remarkTime gray-color">
                {{ info.createdAt | formatTimeWithTimeZone }}
            </span>
        </div>
        <div class="comment-content text" v-viewer.static="{ movable: true }">
            <span v-if="info.commentType === 'DELETED'" class="delete-content">{{ $getText('ticket_info_comment_tip_deleted', '该评论已删除') }}</span>
            <div
                v-else
                ref="commentContent"
                v-html="MarkHyperLink(info.text)"
                class="ql-editor comment-show" />
        </div>
        <div class="comment-opetation">
            <span
                class="comment-operate-button"
                v-if="info.commentType !== 'DELETED'"
                @click="reply(info.id, info.displayName, info.createdBy, info.parentId)"><i class="mtdicon mtdicon-comment" /></span>
            <span
                class="comment-operate-button"
                v-if="info.createdBy === userInfo.username && (info.commentType !== 'DELETED')"
                @click="deleteComment(info.id)"><i class="mtdicon mtdicon-delete-o" /></span>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';

import CommentInput from '@/components/comment-input.vue';
import * as api from '@/api';

import { submitAndGetUserInfo, markHyperLink } from '@/utils/tools';
import { DEFAULT_AVATAR } from '@/config/map.conf';

/**
 * Ticket列表
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        CommentInput
    }
})
export default class CommentItem extends Vue {
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    @Getter inside;

    @Prop({ default: 0 })
    id: number;
    @Prop()
    info: any;
    replyId: number = 0;
    showInput: Boolean = false;
    focus: Boolean = false;
    MarkHyperLink: Function = markHyperLink;

    userAvatar: string = DEFAULT_AVATAR;

    async mounted () {
        await this.updateUserAvatar();
    }

    async updated () {
        await this.updateUserAvatar();
    }

    async updateUserAvatar () {
        let userObj = await submitAndGetUserInfo(this.userDisplayInfo, this.info.createdBy);
        this.userAvatar = (userObj && userObj['avatar']) || DEFAULT_AVATAR;
    }
    reply (id: number, name: string, mis: string, parentId: number) {
        this.$emit('focus');
        this.$emit('reply', id, name, mis, parentId);
        this.replyId = id;
        this.focus = true;
        this.showInput = !this.showInput;
    }
    deleteComment (commentId: number) {
        this.$mtd.confirm({
            title: this.$getText('ticket_info_comment_dialog_confirm_title', '确定要删除此条评论吗？'),
            width: '460px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: this.$getText('ticket_info_comment_dialog_confirm_btn', '确定'),
            cancelButtonText: this.$getText('ticket_clone_custom_btn_cancel', '取消'),
            onOk: async () => {
                try {
                    const res: Ajax.AxiosResponse = await api.ticketApi.deleteComment(this.ticketId, commentId);
                    let { code } = res;
                    if (code === 200) {
                        this.$mtd.message({
                            message: this.$getText('ticket_info_comment_dialog_tip_delete_success', '删除成功'),
                            type: 'success'
                        });
                    }
                    await this.updateUserAvatar(); // 重新获取用户头像
                    this.$emit('updateComment');
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => { console.log(e); });
    }
    afterReply () {
        this.showInput = false;
    }
    updateComment () {
        this.$emit('updateComment');
    }
    finishedReply () {
        this.afterReply();
        this.$emit('updateComment');
    }
    get ticketId () {
        return this.$route.query.id;
    }
}
</script>

<style lang="scss" scoped>
.comment-item {
    color: rgba(0, 0, 0, 0.87);
    margin-bottom: 20px;
    .comment-title {
        white-space: nowrap;
        margin-bottom: 6px;
        .icon {
            float: left;
            display: inline-block;
            width: 26px;
            height: 26px;
            border-radius: 26px;
            overflow: hidden;
            margin-right: 8px;
            vertical-align: middle;
        }
        img {
            height: auto;
            max-width: 100%;
        }
        .name,
        .remarkTime,
        .replied-mis {
            display: inline-block;
            vertical-align: baseline;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 16px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 86%;
        }
        .reply-tag {
            vertical-align: baseline;
            color: #939db2;
        }
    }
    .comment-content {
        margin-bottom: 6px;
        padding: 0 34px;
        word-break: break-all;
        .reply-tip {
            display: inline-block;
            background-color: #f4f4f4;
            padding: 2px 5px;
            margin-bottom: 5px;
        }
    }
    .comment-opetation {
        padding: 0 34px;
        .comment-operate-button {
            color: #000;
            cursor: pointer;
            .mtdicon {
                font-size: 16px;
                color: rgba(0, 0, 0, 0.87);
            }
        }
    }
    .reply-container {
        padding: 20px 0 0 34px;
    }
    .comment-list-child {
        margin-left: 34px;
    }
    .delete-content {
        color: #999;
    }
    .comment-show {
        padding: 0;
        white-space: normal;
    }
}
</style>
