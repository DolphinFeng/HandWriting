<template>
    <div class="holiday-slot">
        <mtd-input :value.sync="name" @input="nameChange" />
        <mtd-date-picker
            style="width: 240px; margin-left: 10px;"
            type="daterange"
            :value.sync="holiday"
            value-format="timestamp"
            :options="options"
            placeholder="选择时间"
            @input="holidayChange" />
        <i class="iconfont icon-delete" @click="deleteHolidaySlot" />
        <div class="error-tip">{{ errorTip }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
// import { TimeTypes } from '@/config/map.conf';

/**
 * 时长输入组件
 *
 * @author liyuyao
 * @date 04/08/2020
 */
const TODAY: number = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();

@Component
export default class HolidaySlot extends Vue {
    @Prop({ default: '' })
    name: string;

    @Prop({
        default: () => {
            return [0, 0];
        }
    })
    holiday: number[];

    options: any = {
        disabledDate (date: any) {
            // 最多可选到昨天的日期，否则置灰
            return date && date.getTime() < TODAY;
        }
    };

    nameChange (val) {
        this.$emit('update:name', val);
    }

    holidayChange (val) {
        this.$emit('update:holiday', val);
    }

    getMillisecond (date) {
        const hour = date.getHours();
        const min = date.getMinutes();
        return (hour * 3600 + min * 60) * 1000;
    }
    deleteHolidaySlot () {
        this.$emit('delete');
    }
    get errorTip () {
        let tip = '';
        if (!this.name) {
            tip = '请填写假期名称';
        } else if (!this.holiday || !this.holiday[0]) {
            tip = '请选择日期区间';
        }
        return tip;
    }
}
</script>

<style lang="postcss">
.holiday-slot {
    margin-bottom: 16px;
    .icon-delete,
    .icon-add {
        margin-left: 16px;
        font-size: 14px;
        cursor: pointer;
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
</style>
