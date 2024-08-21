<template>
    <mtd-checkbox-group
        v-model="value"
        @input="valueChange"
        :readonly="readonly">
        <mtd-checkbox
            v-for="item in options"
            :key="item.value"
            :value="item.value"
            :disabled="getDisabled(item)"
            @change="hiddenChange(arguments, item.value)">{{ item.label || item.value }}</mtd-checkbox>
    </mtd-checkbox-group>
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
export default class ComponentCheckbox extends TemplateMixin {
    @Watch('form.defaultValue', { immediate: true })
    defaultValueChange (val, oldVal) {
        const isHidden = this.value.includes('isHidden');
        const isRequired = this.value.includes('isRequired');
        if (oldVal && !val && isHidden && isRequired) {
            this.value = ['isHidden'];
        }
    }
    hiddenChange (val, type) {
        if (type === 'isHidden') {
            this.$emit('hidden-change', val[0]);
        }
    }
    getDisabled (item) {
        const isRequired = this.value.includes('isRequired');
        const isHidden = this.value.includes('isHidden');
        const noDefaultValue = this.form.defaultValue === '';
        if (item.value === 'isHidden') {
            return isRequired && noDefaultValue && !isHidden;
        } else if (item.value === 'isRequired') {
            return isHidden && noDefaultValue;
        } else {
            return item.disabled;
        }
    }
    // 硬编码：没填defaultValue的时候不能选隐藏，标题除外
    get hiddenDisabled () {
        const isRequired = this.value.includes('isRequired');
        const isHidden = this.value.includes('isHidden');
        const noDefaultValue = this.form.defaultValue === '';
        return isRequired && noDefaultValue && !isHidden;
    }
}
</script>
