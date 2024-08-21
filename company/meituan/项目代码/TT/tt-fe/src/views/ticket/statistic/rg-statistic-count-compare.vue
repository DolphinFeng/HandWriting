<template>
    <div class="rg-statistic-compare-container">
        <mtd-radio-group class="display-mode-checkbox" v-model="dispalyMode">
            <mtd-radio-button
                value="chart">{{ $getText('rg_statistic_count_chart', '折线图') }}</mtd-radio-button>
            <mtd-radio-button
                value="table">{{ $getText('rg_statistic_count_table', '表格') }}</mtd-radio-button>
        </mtd-radio-group>
        <compare-count-table
            v-show="dispalyMode === 'table'"
            :list="compareTableList"
            :rg-names="rgNameMap">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_compare_tt_count', { diffDays: diffDays }) }}</span>
        </compare-count-table>
        <div class="group-chart-wrapper">
            <ticket-line-chart
                v-show="dispalyMode === 'chart'"
                name="compare-state-count-chart"
                :days="diffDays"
                :alias-map="rgNameMap"
                :info="countList">
                <span class="main-title" slot="title">{{ $getText('rg_statistic_compare_tt_count', { diffDays: diffDays }) }}</span>
                <mtd-radio-group
                    size="small"
                    slot="tab"
                    v-model="countType">
                    <mtd-radio-button
                        v-for="type in stateCountCompare"
                        :value="type.value"
                        :key="type.value">{{ type.label }}</mtd-radio-button>
                </mtd-radio-group>
            </ticket-line-chart>
            <ticket-interval-chart
                name="compare-type-count-chart"
                :days="diffDays"
                :alias-map="rgNameMap"
                :is-compare="true"
                :info="treeGroupList">
                <span class="main-title" slot="title">{{ $getText('rg_statistic_tt_type_compare', 'TT所属类型对比') }}</span>
            </ticket-interval-chart>
            <ticket-interval-chart
                name="compare-score-count-chart"
                :days="diffDays"
                :alias-map="rgNameMap"
                :is-compare="true"
                :info="scoreGroupList">
                <span class="main-title" slot="title">{{ $getText('rg_statistic_tt_score_compare', 'TT满意度对比') }}</span>
            </ticket-interval-chart>
            <ticket-interval-chart
                name="compare-sla-count-chart"
                :days="diffDays"
                :alias-map="rgNameMap"
                :is-compare="true"
                :info="slaGroupList">
                <span class="main-title" slot="title">{{ $getText('rg_statistic_tt_sla_compare', 'TT等级对比') }}</span>
            </ticket-interval-chart>
            <ticket-line-chart
                name="compare-reopen-count-chart"
                :days="diffDays"
                :alias-map="rgNameMap"
                :info="reopenCountList">
                <span class="main-title" slot="title">{{ $getText('rg_statistic_tt_reopen_compare', 'TT重新打开对比') }}</span>
            </ticket-line-chart>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import { Getter } from 'vuex-class';
import CompareCountTable from './components/compare-count-table.vue';
import TicketLineChart from './components/ticket-line-chart.vue';
import TicketIntervalChart from './components/ticket-interval-chart.vue';
import { Sla2CN, ReopenTimeMap, StateCountCompare } from '@/config/map.conf';
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
        CompareCountTable,
        TicketLineChart,
        TicketIntervalChart
    }
})
export default class RgStatisticCount extends Vue {
    @Prop({ default: 0 })
    ids: number[];

    @Prop()
    rgNameMap: any;

    @Prop({ default: () => {
        return ['', ''];
    } })
    period: string[];
    dispalyMode: string = 'chart';
    countType: string = 'created';

    reopenTimeMap: CommonTypes.mapObject = ReopenTimeMap;
    // countList: CommonTypes.CountListItem[] = [];
    createdCountList: any = [];
    resolvedCountList: any = [];
    closedCountList: any = [];
    reopenCountList: CommonTypes.GroupItem[] = [];
    treeGroupList: CommonTypes.GroupItem[] = [];
    // typeGroupList: CommonTypes.GroupItem[] = [];
    slaGroupList: CommonTypes.GroupItem[] = [];
    compareTableList: CommonTypes.GroupItem[] = [];
    // oncallGroupList: CommonTypes.GroupItem[] = [];
    scoreGroupList: CommonTypes.GroupItem[] = [];
    sla2CN: CommonTypes.mapObject = Sla2CN;
    stateCountCompare: any = StateCountCompare;

    @Getter misX;

    @Watch('ids')
    onRgIdsChanged (val: number[]) {
        val && this.refreshChart();
        // if (oldVal) {
        //     window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_k42yxnfj_mc', { custom: { mis: this.misX } });
        // }
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
    // 获取所选时长间隔
    get diffDays () {
        return dayjs(this.period[1]).diff(dayjs(this.period[0]), 'days') + 1;
    }
    // 更新图表数据
    refreshChart () {
        let params = {
            rgIds: this.ids.join(','),
            dateStartAt: dayjs(this.period[0]).valueOf(),
            dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
        };
        this.compareNumberByRg(params);
        this.compareTypeByRg(params);
        this.compareScoreByRg(params);
        this.compareSlaByRg(params);
        this.compareReopenByRg(params);
    }
    async compareNumberByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareNumberByRg(params);
            let { data } = res;
            this.createdCountList = data.created || [];
            this.resolvedCountList = data.resolved || [];
            this.closedCountList = data.closed || [];
            this.compareTableList = this.formatCompareTableList(data);
        } catch (e) {
            console.log(e);
        }
    }
    async compareTypeByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareTypeByRg(params);
            let { data } = res;
            this.treeGroupList = this.formatCountObjToList(data, 'type');
        } catch (e) {
            console.log(e);
        }
    }
    async compareScoreByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareScoreByRg(params);
            let { data } = res;
            this.scoreGroupList = this.formatCountObjToList(data, 'type');
        } catch (e) {
            console.log(e);
        }
    }
    async compareSlaByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareSlaByRg(params);
            let { data } = res;
            this.slaGroupList = this.formatCountObjToList(data, 'type');
        } catch (e) {
            console.log(e);
        }
    }
    async compareReopenByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareReopenByRg(params);
            let { data } = res;
            this.reopenCountList = this.formatCountObjToList(data.reopen, 'dateTime');
        } catch (e) {
            console.log(e);
        }
    }
    created () {
        this.ids && this.refreshChart();
    }
    get countList () {
        return this.formatCountObjToList(this[this.countType + 'CountList'], 'dateTime');
    }
    formatCountObjToList (dataObj, type) {
        let resultArr = [];
        for (let time in dataObj) {
            let target = {};
            target[type] = time;
            dataObj[time].forEach(rgCount => {
                target[rgCount['rgId']] = rgCount['number'];
            });
            resultArr.push(target);
        }
        return resultArr;
    }
    formatCompareTableList (data) {
        let resultArr = [];
        for (let day in data.created) {
            let obj = {};
            data.created[day].forEach((rgItem, rgIndex) => {
                let rgName = this.rgNameMap[rgItem['rgId']];
                obj['created' + rgName] = rgItem['number'];
                obj['dateTime'] = day;
                obj['closed' + rgName] = data['closed'][day][rgIndex]['number'];
                obj['resolved' + rgName] = data['resolved'][day][rgIndex]['number'];
            });
            resultArr.push(obj);
        }
        return resultArr;
    }
}
</script>

<style lang="scss">
.rg-statistic-compare-container {
    position: relative;
    height: 100%;
    .display-mode-checkbox {
        position: absolute;
        right: 30px;
        top: 20px;
    }
    .group-chart-wrapper {
        overflow: hidden;
    }
}
</style>
