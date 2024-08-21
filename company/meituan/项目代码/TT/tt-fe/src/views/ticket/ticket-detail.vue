<template>
    <div
        class="ticket-detail-container"
        id="ticket-detail"
        ref="ticketDetail">
        <div
            class="ticket-content-main-container"
            v-if="isPermission"
            v-loading="loading['detail']">
            <ticket-header
                :info="ticketDetail"
                :group-status="groupStatus"
                :is-ticket="isTicket"
                @success="handleSuccess"
                @chat-exist="handleChatRoom"
                ref="header" />
            <ticket-name :name="ticketDetail.name" @submit="submit" />
            <mtd-tabs
                v-model="activeTab"
                @input="tabChange"
                class="content-tabs">
                <mtd-tab-pane :label="$getText('ticket_detail_tab_info', '问题详情')" value="detail">
                    <div class="ticket-content-wrapper">
                        <mtd-container>
                            <mtd-aside width="264px">
                                <ticket-info
                                    class="ticket-info"
                                    ref="info"
                                    v-loading="loading['info']"
                                    :with-ones="isWithOnes"
                                    :info="ticketDetail"
                                    :is-ticket="isTicket"
                                    @update="getTicketDetail('info')" />
                            </mtd-aside>
                            <mtd-main>
                                <ticket-content
                                    ref="ticketContent"
                                    :info="ticketDetail"
                                    :refresh-upload="refreshUpload"
                                    @upload="reloadUpload"
                                    @submit="submit"
                                    @update="handleStateChange"
                                    @success="getTicketDetail('content')" />
                            </mtd-main>
                        </mtd-container>
                    </div>
                </mtd-tab-pane>
                <mtd-tab-pane
                    :label="$getText('ticket_detail_tab_daxiang', '大象会话')"
                    value="chat"
                    :disabled="loginType === 'PASSPORT' || groupStatus === 'NONEXISTENT'">
                    <div slot="label">
                        <mtd-tooltip
                            placement="top"
                            size="small"
                            :disabled="groupStatus !== 'NONEXISTENT'"
                            :content="$getText('ticket_detail_tip_no_daxiang_group_chat', '未创建大象群')">
                            <div>
                                <span>{{ $getText('ticket_detail_tab_daxiang', '大象会话') }}</span>
                                <mtd-badge
                                    dot
                                    class="dx-badge-dot badge"
                                    :hidden="!(groupStatus !== 'NONEXISTENT' && showDot)" />
                            </div>
                        </mtd-tooltip>
                    </div>
                    <PmChatPanel
                        :object-id="Number(ticketId)"
                        system-name="tt"
                        :current-user="misX"
                        :env="env"
                        :room-info="roomInfo"
                        :emit-scroll-to-bottom="emitScroll"
                        :url-prefix="urlPrefix"
                        :report-map="chatReportMap"
                        :rg-id="ticketDetail.rgId"
                        :report-params="chatReportParams"
                        @cancel="handleGroupCanceled"
                        :inside="inside"
                        ref="chatPanel"
                        v-if="groupStatus !== 'NONEXISTENT' && showPanel"
                        :style="`height:${panelHeight}px`"
                        :tenant-id="tenantId" />
                </mtd-tab-pane>
            </mtd-tabs>
        </div>
        <ticket-blank v-else />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter, State, Mutation } from 'vuex-class';

import * as api from '@/api';
import eventBus from '@/utils/event-bus';
import TicketName from './components/ticket-name.vue';
import TicketContent from './ticket-content';
import TicketInfo from './components/ticket-info';
import TicketHeader from './components/ticket-header';
import { markHyperLink, itemPermission } from '@/utils/tools';
import TicketBlank from './components/ticket-blank';
import OptionRecord from './components/option-record.vue';
import StateIcon from '@/components/state-icon.vue';
import 'quill/dist/quill.snow.css';
import store from '@/store';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { CHAT_TT_MAP, CHAT_PANEL_MAP } from '@/config/lx_map.conf';
Component.registerHooks([
    'beforeRouteLeave'
]);
/**
 * Ticket详情
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component({
    components: {
        TicketName,
        TicketContent,
        TicketInfo,
        TicketBlank,
        OptionRecord,
        StateIcon,
        TicketHeader
    }
})
export default class TicketDetail extends Vue {
    @Getter misX;
    @Getter guard;
    @Getter nonWorking;
    @Getter env;
    @Getter chatId;
    @Getter loginType;
    @Getter inside;
    @Getter language;
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @Mutation setDetailPermission;
    @Mutation setRgPermissionMap;

    @Prop() showDot: boolean;
    @Prop({ default: false }) isMiniDetail: boolean;

    ticketDetail: any = {};
    isAlive: Boolean = true;

    refreshUpload: Boolean = false;

    isPermission: boolean = true;
    imgUploadStatus: Boolean = false;

    isWithOnes: string = '';
    activeTab: string = 'detail';
    ifChatRoom: boolean = true;
    panelHeight: number = 0;
    groupId: number = 0;
    visible: boolean;
    tenantId: string = 'com.sankuai.ee.ticket.core';
    roomInfo: any = {};
    isTicket: boolean = false;
    emitScroll: boolean = false;
    showPanel: boolean = false;
    hasUnReadMessage: boolean = false;
    chatReportMap: any = CHAT_PANEL_MAP;
    chatReportParams: any = {
        params: {
            org: '',
            mis: '',
            ticket_id: ''
        },
        cid: 'c_onecloud_pr0rfh0o' // TT的埋点标识
    };
    loading: CommonTypes.mapObject = {
        detail: true,
        info: false,
        state: false,
        content: false
    };

    get isHandleTicketPage () {
        return this.$route.name === 'tt_handle';
    }
    get groupStatus () {
        return this.roomInfo.groupStatus || 'NONEXISTENT';
    }
    // components组件库中不再依赖该变量发起请求，先上线，后续统一删除
    get urlPrefix () {
        return this.env === 'test' ? '//tt.cloud.test.sankuai.com' : (this.env === 'staging' ? 'https://tt.st.sankuai.com' : 'https://tt.sankuai.com');
    }
    getPanelHeight () {
        this.panelHeight = this.$refs.ticketDetail?.clientHeight - (61 + 43 + 40);
    }
    tabChange (val) {
        this.groupId && this.updateUserState(val === 'chat' ? 'OPEN' : 'CLOSE');
        const otherParams = {
            ticket_id: this.ticketId,
            mis: this.misX,
            org: this.userInfo?.orgId
        };
        lxReportClick(CHAT_TT_MAP[val === 'chat' ? 'dx_chat' : 'problem_detail'], otherParams);
    }

    beforeRouteLeave (to: any, from: any, next: any) {
        if (this.guard.comment) {
            this.$mtd.confirm({
                title: this.$getText('ticket_detail_dialog_content', '放弃当前编辑的评论吗?'),
                width: '433px',
                showCancelButton: true,
                type: 'info',
                okButtonText: this.$getText('ticket_detail_dialog_confirm', '放弃'),
                cancelButtonText: this.$getText('ticket_detail_dialog_cancel', '继续编辑'),
                onOk: async () => {
                    this.$store.commit('SET_GUARD_STATUS', {
                        comment: false
                    });
                    next();
                },
                onCancel: () => {
                    next(false);
                }
            }).catch(e => { console.log(e); });
        } else {
            next();
        }
    }
    @Watch('ticketId', { immediate: true })
    async getRouteId (ticketId) {
        if (ticketId) {
            await this.getTicketDetail();
            this.ticketDetailPermissions();
        }
    }
    @Watch('ticketDetail.rgId')
    async getRgChange (rgId, oldRgId) {
        if (oldRgId && rgId) {
            this.ticketDetailPermissions();
        }
    }
    @Watch('nonWorking', { immediate: true })
    async getWorkingState (nonWorking: boolean) {
        const showNonWorking = itemPermission('nonWorkingWarn').visible;
        if (nonWorking && showNonWorking) {
            const hint = await this.getNonWorkingHint();
            const listWithDetail = document.getElementById('listWithDetail');
            this.$mtd.confirm({
                title: this.$getText('ticket_detail_tip_init_success', '发起成功'),
                width: '400px',
                type: 'success',
                message: `<div class="ql-editor">${hint}</div>`,
                className: listWithDetail ? 'nonworking-warning-wrapper-listDetail' : 'nonworking-warning-wrapper',
                dangerouslyUseHTMLString: true,
                getPopupContainer: listWithDetail ? () => {
                    return document.getElementById('listWithDetail');
                } : null
            }).catch(e => e);
        }
    }
    @Watch('ticketDetail.state')
    getState () {
        this.ticketDetailPermissions();
    }
    @Watch('misX', { immediate: true })
    onGetMis () {
        this.misX && this.loginType !== 'PASSPORT' && this.checkGroup();
    }
    @Watch('activeTab', { immediate: true })
    onTabChanged () {
        if (this.activeTab === 'chat') {
            this.showPanel = true;
            this.emitScroll = true;
            this.$refs.chatPanel?.scrollToBottom();
        }
    }
    @Watch('language', { immediate: true })
    handleLanguageChange () {
        this.getTicketDetail();
    }
    mounted () {
        this.getPanelHeight();
        eventBus.$on('groupCancel', this.handleGroupCanceled);
        eventBus.$on('isFilterFold', this.getPanelHeight);
        if (this.isMiniDetail) this.hideTTStyle();
    }
    hideTTStyle () {
        let html = document.getElementsByTagName('html')[0];
        let body = document.getElementsByTagName('body')[0];
        html.style.minWidth = '0px';
        body.style.minWidth = '0px';
    }
    async updateUserState (param: string) {
        await api.chatApi.updateUserState(this.groupId, param);
    }
    async getTicketDetail (part: string = 'detail') {
        this.loading[part] = true;
        if (part === 'info') {
            this.handleStateChange();
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketDetail(this.ticketId);
            let { code, data } = res;
            this.loading[part] = false;
            if (data.errorCode && data.errorCode === 401) {
                this.isPermission = false;
            } else {
                this.ticketDetail = {
                    ...data,
                    desc: markHyperLink(data.desc || '')
                };
                document.title = this.ticketDetail.name;
            }
        } catch (e) {
            console.log(e);
            this.loading[part] = false;
        }
    }
    async ticketDetailPermissions () {
        if (!this.ticketId) return;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.ticketDetailPermissions(this.ticketId);
            let { code, data } = res;
            if (code === 200) {
                this.setDetailPermission(data);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getNonWorkingHint () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getNonWorkingSetting({ rgId: this.ticketDetail.rgId });
        let { data, code } = res;
        if (code === 200) {
            return data.hint || '123';
        }
    }
    async submit (param, result) {
        try {
            let obj = {};
            obj[param] = result;
            const res: Ajax.AxiosResponse = await api.ticketApi.updateTicket(this.ticketId, obj);
            let { code } = res;
            if (code === 200) {
                this.$mtd.message({
                    message: this.$getText('ticket_detail_tip_edit_success', '编辑成功'),
                    type: 'success'
                });
                if (param === 'name') this.getTicketDetail();
            }
        } catch (e) {
            console.log(e);
        }
    }

    async checkGroup () {
        if (!+this.ticketId) return;
        const resInfo: Ajax.AxiosResponse = await api.chatApi.getGroupInfo(Number(this.ticketId));
        const { code, data } = resInfo;
        if (code === 200 && data) {
            switch (data.status) {
                case 'CREATED':
                    // 群已创建
                    this.roomInfo = {
                        groupId: data.group?.groupId,
                        groupStatus: 'CREATED',
                        members: data.group?.members,
                        moderator: data.group?.members[0],
                        isExternalGroup: data.group?.isExternalGroup,
                        canAddMember: data.group?.canAddMember,
                        isTicket: data.group?.isTicket
                    };
                    this.isTicket = data.group?.isTicket;
                    this.groupId = data.group?.groupId;
                    break;
                case 'DISBANDED':
                    // 创建过，已解散
                    this.roomInfo = {
                        groupStatus: 'DISBANDED',
                        isTicket: data.group?.isTicket
                    };
                    this.groupId = 0;
                    break;
                case 'NONEXISTENT':
                default:
                    // 未创建
                    this.roomInfo = {
                        groupStatus: 'NONEXISTENT'
                    };
                    this.groupId = 0;
                    break;
            }
            // 增加埋点参数
            this.$set(this.chatReportParams, 'params', {
                ticket_id: this.ticketId,
                mis: this.misX,
                org: this.userInfo?.orgId
            });
            store.commit('SET_CHAT_ID', this.groupId);
            console.log('chatid ', this.chatId, this.groupStatus, this.roomInfo);
        }
    }
    async handleStateChange () {
        await this.getTicketDetail('state');
        this.$refs['header'] && this.$refs['header'].getTicketTime();
        eventBus.$emit('updateTicket', {
            ticketId: this.ticketDetail.id,
            key: 'state',
            value: this.ticketDetail.state.name
        });
    }
    async reloadUpload () {
        this.refreshUpload = true;
        await this.getTicketDetail();
        this.$refs.ticketContent.$refs.ticketUpload.reMounted();
        // 为跳过动画效果 使上次上传的文件闪现
        setTimeout(() => {
            this.refreshUpload = false;
        }, 500);
    }
    handleSuccess (param) {
        if (param === 'chat') {
            this.checkGroup();
        } else {
            this.handleStateChange();
        }
    }
    handleChatRoom (id) {
        if (id !== 0) {
            // 创建了大象群
            this.activeTab = 'chat';
            this.checkGroup();
        }
    }
    beforeDestroy () {
        this.$mtd.confirm.closeAll();
        this.setDetailPermission({
            isWorkHour: true,
            detailOperate: {}
        });
        this.setRgPermissionMap({});
        this.roomInfo = {};
        this.groupId && this.updateUserState('CLOSE');
        eventBus.$off('groupCancel', this.handleGroupCanceled);
        eventBus.$off('isFilterFold', this.getPanelHeight);
    }
    get ticketId () {
        return this.$route.query.id;
    }
    handleGroupCanceled () {
        console.log('group canceled!');
        this.roomInfo.groupStatus = 'DISBANDED';
        store.commit('SET_CHAT_ID', 0);
    }
}
</script>

<style lang="scss">
.ticket-detail-container {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: #fff;
    border-radius: 6px;
    .ticket-content-main-container {
        height: 100%;
        overflow: auto;
        padding-top: 4px;
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
    }
    .ticket-operate-container {
        position: sticky;
        z-index: 49;
        top: 0;
    }
    .content-tabs {
        padding-left: 8px;
        background-color: #fff;
        .mtd-tabs-nav {
            padding-left: 10px;
            .mtd-tabs-bottom-border {
                display: none;
            }
        }
        .mtd-tabs-content {
            padding-top: 0;
            padding-bottom: 0;
        }
        .pm-chat-panel {
            // height: calc(100% - 142px);
            border-bottom: none;
            textarea {
                line-height: normal;
            }
        }
    }
    .ticket-content-wrapper {
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        .mtd-main {
            height: 100%;
            overflow: visible;
            overflow-x: auto;
            padding: 16px 0 0 16px;
        }
        .mtd-aside {
            padding-bottom: 0;
            border-right: 1px solid rgba(0, 0, 0, 0.06);
        }
    }
    img {
        height: auto;
        max-width: 100%;
    }
    .fake-tooltip {
        width: 80px;
        height: 40px;
        margin-left: 80px;
        position: absolute;
        z-index: 99;
        &:hover {
            cursor: not-allowed;
        }
    }
    .dx-badge-dot {
        float: right;
        width: 3px;
        right: 6px;
        .mtd-badge-dot {
            margin-bottom: 9px;
        }
    }
}
</style>
