<template>
    <mtd-picker
        v-model="selected"
        class="toolcom-state-picker"
        :popper-class="`toolcom-state-picker-popper ${popperClass}`"
        @change="selectChange"
        :disabled="disabled">
        <div slot="selected">
            <slot name="selected" />
        </div>
        <mtd-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            class="toolcom-state-option">
            <span :class="`toolcom-state-option-tag toolcom-state-option-tag-${item.value}`">{{ item.label }}</span>
            <div class="toolcom-state-option-instruction">{{ item.instruction }}</div>
        </mtd-option>
    </mtd-picker>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class StatePicker extends Vue {
    @Prop({ default: () => {
        return [];
    } })
    options: any;

    @Prop({ default: '' })
    popperClass: string;

    @Prop({ default: '' })
    value: string | number;

    @Prop({ default: false })
    disabled: boolean;

    selected: string | number = null;

    @Watch('value', { immediate: true })
    getValue (val) {
        this.selected = val;
    }
    selectChange (val) {
        this.$emit('update:value', val);
        this.$emit('change', val);
    }
}
</script>

<style lang="scss">
.toolcom-state-picker {
    .mtd-picker-icon {
        font-size: 16px;
        font-weight: 500;
    }
}
.toolcom-state-picker-popper {
    max-width: 300px;
    .toolcom-state-option {
        display: block;
        padding-bottom: 8px;
        // background: #ffd2cc;
    }
    .toolcom-state-option-tag {
        border-radius: 2px;
        display: inline-block;
        font-family: PingFangSC-Medium;
        font-size: 12px;
        color: #dd3429;
        letter-spacing: 0;
        text-align: center;
        line-height: 22px;
        font-weight: 500;
        padding: 0 8px;
        background: #ffd2cc;
        min-width: 64px;
    }
    .toolcom-state-option-instruction {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        letter-spacing: 0;
        line-height: 18px;
        font-weight: 400;
    }
    .toolcom-state-option-tag-S1,
    .toolcom-state-option-tag-S2 {
        color: #dd3429;
        background-color: #ffd2cc;
    }
    .toolcom-state-option-tag-S3 {
        color: #d86b01;
        background-color: #ffe9bc;
    }
    .toolcom-state-option-tag-S4 {
        color: #005ade;
        background-color: #bae2ff;
    }
    .toolcom-state-option-tag-S5 {
        color: rgba(0, 0, 0, 0.36);
        background-color: rgba(0, 0, 0, 0.12);
    }
    .mtd-dropdown-menu {
        max-height: fit-content;
    }
}
// .problem-level-popper {
//     width: 102px;
//     .mtd-dropdown-menu {
//         min-width: 0;
//     }
// }
</style>
