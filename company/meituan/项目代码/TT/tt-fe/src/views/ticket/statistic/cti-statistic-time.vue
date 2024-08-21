<template>
    <div class="cti-statistic-time">
        <!-- 工作时间响应时长 API: /statistic/work/hour/time/sum/by/cti -->
        <ticket-line-chart
            name="response-time-chart"
            :handle-chart="handleResponseTime"
            :days="diffDays"
            :alias-map="responseTimeMap"
            :info="workResponseTimeList">
            <span class="main-title" slot="title">按响应时长统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：分钟）</span>
        </ticket-line-chart>

        <!-- 工作时间解决时长 API: /statistic/work/hour/time/sum/by/cti -->
        <ticket-line-chart
            name="resolve-time-chart"
            :handle-chart="handleResolveTime"
            :days="diffDays"
            :alias-map="resolveTimeMap"
            :info="workResolveTimeList">
            <span class="main-title" slot="title">按解决时长统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：小时）</span>
        </ticket-line-chart>

        <!-- 响应合格率 API:  -->
        <ticket-line-chart
            name="response-success-rate-chart"
            :handle-chart="handleRateChart"
            :days="diffDays"
            :alias-map="responseSuccessRateMap"
            :info="responseSuccessRateList">
            <span class="main-title" slot="title">合格率统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：百分比）</span>
        </ticket-line-chart>

        <!-- 解决合格率 API:  -->
        <ticket-line-chart
            name="resolve-success-rate-chart"
            :handle-chart="handleRateChart"
            :days="diffDays"
            :alias-map="resolveSuccessRateMap"
            :info="resolveSuccessRateList">
            <span class="main-title" slot="title">合格率统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：百分比）</span>
        </ticket-line-chart>

        <!-- 工作时间 已响应且已超时 工单数统计 API:  -->
        <ticket-line-chart
            name="responded-and-timeout-counts-chart"
            :days="diffDays"
            :info="respondedAndTimeoutList"
            :alias-map="timeoutMap">
            <span class="main-title" slot="title">工作时间已响应已超时工单数量统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：个）</span>
        </ticket-line-chart>

        <!-- 工作时间 未响应且已超时 工单数统计 API: -->
        <ticket-line-chart
            name="unresponded-and-timeout-counts-chart"
            :days="diffDays"
            :info="unrespondedAndTimeoutList"
            :alias-map="timeoutMap">
            <span class="main-title" slot="title">工作时间未响应已超时工单数量统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：个）</span>
        </ticket-line-chart>
        <!-- 工作时间 已处理且已超时 工单数统计 API: -->
        <ticket-line-chart
            name="resolved-and-timeout-counts-chart"
            :days="diffDays"
            :info="resolvedAndTimeoutList"
            :alias-map="timeoutMap">
            <span class="main-title" slot="title">工作时间已处理超时工单数量统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：个）</span>
        </ticket-line-chart>
        <!-- 工作时间 未处理且已超时 工单数统计 API: -->
        <ticket-line-chart
            name="unresolved-and-timeout-counts-chart"
            :days="diffDays"
            :info="unresolvedAndTimeoutList"
            :alias-map="timeoutMap">
            <span class="main-title" slot="title">工作时间未处理已超时工单数量统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：个）</span>
        </ticket-line-chart>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import { Getter } from 'vuex-class';
import TicketLineChart from './components/ticket-line-chart.vue';
import TicketIntervalChart from './components/ticket-interval-chart.vue';
import { ResolveTimeMap, ResponseTimeMap, ResponseSuccessRateMap, ResolveSuccessRateMap, TimeoutMap } from '@/config/map.conf';
import { DAY_TIME_STAMP } from '@/config/const.conf';
import dayjs from 'dayjs';

/**
 * cti时长统计
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
export default class CtiStatisticTime extends Vue {
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
    resolveTimeMap: CommonTypes.mapObject = ResolveTimeMap;
    responseTimeMap: CommonTypes.mapObject = ResponseTimeMap;

    responseSuccessRateMap: CommonTypes.mapObject = ResponseSuccessRateMap;
    resolveSuccessRateMap: CommonTypes.mapObject = ResolveSuccessRateMap;
    timeoutMap = TimeoutMap;

    sumRateList: CommonTypes.SumRateItem[] = [];

    responseSuccessRateList: CommonTypes.ResponseSuccessRateItem[] = [];
    resolveSuccessRateList: CommonTypes.ResolveSuccessRateItem[] = [];

    // 工作时间解决时长
    workResolveTimeList: CommonTypes.SumTimeItem[] = [];
    // 工作时间响应时长
    workResponseTimeList: CommonTypes.SumTimeItem[] = [];

    // 已超时并且已解决/未解决/已响应/未响应
    respondedAndTimeoutList = [];
    unrespondedAndTimeoutList = [];
    resolvedAndTimeoutList = [];
    unresolvedAndTimeoutList = [];

    @Getter misX;

    @Watch('period')
    onPeriodChanged (val: string[]) {
        this.refreshChart();
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_fp4nk5qy_mc', { custom: { mis: this.misX } });
    }
    // 获取所选时长间隔
    get diffDays () {
        return dayjs(this.period[1]).diff(dayjs(this.period[0]), 'day') + 1;
    }
    refreshChart () {
        this.getWorkResolveTimeByCti();
        this.getWorkResponseTimeByCti();
        this.getSumRateByCti();

        // 已超时并且已解决/未解决/已响应/未响应 4种情况的工单数统计
        this.getRespondedAndTimeoutList();
        this.getUnrespondedAndTimeoutList();
        this.getResolvedAndTimeoutList();
        this.getUnresolvedAndTimeoutList();
    }
    // 查询工作时间解决时长统计
    async getWorkResolveTimeByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getWorkTimeByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                type: 'RESOLVE',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const items = res.data && res.data.items;
            if (items) {
                this.workResolveTimeList = items.map((item) => {
                    return {
                        dateTime: item.dateTime,
                        workResolve: item.time
                    };
                });
            } else {
                this.resolveTimeList = [];
            }
        } catch (e) {
            this.resolveTimeList = [];
            console.log(e);
        }
    }
    // 查询工作时间响应时长
    async getWorkResponseTimeByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getWorkTimeByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                type: 'RESPONSE',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const items = res.data && res.data.items;
            if (items) {
                this.workResponseTimeList = items.map((item: CommonTypes.SumTimeItem) => {
                    return {
                        dateTime: item.dateTime,
                        workResponse: item.time
                    };
                });
            }
        } catch (e) {
            this.workResponseTimeList = [];
            console.log(e);
        }
    }
    async getSumRateByCti () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getSumRateByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const resolveSuccessRateList = [];
            const responseSuccessRateList = [];
            for (let item of items) {
                resolveSuccessRateList.push({
                    dateTime: item.dateTime,
                    resolveSuccessRate: item.resolveSuccessRate * 100
                });
                responseSuccessRateList.push({
                    dateTime: item.dateTime,
                    responseSuccessRate: item.responseSuccessRate * 100
                });
            }

            this.responseSuccessRateList = responseSuccessRateList;
            this.resolveSuccessRateList = resolveSuccessRateList;
        } catch (e) {
            this.responseSuccessRateList = [];
            this.resolveSuccessRateList = [];
            console.log(e);
        }
    }

    // 已响应/未响应/已处理/未处理 四种状态的工单数统计
    async getRespondedAndTimeoutList () {
        try {
            const res = await api.ticketApi.getRespondedAndTimeoutListByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const items: CommonTypes.TimeoutCountItem[] = res.data && res.data.items;
            this.respondedAndTimeoutList = items;
        } catch (e) {
            this.respondedAndTimeoutList = [];
            console.log(e);
        }
    }
    async getUnrespondedAndTimeoutList () {
        try {
            const res = await api.ticketApi.getUnrespondedAndTimeoutListByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const items: CommonTypes.TimeoutCountItem[] = res.data && res.data.items;
            this.unrespondedAndTimeoutList = items;
        } catch (e) {
            this.unrespondedAndTimeoutList = [];
            console.log(e);
        }
    }
    async getResolvedAndTimeoutList () {
        try {
            const res = await api.ticketApi.getResolvedAndTimeoutListByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const items: CommonTypes.TimeoutCountItem[] = res.data && res.data.items;
            this.resolvedAndTimeoutList = items;
        } catch (e) {
            this.resolvedAndTimeoutList = [];
            console.log(e);
        }
    }
    async getUnresolvedAndTimeoutList () {
        try {
            const res = await api.ticketApi.getUnresolvedAndTimeoutListByCti({
                categoryId: this.categoryId || '',
                typeId: this.typeId || '',
                itemId: this.itemId || '',
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const items: CommonTypes.TimeoutCountItem[] = res.data && res.data.items;
            this.unresolvedAndTimeoutList = items;
        } catch (e) {
            this.unresolvedAndTimeoutList = [];
            console.log(e);
        }
    }

    formatJsonToArr (obj) {
        let arr = [];
        for (let key in obj) {
            arr.push({
                day: key,
                count: obj[key]
            });
        }
        return arr;
    }
    setSumRate (list: CommonTypes.SumRateItem[]) {
        return list.map((item: CommonTypes.SumRateItem) => {
            let sumRate: any = {};
            for (let key in item) {
                key !== 'dateTime' ? sumRate[key] = parseInt((item[key] * 100).toFixed(), 10) : sumRate[key] = item[key];
            }
            return sumRate;
        });
    }
    handleResponseTime (chain: any) {
        chain.tooltip('type*count', (name, value) => {
            return {
                name: name,
                value: value + '小时'
            };
        });
    }
    handleResolveTime (chain: any) {
        chain.tooltip('type*count', (name, value) => {
            return {
                name: name,
                value: value + '小时'
            };
        });
    }
    handleRateChart (chain: any) {
        chain.tooltip('type*count', (name, value) => {
            return {
                name: name,
                value: value + '%'
            };
        });
    }
    created () {
        this.refreshChart();
    }
}
</script>
