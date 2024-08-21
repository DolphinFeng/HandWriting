<template>
    <div :class="['ones-itsm-buttons-wrap', {'ones-status-wrap': hasConnectedToValidOnes}]">
        <mtd-announcement
            v-if="systemDeleted"
            :title="$getText('ticket_system_detail_tip_reselect', { text: deletedStatusText })"
            type="warning"
            closable />
        <mtd-announcement
            v-if="isOnesTimeout"
            :title="$getText('ticket_system_detail_ones_timeout', '已超过ONES预计结束时间，请跟进')" />
        <div class="ones-itsm-buttons" v-if="btnShow || systemDeleted">
            <ticket-ones-button
                class="unique-button ones-button"
                :info="info"
                @update="emitUpdate"
                v-if="itemPermission('createOnes').editable" />
            <ticket-case-button
                class="unique-button case-button"
                :info="info"
                v-if="itemPermission('createCase').editable"
                @update="emitUpdate" />
            <ticket-itsm-button
                class="unique-button itsm-button"
                :info="info"
                @update="emitUpdate"
                v-if="itemPermission('createItsm').editable" />
            <ticket-itsm-button
                class="unique-button itsm-button"
                :is-transfer-administration="true"
                :info="info"
                @update="emitUpdate"
                v-if="itemPermission('createItsm').editable" />
        </div>
        <div class="ticket-system-detail" v-else>
            <div class="detail-title-wrap">
                <span :class="['ticket-system-detail-title', {'detail-title-for-disconnect': status === 'ONES'}]">
                    <i class="iconfont icon-ones" v-if="status === 'ONES'" />
                    <img
                        v-else-if="status === 'CASE'"
                        src="@/assets/img/case-logo.png"
                        class="case-logo">
                    <span class="detail-title-name">{{ detailTitleText }}</span>
                </span>
                <mtd-tooltip
                    placement="top"
                    class="disconnect-tooltip-wrapper"
                    size="small"
                    :content="disconnectText">
                    <img
                        :src="imgSrc"
                        v-if="status === 'ONES'"
                        @click="confirmDisconnect">
                </mtd-tooltip>
                <span class="detail-title-link" @click="linkHandle">
                    <span>{{ $getText('ticket_system_detail_go_check', '去查看') }}</span>
                    <i class="mtdicon-right-thick link-icon" />
                </span>
            </div>
            <div class="ones-detail system-detail" v-if="onesDetailShow">
                <span class="ones-detail-time"><span>{{ $getText('ticket_system_detail_expect_start_time', '预计开始时间') }}:</span><span class="detail-time-value">{{ formatTime(detail.expectStart) }}</span></span>
                <span class="ones-detail-time"><span>{{ $getText('ticket_system_detail_expect_end_time', '预计结束时间') }}:</span><span class="detail-time-value">{{ formatTime(detail.expectClose) }}</span></span>
            </div>
            <div class="system-case-detail system-detail" v-if="caseDetailShow">
                <span
                    class="case-detail-line"
                    v-for="(item,index) of detailData"
                    :key="index">
                    <span class="detail-line-title">{{ item.title }}</span>
                    <span class="detail-line-status">({{ item.status.name }})</span>
                </span>
                <div
                    v-if="detailCaseData.length > 5"
                    class="expand-more fold-small fold-line-wrapper"
                    @click="expandMoreHandle">
                    <span>{{ expand ? $getText('ticket_system_detail_fold', '收起') : $getText('ticket_system_detail_expand_more', '展开更多') }}</span>
                    <i :class="[ expand ? 'icon-expand-more' : 'icon-expand-less', 'iconfont']" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { itemPermission } from '@/utils/tools';
import { formatTimeWithTimeZone } from '@/utils/filters/index';

import TicketOnesButton from './ticket-ones-button.vue';
import TicketItsmButton from './ticket-itsm-button.vue';
import TicketCaseButton from './ticket-case-button.vue';

import * as api from '@/api';
/**
 * 下游系统详情
 *
 * @author wb_zhanghongwei
 * @date 07/06/2021
 */
@Component({
    components: {
        TicketOnesButton,
        TicketItsmButton,
        TicketCaseButton
    }
})
export default class TicketSystemDetail extends Vue {
    @Mutation setDetailPermission;
    expand: boolean = false;
    detailCaseData: any = [];
    status: string = '';
    detail: any = {};
    btnShow: boolean = true;
    itemPermission: any = itemPermission;
    isOnesTimeout: boolean = false;
    formatTime = formatTimeWithTimeZone;

    @State(state => state.tt.ticketAbout)
    ticketAbout: any;
    @Mutation setTicketAbout;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    get systemDeleted () {
        return this.detail.state?.name === '已删除';
    }

    get detailData () {
        const data: any = [];
        if (this.expand) {
            return this.detailCaseData;
        } else {
            if (this.detailCaseData.length < 6) {
                return this.detailCaseData;
            }
            for (let i = 0; i < 5; i++) {
                data.push(this.detailCaseData[i]);
            }
            return data;
        }
    }

    get detailTitleText () {
        let detailType: string = '';
        let statusText: string = '';
        switch (this.status) {
            case 'ONES':
                detailType = this.$getText('ticket_system_detail_associated_ones', '已关联ONES');
                statusText = ` (${this.detail.state.name})`;
                break;
            case 'CASE':
                detailType = this.$getText('ticket_system_detail_associated_case', '已关联CASE');
                statusText = ` (${this.detail.state.name})`;
                break;
            case 'ITSM':
                detailType = this.$getText('ticket_system_detail_check_itsm', '查看千寻');
                break;
        }
        return `${detailType}${statusText}`;
    }

    get onesDetailShow () {
        return this.status === 'ONES' && (this.detail.expectStart || this.detail.expectClose);
    }
    get caseDetailShow () {
        return this.status === 'CASE' && this.detailCaseData.length > 0;
    }

    get ticketId () {
        return this.$route.query.id;
    }

    get deletedStatusText () {
        return this.status;
    }

    get imgSrc () {
        return require(`../../../assets/img/associate-icon.svg`);
    }

    get disconnectText () {
        return this.$getText('ticket_system_detail_disconnect_association', { status: this.status });
    }
    get hasConnectedToValidOnes () {
        // 转入ones且为未删除状态
        return this.status === 'ONES' && !this.systemDeleted;
    }

    mounted () {
        this.getAssociateDetail();
    }
    async getAssociateDetail () {
        // console.log(this.ticketId);
        if (!this.ticketId) return;
        const res: Ajax.AxiosResponse = await api.ticketApi.getAssociateDetail({ ticketId: this.ticketId as string });
        // console.log(res);
        const { code, data } = res;
        if (code === 200) {
            if (data && data.type) {
                this.btnShow = false;
                const { type, detail, isOverdue } = data as any;
                this.status = type;
                this.detail = detail;
                this.isOnesTimeout = isOverdue;
                if (type === 'CASE') {
                    this.detailCaseData = detail.requirementList;
                } else if (type === 'ITSM') {
                    this.setTicketAbout({
                        ...this.ticketAbout,
                        itsm: detail?.url
                    });
                }
            } else {
                this.btnShow = true;
                this.resetDetail();
            }
        }
    }
    async ticketDetailPermissions () {
        if (!this.ticketId) return;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.ticketDetailPermissions(Number(this.ticketId));
            let { code, data } = res;
            if (code === 200) {
                this.setDetailPermission(data);
            }
        } catch (e) {
            console.log(e);
        }
    }
    resetDetail () {
        this.status = '';
        this.detail = {};
        this.isOnesTimeout = false;
    }
    linkHandle () {
        let linkUrl = this.detail.url;
        if (linkUrl) {
            window.open(linkUrl, '_blank');
        }
    }
    emitUpdate () {
        this.$emit('update');
        this.getAssociateDetail();
    }

    expandMoreHandle () {
        this.expand = !this.expand;
    }
    confirmDisconnect () {
        // 如果再次绑定到同一个 CASE 产品线下，CASE 侧会判断，该工单ID对应的 CASE 存在，所以不会创建一个新的
        // 暂时只做ones的取消关联
        const onesText = this.$getText('ticket_system_detail_confirm_disconnect', '取消关联后可以再次与该ONES关联，是否确认取消关联？');
        // const caseText = '取消关联后无法再次与该依据关联，是否确认取消关联？';
        this.$mtd.confirm({
            title: this.$getText('ticket_system_detail_confirm_disconnect_title', '是否取消关联'),
            message: onesText,
            showCancelButton: true,
            okButtonText: this.$getText('ticket_info_permission_confirm_btn', '确定'),
            cancelButtonText: this.$getText('ticket_info_permission_cancel_btn', '取消'),
            onOk: () => {
                this.disconnectAssociateDetail();
            }
        }).catch(e => { console.log(e); });
    }
    async disconnectAssociateDetail () {
        let params = {
            source: parseInt(this.ticketId, 10),
            linkType: this.status,
            destination: this.detail.id
        };
        const res: Ajax.AxiosResponse = await api.ticketApi.deleteConnectPage(params);
        if (res.code === 200) {
            this.$mtd.message.success(this.$getText('ticket_system_detail_disconnect_success', { status: this.status }));
            this.getAssociateDetail();
            this.ticketDetailPermissions();
        }
    }
}
</script>

<style lang="scss" scoped>
.ones-itsm-buttons-wrap {
    font-size: 12px !important;
    &.ones-status-wrap {
        padding-top: 6px;
        margin-bottom: 0;
    }
    .mtd-announcement {
        padding: 7px 8px;
        margin-bottom: 8px;
        /deep/ .mtd-announcement-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-right: 0 !important;
        }
        /deep/ .mtd-announcement-title {
            font-size: 12px !important;
            line-height: 20px;
        }
        /deep/ .mtd-announcement-close {
            position: inherit;
            height: 12px;
            display: flex;
            align-items: center;
            font-size: 12px !important;
            right: 12px !important;
        }
    }
}
.ones-itsm-buttons {
    font-size: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-row-gap: 6px;
    /deep/ .mtd-btn {
        background: rgba(0, 0, 0, 0.06);
        border: none;
        font-family: PingFangSC-Medium;
        color: rgba(0, 0, 0, 0.84);
        height: 16px;
        display: inline-flex;
        align-items: center;
        padding: 0 4px;
        .ticket-about-btn-content {
            display: flex;
            align-items: center;
            line-height: 24px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.84);
            border-radius: 4px;
            padding: 0 4px;
            &:hover {
                background: rgba(0, 0, 0, 0.06);
            }
        }
    }
}
.ticket-system-detail {
    font-size: 12px !important;
    .detail-title-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height: 22px;
        .disconnect-tooltip-wrapper {
            height: 16px;
            &:hover {
                cursor: pointer;
            }
        }
    }
    .system-detail {
        margin-top: 12px;
    }
    .ticket-system-detail-title {
        font-size: 12px;
        display: flex;
        align-items: center;
        &.detail-title-for-disconnect {
            max-width: 110px;
        }
        .icon-ones {
            color: #0a70f5;
            font-size: 17px;
        }
        .case-logo {
            width: 16px;
            height: 16px;
        }
        .detail-title-name {
            margin-left: 4px;
            font-weight: 500;
            font-family: PingFangSC;
        }
    }
    .detail-title-link {
        color: rgba(0, 0, 0, 0.6);
        text-align: right;
        line-height: 22px;
        font-weight: 400;
        cursor: pointer;
        display: flex;
        align-items: center;
        .link-icon {
            color: rgba(0, 0, 0, 0.36);
            font-size: 14px;
        }
        &:hover {
            color: #f80;
            .link-icon {
                color: #f80;
            }
        }
    }
    .ones-detail-time {
        color: rgba(0, 0, 0, 0.6);
        line-height: 20px;
        display: block;
        .detail-time-value {
            color: rgba(0, 0, 0, 0.84);
            margin-left: 12px;
        }
    }
    .case-detail-line {
        display: inline-flex;
        line-height: 20px;
        width: 100%;
        justify-content: space-between;
        color: rgba(0, 0, 0, 0.6);
        font-weight: 400;
        .detail-line-title {
            max-width: 132px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    .expand-more {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);
        line-height: 20px;
        display: flex;
        align-items: center;
        margin-top: 8px;
    }
}
</style>
