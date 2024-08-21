<template>
    <div class="ticket-list-container">
        <ticket-data-filter
            ref="dataFilter"
            :filter-fold="false"
            :current-page.sync="currentPage"
            :total.sync="total"
            :limit.sync="limit"
            :archive-id="archiveId"
            @data-change="listDataChange"
            @column-change="columnChange" />
        <div class="table-pagination-wrapper">
            <div class="table-wrapper">
                <mtd-loading
                    :loading="loading"
                    :delay="100">
                    <div :class="['ticket-filter-list-wrapper', { 'with-files': filterOpen }]">
                        <ticket-file-filter
                            v-if="archiveRgId"
                            :rg-id="archiveRgId"
                            :expand.sync="filterOpen"
                            @show-expand="showExpandEvent"
                            @change="fileChooseChange" />
                        <ticket-table
                            :ticket-list="ticketList"
                            :columns-list="columnList"
                            :expand.sync="filterOpen"
                            :has-expand="showExpand"
                            :has-setting="true"
                            @sort="listSort" />
                    </div>
                </mtd-loading>
                <div v-if="total > Math.min(...pageSizes)" class="pagination-container">
                    <mtd-pagination
                        size="small"
                        :show-total="language !== 'en'"
                        :show-size-changer="language !== 'en'"
                        :total="total"
                        :current-page.sync="currentPage"
                        :page-size.sync="limit"
                        @change="handlePageChange" />
                    <span v-if="language === 'en'" style="margin-left: 10px;">  
                        <span>{{ $getText('ticket_list_total', '共') }}</span>
                        {{ total }}
                    </span>
                </div>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import TicketDataFilter from './ticket-data-filter.vue';
import TicketTable from './components/ticket-table.vue';
import TicketTableDetail from './components/ticket-table-detail.vue';
import TicketFileFilter from './components/ticket-file-filter.vue';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { LIST_LX_MAP } from '@/config/lx_map.conf';
import eventBus from '@/utils/event-bus';

/**
 * Ticket列表
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component({
    components: {
        TicketTable,
        TicketDataFilter,
        TicketTableDetail,
        TicketFileFilter
    }
})
export default class TicketList extends Vue {
    @Getter inside;
    @Getter misX;
    @Getter spaceDomain;
    @Getter language;

    loading: Boolean = false;
    totalNumber: number = 0;
    ticketList: any = [];
    columnList: any = [];
    showExpand: boolean = false;
    filterOpen: boolean = false;
    archiveRgId: number = 0;
    archiveId: number | null = null;

    total: number = 0;
    limit: number = 20;
    currentPage: number = 1;
    pageSizes: number[] = [10, 20, 50, 100];

    mounted () {
        eventBus.$emit('changeTab', this.inside ? 'filter' : 'outsideAssigned');
        // 兼容tt_list和tt_handle不拆分逻辑：当query中有id时，跳转到tt_handle
        if (this.$route.query.id) {
            this.$router.replace({
                name: 'tt_handle',
                params: this.$route.params,
                query: this.$route.query
            }).catch(e => e);
            return ;
        }
    }

    @Watch('$route.query.filter', { immediate: true })
    routerFilterChange (filter: string) {
        // 我所在服务组下 问题归档的rgId
        const rgId = parseInt(filter, 10);
        if (rgId) this.archiveRgId = rgId;
    }

    listDataChange (list) {
        this.ticketList = list;
    }

    columnChange (list) {
        this.columnList = list;
    }

    getListData (field?, order?) {
        const dataFilter = this.$refs.dataFilter;
        this.$nextTick(() => {
            dataFilter && dataFilter.getTicketListToState(field, order);
        });
    }

    handlePageChange (current: number, size: number) {
        const dataFilter = this.$refs.dataFilter;
        this.$nextTick(() => {
            dataFilter && dataFilter.handleChange(current, size);
        });
    }

    listSort (prop, order) {
        this.currentPage = 1;
        lxReportClick(`sort_${prop}`);
        this.getListData(prop, order === 'ascending' ? 'ASC' : 'DESC');
    }

    fileChooseChange (data) {
        const { id } = data;
        this.archiveId = id;
        lxReportClick(LIST_LX_MAP['file_filter']);
    }

    showExpandEvent (val) {
        this.showExpand = val;
        lxReportClick(LIST_LX_MAP['file_expand']);
    }
}
</script>

<style lang="scss">
.ticket-list-container {
    height: 100%;
    .pagination-container {
        margin: 0;
        background: #fff;
        padding: 12px 24px 16px 0;
        border-radius: 0 0 4px 4px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
    .mtd-pagination-total {
        font-size: 14px;
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
.table-pagination-wrapper {
    // box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
    padding-bottom: 12px;
    .table-wrapper {
        border-radius: 4px;
        box-shadow: 0 2 6px 0 rgba(0, 0, 0, 0.08);
    }
    .mtd-table {
        border-radius: 4px 4px 0 0;
    }
}
.ticket-filter-list-wrapper.with-files {
    display: flex;
}
</style>
