<template>
    <div class="search-ticket-container">
        <div class="result-overview">
            <span>{{ $getText('ticket_search_result_about', {name: name}) }}</span>
            {{ total }}
            <span>{{ $getText('ticket_search_result_related_results', '条相关结果') }}</span>
        </div>
        <mtd-loading
            :loading="loading"
            :delay="300">
            <ticket-table
                :column-list="['id', 'name', 'priority', 'state', 'assignedCnName', 'ticketType', 'directory', 'createdAt', 'reporterCnName']"
                :ticket-list="ticketList"
                :sortable="false" />
        </mtd-loading>
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
import { Vue, Component, Watch } from 'vue-property-decorator';
import { PaginationMixin } from '@/utils/mixin';
import TicketTable from './components/ticket-table.vue';
import { Sla2CN } from '@/config/map.conf';
import * as api from '@/api';
/**
 * Ticket搜索
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component({
    components: {
        TicketTable
    }
})
export default class TicketSearch extends PaginationMixin {
    name: string = '';
    loading: Boolean = false;
    ticketList: any[] = [];
    sla2CN: CommonTypes.mapObject = Sla2CN;
    columnList: any[] = [];

    @Watch('$route')
    onRouteChanged (to) {
        this.name = to.query.name;
        // 搜索参数变化时，页面复位
        this.currentPage = 1;
        this.searchTicket();
    }
    created () {
        this.name = this.$route.query.name;
        this.searchTicket();
    }
    // 根据关键词搜索ticket
    async searchTicket () {
        if (!this.name) {
            return ;
        }
        this.loading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketByName(encodeURIComponent(this.name), this.currentPage, this.limit);
            this.ticketList = res.data.items;
            this.columnList = ['id', 'name', 'priority', 'state', 'assignedCnName', 'ticketType', 'directory', 'createdAt', 'reporterCnName'];
            this.total = res.data.tn;
        } catch (e) {
            this.ticketList = [];
            console.log(e);
        }
        this.loading = false;
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.searchTicket();
    }
    // 设置用户组件架构信息
    setDept (bg: string, bu: string, org: string) {
        let dept: string = '';
        if (bg) {
            dept += `${bg}/`;
        }
        if (bu) {
            dept += `${bu}/`;
        }
        if (org) {
            dept += `${org}`;
        }
        return dept;
    }
}
</script>

<style lang="scss">
.search-ticket-container {
    height: 100%;
    padding: 12px 16px 16px 16px;
    background-color: #fff;
    .result-overview {
        margin-bottom: 12px;
        font-family: PingFangSC-Semibold;
        font-size: 18px;
        color: #464646;
    }
    .ticket-sla {
        font-family: PingFangSC-Semibold;
        color: #6f6f6f;
    }
}
</style>
