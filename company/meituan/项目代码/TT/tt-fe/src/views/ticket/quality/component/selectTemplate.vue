<template>
    <div class="pm-select">
        <mtd-picker
            :reserve-keyword="true"
            v-model="selectValue"
            clearable
            :placeholder="placeholder"
            :filterable="showFilter"
            remote
            closable
            :popper-class="className"
            :filter-input-props="{ 'genre': 'line', 'placeholder': inputPlaceholder }"
            :remote-method="searchField"
            ref="userPicker"
            :formatter="formatterOption"
            @change="change">
            <template slot="selected" slot-scope="scope">
                <span>{{ getCurrentLabel(scope.selected) }}</span>
            </template>
            <slot />
            <template slot="empty">
                <div class="tips">该空间暂未配置质检模板</div>
                <mtd-button
                    type="primary"
                    class="tt-pure-btn"
                    :href="jumpLink"
                    target="_blank">去配置质检模板</mtd-button>
            </template>
        </mtd-picker>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
@Component
export default class PmSelect extends Vue {
    @Prop({ default: '请选择' }) placeholder?: string;
    @Prop({ default: '请输入' }) inputPlaceholder?: string;
    @Prop() remoteMethod?: (query: string) => void;
    @Prop() formatter?: (arg0: any) => string;
    @Prop({ default: '' }) value: any;
    @Prop({ default: false }) defaultNone: boolean;
    @Prop({ default: 'pm-select-picker-drop' }) popperClass?: string;
    @Prop() jumpLink: string;

    selectValue: any = '';
    $refs: any;
    $mtd: any;

    @Watch('value', { immediate: true })
    onValueChange (val: any) {
        this.selectValue = val;
    }

    getCurrentLabel (option: any) {
        if (!option) {
            return;
        }
        if (this.formatter) {
            return this.formatterOption(option);
        } else {
            return option.currentLabel;
        }
    }

    searchField (query: string) {
        const { remoteMethod } = this.$props;
        if (remoteMethod) {
            remoteMethod(query);
        }
    }
    change (val: any) {
        this.$emit('change', val);
        if (this.$refs.userPicker) {
            const userPicker = this.$refs.userPicker?.$refs.wrappedInstance;
            userPicker.$refs.wrappedInstance.$refs.filter.$refs.wrappedInstance.handleClearClick();
        }
    }

    formatterOption (option: any) {
        const { formatter } = this;
        if (formatter) {
            return formatter({
                value: option.value,
                label: option.currentLabel,
                currentLabel: option.currentLabel
            });
        }
        return null;
    }
    get className () {
        const name = this.defaultNone ? ' default-none-popper' : '';
        return `${this.popperClass}${name}`;
    }
    get showFilter () {
        return this.defaultNone ? false : true;
    }
}
</script>
<style lang="scss">
.default-none-popper {
    padding: 28px 0;
    .mtd-picker-empty {
        text-align: center;
        .tips {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
            line-height: 20px;
            margin-bottom: 12px;
        }
        &:hover {
            background: none;
            color: none;
            cursor: default;
        }
    }
    .tt-pure-btn {
        height: 32px;
        display: inline-block;
        span {
            line-height: 32px;
        }
        &:hover {
            text-decoration: none;
        }
    }
}
</style>
