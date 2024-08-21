<template>
    <div class="day-time-slot">
        <div
            :key="index"
            v-for="(timeSlot, index) in timsSlotsValue"
            class="day-time-line">
            <div class="time-slot">
                <mtd-time-picker
                    type="time"
                    v-model="timeSlot[0]"
                    format="HH:mm"
                    style="width: 90px;"
                    :disabled="disabled"
                    clearable
                    @input="emitTimeChange" />
                ~
                <mtd-time-picker
                    type="time"
                    v-model="timeSlot[1]"
                    format="HH:mm"
                    style="width: 90px;"
                    :disabled="disabled"
                    clearable
                    @input="emitTimeChange" />
                <i
                    class="iconfont icon-delete"
                    v-if="!disabled && timsSlotsValue.length > 1"
                    @click="deleteTimeSlot(index)" />
                <div class="error-tip">{{ computeErrorTip(timeSlot) }}</div>
            </div>
        </div>
        <i
            class="iconfont icon-add"
            v-if="!disabled && timsSlotsValue.length < 3"
            @click="AddTimeSlot" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
// import { TimeTypes } from '@/config/map.conf';

/**
 * 时长输入组件
 *
 * @author liyuyao
 * @date 04/08/2020
 */
const baseTime = 8 * 3600 * 1000;

@Component
export default class DayTimeSlot extends Vue {
    @Prop({ default: 5 })
    timeSlots: number[][];

    @Prop({ default: false })
    disabled: boolean;
    @Prop({ default: true })
    isRequired: boolean;

    timsSlotsValue: number[][] = [[0, 0]];

    @Watch('timeSlots', { immediate: true })
    getTimeSlots (timeSlots) {
        if (timeSlots.length) {
            this.timsSlotsValue = timeSlots.map(time => {
                return time.map(item => new Date(item - baseTime));
            });
        }
    }
    getMillisecond (date) {
        if (date) {
            const hour = date.getHours();
            const min = date.getMinutes();
            return (hour * 3600 + min * 60) * 1000;
        } else {
            return 0;
        }
    }
    emitTimeChange () {
        this.$emit('change', this.formatEmitValue);
    }
    deleteTimeSlot (index) {
        this.timsSlotsValue.splice(index, 1);
        this.$emit('change', this.formatEmitValue);
    }
    AddTimeSlot () {
        this.timsSlotsValue.push([null, null]);
    }
    get formatEmitValue () {
        return this.timsSlotsValue.map(time => {
            return time.map(item => this.getMillisecond(item));
        });
    }
    computeErrorTip (timeSlot) {
        if (this.disabled) {
            return '';
        }
        if (this.isRequired && (!timeSlot || timeSlot.length < 2 || !timeSlot[0] || !timeSlot[1])) {
            return '请选择时间段';
        } else if (timeSlot[0] > timeSlot[1]) {
            return '开始时间需要早于结束时间';
        } else {
            return '';
        }
    }
}
</script>

<style lang="postcss">
.day-time-slot {
    .day-time-line {
        margin-left: 32px;
        display: inline-block;
        margin-bottom: 16px;
    }
    .icon-delete,
    .icon-add {
        margin-left: 16px;
        font-size: 14px;
        cursor: pointer;
    }
    .icon-add {
        vertical-align: -webkit-baseline-middle;
    }
}
label.mtd-checkbox {
    line-height: 34px;
    margin-right: 0;
}
.error-tip {
    font-size: 12px;
    color: #FF5F57;
}
.time-slot {
    display: inline-block;
    vertical-align: top;
}
</style>
