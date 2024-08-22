<template>
    <div class="sla-working-container">
        <div style="padding-bottom: 60px;">
            <div class="container">
                <div class="title">工作日</div>
                <edit-save
                    :editable.sync="editable"
                    @save="submit"
                    @cancel="cancel" />
                <div class="working-time-content">
                    <mtd-checkbox-group
                        v-model="workDays"
                        class="checkbox-vertical"
                        :disabled="!editable"
                        @change="weekDayChange">
                        <div
                            v-for="(day, index) in weekDays"
                            :key="index">
                            <mtd-checkbox :value="index + 1">{{ `周${day}` }}</mtd-checkbox>
                            <day-time-slot
                                style="display: inline-block;"
                                :disabled="!editable || !workDays.includes(index + 1)"
                                :time-slots="timeSlots[index + 1]"
                                @change="dayTimeChange(arguments, index + 1)" />
                        </div>
                    </mtd-checkbox-group>
                </div>
            </div>
            <div class="container holiday">
                <div class="title holiday">节假日值班
                    <info-tip :content="slaSettingTip['holiday']" />
                </div>
                <div class="holiday-time-content">
                    <div class="top-select">
                        <span>选择年份</span>
                        <mtd-date-picker
                            type="year"
                            placeholder="选择年份"
                            v-model="currentYear"
                            :options="yearOptions"
                            @input="getHolidaySetting"
                            style="width: 200px;" />
                        <mtd-button
                            type="primary"
                            v-show="ShowAddBtn"
                            icon="mtdicon mtdicon-add"
                            @click="addHoliday">新增节假日</mtd-button>
                    </div>
                    <mtd-table
                        :data="holidayForm"
                        :row-key="holidayForm.index"
                        :row-col-span="spanMethod">
                        <mtd-table-column
                            prop="name"
                            label="节假日名称"
                            width="150" />
                        <mtd-table-column
                            prop="date"
                            label="节假日时间" />
                        <mtd-table-column
                            prop="time"
                            label="工作时间">
                            <template slot-scope="scope">
                                {{ scope.row.time || '无' }}
                            </template>
                        </mtd-table-column>
                        <mtd-table-column
                            prop="setting"
                            width="150"
                            label="操作">
                            <template slot-scope="scope">
                                <mtd-button
                                    @click="handleEdit(scope.row)"
                                    type="text"
                                    size="small">编辑</mtd-button>
                                <mtd-button
                                    type="text"
                                    size="small"
                                    @click="handleDelete(scope.row)"
                                    v-if="!scope.row.isOfficial">删除</mtd-button>
                            </template>
                        </mtd-table-column>
                    </mtd-table>
                </div>
            </div>
        </div>
        <mtd-modal
            :title="modalTitle"
            v-model="showModal"
            destroy-on-close
            width="400px">
            <div class="holiday-form">
                <div class="holiday-form-item">
                    <span>节假日名称：</span>
                    <mtd-input
                        :readonly="activeItem.isOfficial"
                        v-model="activeItem.name"
                        :invalid="activeItem.name.length > 15"
                        style="width: 230px;" />
                    <div class="mtd-form-item-error-tip" v-if="activeItem.name.length > 15">名称不能超过15个字</div>
                </div>
                <div class="holiday-form-item">
                    <span>节假日日期：</span>
                    <mtd-date-picker
                        type="daterange"
                        :readonly="activeItem.isOfficial"
                        :value="activeItem.dateList"
                        :options="isNextYear ? nextYearDateOptions : dateOptions"
                        value-format="timestamp"
                        placeholder="选择时间"
                        @input="updateDate"
                        style="width: 230px;" />
                </div>
                <div class="holiday-form-item">
                    <span class="worktime-label">工作时间：</span>
                    <day-time-slot
                        :time-slots="activeItem.timeList"
                        style="display: inline-block;"
                        @change="workTimeChange"
                        :is-required="!this.activeItem.isOfficial"
                        :disabled="false" />
                </div>
            </div>
            <div slot="footer" class="modal-footer">
                <mtd-button @click="cancelEdit">取消</mtd-button><mtd-button
                    type="primary"
                    @click="submitEdit">确定</mtd-button>
            </div>
        </mtd-modal>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { WeekDays, SlaSettingTip } from '@/config/map.conf.ts';
// import { State } from 'vuex-class';
import * as api from '@/api';
import EditSave from '../components/edit-save.vue';
import DayTimeSlot from './day-time-slot.vue';
import HolidaySlot from './holiday-slot.vue';
import infoTip from '@/views/components/info-tip.vue';

const TODAY: number = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
// 12.20后才会更新第二年节假日
const canCheckNextYear: boolean = new Date(TODAY).getMonth() + 1 === 12 && new Date(TODAY).getDate() >= 20;
/**
 * sla 工作时间设置
 *
 * @author liyuyao
 * @date 01/20/2019
 */
@Component({
    components: {
        DayTimeSlot,
        HolidaySlot,
        infoTip,
        EditSave
    }
})
export default class WorkTime extends Vue {
    weekDays: string[] = WeekDays;

    workDays: number[] = [];
    startTime: any = null;
    endTime: any = null;

    currentEditRow: any = {};

    errorTip: any = [];
    timeError: string = '';

    holidayList: any = [];
    btnLoading: boolean = false;

    timeSlots: any = {};
    editable: boolean = false;
    currentYear: string = '';
    isAddModal: boolean = true;
    showModal: boolean = false;
    holidayForm: any[] = [];
    activeItem: any = {
        name: '',
        isOfficial: false,
        date: '',
        dateList: [],
        time: '',
        timeList: []
    };
    slaSettingTip: CommonTypes.mapObject = SlaSettingTip;
    // 选择今年时，可选今天到年底的日期
    dateOptions: any = {
        disabledDate (date: any) {
            const currentDate = new Date(TODAY);
            return date.getTime() < TODAY || (date.getFullYear() > currentDate.getFullYear());
        }
    };
    // 选择明年时，可选明年全年日期
    nextYearDateOptions: any = {
        disabledDate (date: any) {
            const currentDate = new Date(TODAY);
            return date.getFullYear() !== currentDate.getFullYear() + 1;
        }
    };
    // 可选年份范围：过去两年 + 今年 + 12.20之后可选明年
    yearOptions: any = {
        disabledDate (date) {
            const currentDate = new Date(TODAY);
            const yearGap = currentDate.getFullYear() - date.getFullYear();
            let disabledYear = yearGap > 2 || yearGap < 0;
            if (yearGap === -1 && canCheckNextYear) {
                disabledYear = false;
            }
            return disabledYear;
        }
    };
    spanMethod: Function = ({ row, columnIndex }) => {
        // amount用于标识需要合并的单元格个数（单个节假日的总天数）、index用来标识节假日的第几天
        if (row.amount && !row.index && columnIndex === 0) {
            return {
                rowspan: row.amount,
                colspan: 1,
            };
        } else if (row.amount && row.index && columnIndex === 0) {
            return {
                rowspan: 0,
                colspan: 0,
            };
        }
    };

    get modalTitle () {
        return this.isAddModal ? '新增节假日' : '编辑节假日';
    }
    get ShowAddBtn () {
        // 仅当前年份和12.20号之后可在明年新增节假日
        const currentDate = new Date(TODAY);
        const year = currentDate.getFullYear();
        if (year.toString() === this.currentYear || (this.isNextYear && canCheckNextYear)) {
            return true;
        }
        return false;
    }
    get isNextYear () {
        return Number(this.currentYear) === new Date(TODAY).getFullYear() + 1;
    }
    created() {
        this.currentYear = new Date(TODAY).getFullYear().toString();
    }
    mounted () {
        this.getHolidayOncalSetting();
    }
    workTimeChange (val) {
        this.activeItem.timeList = val;
    }
    updateDate (date) {
        this.activeItem.dateList = date;
    }
    async submitEdit () {
        if (!this.activeItem.name || !this.activeItem.dateList) {
            this.$mtd.message.error('请填写名称或日期！');
            return;
        }
        if (!this.activeItem.isOfficial && !this.activeItem.timeList.length) {
            this.$mtd.message.error('非法定节假日工作时间必填！');
            return;
        }
        const dateGap = (this.activeItem.dateList[1] - this.activeItem.dateList[0]) / (1000 * 3600 * 24);
        if (!this.activeItem.isOfficial && dateGap > 19) {
            // 为了配合后端逻辑
            this.$mtd.message.error('非法定节假日不可超过20天！');
            return;
        }
        // 添加非法定节假日需要二次确认
        if (!this.activeItem.isOfficial && this.isAddModal) {
            this.$mtd.confirm({
                title: '是否确认添加',
                message: '您添加的日期非法定节假日，添加之后优先按照您配置的节假日值班时间段进行分单和时间统计，是否确认添加',
                width: '430px',
                showCancelButton: true,
                onOk: () => {
                    this.submitHoliday();
                }
            }).catch(() => {});
        } else {
            this.submitHoliday();
        }
    }
    async submitHoliday () {
        const res = await api.rgApi.updateHolidaySetting({
            rgId: this.rgId,
            year: Number(this.currentYear),
            holidayBO: {
                name: this.activeItem.name,
                workTime: this.activeItem.timeList,
                holidayTypeEnum: this.activeItem.isOfficial ? 'OFFICIAL' : 'CUSTOM',
                id: this.activeItem.id,
                dateList: this.activeItem.dateList
            }
        });
        const { code } = res;
        if (code === 200) {
            this.showModal = false;
            this.$mtd.message.success(this.isAddModal ? '添加成功' : '编辑成功');
            this.getHolidaySetting(this.currentYear);
        }
    }
    handleEdit (row) {
        this.isAddModal = false;
        this.showModal = true;
        this.activeItem = row;
    }
    handleDelete (row) {
        this.$mtd.confirm({
            title: '是否确认删除',
            message: '删除后，该节假日对应的日期将被当做工作日处理，按照工作日设置的工作时间计算响应&处理时长，是否确认删除',
            width: '430px',
            showCancelButton: true,
            onOk: () => {
                this.deleteHolidaySetting(row);
            }
        }).catch(() => {});
    }
    cancelEdit () {
        this.showModal = false;
        this.getHolidaySetting(this.currentYear);
    }
    async getHolidayOncalSetting () {
        const res = await api.rgApi.getHolidayOncalSetting(this.rgId);
        const { code, data } = res;
        if (code === 200 && data.workDaysOfWeek) {
            this.workDays = Object.keys(data.workHoursMap).map(day => parseInt(day, 10));
            this.timeSlots = data.workHoursMap;
            this.holidayForm = this.handleHolidayList(data.holidayOnCallHours);
        }
    }
    async setWorkTimeOncall () {
        const res = await api.rgApi.setHolidayOncall({
            rgId: this.rgId,
            workDaysOfWeek: this.workDays,
            workHoursMap: this.timeSlots,
        });
        const { code, data } = res;
        if (code === 200) {
            this.$mtd.message.success('操作成功');
            this.workDays = Object.keys(data.workHoursMap).map(day => parseInt(day, 10));
            this.timeSlots = data.workHoursMap;
            this.editable = !this.editable;
        }
    }
    async getHolidaySetting (val) {
        const res = await api.rgApi.getHolidaySetting({
            rgId: this.rgId,
            year: val
        });
        const { code, data } = res;
        if (code === 200) {
            this.holidayForm = this.handleHolidayList(data || {});
        }
    }
    async deleteHolidaySetting (val) {
        const res = await api.rgApi.deleteHolidaySetting(val.id);
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('删除成功');
            this.getHolidaySetting(this.currentYear);
        }
    }
    formatHolidayList (holidays) {
        const result = {};
        holidays.forEach(holiday => {
            if (!holiday.edit) {
                result[holiday.name] = holiday.date;
            }
        });
        return result;
    }
    dayTimeChange (timeArr, index) {
        this.timeSlots[index] = timeArr[0];
    }

    weekDayChange (val) {
        const days = [1, 2, 3, 4, 5, 6, 7];
        days.forEach((day) => {
            if (!val.includes(day)) {
                delete this.timeSlots[day];
            }
        });
    }

    handleHolidayList (holidays) {
        const list = [];
        const holidayList = Object.values(holidays || {}).sort((a: any, b: any) => a.dateList[0] - b.dateList[0]);
        holidayList.forEach((holiday: any) => {
            if (holiday.holidayTypeEnum === 'OFFICIAL') {
                const dayMap = Object.values(holiday.singleDayHolidayMap || {}).sort((a: any, b: any) => a.dateList[0] - b.dateList[0]);
                const amount = dayMap.length;
                dayMap.forEach((item: any, index) => {
                    list.push({
                        name: item.name,
                        date: item.displayDate,
                        time: item.displayWorkTime && item.displayWorkTime.join(','),
                        dateList: item.dateList,
                        timeList: item.workTime,
                        isOfficial: item.holidayTypeEnum === 'OFFICIAL',
                        id: item.id || 0,
                        amount,
                        index
                    });
                });
            } else {
                list.push({
                    name: holiday.name,
                    date: holiday.displayDate,
                    time: holiday.displayWorkTime && holiday.displayWorkTime.join(','),
                    dateList: holiday.dateList,
                    timeList: holiday.workTime,
                    isOfficial: holiday.holidayTypeEnum === 'OFFICIAL',
                    id: holiday.id || 0,
                });
            }
        });
        return list;
    }
    submit () {
        this.setWorkTimeOncall();
    }
    cancelBack () {
        history.go(-1);
    }
    addHoliday () {
        this.isAddModal = true;
        this.activeItem = {
            name: '',
            isOfficial: false,
            date: '',
            dateList: [],
            time: '',
            timeList: []
        };
        this.showModal = true;
    }
    deleteHoliday (index) {
        this.holidayList.splice(index, 1);
    }
    cancel () {
        this.$mtd.confirm({
            title: '确认放弃当前修改的内容吗？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                await this.getHolidayOncalSetting();
            },
            onCancel: async () => {
                this.editable = !this.editable;
            }
        }).catch(e => e);
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.sla-working-container {
    background: #FFFFFF;
    .container.holiday {
        margin-top: 15px;
    }
    .container {
        width: 1000px;
        .title {
            display: inline-block;
            vertical-align: top;
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 22px;
        }
        .title.holiday {
            width: 90px;
        }
        .edit-save-wrapper {
            float: right;
            display: inline-block;
        }
        .working-time-content,
        .holiday-time-content {
            display: block;
            margin-left: 90px;
            margin-top: 10px;
            vertical-align: top;
        }
        .holiday-time-content {
            display: inline-block;
            margin: 0;
            width: 910px;
            .top-select {
                width: 890px;
                margin-left: 15px;
                .mtd-date-picker {
                    margin-left: 10px;
                }
                .mtd-btn {
                    float: right;
                }
            }
            .mtd-table {
                margin-top: 10px;
            }
        }
    }
    .text-button {
        color: #1C6CDD;
        cursor: pointer;
    }
    .error-tip {
        font-size: 12px;
        color: #FF5F57;
    }
    .sla-footer {
        padding-bottom: 15px;
        margin-left: 130px;
        margin-bottom: 15px;
        background-color: #FFFFFF;
        .close-btn {
            margin-right: 8px;
        }
    }
}
.mtd-modal {
    .holiday-form-item {
        margin-top: 15px;
        position: relative;
        &:first-child {
            .mtd-input-wrapper {
                width: 200px;
            }
        }
        .day-time-line {
            margin-left: 14px;
        }
        .day-time-slot {
            width: 280px;
            margin-left: 70px;
        }
        .worktime-label {
            position: absolute;
        }
    }
}
</style>
