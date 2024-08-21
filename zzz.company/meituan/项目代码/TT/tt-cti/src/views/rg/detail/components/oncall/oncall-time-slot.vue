<template>
    <div class="oncall-time-slot">
        <div
            v-for="(timeSlot, index) in timeSlotsValue"
            :key="index"
            class="oncall-time-line">
            <div class="time-slot">
                <div class="slot-control">
                    <div class="range-picker-control">
                        <mtd-time-picker
                            type="time"
                            v-model="timeSlot[0]"
                            format="HH:mm"
                            style="width: 90px;"
                            :steps="[1, 15]"
                            :disabled="disabled"
                            @change="emitTimeChange" />
                        ~
                        <mtd-time-picker
                            type="time"
                            v-model="timeSlot[1]"
                            format="HH:mm"
                            style="width: 90px;"
                            :steps="[1, 15]"
                            :disabled="disabled"
                            @change="emitTimeChange" />
                    </div>
                    <div class="group-input-control">
                        <mtd-select
                            v-model="timeSlot[2]"
                            class="group-input"
                            placeholder="选择绑定的值班组"
                            @change="emitTimeChange"
                            :disabled="disabled">
                            <mtd-option
                                v-for="item in wholeGroupList"
                                :key="item.id"
                                :value="item.id"
                                :label="item.name">
                                {{ item.name }}
                            </mtd-option>
                        </mtd-select>
                    </div>
                    <mtd-input v-model="timeSlot[3]" style="display: none;" />
                </div>
                <i
                    class="iconfont icon-delete"
                    v-if="!disabled && timeSlotsValue.length > 1"
                    @click="deleteTimeSlot(index)" />
                <div class="error-tip">{{ computeErrorTip(timeSlot) }}</div>
            </div>
        </div>
        <i
            class="iconfont icon-add"
            v-if="!disabled && timeSlotsValue.length < 3"
            @click="AddTimeSlot" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

/**
 * 时长输入组件
 *
 * @author liyuyao
 * @date 04/08/2020
 */
const baseTime = 8 * 3600 * 1000;

@Component({ name: 'oncall-time-slot' })
export default class DayTimeSlot extends Vue {
    @Prop({ default: () => [[0, 86340000, null, null]] })
    timeSlots: Array<[number, number, number | null, number | null]>;

    @Prop({ default: false })
    disabled: boolean;

    // [开始时间, 结束时间, 关联 groupId]
    timeSlotsValue: Array<[Date | null, Date | null, number | null, number | null]> = [[null, null, null, null]];

    @Prop({ required: true, default: [] })
    wholeGroupList: Array<CommonTypes.OnCallGroupRecord>;

    // 初始化设置 timeSlots
    @Watch('timeSlots', { immediate: true })
    setupTimeSlots (timeSlots) {
        if (timeSlots.length) {
            this.timeSlotsValue = timeSlots.map(slot => {
                // NOTE: baseTime 这个是8小时的时差？？？
                return slot.slice(0, 2).map(item => new Date(item - baseTime)).concat(slot[2], slot[3] || null);
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
        this.timeSlotsValue.splice(index, 1);
        this.$emit('change', this.formatEmitValue);
    }
    AddTimeSlot () {
        const previous = this.timeSlotsValue[this.timeSlotsValue.length - 1];
        const previoursEndAt = (previous && previous[1]) || null;
        this.timeSlotsValue.push([previoursEndAt, new Date(86340000 - baseTime), null, null]);
    }
    get formatEmitValue () {
        return this.timeSlotsValue.map(slot => {
            return slot.slice(0, 2).map(item => this.getMillisecond(item)).concat(slot[2], slot[3]);
        });
    }
    computeErrorTip (timeSlot) {
        if (this.disabled) {
            return '';
        }
        if (!timeSlot || timeSlot.length < 2 || !timeSlot[0] || !timeSlot[1]) {
            return '请选择时间段';
        } else if (timeSlot[0] > timeSlot[1]) {
            return '开始时间需要早于结束时间';
        } else if (timeSlot[2] == null) {
            return '请选择绑定的值班组';
        }
        return '';
    }
}
</script>

<style lang="postcss">
.oncall-time-slot {
    .iconfont {
        margin-left: 16px;
        font-size: 14px;
        cursor: pointer;
    }
    .oncall-time-line {
        margin-left: 32px;
        display: inline-block;
        margin-bottom: 16px;
        .time-slot {
            .slot-control {
                display: inline-block;
                .group-input-control {
                    margin-top: 8px;
                    .group-input {
                        width: 198px;
                    }
                }
            }
            .icon-delete {
                vertical-align: top;
            }
        }
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
