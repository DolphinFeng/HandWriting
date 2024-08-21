<template>
    <div
        :class="['handle-ticket-nav-item', { 'handle-ticket-nav-item-active': active }]">
        <span class="content title">{{ ticket.name }}</span>
        <span class="content description">
            <span class="left-wrapper">
                <div class="state-wrapper">
                    <span class="list-user-icon">
                        <user-avatar
                            class="nav-user"
                            :username="ticket.reporterI18nDisplayName ? `${ticket.reporterI18nDisplayName}/${ticket.reporter}` : (ticket.reporterCnName ? `${ticket.reporterCnName}/${ticket.reporter}`: ticket.reporter)"
                            :display-name="ticket.reporterCnName"
                            :avatar="ticket.reporterHeadUrl" />
                    </span>
                    <span class="list-sla-icon">
                        <sla-icon :sla="ticket.sla" />
                    </span>
                    <span class="list-state-icon">
                        <state-icon
                            :state="ticket.state"
                            style="font-family: PingFang SC;"
                            :state-display-name="ticket.stateDisplayName" />
                    </span>
                </div>
                <div class="tag-wrapper" v-if="computeNewComment || computeDxMessage || computeTimeOut">
                    <mtd-tag
                        v-if="computeTimeOut"
                        class="timeout-tag"
                        theme="red">
                        <span style="vertical-align: middle;">{{ $getText('handle_nav_item_timeout_tag_text', '即将超时') }}</span>
                    </mtd-tag>
                    <mtd-tag
                        v-if="computeNewComment"
                        class="new-comment-tag"
                        theme="gray">
                        <i class="iconfont icon-comment1" />
                        <span style="vertical-align: middle;">{{ $getText('handle_nav_item_new_comment_tag', '新评论') }}</span>
                    </mtd-tag>
                    <mtd-tag
                        v-if="computeDxMessage"
                        class="new-comment-tag"
                        theme="gray">
                        <i class="iconfont icon-daxiang" />
                        <span style="vertical-align: middle;">{{ $getText('handle_nav_item_dx_message_tag', '大象消息') }}</span>
                    </mtd-tag>
                </div>
            </span>
            <span class="right-wrapper">
                {{ ticket.createdAt | formatTimeWithoutYear }}
            </span>
        </span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import SlaIcon from '@/components/sla-icon.vue';
import StateIcon from '@/components/state-icon.vue';
import UserAvatar from '@/components/user-avatar.vue';

/**
 * 处理TT
 *
 * @author liyuyao
 * @date 10/22/2020
 */
@Component({
    components: {
        SlaIcon,
        StateIcon,
        UserAvatar
    }
})
export default class HandleNavItem extends Vue {
    @Prop()
    ticket: any;

    @Prop({ default: false })
    active: boolean;

    @Prop({ default: undefined })
    commentState: any;

    @Watch('active', { immediate: true })
    @Watch('computeDxMessage', { immediate: true })
    onItemActive () {
        this.active && this.$emit('dx-tag-change', this.ticket.id, this.computeDxMessage);
    }

    get computeNewComment () {
        return (this.commentState === undefined || this.commentState.isNewComment === undefined) ? this.ticket.isNewComment : this.commentState.isNewComment;
    }
    get computeTimeOut () {
        return (this.commentState === undefined || this.commentState.isAboutToTimeout === undefined) ? this.ticket.isAboutToTimeout : this.commentState.isAboutToTimeout;
    }
    get computeDxMessage () {
        const hasUnreadProperty = this.commentState !== undefined && this.commentState.hasOwnProperty('isUnreadMessage');
        return hasUnreadProperty ? this.commentState.isUnreadMessage : this.ticket.isUnreadMessage;
    }
}
</script>

<style lang="scss">
.handle-ticket-nav-item {
    box-sizing: border-box;
    width: 100%;
    cursor: pointer;
    padding: 12px 8px 0 8px;
    // border-top: 1px solid rgba(0, 0, 0, 0.07);
    // border-left: 3px solid #f5f5f5;
    // &:last-child {
    //     border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    // }
    // &:first-child {
    //     border-top: none;
    // }
    .content {
        width: 100%;
        display: inline-block;
    }
    .title {
        width: 100%;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: PingFangSC-Regular;
    }
    .description {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: 0 0 10px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        .left-wrapper {
            flex: 1 1 auto;
            .state-wrapper {
                display: flex;
                .list-sla-icon {
                    width: 72px;
                    .ticket-sla {
                        margin-left: 10px !important;
                    }
                    .ticket-sla-icon {
                        width: 14px;
                    }
                    .ticket-sla-text {
                        color: rgba(0, 0, 0, 0.6);
                    }
                }
                .list-state-icon {
                    width: 96px;
                    font-size: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    vertical-align: middle;
                    line-height: 21px;
                    color: rgba(0, 0, 0, 0.6);
                }
                .list-user-icon {
                    width: 72px;
                    color: rgba(0, 0, 0, 0.6);
                    white-space: nowrap;
                    .nav-user .user-name {
                        display: inline-block;
                        max-width: 48px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .user-wrapper {
                        width: 72px;
                    }
                }
            }
            .tag-wrapper {
                margin-top: 8px;
                .new-comment-tag {
                    color: rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    border-radius: 3px;
                    background-color: #f5f5f5;
                    line-height: 22px;
                    .mtd-tag-content {
                        .iconfont {
                            vertical-align: middle;
                        }
                    }
                }
                .timeout-tag {
                    border: 1px solid #fbbdb8;
                    border-radius: 3px;
                    font-size: 12px;
                    color: #f5483b;
                    letter-spacing: 0;
                    line-height: 20px;
                    font-weight: 400;
                }
            }
        }
        .right-wrapper {
            text-align: right;
            vertical-align: middle;
            // width: 76px;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            height: 21px;
            line-height: 21px;
        }
    }
    .new-comment-tag {
        margin-top: 2px;
        color: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 3px;
        background-color: #f5f5f5;
        line-height: 22px;
        .icon-comment1 {
            vertical-align: middle;
        }
    }
}
.handle-ticket-nav-item-active {
    background-color: #f5f5f5;
    border-radius: 6px;
    .title {
        font-family: PingFangSC-Semibold;
    }
}
</style>
