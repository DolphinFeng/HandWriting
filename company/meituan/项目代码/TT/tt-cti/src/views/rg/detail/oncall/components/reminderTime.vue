<template>
    <div class="reminder-time">
        <mtd-input-group compact>
            <mtd-input-number
                v-model="currentTime"
                :max="maxTime"
                @change="onChanged('time')"
                controls-position="right"
                :min="minTime" />
            <mtd-select
                type="text"
                @change="onChanged('unit')"
                v-model="currentUnit">
                <mtd-option
                    value="MINUTE"
                    label="分钟" />
                <mtd-option
                    value="HOUR"
                    label="小时" />
            </mtd-select>
        </mtd-input-group>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    name: 'ReminderTime',
})
export default class ReminderTime extends Vue {
    @Prop({ default: 5 }) time: number;
    @Prop({ default: 'MINUTE' }) unit: string;
    currentTime: number = 0;
    currentUnit: string = 'MINUTE';
    @Watch('time', { immediate: true })
    @Watch('unit', { immediate: true })
    onTimeChanged () {
        if (this.time) {
            this.currentTime = this.time;
            this.currentUnit = this.unit;
        }
    }
    onChanged (type) {
        if (type === 'unit') {
            // 从小时切换到分钟时，currentTime < 5 重置为5
            // 从分钟切换到小时时，currentTime > 6 重置为6
            if (this.currentUnit === 'MINUTE' && this.currentTime < 5) {
                this.currentTime = 5;
            } else if (this.currentUnit === 'HOUR' && this.currentTime > 6) {
                this.currentTime = 6;
            }
        }
        this.$emit('change', {
            time: this.currentTime,
            unit: this.currentUnit
        });
    }
    get maxTime () {
        return this.currentUnit === 'MINUTE' ? 120 : 6;
    }
    get minTime () {
        return this.currentUnit === 'MINUTE' ? 5 : 1;
    }
}
</script>

<style lang="scss" scoped>
.reminder-time {
    display: inline-block;
    .mtd-input-number-wrapper {
        width: 80px;
        .mtd-input-number {
            padding: 0 30px;
        }
    }
    .mtd-select {
        width: 70px;
    }
}
</style>
