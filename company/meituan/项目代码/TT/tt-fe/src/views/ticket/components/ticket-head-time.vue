<template>
    <div class="ticket-time-container" v-if="!nonWorking">
        <!-- <div class="time-item"> -->
        {{ $getText('ticket_time_response_title', '响应') }}：<span :class="'time-circle is-' + timeData.responseColor">{{ isTodoState ? timeData.endResponseOkTime : (timeData.realResponse || $getText('ticket_time_no_data', '暂无')) }}</span>
        <span class="limited-time">({{ $getText('ticket_time_limit', '限') + timeData.slaResponse }})</span>
        <!-- </div> -->
        <!-- <div class="time-item"  v-if="!isTodoState"> -->
        <span v-if="!isTodoState" style="margin-left: 12px;">{{ $getText('ticket_time_resolve_title', '解决') }}：<span :class="'time-circle is-' + timeData.resolveColor">{{ showResolveExpiration ? timeData.endResolveOkTime : (timeData.realResolve || $getText('ticket_time_no_data', '暂无')) }}</span></span>
        <span  v-if="!isTodoState" class="limited-time">({{ $getText('ticket_time_limit', '限') + timeData.slaResolve }})</span>
        <!-- </div> -->
    </div>
    <div class="ticket-time-container" v-else>
        {{ $getText('ticket_time_non_working', '当前为非工作时间，请您耐心等待') }}
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Mutation, Getter } from 'vuex-class';
import dayjsWithTimeZone from '@/utils/tools/dayjs';

import * as api from '@/api';
/**
 * Ticket响应时间
 *
 * @author liyuyao
 * @date 04/20/2020
 */
@Component
export default class TicketTime extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Mutation setTimeData;
    @Getter nonWorking;
    @Getter language;

    timeData: any = {};
    ticketId: number = 0;

    @Watch('info.id', { immediate: true })
    getTicketId (id) {
        this.ticketId = id;
        this.ticketId && this.getTicketTime();
    }

    @Watch('language', { immediate: true })
    handleLanguageChange () {
        this.ticketId && this.getTicketTime();
    }

    // 获取响应时长
    async getTicketTime () {
        if (!+this.ticketId) return;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketTime(this.ticketId);
            let { code, data } = res;
            if (code === 200 && data) {
                this.timeData = this.handleTimeData(data);
                this.setTimeData(data);
                // this.setTimeData(this.timeData);
            }
        } catch (e) {
            console.log(e);
        }
    }
    handleExpectClose (data) {
        let expectClose = '';
        // 如果解决不是无限时的
        if (data.day !== 9999) {
            let minutes = (data.day * 60 * 24 + data.hour * 60 + data.minute) * 60000;
            expectClose = dayjsWithTimeZone(Date.now() + minutes).format('YYYY-MM-DD HH:mm:ss');
        }
        return expectClose;
    }
    handleTimeData (data) {
        let result = {
            slaResolve: this.timeStringResult(data.slaResolve),
            slaResponse: this.timeStringResult(data.slaResponse),
            responseColor: data.responseIsOK ? 'green' : 'red',
            resolveColor: data.resolveIsOK ? 'green' : 'red',
            isEverPaused: data.isEverPaused,
            isEverReopened: data.isEverReopened,
            endResponseOkTime: this.endTimeResult(data.responseExpiration, true),
            endResolveOkTime: this.endTimeResult(data.resolveExpiration),
            resolveIsOK: data.resolveIsOK
        };
        if (data.realResponse) {
            result.realResponse = this.timeStringResult(data.realResponse);
        }
        if (data.realResolve) {
            result.realResolve = this.timeStringResult(data.realResolve);
        }
        if (data.realReopenResolve) {
            result.realReopenResolve = this.timeStringResult(data.realReopenResolve);
        }
        if (data.realPureResolve) {
            result.realPureResolve = this.timeStringResult(data.realPureResolve);
        }
        return result;
    }
    endTimeResult (timestamp, isResponse: boolean = false) {
        return this.$getText(isResponse ? 'ticket_time_response' : 'ticket_time_resolve', { time: dayjsWithTimeZone(timestamp).format('YYYY-MM-DD HH:mm') });
    }
    timeStringResult (data) {
        return (data.day ? data.day + this.$getText('ticket_time_day', '天') : '') + (data.hour ? data.hour + this.$getText('ticket_time_hour', '小时') : '') + (data.minute ? data.minute + this.$getText('ticket_time_minute', '分钟') : '');
    }
    get isTodoState () {
        return this.info.state && this.info.state.value === '未处理';
    }
    get showResolveExpiration () {
        return !this.timeData.resolveIsOK;
    }
}
</script>

<style lang="scss">
.ticket-time-container {
    max-width: 446px;
    min-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: PingFangSC-Medium;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.84);
    line-height: 22px;
    display: inline-block;
    vertical-align: middle;
    .time-item {
        display: inline-block;
        margin-right: 16px;
    }
    .limited-time {
        color: rgba(0, 0, 0, 0.6);
    }
    .time-circle {
        display: inline-block;
        &.is-red {
            color: #f5483b;
        }
    }
    .icon-time-o2 {
        color: rgba(0, 0, 0, 0.36);
    }
}
</style>