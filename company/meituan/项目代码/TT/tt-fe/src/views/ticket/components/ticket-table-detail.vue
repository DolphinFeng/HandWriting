<template>
    <div
        class="ticket-table-detail-container"
        id="listWithDetail"
        v-if="ticketList.length">
        <handle-nav
            :list="ticketList"
            :detail-id="detailId"
            :tn="total"
            @change="changeTicketDetailId"
            @dx-tag-change="onDxMessageChanged"
            @scroll-load="listScrollLoad"
            @refresh="listRefresh" />
        <div
            id="listDetail"
            class="list-detail"
            v-if="ticketList && ticketList.length > 0">
            <div
                class="resize-handler"
                @mousedown.stop.prevent="mouseDownResize" />
            <div class="detail-with-list">
                <div class="detail-with-list-container">
                    <ticket-detail
                        v-if="showDetail"
                        :show-dot="showDot"
                        :in-list-detail="true" />
                </div>
                <ticket-tool
                    class="detail-with-list-tool"
                    :ticket-id="detailId"
                    :tool-mode.sync="toolMode"
                    :tool-exchangeable="toolExchangeable"
                    :in-list-detail="true" />
            </div>
        </div>
    </div>
    <div class="list-empty-page" v-else>
        <img class="empty-rocket" src="@/assets/img/empty.png">
        <h3>{{ $getText('ticket_table_detail_list_empty_title', '暂无相关内容') }}</h3>
        <p>{{ $getText('ticket_table_detail_list_empty_desc', '遇到的问题可以尝试发起TT，TT会帮你解决！') }}</p>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { Sla2CN, DEFAULT_AVATAR } from '@/config/map.conf';
import { HANDLE_LX_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';

import TicketDetail from './../ticket-detail.vue';
import TicketTool from './../ticket-tool.vue';
import HandleNav from '@/views/ticket/components/handle-nav.vue';
import eventBus from '@/utils/event-bus';

import SlaIcon from '@/components/sla-icon.vue';
import StateIcon from '@/components/state-icon.vue';
import UserAvatar from '@/components/user-avatar.vue';

@Component({
    components: {
        TicketDetail,
        HandleNav,
        SlaIcon,
        StateIcon,
        UserAvatar,
        TicketTool
    }
})
export default class TicketTableDetail extends Vue {
    @Prop({ default: '' })
    total: string | number;
    @Prop({ default: '' })
    currentPage: string | number;
    @Prop({ default: [] })
    ticketList: any;
    @Prop({ default: '' })
    detailId: string | number;
    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];
    @Mutation setRgPermissionMap;
    @Mutation setDetailPermission;

    sla2CN: CommonTypes.mapObject = Sla2CN;
    // detailId: string | number | null = null;
    showDetail: boolean = false;
    isResizing: boolean = false;
    showDot: boolean = false;
    toolMode: string = 'static';
    toolExchangeable: boolean = true;

    mounted () {
        eventBus.$on('updateTicket', this.updateTicket);
        document.documentElement.addEventListener('mousemove', this.mouseMoveResizer, true);
        document.documentElement.addEventListener('mouseup', this.mouseUpResizer, true);
    }

    beforeDestroy () {
        eventBus.$off('updateTicket', this.updateTicket);
        document.documentElement.removeEventListener('mousemove', this.mouseMoveResizer);
        document.documentElement.removeEventListener('mouseup', this.mouseUpResizer);
    }

    @Watch('ticketList', { immediate: true })
    onGetTicketList (list, oldList) {
        if (oldList && !oldList.length && list.length) {
            // 防止切换到无数据后再切回有数据，宽度计算失误
            this.$nextTick(() => {
                const listNav: HTMLElement = document.getElementById('handleListNav');
                const listDetail: HTMLElement = document.getElementById('listDetail');
                if (listNav) listDetail.style.width = `calc(100% - ${ listNav.getBoundingClientRect().width - 6 }px)`;
                if (listDetail && listDetail.offsetWidth < 1160) {
                    this.toolMode = 'float';
                    this.toolExchangeable = false;
                }
            });
        }
    }
    getListDisplayNames (userArr) {
        let resultArr = [];
        resultArr = userArr.map((username) => {
            let userObj = this.userDisplayInfo.find((user) => {
                return user.username === username;
            });
            return {
                username: username,
                displayName: userObj && userObj['displayName'] || username,
                avatar: (userObj && userObj['avatar']) || DEFAULT_AVATAR
            };
        });
        return resultArr;
    }
    changeTicketDetailId (detailId: string | number) {
        if (!detailId) {
            return ;
        }
        this.showDetail = false;
        this.$emit('detailChange', detailId);
        this.$nextTick(() => {
            this.showDetail = true;
        });
        lxReportClick(HANDLE_LX_MAP['detail_change']);
    }
    updateTicket (ticket) {
        this.ticketList.map((item) => {
            if (`${item.id}` === `${ticket.ticketId}`) {
                return item[ticket.key] = ticket.value;
            }
            return item;
        });
    }
    mouseDownResize (e: MouseEvent) {
        const listNav: HTMLElement = document.getElementById('handleListNav');
        if (listNav && e.clientX > listNav.getBoundingClientRect().left + 24) {
            this.isResizing = true;
        }
    }
    mouseMoveResizer (e: MouseEvent) {
        if (this.isResizing) {
            const listNav: HTMLElement = document.getElementById('handleListNav');
            const listDetail: HTMLElement = document.getElementById('listDetail');
            if (listNav) listNav.style.width = (e.clientX - listNav.getBoundingClientRect().left) + 'px';
            if (listNav.offsetWidth <= 200) {
                listNav.style.width = '200px';
            }
            if (listNav.offsetWidth >= 500) {
                listNav.style.width = '500px';
            }
            if (listNav) listDetail.style.width = `calc(100% - ${ listNav.getBoundingClientRect().width }px)`;
        }
    }
    mouseUpResizer (e: MouseEvent) {
        this.isResizing = false;
    }
    @Watch('detailId')
    handleDetailId () {
        if (this.detailId) {
            this.changeTicketDetailId(this.detailId);
        }
    }
    listScrollLoad () {
        this.$emit('handle-scroll-load');
    }
    listRefresh () {
        this.$emit('handle-list-refresh');
    }
    onDxMessageChanged (id, val) {
        this.showDot = val;
    }
}
</script>

<style lang="scss">
.ticket-table-detail-container {
    // padding-bottom: 16px;
    width: 100%;
    .handle-list-nav-container,
    .list-detail {
        position: relative;
        float: left;
        .ticket-state-container {
            margin: 0 12px 12px 12px;
        }
    }
    .list-detail {
        height: 100%;
        /* overflow-x: auto; */
        overflow-y: scroll;
        // width: calc(100% - 300px);
        padding: 0 0 0 15px;
        margin-right: -5px;
        // margin: 0 0 20px 0;
        .ticket-content-wrapper {
            width: 100%;
            overflow-x: hidden;
        }
        .mtd-main {
            // height: 100% !important;
            overflow-y: auto;
            // .ticket-content-container {
            //     width: 100% !important;
            // }
        }
        .mtd-aside {
            // width: 224px !important;
            // height: 100% !important;
            overflow-y: auto;
        }
    }
    .mtd-pagination-container {
        padding: 10px;
        .mtd-pagination {
            overflow: hidden;
            .mtd-pager {
                float: right;
            }
        }
    }
    .resize-handler {
        position: absolute;
        z-index: 1;
        width: 3px;
        box-sizing: content-box;
        height: 100%;
        top: 0;
        left: 0;
        cursor: col-resize;
        opacity: 0;
        background: #0a70f5;
        &:hover {
            opacity: 1;
        }
    }
    .detail-with-list {
        display: flex;
        min-width: 848px;
        height: 100%;
    }
    .detail-with-list-container {
        position: relative;
        min-width: 848px;
        height: 100%;
        flex-grow: 1;
    }
    .detail-with-list-tool {
        flex-shrink: 0;
    }
}
.list-empty-page {
    text-align: center;
    .empty-rocket {
        margin-top: 80px;
        width: 160px;
    }
    h3 {
        margin-bottom: 8px;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 24px;
    }
    p {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.38);
        line-height: 20px;
    }
}
.nonworking-warning-wrapper-listDetail.mtd-confirm-wrapper-success {
    .mtd-modal-mask {
        width: calc(100% - 330px);
        left: auto;
        position: absolute;
    }
    .mtd-modal-center {
        width: calc(100% - 330px);
        left: auto;
        position: absolute;
    }
}
</style>
