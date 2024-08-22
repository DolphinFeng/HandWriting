<template>
    <div class="ticket-handle-list-container">
        <ticket-data-filter
            ref="dataFilter"
            :filter-fold="true"
            :current-page.sync="currentPage"
            :total.sync="total"
            :limit.sync="limit"
            @foldChange="handleFold"
            @data-change="listDataChange" />
        <mtd-loading
            :loading="loading"
            :class="[isFilterFold ? 'hide-class' : 'show-class']"
            :delay="100">
            <ticket-table-detail
                :ticket-list="ticketList"
                :detail-id="detailId"
                :total="total"
                :current-page="currentPage"
                :handle-change="handlePageChange"
                @handle-scroll-load="handleScrollLoad"
                @handle-list-refresh="handlePageChange"
                @detailChange="detailChange" />
        </mtd-loading>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import eventBus from '@/utils/event-bus';
import TicketDataFilter from './ticket-data-filter.vue';
import TicketTableDetail from './components/ticket-table-detail.vue';

Component.registerHooks([
    'beforeRouteLeave',
    'beforeRouteUpdate'
]);


/**
 * 处理TT
 *
 * @author liyuyao
 * @date 10/22/2020
 */
@Component({
    components: {
        TicketDataFilter,
        TicketTableDetail
    }
})
export default class TicketHandle extends Vue {
    @Getter guard;
    @Getter spaceDomain;

    loading: Boolean = false;
    ticketList: any = [];
    detailId: string | number | null = null;

    total: number = 0;
    limit: number = 20;
    currentPage: number = 1;
    pageSizes: number[] = [10, 20, 50, 100];
    isFilterFold: boolean = false;

    @Watch('detailId')
    handleDetailId () {
        if (!this.detailId) return;
        let query = this.$router.history.current.query;
        let path = this.$router.history.current.path;
        let newQuery = JSON.parse(JSON.stringify(query));
        newQuery.id = this.detailId;
        this.$router.push({ path, query: newQuery, params: { space: this.spaceDomain } }).catch(err => err);
    }

    mounted () {
        this.$route.query.id && (this.detailId = this.$route.query.id);
        const lastChoice = localStorage.getItem('hide-filter');
        this.isFilterFold = lastChoice !== 'false';
    }

    handleFold (hide) {
        this.isFilterFold = hide;
        eventBus.$emit('isFilterFold', '');
    }

    listDataChange (list) {
        this.ticketList = list;
        if (!this.$route.query.id) this.detailId = this.ticketList[0] ? this.ticketList[0]['id'] : null;
        this.handleDetailId();
    }
    detailChange (detailId: string | number) {
        this.detailId = detailId;
    }
    handlePageChange (current: number, size: number) {
        const dataFilter = this.$refs.dataFilter;
        dataFilter && dataFilter.handleChange(current, size);
    }
    handleScrollLoad (current: number, size: number) {
        const dataFilter = this.$refs.dataFilter;
        dataFilter && dataFilter.handleScrollLoad(current, size);
    }
    beforeRouteUpdate (to, from, next) {
        this.$store.commit('SET_GUARD_STATUS', {
            comment: false
        });
        next();
    }
    beforeRouteLeave (to: any, from: any, next: any) {
        if (this.guard.comment) {
            this.$mtd.confirm({
                title: this.$getText('ticket_handle_before_leave_confirm_title', '放弃当前编辑的评论吗?'),
                width: '433px',
                showCancelButton: true,
                type: 'info',
                okButtonText: this.$getText('ticket_handle_before_leave_confirm_ok', '放弃'),
                cancelButtonText: this.$getText('ticket_handle_before_leave_confirm_cancel', '继续编辑'),
                onOk: async () => {
                    this.$store.commit('SET_GUARD_STATUS', {
                        comment: false
                    });
                    next();
                },
                onCancel: () => {
                    next(false);
                }
            }).catch(e => e);
        } else {
            next();
        }
    }
}
</script>

<style lang="scss">
.ticket-handle-list-container {
    height: 100%;
    .mtd-loading-container {
        height: 100%;
    }
    .ticket-table-detail-container {
        height: 100%;
        overflow: hidden;
    }
}
.user-header-popper {
    font-size: 12px;
    .header-img-container {
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }
    .name-content {
        float: right;
        margin-left: 4px;
    }
}
.ticket-filter-list-wrapper.with-files {
    display: flex;
}
.tt-new-message-notify {
    bottom: 32px;
    top: initial !important;
    padding: 10px;
    width: 280px;
    .mtd-notification-title {
        font-size: 14px;
        font-weight: 500;
    }
    .mtd-notification-content {
        display: none;
    }
}
</style>
