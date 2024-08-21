<template>
    <div class="rg-statistic-count">

        <!-- 工作时间响应时长 API: /statistic/work/hour/time/sum/by/rg -->
        <ticket-line-chart
            name="response-time-chart"
            :handle-chart="handleResponseTime"
            :days="diffDays"
            :alias-map="responseTimeMap"
            :info="responseTimeList">
            <span class="main-title" slot="title">按工作时间响应时长统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：分钟）</span>
        </ticket-line-chart>

        <!-- 工作时间解决时长 API: getResponseWorkTimeByRg -->
        <ticket-line-chart
            name="resolve-time-chart"
            :handle-chart="handleResolveTime"
            :days="diffDays"
            :alias-map="resolveTimeMap"
            :info="workResolveTimeList">
            <span class="main-title" slot="title">按工作时间解决时长统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：小时）</span>
        </ticket-line-chart>

        <!-- 响应时长合格率 API: getSumRateByRg -->
        <ticket-line-chart
            name="response-success-rate-chart"
            :handle-chart="handleRateChart"
            :days="diffDays"
            :alias-map="responseSuccessRateMap"
            :info="responseSuccessRateList">
            <span class="main-title" slot="title">工作时间响应合格率统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：百分比）</span>
        </ticket-line-chart>

        <!-- 解决时长合格率 API: getSumRateByRg -->
        <ticket-line-chart
            name="resolve-success-rate-chart"
            :handle-chart="handleRateChart"
            :days="diffDays"
            :alias-map="resolveSuccessRateMap"
            :info="resolveSuccessRateList">
            <span class="main-title" slot="title">工作时间解决合格率统计·{{ diffDays }}天范围</span>
            <span class="sub-title" slot="subTitle">（单位：百分比）</span>
        </ticket-line-chart>

        <div v-if="!misId">
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
export default class RgStatisticTime extends Vue {
    @Prop({ default: 0 })
    id: number;
    @Prop({ default: '' })
    misId: string;

    @Prop({ default: () => {
        return ['', ''];
    } })
    period: string[];
    resolveTimeMap: CommonTypes.mapObject = ResolveTimeMap;
    responseTimeMap: CommonTypes.mapObject = ResponseTimeMap;

    responseSuccessRateMap: CommonTypes.mapObject = ResponseSuccessRateMap;
    resolveSuccessRateMap: CommonTypes.mapObject = ResolveSuccessRateMap;
    timeoutMap = TimeoutMap;
    responseSuccessRateList: CommonTypes.ResponseSuccessRateItem[] = [];
    resolveSuccessRateList: CommonTypes.ResolveSuccessRateItem[] = [];
    workResolveTimeList: CommonTypes.SumTimeItem[] = [];
    responseTimeList: CommonTypes.SumTimeItem[] = [];

    respondedAndTimeoutList = [];
    unrespondedAndTimeoutList = [];
    resolvedAndTimeoutList = [];
    unresolvedAndTimeoutList = [];

    alreadyReactList: CommonTypes.ReactTimeItem[] = [];
    notReactList: CommonTypes.ReactTimeItem[] = [];
    alreadyHandleList: CommonTypes.ReactTimeItem[] = [];
    notHandleList: CommonTypes.ReactTimeItem[] = [];

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
    // 获取所选时长间隔
    get diffDays () {
        return dayjs(this.period[1]).diff(dayjs(this.period[0]), 'day') + 1;
    }
    // 更新图表数据
    refreshChart () {
        this.getResolveWorkTimeByRg();
        this.getResponseWorkTimeByRg();
        this.getSumRateByRg();

        // 已超时并且已解决/未解决/已响应/未响应 4种情况的工单数统计
        this.getRespondedAndTimeoutList();
        this.getUnrespondedAndTimeoutList();
        this.getResolvedAndTimeoutList();
        this.getUnresolvedAndTimeoutList();

        this.getAlreadyReactSpendByRg();
        this.getNotReactSpendByRg();
        this.getAlreadyHandleSpendByRg();
        this.getNotHandleSpendByRg();
    }
    async getResolveWorkTimeByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getWorkTimeByRg({
                rgId: this.id,
                type: 'RESOLVE',
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            if (res.data && res.data.items) {
                this.workResolveTimeList = res.data.items.map((item) => {
                    return {
                        workResolve: item.time,
                        dateTime: item.dateTime
                    };
                });
            }
        } catch (e) {
            this.workResolveTimeList = [];
            console.log(e);
        }
    }
    async getResponseWorkTimeByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getWorkTimeByRg({
                rgId: this.id,
                type: 'RESPONSE',
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            if (res.data && res.data.items) {
                this.responseTimeList = res.data.items.map((item: CommonTypes.SumTimeItem) => {
                    return {
                        dateTime: item.dateTime,
                        workResponse: item.time
                    };
                });
            }
        } catch (e) {
            this.responseTimeList = [];
            console.log(e);
        }
    }
    async getSumRateByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getSumRateByRg({
                rgId: this.id,
                misId: this.misId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            const items: CommonTypes.SumRateItem[] = res.data.items;
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
            this.resolveSuccessRateList = resolveSuccessRateList;
            this.responseSuccessRateList = responseSuccessRateList;
        } catch (e) {
            this.resolveSuccessRateList = [];
            this.responseSuccessRateList = [];
            console.log(e);
        }
    }

    // 已响应/未响应/已处理/未处理 四种状态的工单数统计
    async getRespondedAndTimeoutList () {
        try {
            const res = await api.ticketApi.getRespondedAndTimeoutListByRg({
                rgId: this.id,
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
            const res = await api.ticketApi.getUnrespondedAndTimeoutListByRg({
                rgId: this.id,
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
            const res = await api.ticketApi.getResolvedAndTimeoutListByRg({
                rgId: this.id,
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
            const res = await api.ticketApi.getUnresolvedAndTimeoutListByRg({
                rgId: this.id,
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

    async getAlreadyReactSpendByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getAlreadyReactSpendByRg({
                rgId: this.id,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.alreadyReactList = this.formatJsonToArr(res.data);
        } catch (e) {
            this.alreadyReactList = [];
            console.log(e);
        }
    }
    async getNotReactSpendByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getNotReactSpendByRg({
                rgId: this.id,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.notReactList = this.formatJsonToArr(res.data);
        } catch (e) {
            this.notReactList = [];
            console.log(e);
        }
    }
    async getAlreadyHandleSpendByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getAlreadyHandleSpendByRg({
                rgId: this.id,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.alreadyHandleList = this.formatJsonToArr(res.data);
        } catch (e) {
            this.alreadyHandleList = [];
            console.log(e);
        }
    }
    async getNotHandleSpendByRg () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getNotHandleSpendByRg({
                rgId: this.id,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });
            this.notHandleList = this.formatJsonToArr(res.data);
        } catch (e) {
            this.notHandleList = [];
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
        this.id && this.refreshChart();
    }
}
</script>
