<template>
    <div class="create-change-sla">
        <StatePicker
            :options="slaOptions"
            :value.sync="value"
            class="create-change-sla-selected"
            @change="totalEmit">
            <div slot="selected" :class="`create-change-sla-selected-value create-change-sla-selected-${value}`">
                {{ $getText(Sla2CN[value]) }}
            </div>
        </StatePicker>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { Sla2CN, SlaOptions } from '@/config/map.conf';
import StatePicker from '@/components/state-picker.vue';
import TemplateMixin from '../TemplateMixin.vue';
import sortBy from 'lodash.sortby';
import * as api from '@/api';
@Component({
    components: {
        StatePicker
    }
})
export default class ComponentSla extends TemplateMixin {
    @Watch('rgId', { immediate: true })
    onRgIdChanged () {
        if (this.rgId !== this.currentRgId) {
            this.currentRgId = this.rgId;
            this.currentRgId && this.getSlaConfig();
        }
    }
    newSlaOptions: any = null;

    get slaOptions () {
        if (this.newSlaOptions) return this.newSlaOptions;
        return SlaOptions.map(item => {
            let option = {
                value: item.value,
                label: this.$getText(item.label),
                instruction: this.$getText(item.instruction)
            };
            console.log(item, option);
            return option;
        });
    }
    Sla2CN: CommonTypes.mapObject = Sla2CN;
    // 表单加载过程中很容易触发组件的多次渲染，存一下当前的rgId，仅在有变动时请求
    currentRgId: number = 0;

    async getSlaConfig () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getSlaConfig(this.currentRgId);
            const slaSort = sortBy(res.data.items, ['name']).filter(item => {
                return item.displayWhenLauch;
            });
            this.newSlaOptions = slaSort.map(item => {
                return {
                    value: item.name,
                    label: this.$getText(Sla2CN[item.name]),
                    instruction: item.description
                };
            });
        } catch (e) {
            console.log(e);
        }
    }
}
</script>

<style lang="scss">
.create-change-sla {
    width: 280px;
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
