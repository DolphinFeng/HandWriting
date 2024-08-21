<template>
    <div
        v-loading="loading"
        class="option-record-container">
        <p class="no-record-tip" v-if="!chatRoomRecord.length">{{ $getText('operate_record_no_record_tip', '暂无大象会话记录') }}</p>
        <div
            v-for="(item, index) in chatRoomRecord"
            :key="index"
            class="comment-item">
            <div class="comment-title">
                <i class="icon" v-if="inside">
                    <img class="user-avatar" :src="item.avatar">
                </i>
                <span class="name">{{ item.displayName }}<span v-if="inside">（{{ item.mis }}）</span></span>
                <span class="remarkTime gray-color">
                    {{ item.time | formatTimeWithTimeZone }}
                </span>
            </div>
            <div
                class="comment-content text"
                v-if="item.messageType === 'text'"
                v-viewer.static="{ movable: true }">
                <div v-html="MarkHyperLink(item.body.text || '')" />
            </div>
            <div
                class="comment-content text"
                v-if="item.messageType === 'image'"
                v-viewer="{ movable: true }">
                <img :src="item.body.original">
            </div>
            <div class="comment-content text" v-if="item.messageType === 'emotion'">
                {{ $getText('operate_record_emotion', '表情') }}：{{ item.body.name }}
            </div>
            <div class="comment-content text" v-if="!(DX_MESSAGE_TYPE[item.messageType] && DX_MESSAGE_TYPE[item.messageType]['detail'])">
                [{{ DX_MESSAGE_TYPE[item.messageType] && $getText(DX_MESSAGE_TYPE[item.messageType]['cn_name'])|| $getText('operate_record_other_message', '其他消息') }}]
            </div>
        </div>
        <div v-if="total > Math.min(...pageSizes)" class="pagination-container">
            <mtd-pagination
                :total="total"
                show-size-changer
                show-total
                size="small"
                :current-page.sync="currentPage"
                :page-size.sync="limit"
                @change="handleChange" />
        </div>   
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';

import { PaginationMixin } from '@/utils/mixin';
import * as api from '@/api';
import { markHyperLink, submitUserArrToVuex } from '@/utils/tools';
import { DEFAULT_AVATAR, DX_MESSAGE_TYPE } from '@/config/map.conf';

/**
 * Ticket操作记录
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component
export default class OperateRecord extends PaginationMixin {
    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    @Getter inside;

    ticketId: number = 0;
    loading: Boolean = false;
    chatRoomRecord: CommonTypes.OptionRecordItem[] = [];
    limit: number = 10;
    MarkHyperLink: Function = markHyperLink;
    DX_MESSAGE_TYPE: any = DX_MESSAGE_TYPE;

    created () {
        this.ticketId = this.$route.query.id;
        this.getChatRecord();
    }
    async getChatRecord () {
        this.loading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getChatRecord(this.ticketId, this.currentPage, this.limit);
            this.chatRoomRecord = res.data.items;
            this.total = res.data.tn;
            this.getRecordActorDisplay();
        } catch (e) {
            console.log(e);
        }
        this.loading = false;
    }
    async getRecordActorDisplay () {
        let misArr = this.chatRoomRecord?.map((item) => {
            return item.mis;
        }) || [];
        await submitUserArrToVuex(this.userDisplayInfo, misArr);
        this.chatRoomRecord.forEach((chatUser) => {
            let userObj = this.userDisplayInfo.find((user) => {
                return chatUser.mis === user.username;
            });
            this.$set(chatUser, 'displayName', (userObj && userObj['displayName']) || chatUser.mis);
            this.$set(chatUser, 'avatar', (userObj && userObj['avatar']) || DEFAULT_AVATAR);
        });
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getChatRecord();
    }
}
</script>

<style lang="scss">
.option-record-container {
    .comment-item {
        color: #333;
        padding-bottom: 20px;
        .comment-title {
            margin-bottom: 5px;
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
            .name {
                display: inline-block;
                margin-right: 12px;
                vertical-align: middle;
                color: rgba(0, 0, 0, 0.84);
                font-family: PingFangSC-Medium;
            }
            .remarkTime {
                float: right;
                vertical-align: middle;
                color: #6f6f6f;
            }
        }
        .comment-content {
            color: rgba(0, 0, 0, 0.6);
            padding: 0 34px;
            word-break: break-all;
            line-height: 160%;
            .reply-tip {
                display: inline-block;
                background-color: #f4f4f4;
                padding: 2px 5px;
                margin-bottom: 5px;
            }
        }
        .comment-opetation {
            padding: 0 34px;
            .reply {
                color: #aaa;
                cursor: pointer;
                &:hover {
                    color: #333;
                }
            }
        }
        .reply-container {
            padding: 20px 0 0 34px;
        }
    }
}
</style>