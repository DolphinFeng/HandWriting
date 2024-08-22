<template>
    <div class="rg-statistic-count">
        <mtd-radio-group class="display-mode-checkbox" v-model="dispalyMode">
            <mtd-radio-button
                value="chart">图表</mtd-radio-button>
            <mtd-radio-button
                value="table">表格</mtd-radio-button>
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
                v-if="!misId"
                name="reopen-time-chart"
                :days="diffDays"
                :alias-map="reopenTimeMap"
                :info="reopenList">
                <span class="main-title" slot="title">重新打开数时间趋势</span>
            </ticket-line-chart>
            <!-- 发起方 initiator 从二级部门字段取数据 -->
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
            <ticket-pie-chart
                name="oncall-group-chart"
                :info="oncallGroupList"
                v-if="misId === ''">
                <span class="main-title" slot="title">RG 问题解决量人员分布</span>
            </ticket-pie-chart>
            <ticket-pie-chart
                name="score-group-chart"
                :avg="scoreAvg"
                :info="scoreGroupList">
                <span class="main-title" slot="title">TT 满意度分布</span>
            </ticket-pie-chart>
            <ticket-pie-chart
                name="tag-group-chart"
                :sum="tagSum"
                :info="tagGroupList">
                <span class="main-title" slot="title">TT 标签分布</span>
            </ticket-pie-chart>
            <ticket-pie-table-chart
                @type-changed="changeDisplayType"
                name="tag-group-chart">
                <span class="main-title" slot="title">问题归档下级归档分布</span>
                <span
                    class="archive-distribute-back"
                    @click="getArchiveDistributeByRg(archiveBread[archiveBread.length - 2], true)"
                    slot="back"><i class="mtdicon mtdicon-left" v-if="archiveBread.length > 1" />{{ archiveBread.length > 1 ? '返回上一级归档' : ' ' }}</span>
                <ticket-pie-chart
                    slot="chart"
                    name="archive-distribute-chart"
                    v-show="displayType === 'chart'"
                    @pie-click="changeArchiveDistribute"
                    :info="archiveDistributeList"
                    :is-visible="displayType === 'chart'">
                    <span />
                </ticket-pie-chart>
                <mtd-table
                    slot="table"
                    v-show="displayType === 'table'"
                    :data="archiveDistributeList"
                    height="270"
                    class="count-table-list">
                    <div slot="empty">
                        <i class="iconfont icon-hulk-zanwushuju" />
                        <p class="no-data">暂无数据</p>
                    </div>
                    <mtd-table-column prop="level" label="层级" />
                    <mtd-table-column prop="name" label="问题归档名称" />
                    <mtd-table-column prop="number" label="工单数量" />
                    <mtd-table-column prop="percent" label="占比">
                        <template slot-scope="scope">
                            <span>{{ Number(scope.row.percent*100).toFixed(2) + '%' }}</span>
                        </template>
                    </mtd-table-column>
                </mtd-table>
            </ticket-pie-table-chart>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import { Getter } from 'vuex-class';
import CountTable from './components/count-table.vue';
import TicketLineChart from './components/ticket-line-chart.vue';
import TicketStackedBarChart from './components/ticket-stacked-bar-chart.vue';
import TicketPieChart from './components/ticket-pie-chart.vue';
import TicketPieTableChart from './components/ticket-pie-table-chart.vue';
import { Sla2CN, ReopenTimeMap } from '@/config/map.conf';
import { DAY_TIME_STAMP } from '@/config/const.conf';
import dayjs from 'dayjs';

/**
 * rg数量统计
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component({
    components: {
        CountTable,
        TicketLineChart,
        TicketStackedBarChart,
        TicketPieChart,
        TicketPieTableChart
    }
})
export default class RgStatisticCount extends Vue {
    @Prop({ default: 0 })
    id: number;
    @Prop({ default: '' })
    misId: string;

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
    scoreGroupList: CommonTypes.GroupItem[] = [];
    tagGroupList: CommonTypes.GroupItem[] = [];
    sla2CN: CommonTypes.mapObject = Sla2CN;
    archiveDistributeList: any[] = [];

    scoreAvg: number = 0;
    tagSum: number = 0;
    archiveBread: any[] = [];
    displayType: string = 'chart';

    @Getter misX;

    @Watch('id')
    onRgIdChanged (val: number, oldVal: number) {
        val && this.refreshChart();
        if (oldVal) {
            window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_k42yxnfj_mc', { custom: { mis: this.misX } });
        }
    }
    @Watch('misId')
    onMisIdChanged () {
        this.refreshChart();
    }
    @Watch('period')
    onPeriodChanged (val: string[]) {
        this.refreshChart();
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_4i236pkd_mc', { custom: { mis: this.misX } });
    }
    // 监听展示形式进行相关埋点：图表/列表
    @Watch('dispalyMode')
    onDispalyModeChanged (val: string) {
        if (val === 'chart') {
            window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_gibr4uq1_mc', { custom: { mis: this.misX } });
        } else {
            window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_b4qwkqef_mc', { custom: { mis: this.misX } });
        }
    }
    // 变化归档表展示类型
    changeDisplayType (value) {
        this.displayType = value;
        console.log('-->', this.archiveDistributeList);
    }
    // 获取所选时长间隔
    get diffDays () {
        return dayjs(this.period[1]).diff(dayjs(this.period[0]), 'day') + 1;
    }
    // 更新图表数据
    refreshChart () {
        this.getCountByRg();
        this.getGroupByRg();
        this.getInitiatorGroupByRg();
        this.getGroupTypeByRg();
        this.getGroupSlaByRg();
        this.getGroupOncallByRg();
        this.getGroupScoreByRg();
        this.getReopenByRg();
        this.getGroupTagByRg();
        this.getArchiveDistributeByRg();
        this.archiveBread = [];
    }
    async getCountByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getCountByRg({
                rgId: this.id,
                misId: this.misId,
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
    async getReopenByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getReopenByRg({
                rgId: this.id,
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.reopenList = res.data.items;
        } catch (e) {
            this.reopenList = [];
            console.log(e);
        }
    }
    async getInitiatorGroupByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getInitiatorGroupByRg({
                rgId: this.id,
                misId: this.misId,
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
    async getGroupByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupByRg({
                rgId: this.id,
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.treeGroupList = res.data.items;
        } catch (e) {
            this.treeGroupList = [];
            console.log(e);
        }
    }
    async getGroupTypeByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupTypeByRg({
                rgId: this.id,
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.typeGroupList = res.data.items;
        } catch (e) {
            this.typeGroupList = [];
            console.log(e);
        }
    }
    async getGroupSlaByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupSlaByRg({
                rgId: this.id,
                misId: this.misId,
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
    async getGroupOncallByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupOncallByRg({
                rgId: this.id,
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.oncallGroupList = res.data.items;
        } catch (e) {
            this.oncallGroupList = [];
            console.log(e);
        }
    }
    async getGroupScoreByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getSatifiedByRg({
                rgId: this.id,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP,
                misId: this.misId
            });
            this.scoreGroupList = res.data.items;
            this.scoreAvg = res.data.avg;
        } catch (e) {
            this.scoreGroupList = [];
            console.log(e);
        }
    }
    async getGroupTagByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getGroupTagByRg({
                rgId: this.id,
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.tagGroupList = res.data.items;
            this.tagSum = this.tagGroupList.length;
        } catch (e) {
            // this.tagGroupList = [];
            console.log(e);
        }
    }
    async changeArchiveDistribute (index) {
        const clickedData = this.archiveDistributeList[index];
        if (!clickedData.leaf) await this.getArchiveDistributeByRg(clickedData.id);
    }
    async getArchiveDistributeByRg (id, needPop) {
        console.log(this.archiveBread);
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getArchiveDistribute({
                rgId: this.id,
                parentArchiveId: id,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.archiveDistributeList = res.data.children.map(item => Object.assign(item, { number: item.count }));
            if (needPop) {
                this.archiveBread.pop();
            } else {
                this.archiveBread.push(res.data.parentArchiveId);
            }
        } catch (e) {
            this.archiveDistributeList = [];
        }
    }
    created () {
        this.id && this.refreshChart();
    }
}
</script>

<style lang="scss">
.rg-statistic-count {
    position: relative;
    height: 100%;
    padding: 12px 8px 12px 20px;
    .line-chart-container {
        background: #fff;
        // margin-bottom: 0;
    }
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
    .count-table-container {
        margin-bottom: 12px;
    }
}
.archive-distribute-back {
    color: #666;
    margin-left: 24px;
    cursor: pointer;
}
.count-table-list {
    border: none;
    padding: 10px;
    background: #fff;
}
</style>
