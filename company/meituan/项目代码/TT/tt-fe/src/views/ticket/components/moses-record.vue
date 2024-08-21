<template>
    <div
        v-loading="loading"
        class="moses-record-container">
        <div
            v-for="(item, index) in mosesRecord"
            :key="index"
            class="comment-item">
            <div class="comment-title">
                <i class="icon" v-if="inside">
                    <img :src="item.userType === 0 ? userInfo.userHead : robotInfo.robotHead" class="user-avatar">
                </i>
                <span class="name">{{ item.userType === 0 ? userInfo.userDisplayName : robotInfo.robotName }}
                    <span v-if="inside && item.userType === 0">（{{ userInfo.userName }}）</span>
                </span>
                <span class="remarkTime gray-color">
                    {{ item.sendTime |  formatTimeWithTimeZone }}
                </span>
            </div>
            <div
                :class="['comment-content text']"
                v-viewer.static="{ movable: true }">
                <div style="white-space:pre-line;" v-html="MarkHyperLink(item.content || '')" />
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
 * Ticket摩西会话记录
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component
export default class MosesRecord extends PaginationMixin {
    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    @Getter inside;

    ticketId: number = 0;
    loading: Boolean = false;
    mosesRecord: CommonTypes.MosesRecordItem[] = [];
    userInfo: any = {
        userDisplayName: '',
        userName: '',
        userHead: ''
    };
    robotInfo: any = {
        robotKey: '',
        robotName: '',
        robotHead: ''
    };
    limit: number = 10;
    MarkHyperLink: Function = markHyperLink;
    created () {
        this.ticketId = this.$route.query.id;
        this.getMosesRecord();
    }
    async getMosesRecord () {
        this.loading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getMosesRecord(this.ticketId,{
                cn: this.currentPage,
                sn: this.limit
            });
            this.mosesRecord = res.data.mosesDialogMessageList;
            this.userInfo = {
                userDisplayName: res.data.userDisplayName,
                userName: res.data.username,
                userHead: res.data.userHead || DEFAULT_AVATAR
            };
            this.robotInfo = {
                robotKey: res.data.robotKey,
                robotName: res.data.robotName,
                robotHead: res.data.robotHead || DEFAULT_AVATAR
            };
            this.total = res.data.tn;
        } catch (e) {
            console.log(e);
        }
        this.loading = false;
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getMosesRecord();
    }
}
</script>

<style lang="scss">
.moses-record-container {
    padding-right: 10px;
    .comment-item {
        color: #333;
        padding-bottom: 20px;
        .comment-title {
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
        }
    }
}
</style>