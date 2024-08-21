<template>
    <div class="personal-oncall-wrapper">
        <div class="header">
            <mtd-icon-button
                size="small"
                type="secondary"
                :disabled="disablePreviousBtn"
                @click="onDataChanged('previous')"
                icon="mtdicon mtdicon-left" />
            <span class="month-date">{{ this.filterDateMonth }}</span><span class="month-text">{{ $getText('personal_oncall_card_month_text', '月') }}</span>
            <mtd-icon-button
                size="small"
                type="secondary"
                :disabled="disableNextBtn"
                @click="onDataChanged('next')"
                icon="mtdicon mtdicon-right" />
            <mtd-button class="tt-pure-btn back-to-today" @click="backToToday">{{ $getText('personal_oncall_card_back_to_today', '回到今天') }}</mtd-button>
            <mtd-select
                v-model="selectedRgList"
                multiple
                class="rg-select custom-select-no-tag"
                @change="onRgChanged">
                <mtd-option
                    v-for="item in rgList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id" />
            </mtd-select>
        </div>
        <mtd-table
            :data="tableData"
            bordered
            :loading="tableLoading"
            @cell-click="onCellClick"
            :class="['personal-oncall-table', {'four-weeks': weekNumber === 4}, {'six-weeks': weekNumber === 6}]"
            header-cell-class="oncall-date-header"
            :height="401"
            :cell-class="cellClass">
            <mtd-table-column
                :prop="item.value"
                :key="index"
                align="center"
                min-width="44px"
                v-for="(item, index) in weekDayMap"
                :label="$getText(item.label)">
                <template slot-scope="scope" v-if="!!scope.row[item.value]">
                    <shift-cell
                        @close="onCellClose"
                        :class="{'selected': activeDate === scope.row[item.value].timestamp}"
                        :timestamp="scope.row[item.value].timestamp"
                        :current-month="filterDateMonth"
                        :end-date="endDate"
                        :data="scope.row[item.value]" />
                </template>
            </mtd-table-column>
        </mtd-table>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import * as api from '@/api';
import { OncallWeekdayList } from '@/config/map.conf';
import ShiftCell from './shift-cell.vue';

const TODAY: Date = new Date(new Date().setHours(0, 0, 0, 0));
// const TODAY: Date = new Date(2023, 6, 0);
@Component({
    components: {
        ShiftCell
    }
})
export default class PersonalOncallCard extends Vue {
    @Getter misX;
    @Prop() rgList: any[];
    filterDate: Date = TODAY;
    disablePreviousBtn: boolean = false;
    disableNextBtn: boolean = false;
    tableLoading: boolean = false;
    selectedRgList: number[] = [];
    tableData: CommonTypes.mapObject[] = [];
    activeDate: string = '';
    weekDayMap: CommonTypes.mapObject[] = OncallWeekdayList;
    tableShiftList: CommonTypes.mapObject = {};
    dateInfoList: any[] = [];

    @Watch('filterDate', { immediate: true })
    onFilterDateChanged () {
        this.updateBtnDisableState();
    }
    @Watch('rgList', { immediate: true })
    onRgListChanged () {
        if (this.rgList) {
            this.selectedRgList = this.rgList.map(item => item.id);
        }
    }
    @Watch('misX', { immediate: true })
    async mountUserMis () {
        if (this.misX) {
            this.updateDateTable();
        }
    }
    async updateDateTable () {
        this.tableLoading = true;
        await this.getCalendar();
        this.getTableData();
    }
    onDataChanged (type: 'previous' | 'next') {
        this.filterDate = this.getPreviousOrNextMonth(this.filterDate, type);
        this.updateDateTable();
    }
    onRgChanged () {
        this.updateDateTable();
    }
    onCellClose () {
        this.activeDate = '';
    }
    backToToday () {
        this.filterDate = TODAY;
        this.updateDateTable();
    }
    onCellClick (scope: any) {
        // 过去时间不可点击、无班次格子不可点击
        const isDisableDateCell = scope.cell.className.includes('table-cell-disable');
        const noShiftDateCell = !scope.row[scope.column.prop].rgOncallInfo?.length;
        if (isDisableDateCell || noShiftDateCell) {
            return;
        }
        const prefixClass = 'cell-date-class-';
        scope.cell.classList.forEach(item => {
            if (item.includes(prefixClass)) {
                this.activeDate = item.slice(prefixClass.length);
            }
        });
    }
    cellClass (scope) {
        const timestamp = scope.row[scope.columnIndex].timestamp;
        const isWeekend = ['6', '0'].includes(scope.column.prop);
        // 超过endDate不可点击
        const isDisableDate = Number(timestamp) < TODAY.getTime();
        return `table-cell-date cell-date-class-${timestamp}${isWeekend ? ' table-cell-weekend' : ''} ${isDisableDate ? ' table-cell-disable' : ''}`;
    }
    // 计算左右按钮是否可点击，仅支持查看前一个月、当前月、后一个月的数据
    updateBtnDisableState () {
        // 起始时间是filterDate的上一个月
        const startPreviousDate = this.getPreviousOrNextMonth(this.startDate, 'previous');
        const startMonth = startPreviousDate.getMonth();
        // 截止时间是下个月底，需要计算endDate的下个月的年、月
        const endNextDate = this.getPreviousOrNextMonth(this.endDate, 'next');
        const endMonth = endNextDate.getMonth();

        // 当前日期前一个月、后一个月的日期
        const nextDate = this.getPreviousOrNextMonth(this.filterDate, 'next');
        const nextMonth = nextDate.getMonth();

        const previousDate = this.getPreviousOrNextMonth(this.filterDate, 'previous');
        const previousMonth = previousDate.getMonth();

        this.disableNextBtn = endMonth === nextMonth;
        this.disablePreviousBtn = startMonth === previousMonth;
    }
    async getCalendar () {
        try {
            const res = await api.oncallApi.getOncallCalender({
                rgId: [null],
                timestamp: this.filterDate.getTime(),
                timeType: 'MONTH',
                needHolidayInfo: true
            });
            const { data, code } = res;
            if (code === 200 && data) {
                this.dateInfoList = [].concat(data.items || []);
            }
        } catch (error) {
            this.tableLoading = false;
            console.log(error);
        }
    }
    async getOncallRgList () {
        const res = await api.oncallApi.getOncallRgList(this.misX);
        const { data, code } = res;
        if (code === 200 && data) {
            this.rgList = data || [];
        }
    }
    async getTableData () {
        try {
            const res = await api.oncallApi.getOncallTable({
                rgId: this.selectedRgList,
                timestamp: this.filterDate.getTime(),
                timeType: 'MONTH',
                needRgDetail: true,
                mis: this.misX
            });
            const { data, code } = res;
            if (code === 200 && data) {
                this.tableLoading = false;
                this.tableShiftList = data.shift || [];
                this.formatTableData(data.oncall[this.misX] || {});
            }
        } catch (error) {
            console.log('error:', error);
            this.tableLoading = false;
        }
    }
    formatOncallType (data) {
        let dateType = null;
        let formatShift = [];
        const { wholeDay, shift } = data;
        if (shift && shift.length && shift[0].shiftId) {
            formatShift = shift.map(shift => {
                shift.color = this.tableShiftList[shift.shiftId].color;
                shift.abbreviation = this.tableShiftList[shift.shiftId].abbreviation;
                shift.name = this.tableShiftList[shift.shiftId].name;
                shift.displayTime = this.tableShiftList[shift.shiftId].displayTime;
                shift.rgId = data.rgId;
                shift.rgName = data.rgName;
                return shift;
            });
        }
        if (wholeDay.wholeDayOncall) {
            // 将全天作为一个普通的班次
            formatShift.push({
                name: '值班',
                offline: wholeDay.offline,
                abbreviation: '值班',
                color: 'ALL',
                displayTime: '全天',
                rgId: data.rgId,
                rgName: data.rgName
            });
        }
        return { dateType, formatShift };
    }
    // 获取到所有表格数据后，进行处理
    formatTableData (data) {
        // data的key是时间戳，value是按照rg维度聚合的值班信息
        this.tableData = [];
        Object.keys(data).forEach(timestamp => {
            const rgOncallInfo = [];
            const targetDate = this.dateInfoList.find(item => {
                return item.timestamp.toString() === timestamp;
            });
            if (targetDate) {
                const { day, month, dayOfWeek, officialHoliday, today, weekOfYear } = targetDate;
                Object.keys(data[timestamp]).forEach(rg => {
                    // 先把班次、状态信息进行处理
                    let { dateType, formatShift } = this.formatOncallType(data[timestamp][rg]);
                    data[timestamp][rg] = {
                        ...data[timestamp][rg],
                        timestamp: timestamp,
                        shiftList: formatShift,
                        type: dateType
                    };
                    if (formatShift.length) rgOncallInfo.push(data[timestamp][rg]);
                });
                // 因为历史原因，后端返回的dayOfWeek，1代表周一、7代表周日，和国际惯例不同
                // 这里为了之后的一系列计算更简单，把周日改回0
                data[timestamp] = Object.assign({}, {
                    day,
                    month,
                    dayOfWeek: dayOfWeek === 7 ? 0 : dayOfWeek,
                    officialHoliday,
                    today,
                    weekOfYear,
                    rgOncallInfo,
                    timestamp
                });
            }
        });
        // 按周排成多行
        this.tableData = this.groupByWeek(data);
        // 补全tableData中第一行和最后一行的数据
        this.tableData[0] = this.fillWeek(this.tableData[0]);
        this.tableData[this.tableData.length - 1] = this.fillWeek(this.tableData[this.tableData.length - 1]);
    }
    fillWeek (weekObj) {
        const filledWeek = {};
        const weekDays = Object.keys(weekObj).map(Number);

        if (weekDays.length > 0) {
            const firstDayTimestamp = Number(weekObj[Math.min(...weekDays)].timestamp);
            const startOfWeek = firstDayTimestamp - (Math.min(...weekDays) - 1) * 24 * 60 * 60 * 1000;

            for (let i = 0; i <= 6; i++) {
                if (weekObj.hasOwnProperty(i)) {
                    filledWeek[i] = weekObj[i];
                } else {
                    const timestamp = startOfWeek + (i - 1) * 24 * 60 * 60 * 1000;
                    filledWeek[i] = {
                        timestamp: timestamp,
                        day: new Date(timestamp).getDate(),
                        month: new Date(timestamp).getMonth() + 1
                    };
                }
            }
        }

        return filledWeek;
    }
    groupByWeek (data) {
        const result = [];
        let currentWeekData = {};
        let currentWeekNumber = null;

        // 对象的 key 按照时间戳排序
        const sortedKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
        sortedKeys.forEach((timestamp) => {
            const { dayOfWeek, weekOfYear } = data[timestamp];
            if (currentWeekNumber === null) {
                currentWeekNumber = weekOfYear;
            }
            if (weekOfYear === currentWeekNumber) {
                currentWeekData[dayOfWeek] = data[timestamp];
            } else {
                result.push(currentWeekData);
                currentWeekData = {};
                currentWeekData[dayOfWeek] = data[timestamp];
                currentWeekNumber = weekOfYear;
            }
        });

        // 添加最后一周的数据
        if (currentWeekData[0]) {
            result.push(currentWeekData);
        }
        return result;
    }
    // 查询某个日期前一月或者后一月的Date
    getPreviousOrNextMonth (date: Date, type: 'previous' | 'next') {
        const year = date.getFullYear();
        const month = date.getMonth(); // 真实月份-1
        const day = date.getDate();
        let finalYear = year;
        let finalMonth = type === 'previous' ? month - 1 : month + 1;
        let finalDay = day;
        if (finalMonth === -1) {
            // 一月的前一个月
            finalYear = year - 1;
            finalMonth = 11;
        } else if (finalMonth === 12) {
            // 十二月的后一个月
            finalYear = year + 1;
            finalMonth = 0;
        }
        // 获取下个月天数
        const newDays = new Date(finalYear, finalMonth, 1).getDate();
        if (day > newDays) {
            finalDay = newDays;
        }
        return new Date(finalYear, finalMonth, finalDay);
    }
    get endDate () {
        // 可查看的最晚时间为下个月的最后一天
        const endDate = this.getPreviousOrNextMonth(TODAY, 'next');
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();
        return new Date(endYear, endMonth + 1, 0);
    }
    get startDate () {
        // 可查看的最早时间为上个月的第一天
        const startDate = this.getPreviousOrNextMonth(TODAY, 'previous');
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        return new Date(startYear, startMonth + 1, 0);
    }
    get filterDateMonth () {
        return this.filterDate.getMonth() + 1;
    }
    get weekNumber () {
        return this.tableData.length;
    }
}
</script>

<style lang="scss" scoped>
.personal-oncall-wrapper {
    .header {
        height: 51px;
        padding: 0 12px 0 18px;
        display: flex;
        align-items: center;
        position: relative;
        .mtd-icon-btn-small {
            width: 20px;
            height: 20px;
            border-radius: 10px;
            border: 1px solid #dedede;
            padding: 0;
            /deep/ .mtdicon {
                font-size: 10px;
                -webkit-transform: scale(0.84);
                line-height: 18px;
            }
        }
        .month-date {
            font-weight: 600;
            font-size: 24px;
            margin-left: 12px;
            display: inline-block;
        }
        .month-text {
            font-weight: 600;
            display: inline-block;
            margin: 0 12px 0 6px;
        }
        .back-to-today {
            margin-left: 12px;
        }
        .rg-select {
            width: 180px;
            position: absolute;
            right: 12px;
            /deep/.mtd-select-tags {
                padding-right: 18px;
                .mtd-select-choice {
                    max-width: 85px;
                }
                .mtd-select-tags-ul {
                    max-height: 32px;
                    overflow-y: scroll;
                }
                .mtd-select-search-line {
                    width: 10px;
                }
                .mtd-input-suffix-inner {
                    .mtdicon {
                        line-height: 32px;
                        vertical-align: middle;
                    }
                }
            }
        }
    }
    .personal-oncall-table {
        border-radius: 0 0 4px 4px;
        /deep/.mtd-table-header-wrapper {
            thead {
                tr {
                    th {
                        height: 40px;
                        background: #f7f9fa;
                        color: rgba(0, 0, 0, 0.84);
                        &:nth-last-of-type(2) {
                            border-right: none;
                        }
                    }
                }
            }
        }
        /deep/.mtd-table-empty-block {
            height: 100%;
        }
        /deep/.mtd-table-body {
            tbody {
                tr {
                    display: flex;
                    height: calc(360px / 5);
                    &:nth-last-of-type(1) {
                        td {
                            border-bottom: none;
                        }
                    }
                    &:hover {
                        td {
                            background-color: #fff !important;
                        }
                    }
                }
                td {
                    cursor: default;
                    &:nth-last-of-type(1) {
                        border-right: none;
                    }
                    &.table-cell-date {
                        padding: 0;
                        text-align: center;
                        cursor: pointer;
                        display: flex;
                        flex: 0 0 67px;
                        .mtd-table-cell {
                            padding: 0;
                            flex: 1;
                            .date-cell-shift {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                            }
                            .mtd-badge {
                                flex: 0 0 28px;
                            }
                            .date-wrapper {
                                display: flex;
                                flex-direction: column;
                                margin-top: 2px;
                                .date {
                                    display: inline-block;
                                    width: 24px;
                                    height: 24px;
                                    line-height: 24px;
                                    border-radius: 50%;
                                    font-weight: 600;
                                    &.today {
                                        background: #0a70f5;
                                        color: #fff;
                                    }
                                    &.not-current-month {
                                        color: #acafb3;
                                    }
                                }
                                &.weekend {
                                    color: #0a70f5;
                                }
                            }
                            .mtd-badge-text {
                                width: 18px;
                                height: 18px;
                                font-size: 12px;
                                -webkit-transform: scale(0.84);
                                top: 1px;
                                left: 14px;
                                background: #ffe4e4;
                                color: #ff4a47;
                                border: none;
                            }
                        }
                        &.table-cell-weekend {
                            .date {
                                color: #acafb3;
                            }
                        }
                        &.table-cell-disable {
                            opacity: 0.5;
                            cursor: not-allowed;
                        }
                    }
                }
            }
        }
        &.four-weeks {
            /deep/.mtd-table-body {
                tbody {
                    tr {
                        height: calc(360px / 4);
                    }
                }
            }
        }
        &.six-weeks {
            /deep/.mtd-table-body {
                tbody {
                    tr {
                        height: calc(360px / 6);
                    }
                    td {
                        &.table-cell-date {
                            .mtd-badge {
                                flex: 0 0 18px;
                            }
                            .date-wrapper {
                                .date {
                                    height: 18px;
                                    width: 18px;
                                    line-height: 18px;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>