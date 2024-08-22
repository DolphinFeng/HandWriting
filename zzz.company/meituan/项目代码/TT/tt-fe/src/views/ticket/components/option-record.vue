<template>
    <div
        v-loading="loading"
        class="option-record-container">
        <div
            v-for="(item, index) in operateRecord"
            :key="index"
            class="comment-item">
            <div class="comment-title" v-if="item.actor.mis !== 'cuttingLine'">
                <i class="icon" v-if="inside">
                    <img :src="item.actor.avatar" class="user-avatar">
                </i>
                <span class="name">{{ item.actor.i18nDisplayName || item.actor.name }}<span v-if="inside">/{{ item.actor.mis }}</span></span>
                <span class="remarkTime gray-color">
                    {{ item.actTime | formatTimeWithTimeZone }}
                </span>
            </div>
            <div
                :class="['comment-content text', {'cutting-line': item.actor.mis === 'cuttingLine'}]"
                v-viewer.static="{ movable: true }">
                <div v-html="MarkHyperLink(item.message || '')" />
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
import { markHyperLink } from '@/utils/tools';
import { DEFAULT_AVATAR } from '@/config/map.conf';
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
    operateRecord: CommonTypes.NewOptionRecordItem[] = [];
    limit: number = 10;
    MarkHyperLink: Function = markHyperLink;
    created () {
        this.ticketId = this.$route.query.id;
        this.getOptionRecord();
    }
    async getOptionRecord () {
        this.loading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getOptionRecord(this.ticketId,{
                cn: this.currentPage,
                sn: this.limit
            });
            this.operateRecord = res.data.items;
            this.total = res.data.tn;
            this.setActorAvatorDefaultDisplay();
            // this.getRecordActorDisplay();
        } catch (e) {
            console.log(e);
        }
        this.loading = false;
    }
    // 获取reporter和assigned的displayName  用于hover展示
    // async getRecordActorDisplay () {
    //     let actors = this.operateRecord.map((item) => {
    //         return item.actor.mis;
    //     });
    //     await submitUserArrToVuex(this.userDisplayInfo, actors);
    //     this.operateRecord.forEach((record) => {
    //         let userObj = this.userDisplayInfo.find((user) => {
    //             return record.actor.mis === user.username;
    //         });
    //         this.$set(record, 'avatar', (userObj && userObj['avatar']) || DEFAULT_AVATAR);
    //     });
    // }
    setActorAvatorDefaultDisplay () {
        this.operateRecord.forEach((record) => {
            record.actor.avatar = record.actor.avatar || DEFAULT_AVATAR;
        });
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getOptionRecord();
    }
}
</script>

<style lang="scss">
.option-record-container {
    padding-right: 10px;
    .comment-item {
        color: #333;
        padding-bottom: 20px;
        .comment-title {
            white-space: nowrap;
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
                vertical-align: sub;
                color: rgba(0, 0, 0, 0.84);
                font-family: PingFangSC-Medium;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                max-width: 96%;
            }
            .remarkTime {
                float: right;
                color: #6f6f6f;
            }
        }
        .comment-content {
            color: rgba(0, 0, 0, 0.6);
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
    .cutting-line {
        font-size: 12px;
        text-align: center;
        border-top: 2px dashed rgba(0, 0, 0, 0.17);
    }
}
</style>