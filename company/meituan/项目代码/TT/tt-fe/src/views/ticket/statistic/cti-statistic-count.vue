<template>
    <div class="cti-statistic-count">
        <mtd-radio-group class="display-mode-checkbox" v-model="dispalyMode">
            <mtd-radio-button value="chart">图表</mtd-radio-button>
            <mtd-radio-button value="table">表格</mtd-radio-button>
        </mtd-radio-group>
        <count-table v-show="dispalyMode === 'table'" :list="countList">
            <span class="main-title" slot="title">TT 数量·{{ diffDays }}天范围</span>
        </count-table>
        <div class="group-chart-wrapper">
            <ticket-stacked-bar-chart
                v-show="dispalyMode === 'chart'"
                name="state-count-stacked-bar-chart"
                :days="diffDays"
                :info="countList">
                <span class="main-title" slot="title">TT 数量·{{ diffDays }} 天范围</span>
            </ticket-stacked-bar-chart>
            <ticket-line-chart
                v-show="dispalyMode === 'chart'"
                name="reopen-time-chart"
                :days="diffDays"
                :alias-map="reopenTimeMap"
                :info="reopenList">
                <span class="main-title" slot="title">重新打开数时间趋势</span>
            </ticket-line-chart>

            <!-- 以下都是饼状图 -->
            <ticket-pie-chart
                name="initiator-group-chart"
                :info="initiatorGroupList">
                <span class="main-title" slot="title">TT 发起方分布</span>
            </ticket-pie-chart>
            <ticket-pie-chart
                name="tree-group-chart"
                :info="treeGroupList">
                <span class="main-title" slot="title">TT 所属目录分布</span>
            </ticket-pie-chart>
            <ticket-pie-chart
                name="type-group-chart"
                :info="typeGroupList">
                <span class="main-title" slot="title">TT 所属类型分布</span>
            </ticket-pie-chart>
            <ticket-pie-chart
                name="sla-group-chart"
                :info="slaGroupList">
                <span class="main-title" slot="title">TT 所属等级分布</span>
            </ticket-pie-chart>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import { Getter } from 'vuex-class';
import CountTable from './components/count-table.vue';
import TicketStackedBarChart from './components/ticket-stacked-bar-chart.vue';
import TicketLineChart from './components/ticket-line-chart.vue';
import TicketPieChart from './components/ticket-pie-chart.vue';
import { ReopenTimeMap, Sla2CN } from '@/config/map.conf';
import { DAY_TIME_STAMP } from '@/config/const.conf';
import dayjs from 'dayjs';
/**
 * cti数量统计
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component({
    components: {
        CountTable,
        TicketLineChart,
        TicketPieChart,
        TicketStackedBarChart
    }
})
export default class CtiStatisticCount extends Vue {
    @Prop({ default: 0 })
    categoryId: number;
    @Prop({ default: 0 })
    typeId: number;
    @Prop({ default: 0 })
    itemId: number;
    @Prop({ default: () => {
        return ['', ''];
    } })
    period: string[];
    dispalyMode: string = 'chart';
    reopenTimeMap: CommonTypes.mapObject = ReopenTimeMap;
    countList: CommonTypes.CountListItem[] = [];
    reopenList: CommonTypes.ReopenListItem[] = [];
    initiatorGroupList: CommonTypes.InitiatorGroupItem[] = [];
    treeGroupList: CommonTypes.GroupItem[] = [];
    typeGroupList: CommonTypes.GroupItem[] = [];
    slaGroupList: CommonTypes.GroupItem[] = [];
    oncallGroupList: CommonTypes.GroupItem[] = [];
    sla2CN: CommonTypes.mapObject = Sla2CN;

    @Getter misX;


    @Watch('period')
    onPeriodChanged (val: string[]) {
        this.refreshChart();
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_fp4nk5qy_mc', { custom: { mis: this.misX } });
    }
    @Watch('dispalyMode')
    onDispalyModeChanged (val: string) {
        if (val === 'chart') {
            window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_gcymg2f8_mc', { custom: { mis: this.misX } });
        } else {
            window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_641pqzef_mc', { custom: { mis: this.misX } });
        }
    }
    // 获取所选时长间隔
    get diffDays () {
        return dayjs(this.period[1]).diff(dayjs(this.period[0]), 'days') + 1;
    }
    // 更新图表数据
    refreshChart () {
        this.getCountByCti();
        this.getGroupByCti();
        this.getGroupTypeByCti();
        this.getGroupSlaByCti();
        this.getReopenByCti();
        this.getInitiatorGroupByCti();
    }
    async getCountByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getCountByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.countList = res.data.items;
            let total = 0;
            this.countList.forEach((item) => {
                total += item.createdNumber;
            });
            this.$emit('total-change', total);
        } catch (e) {
            this.countList = [];
            console.log(e);
        }
    }
    async getReopenByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getReopenByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.reopenList = res.data.items;
        } catch (e) {
            this.reopenList = [];
            console.log(e);
        }
    }
    async getInitiatorGroupByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getInitiatorGroupByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const rawItems = res.data.items;
            const total = rawItems.reduce((sum, item) => sum + item.orgNumber, 0);
            this.initiatorGroupList = rawItems.map((item) => {
                return {
                    name: item.org,
                    number: item.orgNumber,
                    percent: item.orgNumber / total
                };
            });
        } catch (e) {
            this.initiatorGroupList = [];
            console.log(e);
        }
    }
    async getGroupByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.treeGroupList = res.data.items;
        } catch (e) {
            this.treeGroupList = [];
            console.log(e);
        }
    }
    async getGroupTypeByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupTypeByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.typeGroupList = res.data.items;
        } catch (e) {
            this.typeGroupList = [];
            console.log(e);
        }
    }
    async getGroupSlaByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupSlaByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.slaGroupList = res.data.items.map((item: CommonTypes.GroupItem) => {
                return {
                    name: this.$getText(this.sla2CN[item.name]),
                    number: item.number,
                    percent: item.percent
                };
            });
        } catch (e) {
            this.slaGroupList = [];
            console.log(e);
        }
    }
    created () {
        this.refreshChart();
    }
}
</script>

<style lang="scss">
.cti-statistic-count {
    position: relative;
    height: 100%;
    padding: 12px 8px 12px 20px;
    .display-mode-checkbox {
        position: absolute;
        right: 30px;
        top: 20px;
    }
    .group-chart-wrapper {
        overflow: hidden;
        .line-chart-container {
            background: #fff;
            margin-bottom: 0;
        }
    }
}
</style>