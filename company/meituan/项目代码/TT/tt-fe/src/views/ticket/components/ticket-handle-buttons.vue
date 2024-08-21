<template>
    <div class="ticket-handle-container">
        <div class="ticket-handle-buttons">
            <mtd-button
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="notInScopeBid"
                v-if="!hidenotInScopeBtn && itemPermission('notInScopeTicket').editable"
                @click="circulationUnknow"
                style="margin-right: 6px; vertical-align: middle;">{{ $getText('ticket_handle_buttons_not_in_scope_text', '不在处理范围') }}</mtd-button>
            <ticket-score-button :info="info" @success="handleUpdate" />
            <mtd-button
                v-if="primaryButton && itemPermission(`${ticketStateMap[primaryButton].cb}Ticket`).editable"
                v-lxay
                lxay-act="moduleClick"
                :lxay-bid="ticketStateMap[primaryButton].bid"
                :class="primaryBtnClass"
                :icon="primaryBtnIcon"
                type="primary"
                @click="handleOperate(ticketStateMap[primaryButton].cb)">{{ $getText(ticketStateMap[primaryButton].text) }}</mtd-button>
            <btn-group>
                <mtd-button
                    v-for="(item, index) in filterNextState"
                    :key="index"
                    v-lxay
                    lxay-act="moduleClick"
                    :lxay-bid="ticketStateMap[item].bid"
                    :type="ticketStateMap[item].type"
                    v-show="itemPermission(`${ticketStateMap[item].cb}Ticket`).editable"
                    @click="handleOperate(ticketStateMap[item].cb)">{{ $getText(ticketStateMap[item].text) }}</mtd-button>
            </btn-group>
        </div>
        <complete-ticket
            @success="handleUpdate"
            @close="completeVisible = false"
            v-if="completeVisible"
            :edit-content="editResolution"
            :is-ticket="isTicket"
            :id="ticketId"
            :info="info" />
        <pend-ticket
            @success="handleUpdate"
            @close="pendVisible = false"
            v-if="pendVisible"
            :id="ticketId"
            :info="info" />
        <pause-ticket
            @success="handleUpdate"
            @close="pauseVisible = false"
            v-if="pauseVisible"
            :id="ticketId"
            :info="info" />
        <close-ticket
            @success="handleUpdate"
            @close="closeVisible = false"
            v-if="closeVisible"
            :edit-content="editPreviousClose"
            :id="ticketId"
            :info="info" />
        <retry-ticket
            @success="handleUpdate"
            @close="retryVisible = false"
            v-if="retryVisible"
            :id="ticketId"
            :info="info" />
        <confirm-close-ticket
            v-if="confirmVisible"
            :sys-type="sysType"
            :click-state="clickState"
            @confirm="handleConfirm"
            @close="confirmVisible = false" />
        <not-in-scope-modal
            @success="scopeModalSuccess"
            @close="showNotInScopeModal = false"
            :desc="info.desc"
            :ticket-id="ticketId"
            :reporter="info.reporter"
            v-if="showNotInScopeModal" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { TicketStateMap, unknownCommontText } from '@/config/map.conf';
import { itemPermission } from '@/utils/tools';
import { Getter } from 'vuex-class';
import { DETAIL_CIRCULATION } from '@/config/lx_map.conf';
// import store from '@/store';

import CloseTicket from './modals/close-ticket.vue';
import CompleteTicket from './modals/complete-ticket.vue';
import PendTicket from './modals/pend-ticket.vue';
import PauseTicket from './modals/pause-ticket.vue';
import RetryTicket from './modals/retry-ticket.vue';
import confirmCloseTicket from './modals/confirm-close-ticket.vue';
import NotInScopeModal from './modals/not-in-scope-modal.vue';

import TicketScoreButton from './ticket-score-button.vue';
import eventBus from '@/utils/event-bus';
import * as api from '@/api';
/**
 * Ticket详情 顶部操作栏
 *
 * @author liyuyao
 * @date 03/15/2019
 */
@Component({
    components: {
        CloseTicket,
        PendTicket,
        PauseTicket,
        CompleteTicket,
        RetryTicket,
        TicketScoreButton,
        confirmCloseTicket,
        NotInScopeModal
    }
})
export default class TicketHandleButtons extends Vue {
    @Getter misX;
    @Getter env;

    @Prop({ default: () => {
        return {};
    } })
    info: any;
    @Prop() isTicket: boolean;

    ticketId: number = 0;
    itemPermission: Function = itemPermission;
    editResolution: boolean = false;
    editPreviousClose: boolean = false;
    showNotInScopeModal: boolean = false;
    primaryBtnLoading: boolean = false;

    @Watch('info')
    async infoChangeHandler (info) {
        this.ticketId = info.id;
        this.calculateHideBtn();
        if (this.primaryButton === '重新打开') {
            this.canProcessProblem = true;
        } else {
            const res: any = await api.ticketApi.getProcessPermission({
                ticketId: info.id
            });
            const { code , data } = res;
            if (code === 200) {
                this.canProcessProblem = data.permission;
            }
        }
    }

    // nextState: any = [];
    closeVisible: Boolean = false;
    completeVisible: Boolean = false;
    pendVisible: Boolean = false;
    pauseVisible: Boolean = false;
    retryVisible: Boolean = false;
    confirmVisible: Boolean = false;
    // 绑定下游系统类型
    sysType: string = '';
    // 点击 处理完成or关闭TT
    clickState: string = '';
    hidenotInScopeBtn: boolean = false;

    ticketStateMap: CommonTypes.mapObject = TicketStateMap;
    canProcessProblem: Boolean = false;

    get filterNextState () {
        return this.info.nextStates && this.info.nextStates.map((item) => {
            return item.name;
        }).slice(1) || [];
    }
    get primaryButton () {
        return this.info.nextStates?.[0]?.name;
    }
    get primaryBtnIcon () {
        return this.primaryBtnLoading ? 'mtd-btn-spin' : '';
    }
    get primaryBtnClass () {
        return this.primaryBtnLoading ? 'mtd-btn-loading' : '';
    }
    get notInScopeBid () {
        return DETAIL_CIRCULATION['click_not_inscope'];
    }
    calculateHideBtn () {
        if (!this.info?.createdAt) return;
        const nowTime = new Date().getTime();
        // 超过工单创建时间一周的工单以及接口发起工单，隐藏“不在处理范围”按钮
        this.hidenotInScopeBtn = (nowTime - this.info.createdAt) / (1000 * 60 * 60 * 24) > 3 || !['ticket', 'ticket.MOBILE'].includes(this.info.source);
    }
    mounted () {
        eventBus.$on('showModal', this.showModal);
    }

    beforeDestroy () {
        eventBus.$off('showModal', this.showModal);
    }
    showModal (type: string) {
        if (type === 'close') {
            this.editPreviousClose = true;
            this.closeVisible = true;
        } else if (type === 'resolve') {
            this.editResolution = true;
            this.completeVisible = true;
        }
    }
    handleOperate (cb: string) {
        this[cb]();
    }
    async doing () {
        this.primaryBtnLoading = true;
        try {
            await api.ticketApi.updateTicket(this.ticketId, {
                state: '处理中'
            });
            this.handleUpdate();
            this.$mtd.message({
                message: this.$getText('ticket_handle_buttons_tip_handle_success', '开始处理成功'),
                type: 'success'
            });
            this.primaryBtnLoading = false;
        } catch (e) {
            console.log(e);
            this.primaryBtnLoading = false;
        }
    }
    pend () {
        this.pendVisible = true;
    }
    pause () {
        this.pauseVisible = true;
    }
    done () {
        this.clickState = 'done';
        this.editResolution = false;
        this.getAssociateDetail(this.clickState);
    }
    close () {
        this.clickState = 'close';
        this.editPreviousClose = false;
        this.getAssociateDetail(this.clickState);
    }
    retry () {
        const isReopen = itemPermission(`reopen`).visible;
        if (!isReopen) {
            this.$mtd.confirm({
                title: this.$getText('ticket_handle_buttons_tip_restart', '请重新发起工单'),
                message: this.$getText('ticket_handle_buttons_tip_not_support', '你好，当前处理组不支持重新打开工单，请重新提问'),
                width: '433px',
                showCancelButton: true,
                type: 'warning',
                cancelButtonText: this.$getText('ticket_handle_buttons_btn_ask_again', '重新提问'),
                okButtonText: this.$getText('ticket_handle_buttons_btn_cancel', '取消')
                // onOk: async ()=>{}
            }).catch(async (e) => {
                console.log(e);
                const { action } = e;
                const { categoryId, typeId, itemId } = this.info;
                const createQuery = {
                    cid: categoryId || '',
                    tid: typeId || '',
                    iid: itemId || ''
                };
                if (action === 'cancel') {
                    let routeData = this.$router.resolve({
                        path: '/ticket/create',
                        query: createQuery
                    });
                    window.open(routeData.href, '_blank');
                }
            });
        } else {
            this.retryVisible = true;
        }
    }
    handleUpdate () {
        this.$emit('success');
    }
    scopeModalSuccess () {
        this.showNotInScopeModal = false;
        this.handleUpdate();
    }
    handleConfirm () {
        if (this.clickState === 'close') {
            this.closeVisible = true;
        } else if (this.clickState === 'done') {
            this.completeVisible = true;
        }
    }
    async getAssociateDetail (state) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getAssociateDetail({ ticketId: this.info.id });
            const { code, data } = res;
            if (code === 200) {
                if (data && data.type) {
                    this.sysType = data.type;
                    const isOnesDoneOrDelete = data.type === 'ONES' && (['DELETE', 'DONE'].includes(data.detail?.state?.category));
                    const isCaseDone = data.type === 'CASE' && data.detail?.state?.statusType === 'DONE';
                    const isCaseDelete = data.type === 'CASE' && data.detail?.state?.name === '已删除';
                    const isItsm = data.type === 'ITSM';
                    if (isOnesDoneOrDelete || isCaseDone || isCaseDelete || isItsm) {
                        state === 'close' ? this.closeVisible = true : this.completeVisible = true;
                    } else {
                        // 绑定 && 未完成
                        this.confirmVisible = true;
                    }
                } else {
                    // 未绑定下游系统
                    state === 'close' ? this.closeVisible = true : this.completeVisible = true;
                }
            }
        } catch (error) {
            console.log('Get error code failed', error);
        }
    }
    // 不在处理范围
    async circulationUnknow () {
        const unknownCatalog = {
            assigned: '',
            categoryName: '找不到合适的目录',
            categoryId: 14,
            typeName: '找不到合适的目录',
            typeId: 172,
            itemName: '找不到合适的目录',
            itemId: 524,
            rgId: 342,
            rgName: '',
            appointAssigned: false
        };
        const res: Ajax.AxiosResponse = await api.ctiApi.getOncallUser({ rgId: unknownCatalog.rgId });
        let { code, data } = res;
        if (code === 200) {
            unknownCatalog.assigned = data.identify;
        }
        if (!+this.info?.id) return;
        const updateRes: Ajax.AxiosResponse = await api.ticketApi.updateTicket(this.info?.id, {
            ...unknownCatalog,
            notInScope: true
        });
        if (updateRes.code === 200 && updateRes.data) {
            if (updateRes.data.needFurtherInfo) {
                // 展示弹框
                this.showNotInScopeModal = true;
            } else {
                if (updateRes.data.rgId === unknownCatalog.rgId) {
                    this.addNotInScopeComment();
                }
                this.$mtd.message({
                    message: this.$getText('ticket_handle_buttons_tip_success', '成功'),
                    type: 'success'
                });
            }
        }
        this.handleUpdate();
    }
    async addNotInScopeComment () {
        await api.ticketApi.pushComment({
            commentType: 'ADDED',
            text: unknownCommontText,
            parentId: 0,
            repliedId: 0,
            mis: 'tt.robot',
            ticketId: this.ticketId,
            toUsers: []
        });
    }
}
</script>

<style lang="scss">
.ticket-handle-container {
    display: inline-block;
    .ticket-handle-buttons {
        display: inline-block;
        .mtd-btn-primary {
            margin-right: 6px;
            vertical-align: middle;
            &.mtd-btn-loading {
                .mtd-btn-before {
                    line-height: 16px;
                    vertical-align: middle;
                }
            }
        }
        .tt-btn-group {
            border: 1px solid rgba(0, 0, 0, 0.12);
            background: #fff;
            vertical-align: middle;
        }
        .tt-btn-group .mtd-btn {
            background: #fff;
            height: 30px;
        }
    }
}
.handle-ticket-dialog {
    .mtd-form-item-content {
        line-height: 0;
    }
    .ql-formats {
        line-height: 22px;
    }
    .quill-editor .ql-container .ql-editor {
        min-height: 100px;
    }
    .overflow {
        color: #f5483b;
        font-size: 12px;
        line-height: 22px;
    }
    .mtd-modal-content-wrapper {
        min-height: 222px;
    }
}
</style>
