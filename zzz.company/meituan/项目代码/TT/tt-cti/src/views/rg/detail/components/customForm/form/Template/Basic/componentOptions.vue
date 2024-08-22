<template>
    <div class="options-setting-container">
        <component
            :is="checkComponent"
            v-model="defaultOption"
            @input="OptionChange"
            :readonly="readonly">
            <div
                :key="index"
                v-for="(option, index) in setOptions"
                class="option-setting-item">
                <mtd-input v-model="setOptions[index]" @input="OptionChange" />
                <component
                    :is="optionComponent"
                    label="默认"
                    :value="index"
                    :key="index">默认</component>
                <div class="operate">
                    <i class="iconfont icon-delete" @click="deleteOptions(index)" />
                    <i class="iconfont icon-add-square-o" @click="addOptions(index)" />
                </div>
            </div>
        </component>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class OptionsSetting extends TemplateMixin {
    defaultOption: number | number[] = null;
    setOptions: string[] = [''];

    get multiple () {
        return !!(this.form.component && this.form.component.indexOf('Multiple') > -1);
    }

    @Watch('form.options', { immediate: true })
    onGetOptions (options) {
        this.defaultOption = this.multiple ? [] : null;
        this.setOptions = options.map((option, index) => {
            if (option.isDefault) {
                if (this.multiple && Array.isArray(this.defaultOption)) {
                    this.defaultOption.push(index);
                } else {
                    this.defaultOption = index;
                }
            }
            return option.value;
        });
    }

    get checkComponent () {
        return this.multiple ? 'mtd-checkbox-group' : 'mtd-radio-group';
    }

    get optionComponent () {
        return this.multiple ? 'mtd-checkbox' : 'mtd-radio';
    }

    get formatOptions () {
        const defaultValue = this.multiple ? this.defaultOption : [this.defaultOption];
        return this.setOptions.map((option, index) => {
            return {
                value: option,
                // NOTE: 通过 Array.isArray() 做 type check 避免 ts 报错
                isDefault: Array.isArray(defaultValue) ? defaultValue.includes(index) : null
            };
        });
    }

    addOptions (index: number) {
        this.setOptions.splice(index + 1, 0, '');
        this.OptionChange();
    }

    deleteOptions (index: number) {
        if (this.setOptions.length <= 1) {
            return;
        }
        this.setOptions.splice(index, 1);
        this.OptionChange();
    }

    OptionChange () {
        this.$emit('change', this.formatOptions, this.field);
    }
}
</script>
<style lang="postcss" scoped>
.option-setting-item {
    margin-bottom: 8px;
    .mtd-input-wrapper {
        width: 164px;
        margin-right: 15px;
    }
    .operate {
        float: right;
        .iconfont {
            line-height: 32px;
            padding: 0 5px;
            cursor: pointer;
        }
    }
    .mtd-radio,
    .mtd-radio-checked,
    .mtd-radio-normal {
        display: inline-block;
    }
}
/deep/ .mtd-checkbox-group .mtd-checkbox {
    margin-right: 0;
}
</style>
