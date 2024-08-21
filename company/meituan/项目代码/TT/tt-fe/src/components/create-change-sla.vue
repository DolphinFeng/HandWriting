<template>
    <div class="create-change-sla">
        <StatePicker
            :options="options"
            :value.sync="selected"
            class="create-change-sla-selected"
            @change="selectChange">
            <div slot="selected" :class="`create-change-sla-selected-value create-change-sla-selected-${value}`">
                {{ $getText(Sla2CN[value]) }}
            </div>
        </StatePicker>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Sla2CN, SlaOptions } from '@/config/map.conf';
import StatePicker from '@/components/state-picker.vue';

@Component({
    components: {
        StatePicker
    }
})
export default class CreateChangeSla extends Vue {
    @Prop({ default: () => {
        return SlaOptions;
    } })
    options: CommonTypes.mapObject[];

    @Prop({ default: 'S4' })
    value: string;

    selected: string = 'S4';

    Sla2CN: CommonTypes.mapObject = Sla2CN;

    @Watch('value')
    getValue () {
        this.selected = this.value;
    }


    selectChange (val) {
        this.$emit('update:value', val);
        this.$emit('change', val);
    }
}
</script>

<style lang="scss">
.create-change-sla {
    width: 100%;
    height: 32px;
    // font-size: 14px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    background-color: #fff;
    .create-change-sla-selected {
        width: 100%;
        vertical-align: top;
        max-width: initial;
        line-height: 30px;
        .mtd-picker-selection {
            padding: 0 8px;
        }
    }
    .create-change-sla-selected-value {
        border-radius: 2px;
        display: inline-block;
        font-family: PingFangSC-Medium;
        font-size: 12px;
        letter-spacing: 0;
        text-align: center;
        line-height: 22px;
        font-weight: 500;
        padding: 0 8px;
        min-width: 64px;
        &.create-change-sla-selected-S1,
        &.create-change-sla-selected-S2 {
            color: #dd3429;
            background-color: #ffd2cc;
        }
        &.create-change-sla-selected-S3 {
            color: #d86b01;
            background-color: #ffe9bc;
        }
        &.create-change-sla-selected-S4 {
            color: #005ade;
            background-color: #bae2ff;
        }
        &.create-change-sla-selected-S5 {
            color: rgba(0, 0, 0, 0.36);
            background-color: rgba(0, 0, 0, 0.12);
        }
    }
    // .mtd-picker-selection {
    //     color: #fff;
    // }
}
</style>
