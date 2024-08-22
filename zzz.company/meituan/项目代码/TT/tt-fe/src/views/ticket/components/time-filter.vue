<template>
    <div class="time-filter">
        <mtd-date-picker 
            type="daterange"
            format="yyyy-MM-dd"
            placement="bottom-end"
            class="filter-time-picker"
            :options="options"
            v-model="currentPeriod"
            @input="dateChange" />    
        <mtd-tooltip :content="$getText('time_filter_backward', { day: diffDays })" placement="top">
            <mtd-button
                @click="handleBackClick"
                class="time-pager-btn"
                icon="mtdicon mtdicon-left-thick" />
        </mtd-tooltip>
        <mtd-tooltip :content="$getText('time_filter_forward', { day: diffDays })" placement="top">
            <mtd-button
                @click="handleForewardClick"
                :disabled="disabledAdd"
                class="time-pager-btn"
                icon="mtdicon mtdicon-right-thick" />
        </mtd-tooltip>
        <mtd-button 
            :disabled="disabledRecent" 
            @click="handleRecentClick" 
            class="time-pager-label">{{ $getText('time_filter_recent', '最近') }}</mtd-button>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { CHART_LX_MAP } from '@/config/lx_map.conf';
import dayjs from 'dayjs';
import { Getter } from 'vuex-class';

const TODAY: number = dayjs(dayjs().format('YYYY-MM-DD')).valueOf();
const YESTERDAY: number = dayjs(dayjs().add(-1, 'day').format('YYYY-MM-DD')).valueOf();
/**
 * 时间筛选器
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component
export default class TimeFilter extends Vue {
    @Getter misX;

    @Prop({ default: () => {
        return ['', ''];
    } })
    period: string[];
    @Prop({ default: '' })
    by: string;

    currentPeriod: string[] = this.period;
    // 是否禁用所选时间段整体前移按钮
    disabledAdd: Boolean = true;
    // 是否禁用最近时间段按钮
    disabledRecent: Boolean = true;
    options: any = {
        disabledDate: (date: any) => {
            // 最多可选到昨天的日期，否则置灰
            return date && date.getTime() > this.baseDay;
        }
    };

    get baseDay () {
        return ['rg', 'cti'].includes(this.by) ? TODAY : YESTERDAY;
    }

    @Watch('currentPeriod')
    onPeriodChanged (val: string[]) {
        if (dayjs(val[1]).valueOf() >= this.baseDay) {
            this.disabledAdd = true;
            this.disabledRecent = true;
        } else {
            this.disabledAdd = false;
            this.disabledRecent = false;
        }
        this.$emit('update:period', val);
    }
    get diffDays () {
        return dayjs(this.currentPeriod[1]).diff(dayjs(this.currentPeriod[0]), 'days') + 1;
    }
    // 点击时间段整体前移按钮
    handleBackClick () {
        this.currentPeriod = [
            dayjs(this.currentPeriod[0]).subtract(this.diffDays, 'days').format('YYYY-MM-DD'),
            dayjs(this.currentPeriod[1]).subtract(this.diffDays, 'days').format('YYYY-MM-DD')
        ];
        this.$emit('update:period', this.currentPeriod);
    }
    // 点击时间段整体后移按钮
    handleForewardClick () {
        let afterDay: any = dayjs(this.currentPeriod[1]).add(this.diffDays, 'days');
        let beforeDay: any;
        if (afterDay.valueOf() > this.baseDay) {
            afterDay = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
            beforeDay = dayjs(afterDay).subtract(this.diffDays - 1, 'days').format('YYYY-MM-DD');
        } else {
            afterDay = afterDay.format('YYYY-MM-DD');
            beforeDay = dayjs(this.currentPeriod[0]).add(this.diffDays, 'days').format('YYYY-MM-DD');
        }
        this.currentPeriod = [
            beforeDay,
            afterDay
        ];
        this.$emit('update:period', this.currentPeriod);
    }
    // 点击最近时间段按钮
    handleRecentClick () {
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_jqk6hejz_mc', { custom: { mis: this.misX, by: this.by } });
        this.currentPeriod = [
            dayjs().subtract(this.diffDays, 'days').format('YYYY-MM-DD'),
            dayjs().format('YYYY-MM-DD')
        ];
    }
    dateChange () {
        window.LXAnalytics && window.LXAnalytics('moduleClick', CHART_LX_MAP['rg_click_date'], { custom: { mis: this.misX } });
    }
}
</script>

<style lang="scss">
.time-filter {
    display: inline-block;
    float: right;
    .filter-time-picker {
        min-width: 230px;
        vertical-align: bottom;
    }
    .time-pager-btn {
        min-width: 34px;
        padding: 0;
        .mtd-btn-before {
            margin-right: 0;
        }
    }
    .time-pager-label {
        min-width: 46px;
        padding: 0 4px;
    }
}
</style>