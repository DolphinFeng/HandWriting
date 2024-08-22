<template>
    <div class="oncall-reminder-wrapper">
        <div class="title">值班上线提醒<mtd-switch
            v-model="isPreReminderOpen"
            @input="onSwitchChange($event, 'preReminder')"
            size="small" /></div>
        <div class="reminder-item" v-show="isPreReminderOpen">
            {{ oncallReminderConfigText[shiftReminderData.timing] }}
            <reminder-time
                @change="onTimeChanged($event, 'online')"
                :time="shiftReminderData.timeValue"
                :unit="shiftReminderData.timeUnit" />
            {{ oncallReminderConfigText[shiftReminderData.reason] }}
        </div>
        <div class="title">值班签到<mtd-switch
            v-model="isCheckInReminderOpen"
            @input="onSwitchChange($event, 'checkIn')"
            size="small" /></div>
        <div
            class="reminder-item"
            v-show="isCheckInReminderOpen"
            v-for="item in checkInReminderList"
            :key="item.triggerConfigId">
            {{ oncallReminderConfigText[item.timing] }}
            <reminder-time
                :time="item.timeValue"
                :unit="item.timeUnit"
                @change="onTimeChanged($event, 'checkIn', item.triggerConfigId)" />{{ oncallReminderConfigText[item.reason] }}
            <mtd-tooltip
                v-if="item.reason === 'REMIND_CHECK_IN'"
                theme="dark"
                size="small"
                content="值班人员开始处理TT将自动触发打卡完成"
                placement="top">
                <i class="mtdicon mtdicon-info-circle-o" />
            </mtd-tooltip>
            <reminder-receiver
                v-else
                :users="item.recipient"
                @change="onReceiverChanged($event, item.triggerConfigId)" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ReminderTime from '../components/reminderTime.vue';
import { OncallReminderConfigText } from '@/config/map.conf';
import ReminderReceiver from '../components/reminderReceiver.vue';
import * as api from '@/api';
import { cloneDeep } from 'lodash';
@Component({
    components: {
        ReminderTime,
        ReminderReceiver
    }
})
export default class OncallReminder extends Vue {
    shiftReminderData: any = {};
    checkInReminderList: any = {};
    optionList: any[] = [];
    isCheckInReminderOpen: boolean = false;
    isPreReminderOpen: boolean = false;
    oncallReminderConfigText: any = OncallReminderConfigText;
    searchLoading = false;

    created() {
        this.getReminderConfig();
    }
    async getReminderConfig () {
        const res = await api.oncallApi.getReminderConfig(this.rgId);
        const { data, code } = res;
        if (code === 200 && data) {
            const { shiftReminderConfig, checkInReminderConfig } = data;
            this.shiftReminderData = Object.assign({}, shiftReminderConfig?.config);
            this.checkInReminderList = cloneDeep(checkInReminderConfig?.configList);
            this.isCheckInReminderOpen = checkInReminderConfig?.state === 'ON';
            this.isPreReminderOpen = shiftReminderConfig?.state === 'ON';
        }
    }
    async updateReminderConfig (config) {
        const res = await api.oncallApi.updateReminderConfig(this.rgId, config);
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('更新成功');
            this.getReminderConfig();
        }
    }
    onSwitchChange (val, type: 'checkIn' | 'preReminder') {
        const requestParam = {};
        requestParam[type + 'State'] = val ? 'ON' : 'OFF';
        this.updateReminderConfig({ ...requestParam });
    }
    onTimeChanged (data, type, id?) {
        const { time, unit } = data;
        if (type === 'online') {
            this.shiftReminderData.timeValue = time;
            this.shiftReminderData.timeUnit = unit;
            this.updateReminderConfig({
                ...this.shiftReminderData
            });
        } else {
            const targetData = this.checkInReminderList.find(item => item.triggerConfigId === id);
            targetData.timeValue = time;
            targetData.timeUnit = unit;
            this.updateReminderConfig({
                ...targetData
            });
        }
    }
    onReceiverChanged (recipientData: any, id) {
        const targetData = this.checkInReminderList.find(item => item.triggerConfigId === id);
        targetData.recipient = recipientData;
        this.updateReminderConfig({
            ...targetData
        });
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>
<style lang="scss" scoped>
.oncall-reminder-wrapper {
    .title {
        font-size: 16px;
        font-weight: 600;
        line-height: 32px;
        margin-top: 12px;
        display: flex;
        align-items: center;
        .mtd-switch {
            margin-left: 8px;
        }
    }
    .reminder-item {
        display: flex;
        align-items: center;
        margin: 12px 0 12px 18px;
        .reminder-time,
        .reminder-receiver-select {
            margin: 0 6px;
        }
        .mtdicon-info-circle-o {
            color: rgba(0, 0, 0, 0.36);
            margin-left: 2px;
        }
    }
}
</style>
