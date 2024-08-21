<template>
    <div class="oncall-info-container">
        <div class="info-header">
            <div class="filter">
                <mtd-icon-button
                    size="small"
                    type="secondary"
                    class="demo-icon-btn"
                    :disabled="disablePreviousBtn"
                    @click="onDataChanged('previous')"
                    icon="mtdicon mtdicon-left" />
                <mtd-icon-button
                    size="small"
                    type="secondary"
                    class="demo-icon-btn"
                    :disabled="disableNextBtn"
                    @click="onDataChanged('next')"
                    icon="mtdicon mtdicon-right" />
                <mtd-date-picker
                    :type="filterType.toLowerCase()"
                    :week-start="0"
                    :options="ruleDateOptions"
                    v-model="filterDate"
                    placeholder="选择时间"
                    @input="onDatePick"
                    :format="dateFormatString" />
                <mtd-button class="tt-pure-btn back-to-today" @click="backToToday">回到今天</mtd-button>
                <mtd-radio-group v-model="filterType" @input="onTypeChanged">
                    <mtd-radio-button value="MONTH">月</mtd-radio-button>
                    <mtd-radio-button value="WEEK">周</mtd-radio-button>
                </mtd-radio-group>
            </div>
            <div class="operation">
                <mtd-tooltip
                    class="import-tooltip-wrapper"
                    placement="top"
                    :disabled="!disableImport"
                    content="请先配置班次">
                    <span>
                        <mtd-button
                            @click="openImportModal"
                            class="tt-pure-btn"
                            :disabled="disableImport"
                            icon="mtdicon mtdicon-file-import">导入值班表</mtd-button></span>
                </mtd-tooltip>
                <mtd-button
                    class="tt-pure-btn"
                    @click="jumpPage"
                    icon="mtdicon mtdicon-setting">值班规则</mtd-button>
                <mtd-button
                    class="tt-pure-btn"
                    @click="addMember"
                    icon="mtdicon mtdicon-avatar-add">添加成员</mtd-button>
            </div>
        </div>
        <mtd-announcement
            title="功能上线前的历史值班安排无法查看，请您谅解"
            type="info"
            closable
            v-if="showAnnouncement"
            @close="closeAnnouncement"
            show-icon />
        <div class="oncall-table-wrapper">
            <mtd-table
                :data="tableData"
                bordered
                :loading="tableLoading"
                height="100%"
                @cell-click="onCellClick"
                id="oncall-info-table"
                class="oncall-info-table"
                :cell-class="cellClass"
                :row-class="rowClass"
                :header-cell-class="headerCellClass">
                <mtd-table-column
                    prop="member"
                    label="成员"
                    fixed
                    width="143">
                    <template slot-scope="scope">
                        <member-cell
                            :member="scope.row.member"
                            :active-mis="activeMis"
                            @close="onPopoverClose"
                            @success="updateWholeTable" />
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    prop="hour"
                    label="已排工时（小时）"
                    fixed
                    align="center"
                    width="68">
                    <template slot-scope="scope">
                        <span>{{ scope.row.hour }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    prop="date">
                    <template v-slot:header>
                        <span class="date">{{ tableHeaderDate }}</span>
                        <span class="shift-wrapper">
                            <span
                                :class="['oncall-shift-tag', item.color]"
                                v-for="(item, index) in allShiftList"
                                :key="index">{{ `${item.abbreviation}：${item.displayTime}` }}</span>
                            <mtd-tooltip
                                content="阴影代表值班时段中出现下线情况，遮罩代表为过去时间的值班"
                                size="small"
                                placement="top">
                                <i v-show="!disableImport" class="mtdicon mtdicon-question-circle-o" />
                            </mtd-tooltip>
                        </span>
                    </template>
                    <mtd-table-column
                        :prop="`${item.dayOfWeek}_${index}`"
                        :key="item.timestamp"
                        min-width="44px"
                        v-for="(item, index) in dateCols"
                        :label="item.timestamp.toString()">
                        <template v-slot:header>
                            <mtd-badge value="休" :hidden="!(item.holiday || item.officialHoliday)">
                                <div :class="[{'weekend': item.weekend}, 'date-wrapper']">
                                    <span :class="['date', {'today': item.today}]">{{ item.day }}</span>
                                    <span>{{ dayInWeekMap[item.dayOfWeek - 1] }}</span>
                                </div>
                            </mtd-badge>
                        </template>
                        <template slot-scope="scope">
                            <shift-cell
                                @close="onCellClose"
                                @success="updateWholeTable"
                                :class="{'selected': activeMisDate === (scope.row.member.identify + item.timestamp.toString())}"
                                :member="scope.row.member"
                                :timestamp="item.timestamp"
                                :end-date="endDate"
                                :shift-list="allShiftWithWholeDayList"
                                :data="scope.row.dateList[item.timestamp]" />
                        </template>
                    </mtd-table-column>
                </mtd-table-column>
            </mtd-table>
        </div>
        <import-modal
            v-if="showImportModal"
            :visible.sync="showImportModal"
            :timestamp="filterDate"
            :type="filterType"
            @success="updateWholeTable" />
        <add-member-modal
            v-if="showMemberModal"
            :visible.sync="showMemberModal"
            @success="updateWholeTable" />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { State } from 'vuex-class';
import ImportModal from '../components/modals/importModal.vue';
import ShiftCell from '../components/shiftCell.vue';
import { WeekDays } from '@/config/map.conf';
import AddMemberModal from '../components/modals/addMemberModal.vue';
import MemberCell from '../components/memberCell.vue';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { OncallReportMap } from '@/config/lx.conf';
const TODAY: Date = new Date(new Date().setHours(0, 0, 0, 0));
// 可查看的最早时间为23年4月
const START_DATE: Date = new Date(2023, 3, 0);
@Component({
    components: {
        ImportModal,
        ShiftCell,
        AddMemberModal,
        MemberCell
    }
})
export default class OncallInfoTable extends Vue {
    @State(state => state.cti.env)
    env: string;

    dayInWeekMap: CommonTypes.mapObject = WeekDays;
    dateCols: CommonTypes.mapObject[] = [];
    tableData: CommonTypes.mapObject[] = [];
    oncallMembers: CommonTypes.mapObject[] = [];
    hourList: CommonTypes.mapObject = {};
    allShiftList: CommonTypes.mapObject[] = []; // RG组配置的班次list
    tableShiftList: CommonTypes.mapObject = {}; // 当前筛选范围下，table接口涉及到的班次列表（不一定等于allShiftList）
    allShiftWithWholeDayList: CommonTypes.mapObject[] = []; // 将“全天”拼进班次list中

    filterDate: Date = TODAY;
    filterType: 'MONTH' | 'WEEK' = 'WEEK';
    activeMis: string = '';
    activeMisDate: string = '';

    showImportModal: boolean = false;
    showMemberModal: boolean = false;
    tableLoading: boolean = false;
    disablePreviousBtn: boolean = false;
    disableNextBtn: boolean = false;
    lastCloseAnnouncement: boolean = false;

    @Watch('filterDate', { immediate: true })
    onFilterDateChanged () {
        this.updateBtnDisableState();
    }

    created () {
        this.initFilter();
        this.getShifts();
        this.getCalendar();
        this.updateWholeTable();
    }
    mounted () {
        if (localStorage.closeAnnouncement === 'true') {
            this.lastCloseAnnouncement = true;
        }
    }

    updateWholeTable () {
        this.tableLoading = true;
        Promise.all([this.getOncallMembers(), this.getHourList()]).then(() => {
            this.getTableData();
        }).catch(() => {
            this.tableLoading = false;
        });
    }
    updateDateTable () {
        this.getCalendar();
        this.tableLoading = true;
        this.updateWholeTable();
    }
    async getShifts () {
        const res = await api.oncallApi.getShifts(this.rgId);
        const { data, code } = res;
        if (code === 200 && data) {
            this.allShiftList = data.items || [];
            this.allShiftWithWholeDayList = this.allShiftList.concat({
                abbreviation: '值班',
                color: 'ALL'
            });
        }
    }
    async getHourList () {
        const res = await api.oncallApi.getOncallHour({
            rgId: [this.rgId],
            timestamp: this.filterDate.getTime(),
            timeType: this.filterType,
        });
        const { data, code } = res;
        if (code === 200 && data) {
            this.hourList = data;
        }
    }
    async getOncallMembers () {
        const res = await api.oncallApi.getOncallMember({
            rgId: [this.rgId],
            timestamp: this.filterDate.getTime(),
            timeType: this.filterType
        });
        const { data, code } = res;
        if (code === 200 && data) {
            this.oncallMembers = data.items;
        }
    }
    async getCalendar () {
        const res = await api.oncallApi.getOncallCalender({
            rgId: [this.rgId],
            timestamp: this.filterDate.getTime(),
            timeType: this.filterType,
            needHolidayInfo: true
        });
        const { data, code } = res;
        if (code === 200 && data) {
            this.dateCols = [].concat(data.items || []);
        }
    }
    async getTableData () {
        try {
            const res = await api.oncallApi.getOncallTable({
                rgId: [this.rgId],
                timestamp: this.filterDate.getTime(),
                timeType: this.filterType,
                needRgDetail: false
            });
            const { data, code } = res;
            if (code === 200 && data) {
                this.tableLoading = false;
                this.tableShiftList = data.shift || [];
                this.formatTableData(data.oncall || {});
            }
        } catch (error) {
            console.log('error:', error);
            this.tableLoading = false;
        }
    }
    // 获取到所有表格数据后，进行处理
    formatTableData (data) {
        this.tableData = [];
        // 按照member接口的顺序取数据
        this.oncallMembers.forEach(member => {
            const row: CommonTypes.mapObject = {};
            row.member = { ...member };
            row.hour = this.hourList[member.identify]?.toFixed(1);
            Object.keys(data[member.identify]).forEach(timestamp => {
                let dateType = null;
                const { dayOff, wholeDay, shift } = data[member.identify][timestamp][this.rgId];
                if (dayOff.dayOff) {
                    dateType = 'dayOff';
                } else if (dayOff.dayOffPending) {
                    dateType = 'dayOffPending';
                } else if (wholeDay.wholeDayOncall) {
                    dateType = wholeDay.offline ? 'wholeDayOffline' : 'wholeDay';
                } else {
                    dateType = shift?.length ? 'shift' : 'noShift';
                }
                if (shift && shift.length && shift[0].shiftId) {
                    data[member.identify][timestamp][this.rgId].shift = data[member.identify][timestamp][this.rgId].shift.map(shift => {
                        shift.color = this.tableShiftList[shift.shiftId].color;
                        shift.abbreviation = this.tableShiftList[shift.shiftId].abbreviation;
                        return shift;
                    });
                }
                data[member.identify][timestamp] = {
                    ...data[member.identify][timestamp][this.rgId],
                    type: dateType
                };
            });
            row.dateList = data[member.identify];
            this.tableData.push(row);
        });
    }
    formatShiftList (shift) {
        Object.keys(id => {
            this.allShiftList.push(shift[id]);
        });
    }
    // 计算左右按钮是否可点击
    updateBtnDisableState () {
        // 起始时间的年、月
        const startMonth = START_DATE.getMonth();
        const startYear = START_DATE.getFullYear();
        // 截止时间是下个月底，需要计算endDate的下个月的年、月
        const endNextDate = this.getPreviousOrNextMonth(this.endDate, 'next');
        const endMonth = endNextDate.getMonth();

        if (this.filterType === 'MONTH') {
            // 当前日期前一个月、后一个月的日期
            const nextDate = this.getPreviousOrNextMonth(this.filterDate, 'next');
            const nextMonth = nextDate.getMonth();

            const previousDate = this.getPreviousOrNextMonth(this.filterDate, 'previous');
            const previousMonth = previousDate.getMonth();
            const previousYear = previousDate.getFullYear();

            this.disableNextBtn = endMonth === nextMonth;
            // 需要考虑不同年的情况
            this.disablePreviousBtn = (startMonth > previousMonth) && startYear === previousYear;
        } else {
            // 一周前/一周后如果属于无法查看的月份，则不可点击
            const nextDate = this.getPreviousOrNextWeek(this.filterDate, 'next');
            const nextWeekMonth = nextDate.getMonth();

            const previousDate = this.getPreviousOrNextWeek(this.filterDate, 'previous');
            // const previousWeekMonth = previousDate.getMonth();
            // const previousWeekYear = nextDate.getFullYear();

            this.disableNextBtn = endMonth === nextWeekMonth;
            // 需要考虑不同年的情况
            this.disablePreviousBtn = previousDate.getTime() < START_DATE.getTime();
        }
    }
    // 查询某个日期前一周或者后一周的Date
    getPreviousOrNextWeek (date: Date, type: 'previous' | 'next') {
        // 为了兼容起止日期按周查看可能跨月的情况，不固定+-7，而是取上一个周六或者下一个周日【按照周日、周一、...、周六的顺序】
        // 按照上述方法，如果起始时间与上月的最后几天在同一周 or 截止时间与下月的最早几天在同一周，也能正常查看
        const targetDate = new Date(date.getTime());
        targetDate.setDate(targetDate.getDate() - targetDate.getDay() + (type === 'previous' ? -1 : 7));
        return targetDate;
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
    // 获取某一天所在周的起止日期
    getWeekStartEnd (date: Date) {
        // 获取当天是周几（0表示周日，1~6表示周一到周六）
        const dayOfWeek = date.getDay();

        // 计算当前周的起始日期
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);

        // 计算当前周的截止日期
        const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - dayOfWeek));

        // 格式化日期输出
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
        };

        return {
            start: formatDate(start),
            end: formatDate(end)
        };
    }
    disabledDate (date: Date) {
        return date && !(date.getTime() > START_DATE.valueOf() && !(date.getTime() > this.endDate.valueOf()));
    }
    updateRouter () {
        this.$router.push({
            name: this.$route.name,
            query: {
                ...this.$route.query,
                filterType: this.filterType,
                filterDate: this.filterDate.getTime().toString()
            }
        }).catch(e => e);
    }
    initFilter () {
        const { filterType, filterDate } = this.$route.query;
        this.filterDate = new Date(Number(filterDate || TODAY));
        this.filterType = filterType === 'MONTH' ? 'MONTH' : 'WEEK';
    }
    checkDate () {
        const currentYear = TODAY.getFullYear();
        const selectedYear = this.filterDate.getFullYear();
        if (this.filterType === 'MONTH') {
            const currentMonth = TODAY.getMonth();
            const selectedMonth = this.filterDate.getMonth();
            return selectedYear < currentYear || selectedMonth < currentMonth;
        } else {
            const currentWeek = this.getWeek(TODAY);
            const selectedWeek = this.getWeek(this.filterDate);
            return selectedYear < currentYear || selectedWeek < currentWeek;
        }
    }
    getWeek (date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    onDataChanged (type: 'previous' | 'next') {
        if (this.filterType === 'MONTH') {
            this.filterDate = this.getPreviousOrNextMonth(this.filterDate, type);
        } else {
            this.filterDate = this.getPreviousOrNextWeek(this.filterDate, type);
        }
        if (this.checkDate()) {
            lxReportClick(OncallReportMap.query_historical_oncall);
        }
        this.updateDateTable();
        this.updateRouter();
    }
    onPopoverClose () {
        this.activeMis = '';
    }
    onTypeChanged () {
        this.updateDateTable();
        this.updateBtnDisableState();
        this.updateRouter();
    }
    onDatePick () {
        if (this.checkDate()) {
            lxReportClick(OncallReportMap.query_historical_oncall);
        }
        this.updateDateTable();
        this.updateRouter();
    }
    onCellClose () {
        this.activeMisDate = '';
    }
    onCellClick (scope: any) {
        // 因为“过去时间不可点击”而disable的cell
        const isDisableDateCell = scope.cell.className.includes('table-column-cell-disable');
        // 因为“已删除值班人整行不可点击”而disable的row
        const isDisableMemberRow = scope.cell.parentNode.className.includes('table-row-disable');
        // const isDisableMemberRowDateCell = isDisableMemberRow && scope.cell.className.includes('table-column-cell-date') ||scope.cell.className.includes('table-column-cell-member');
        if (isDisableDateCell || isDisableMemberRow) {
            return;
        }
        if (scope.column.prop === 'member') {
            this.activeMis = scope.row.member.identify;
        } else if (scope.column.prop !== 'hour') {
            this.activeMisDate = scope.row.member.identify + scope.column.label;
        }
    }
    openImportModal () {
        lxReportClick(OncallReportMap.click_import_oncall);
        this.showImportModal = true;
    }
    backToToday () {
        this.filterDate = TODAY;
        this.updateDateTable();
        this.updateRouter();
    }
    addMember () {
        this.showMemberModal = true;
    }

    closeAnnouncement () {
        localStorage.closeAnnouncement = 'true';
        this.lastCloseAnnouncement = true;
    }

    rowClass ({ row }) {
        // 已被删除的成员整行不可点击，class加在tr上
        return row.member.deleted ? 'table-row-disable' : '';
    }
    cellClass (scope) {
        if (scope.columnIndex === 0) {
            return `table-column-cell-member ${scope.row.member.identify}`;
        } else if (scope.columnIndex === 1) {
            return 'table-column-cell-hour';
        } else {
            const isWeekend = ['6', '7'].includes(scope.column.prop.split('_')[0]);
            // 过去时间整列不可点击、超过endDate整列不可点击，class加在td上
            const isDisableDate = Number(scope.column.label) < TODAY.getTime() || Number(scope.column.label) > this.endDate.getTime();
            return `table-column-cell-date${isWeekend ? ' table-column-cell-weekend' : ''} ${isDisableDate ? ' table-column-cell-disable' : ''}`;
        }
    }
    headerCellClass (scope) {
        if (scope.rowIndex === 0 && scope.columnIndex === 2) {
            return 'table-header-info';
        } else if (scope.rowIndex === 0 && scope.columnIndex === 1) {
            return 'table-header-hour';
        } else if (scope.rowIndex === 1) {
            const isWeekend = ['6', '7'].includes(scope.column.prop.split('_')[0]);
            return `table-header-date${isWeekend ? ' table-header-weekend' : ''}`;
        }
        return '';
    }

    jumpPage () {
        const url = this.$router.resolve({
            name: 'rg_oncall_rules',
            query: {
                rgId: `${this.rgId}`
            }
        });
        window.open(url.href, '_blank');
    }
    get endDate () {
        // 可查看的最晚时间为下个月的最后一天
        const endDate = this.getPreviousOrNextMonth(TODAY, 'next');
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();
        return new Date(endYear, endMonth + 1, 0);
    }
    get ruleDateOptions () {
        return {
            disabledDate: this.disabledDate
        };
    }
    get tableHeaderDate () {
        return `${this.filterDate.getFullYear()}年${this.filterDate.getMonth() + 1}月`;
    }
    get dateFormatString () {
        const { start, end } = this.getWeekStartEnd(this.filterDate);
        return this.filterType === 'WEEK' ? `${start} ~ ${end}` : 'yyyy年MM月';
    }
    get disableImport () {
        return !this.allShiftList.length;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }

    get showAnnouncement () {
        // 上次未关闭公告，且当前时间范围在上线日期所在月/周
        // 开始日期目前是12.31，从1.1开始查看，为了应对左右切换周的情况，需要对比8天
        const inSameMonth = this.filterType === 'MONTH' && this.filterDate.getMonth() === this.getPreviousOrNextMonth(START_DATE, 'next').getMonth();
        const inSameWeek = this.filterType === 'WEEK' && this.filterDate.getTime() - START_DATE.getTime() < 8 * 24 * 60 * 60 * 1000;
        return !this.lastCloseAnnouncement && (inSameMonth || inSameWeek);
    }
}
</script>

<style lang="postcss">
.oncall-info-container {
    height: calc(100% - 64px);
    .info-header {
        margin: 22px 0 12px 0;
        display: flex;
        justify-content: space-between;
        .filter {
            display: flex;
            align-items: center;
            .mtd-date-picker {
                width: 230px;
                margin-left: 4px;
            }
            .back-to-today {
                margin-left: 12px;
                font-weight: 500;
            }
            .mtd-radio-group {
                margin-left: 12px;
                padding: 2px;
                background: rgba(0, 0, 0, 0.06);
                border-radius: 4px;
                .mtd-radio-button {
                    border: none;
                    background: transparent;
                    box-shadow: none;
                    height: 28px;
                    line-height: 26px;
                    .mtd-radio-button-inner {
                        line-height: 26px;
                    }
                    &.mtd-radio-button-checked {
                        background: #FFFFFF;
                        box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.12);
                        border-radius: 2px;
                    }
                }
            }
        }
        .operation {
            .mtd-btn {
                margin-left: 12px;
                .mtd-btn-before {
                    color: rgba(0, 0, 0, 0.84);
                }
            }
        }
    }
    .mtd-announcement {
        border-radius: 6px;
        margin-bottom: 24px;
        .mtd-announcement-icon {
            line-height: 20px;
        }
    }
    .oncall-table-wrapper {
        height: calc(100% - 66px);
    }
    .oncall-info-table {
        border-color: #DADCE0;
        border-left: none;
        &::before {
            background-color: transparent;
        }
        &.mtd-table-border {
            &::after {
                background-color: transparent;
            }
        }
        .mtd-table-fixed {
            &::before {
                background-color: transparent;
            }
            .mtd-table-fixed-header-wrapper {
                .mtd-table-header {
                    border-left: 1px solid #DADCE0;
                    .table-header-hour {
                        border-right: 2px solid #DADCE0;
                    }
                }
            }
            .mtd-table-fixed-body-wrapper {
                .mtd-table-body {
                    border-left: 1px solid #DADCE0;
                    .table-column-cell-hour {
                        border-right: 2px solid #DADCE0;
                    }
                }
            }
        }
        .mtd-table-header {
            thead {
                th {
                    background: none;
                    color: rgba(0, 0, 0, 0.72);
                    font-weight: 600;
                    border-color: #DADCE0;
                    &.table-header-hour {
                        .mtd-table-cell {
                            padding: 0;
                            text-align: center;
                        }
                    }
                    &.table-header-info {
                        padding: 6px 0;
                        .mtd-table-cell {
                            padding-right: 0;
                            font-size: 12px;
                            color: rgba(0, 0, 0, 0.6);
                            line-height: 18px;
                            display: flex;
                            justify-content: space-between;
                            .shift-wrapper {
                                .oncall-shift-tag {
                                    font-weight: 500;
                                    margin-right: 6px;
                                    border-radius: 2px;
                                    color: #000000;
                                    padding: 0 4px;
                                    font-size: 12px;
                                    line-height: 12px;
                                }
                                .mtd-tooltip-rel {
                                    margin-right: 6px;
                                }
                            }
                        }
                    }
                    &.table-header-date {
                        padding: 0;
                        .mtd-table-cell {
                            text-align: center;
                            padding: 0;
                            .date-wrapper {
                                display: flex;
                                flex-direction: column;
                                text-align: center;
                                font-size: 12px;
                                color: rgba(0, 0, 0, 0.5);
                                .date {
                                    display: inline-block;
                                    width: 20px;
                                    height: 20px;
                                    line-height: 20px;
                                    border-radius: 50%;
                                    margin: 4px 0 1px 0;
                                    &.today {
                                        background: #0A70F5;
                                        color: #FFFFFF;
                                    }
                                }
                                &.weekend {
                                    color: #0A70F5;
                                }
                            }
                            .mtd-badge-text {
                                width: 18px;
                                height: 18px;
                                font-size: 12px;
                                -webkit-transform: scale(0.84);
                                top: 1px;
                                left: 14px;
                                background: #FFE4E4;
                                color: #FF4A47;
                                border: none;
                            }
                        }
                        &.table-header-weekend {
                            background: #F9F9F9;
                        }
                    }
                }
            }
        }
        .mtd-table-body {
            tbody {
                td {
                    border-color: #DADCE0;
                    cursor: default;
                    &.table-column-cell-date {
                        padding: 0;
                        text-align: center;
                        cursor: pointer;
                        .mtd-table-cell {
                            padding: 0;
                            height: 60px;
                        }
                        &.table-column-cell-weekend {
                            background: #F9F9F9;
                        }
                        &.table-column-cell-disable {
                            opacity: 0.5;
                            cursor: not-allowed;
                        }
                    }
                    &.table-column-cell-member {
                        padding: 0;
                        cursor: pointer;
                        .mtd-table-cell {
                            padding: 0;
                            height: 60px;
                            .oncall-member-wrapper {
                                height: 100%;
                                width: 100%;
                                .member-wrapper {
                                    height: 100%;
                                    width: 100%;
                                    display: flex;
                                    padding-left: 12px;
                                    align-items: center;
                                    &.selected {
                                        border: 2px solid #FFD100;
                                        padding-left: 10px;
                                    }
                                    .mtd-tag {
                                        flex: none;
                                        margin: 0 4px 0 8px;
                                        border-radius: 4px;
                                    }
                                }
                            }
                        }
                    }
                }
                tr {
                    &:hover {
                        td {
                            background-color: #F5F5F5 !important;
                        }
                    }
                }
                tr.table-row-disable {
                    opacity: 0.5;
                    .table-column-cell-disable {
                        opacity: 1;
                    }
                    .table-column-cell-member,
                    .table-column-cell-date,
                    .table-column-cell-hour {
                        cursor: not-allowed;
                    }
                }
            }
        }
    }
}
.oncall-member-popover {
    padding: 0 !important;
    .item {
        padding: 6px 28px 6px 16px;
        &:hover {
            background: rgba(0, 0, 0, 0.04);
            cursor: pointer;
        }
    }
}
</style>
