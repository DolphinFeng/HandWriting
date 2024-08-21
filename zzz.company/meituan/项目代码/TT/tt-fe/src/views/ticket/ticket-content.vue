<template>
    <div class="ticket-content-container">
        <h3>{{ $getText('ticket_info_desc_title', 'TT描述') }}
            <span 
                v-if="itemPermission('desc').editable && !isGlobalEdit"
                @click="editGlobal"
                class="edit-with-icon"><i class="mtdicon mtdicon-edit-o" /></span>
        </h3>
        <ticket-desc
            :global-edit="isGlobalEdit"
            :edit.sync="editStatus.desc"
            :ticket-desc.sync="ticketDetail.desc"
            @submit="updateContent('desc')"
            v-if="itemPermission('desc').visible"
            ref="desc" />
        <div class="save-button-wrapper" v-if="isGlobalEdit">
            <mtd-button
                @click="globalSave"
                type="primary">{{ $getText('ticket_info_edit_save_btn', '保存') }}</mtd-button>
            <mtd-button
                @click="cancelGlobalSave">{{ $getText('ticket_info_edit_cancel_btn', '取消') }}</mtd-button>
        </div>
        <ticket-custom-edit
            v-if="ticketDetail.customFormId && itemPermission('desc').visible"
            :edit.sync="isGlobalEdit"
            :info="ticketDetail"
            ref="custom"
            :disabled="!itemPermission('desc').editable" />
        
        <div class="resolve-result-container" v-if="hasResult">
            <ticket-result
                :info="resultInfo" />
            <ticket-score :info="ticketDetail" />
        </div>
        <ticket-attachment
            ref="ticketUpload"
            v-loading="refreshUpload"
            :info="ticketDetail"
            @upload="reloadUpload" />
        <div class="addition-info-container">
            <div class="comment-record-chat-tabs">
                <div
                    :key="tab.value"
                    @click="activeTab = tab.value"
                    v-for="tab in detailTabs"
                    :class="{'is-active': activeTab === tab.value}">{{ tab.value === 'comment' ? `${$getText(tab.label)}(${commentCount})` : $getText(tab.label) }}</div>
            </div>
            <keep-alive>
                <ticket-comment
                    :count.sync="commentCount"
                    v-if="activeTab === 'comment'"
                    :info="info" 
                    @update="updateComment" />
            </keep-alive>
            <option-record ref="ticketRecord" v-if="activeTab === 'record'" />
            <moses-record ref="mosesRecord" v-if="activeTab === 'moses'" />
        </div>
        <div class="placeholder-content" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import TicketDesc from './components/ticket-desc.vue';
import TicketCustomEdit from './components/ticket-custom-edit.vue';
import TicketAttachment from './components/ticket-attachment.vue';
import TicketResult from './components/ticket-result.vue';
import TicketScore from './components/ticket-score.vue';
import TicketComment from './components/ticket-comment.vue';
import OptionRecord from './components/option-record.vue';
import MosesRecord from './components/moses-record.vue';
import FormIndex from './components/form/formIndex.vue';
import { itemPermission } from '@/utils/tools';
import store from '@/store';

import Viewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';
import { DetailTabsMoses, DetailTabs } from '@/config/map.conf';
Vue.use(Viewer);

/**
 * Ticket详情
 *
 * @author liyuyao
 * @date 06/12/2019
 */
@Component({
    components: {
        TicketDesc,
        TicketCustomEdit,
        TicketAttachment,
        TicketComment,
        TicketResult,
        OptionRecord,
        MosesRecord,
        TicketScore,
        FormIndex
    }
})
export default class TicketContent extends Vue {
    @Getter loginType;
    @Getter inside;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Prop({ default: false })
    refreshUpload: Boolean;

    ticketDetail: any = {
        name: '',
        desc: '',
        attachment: []
    };
    resultInfo: any = {
        category: '',
        resolution: '',
        closedReason: ''
    };

    // isCanEdit: Boolean = false;
    activeTab: string = 'comment';
    customFieldValues: any[] = [];
    customFieldValueList: any[] = [];
    $refs: any;
    commentCount: number = 0;

    isGlobalEdit: boolean = false;
    editStatus: any = {
        desc: false,
        custom: false
    };
    itemPermission: Function = itemPermission;

    @Watch('info', { deep: true })
    async onWatchInfo (info) {
        // 初始化表单数据
        for (let key in info) {
            this.ticketDetail[key] = info[key];
        }
        store.commit('SET_HAS_SCORE', false);
        this.resultInfo = {
            category: this.ticketDetail.state.category || '',
            resolution: this.ticketDetail.resolution || '',
            closedReason: this.ticketDetail.closedDesc ? `${this.ticketDetail.closedReason}，${this.ticketDetail.closedDesc}` : this.ticketDetail.closedReason || ''
        };
    }
    editGlobal () {
        this.isGlobalEdit = true;
        this.editStatus.desc = true;
        // this.editStatus.custom = true;
    }
    get hasResult () {
        return (this.resultInfo.resolution || this.resultInfo.closedReason) && this.resultInfo.category;
    }
    get detailTabs () {
        // passport方式登录的用户隐藏 大象会话 tab，不再区分DetailTabsInside和DetailTabs
        const isFromMoses = this.info?.source === 'ticket.moses' || this.info?.source === 'ticket.com.sankuai.nlp.dialog.dialogmanager';
        return isFromMoses ? DetailTabsMoses : DetailTabs;
    }
    async reloadUpload () {
        this.$emit('upload');
    }
    updateContent (type) {
        this.$emit('submit', type, this.ticketDetail.desc);
    }
    updateComment () {
        this.$emit('update');
    }
    globalSave () {
        this.$refs.desc && this.$refs.desc.contentSave();
        this.$refs.custom && this.$refs.custom.submit();
        this.isGlobalEdit = false;
    }
    cancelGlobalSave () {
        this.isGlobalEdit = false;
        this.editStatus.desc = false;
    }
}
</script>

<style lang="scss">
.ticket-detail-container {
    height: 100%;
    h3 {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 24px;
    }
    .placeholder-content {
        width: 100%;
        height: 340px;
    }
    img {
        height: auto;
        max-width: 100%;
    }
    .edit-with-icon {
        cursor: pointer;
    }
    .resolve-result-container {
        background: #f7f7f7;
        padding: 12px 16px;
        margin: 16px 0;
    }
    .addition-info-container {
        margin-top: 32px;
    }
    .comment-record-chat-tabs {
        margin-bottom: 12px;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 24px;
        div {
            margin-right: 20px;
            display: inline-block;
            cursor: pointer;
            &.is-active {
                font-family: PingFangSC-Semibold;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.84);
            }
        }
    }
    #edit-fixed {
        float: right;
        position: sticky;
        position: -webkit-sticky;
        top: 0;
    }
    .save-button-wrapper {
        margin-bottom: 10px;
        .mtd-btn {
            width: 80px;
        }
    }
    .no-record-tip {
        text-align: center;
        color: #666;
    }
    .mtd-main {
        padding: 20px 6px 20px 24px;
        background-color: #fff;
    }
    .fold-line-wrapper.fold-more {
        color: rgba(0, 0, 0, 0.6);
    }
    .mtdicon-edit-o {
        font-size: 17px;
    }
}
</style>
