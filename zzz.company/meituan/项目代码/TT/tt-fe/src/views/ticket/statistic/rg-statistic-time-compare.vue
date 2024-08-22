<template>
    <div class="rg-statistic-count">
        <ticket-line-chart
            name="compare-response-time-chart"
            :handle-chart="handleResponseTime"
            :days="diffDays"
            :alias-map="rgNameMap"
            :info="responseTimeList">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_time_compare_main_title', { diffDays: diffDays }) }}</span>
        </ticket-line-chart>
        <ticket-line-chart
            name="compare-resolve-time-chart"
            :handle-chart="handleResolveTime"
            :days="diffDays"
            :alias-map="rgNameMap"
            :info="resolveTimeList">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_time_compare_resolve_main_title', { diffDays: diffDays }) }}</span>
        </ticket-line-chart>
        <ticket-line-chart
            name="compare-rate-chart"
            :handle-chart="handleSumRate"
            :days="diffDays"
            :alias-map="rgNameMap"
            :info="sumRateList">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_time_compare_rate_main_title', { diffDays: diffDays }) }}</span>
            <span class="sub-title" slot="subTitle">{{ $getText('rg_statistic_time_compare_rate_sub_title', '（单位：百分比）') }}</span>
            <mtd-radio-group
                size="small"
                slot="tab"
                v-model="sumRateType">
                <mtd-radio-button
                    value="response"
                    key="response">{{ $getText('rg_statistic_time_compare_response_rate', '响应合格率') }}</mtd-radio-button>
                <mtd-radio-button
                    value="resolve"
                    key="resolve">{{ $getText('rg_statistic_time_compare_resolve_rate', '处理合格率') }}</mtd-radio-button>
            </mtd-radio-group>
        </ticket-line-chart>
        <ticket-interval-chart
            name="compare-already-react-chart"
            :days="diffDays"
            :alias-map="rgNameMap"
            :is-compare="true"
            :info="alreadyReactList">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_time_compare_already_react_main_title', '响应时长分布对比（已响应）') }}</span>
        </ticket-interval-chart>
        <ticket-interval-chart
            name="compare-not-react-chart"
            :days="diffDays"
            :alias-map="rgNameMap"
            :is-compare="true"
            :info="notReactList">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_time_compare_not_react_main_title', '响应时长分布对比（未响应）') }}</span>
        </ticket-interval-chart>
        <ticket-interval-chart
            name="compare-already-handle-chart"
            :days="diffDays"
            :alias-map="rgNameMap"
            :is-compare="true"
            :info="alreadyHandleList">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_time_compare_already_handle_main_title', '处理时长分布对比（已处理）') }}</span>
        </ticket-interval-chart>
        <ticket-interval-chart
            name="compare-not-handle-chart"
            :days="diffDays"
            :alias-map="rgNameMap"
            :is-compare="true"
            :info="notHandleList">
            <span class="main-title" slot="title">{{ $getText('rg_statistic_time_compare_not_handle_main_title', '处理时长分布对比（未处理）') }}</span>
        </ticket-interval-chart>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import { Getter } from 'vuex-class';
import TicketLineChart from './components/ticket-line-chart.vue';
import TicketIntervalChart from './components/ticket-interval-chart.vue';
import { DAY_TIME_STAMP } from '@/config/const.conf';
import dayjs from 'dayjs';
/**
 * rg时长统计
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component({
    components: {
        TicketLineChart,
        TicketIntervalChart
    }
})
export default class RgStatisticTimeCompare extends Vue {
    @Prop({ default: 0 })
    ids: number[];

    @Prop({ default: () => {
        return ['', ''];
    } })
    period: string[];

    @Prop()
    rgNameMap: any;

    sumRateType: string = 'response';
    resolveTimeList: CommonTypes.SumTimeItem[] = [];
    responseTimeList: CommonTypes.SumTimeItem[] = [];
    resolveRateTimeList: CommonTypes.SumTimeItem[] = [];
    responseRateTimeList: CommonTypes.SumTimeItem[] = [];
    alreadyReactList: CommonTypes.ReactTimeItem[] = [];
    notReactList: CommonTypes.ReactTimeItem[] = [];
    alreadyHandleList: CommonTypes.ReactTimeItem[] = [];
    notHandleList: CommonTypes.ReactTimeItem[] = [];

    @Getter misX;

    @Watch('ids')
    onRgIdsChanged (val: number[]) {
        val && this.refreshChart();
    }
    @Watch('period')
    onPeriodChanged (val: string[]) {
        this.refreshChart();
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_4i236pkd_mc', { custom: { mis: this.misX } });
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
        this.compareResponseByRg(params);
        this.compareResolveByRg(params);
        this.compareResolveResponseRateByRg(params);
        this.compareAlreadyReactDistributeByRg(params);
        this.compareNotReactDistributeByRg(params);
        this.compareAlreadyHandleDistributeByRg(params);
        this.compareNotHandleDistributeByRg(params);
    }
    async compareResponseByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareResponseByRg(params);
            let { data } = res;
            this.responseTimeList = this.formatCountObjToList(data.responseTime, 'dateTime');
        } catch (e) {
            console.log(e);
        }
    }
    async compareResolveByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareResolveByRg(params);
            let { data } = res;
            this.resolveTimeList = this.formatCountObjToList(data.resolveTime, 'dateTime');
        } catch (e) {
            console.log(e);
        }
    }
    async compareResolveResponseRateByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareResolveResponseRateByRg(params);
            let { data } = res;
            this.resolveRateTimeList = data.resolveRate;
            this.responseRateTimeList = data.responseRate;
        } catch (e) {
            console.log(e);
        }
    }
    get sumRateList () {
        return this.formatRateList(this[this.sumRateType + 'RateTimeList'], 'dateTime');
    }
    async compareAlreadyReactDistributeByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareAlreadyReactDistributeByRg(params);
            let { data } = res;
            this.alreadyReactList = this.formatCountObjToList(data.items, 'type');
        } catch (e) {
            console.log(e);
        }
    }
    async compareNotReactDistributeByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareNotReactDistributeByRg(params);
            let { data } = res;
            this.notReactList = this.formatCountObjToList(data.items, 'type');
        } catch (e) {
            console.log(e);
        }
    }
    async compareAlreadyHandleDistributeByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareAlreadyHandleDistributeByRg(params);
            let { data } = res;
            this.alreadyHandleList = this.formatCountObjToList(data.items, 'type');
        } catch (e) {
            console.log(e);
        }
    }
    async compareNotHandleDistributeByRg (params) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.compareNotHandleDistributeByRg(params);
            let { data } = res;
            this.notHandleList = this.formatCountObjToList(data.items, 'type');
        } catch (e) {
            console.log(e);
        }
    }
    handleResponseTime (chain: any) {
        chain.tooltip('type*count', (name, value) => {
            return {
                name: name,
                value: value + this.$getText('rg_statistic_time_compare_hour', '小时')
            };
        });
    }
    handleResolveTime (chain: any) {
        chain.tooltip('type*count', (name, value) => {
            return {
                name: name,
                value: value + this.$getText('rg_statistic_time_compare_hour', '小时')
            };
        });
    }
    handleSumRate (chain: any) {
        chain.tooltip('type*count', (name, value) => {
            return {
                name: name,
                value: value + '%'
            };
        });
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
    formatRateList (dataObj, type) {
        let resultArr = [];
        for (let time in dataObj) {
            let target = {};
            target[type] = time;
            dataObj[time].forEach(rgCount => {
                target[rgCount['rgId']] = parseInt(rgCount['value'], 10) * 100;
            });
            resultArr.push(target);
        }
        return resultArr;
    }
    created () {
        this.ids && this.refreshChart();
    }
}
</script>
