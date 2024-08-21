<template>
    <mtd-input :disabled="disabled" v-model.trim="currTime">
        <template slot="append">
            <mtd-select
                :disabled="disabled"
                v-model="currUnit"
                style="width: 77px;">
                <mtd-option
                    v-for="(item, index) in timeTypes"
                    :key="index"
                    :label="item"
                    :value="index" />
            </mtd-select>
        </template>
    </mtd-input>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { TimeTypes } from '@/config/map.conf';

/**
 * 时长输入组件
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component
export default class TimeInput extends Vue {
    @Prop({ default: 5 })
    time: number;
    @Prop({ default: 'MINUTE' })
    unit: string;
    @Prop({ default: false })
    disabled: Boolean;

    currTime: number = null;
    currUnit: string = '';
    timeTypes: CommonTypes.mapObject = TimeTypes;

    created () {
        this.currTime = this.time;
        this.currUnit = this.unit;
    }

    @Watch('time')
    onTimeChanged (val) {
        if (val) {
            this.currTime = val;
        }
    }
    @Watch('unit')
    onUnitChanged (val) {
        if (val) {
            this.currUnit = val;
        }
    }
    @Watch('currTime')
    onCurrTimeChanged (val) {
        this.$emit('update:time', val);
    }
    @Watch('currUnit')
    onCurrUnitChanged (val) {
        this.$emit('update:unit', val);
    }
}
</script>

<style lang="postcss">
.time-input-container {
    .label-text {
        display: inline-block;
        position: relative;
        top: 27px;
        left: -70px;
        color: #666666;
    }
}
</style>
