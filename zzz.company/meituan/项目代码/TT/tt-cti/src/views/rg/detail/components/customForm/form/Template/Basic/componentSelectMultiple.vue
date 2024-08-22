<template>
    <mtd-select
        v-model="value"
        multiple
        @input="valueChange"
        :disabled="readonly"
        filterable
        :class="{'component-select-readonly': readonly}">
        <mtd-option
            v-for="item in options"
            :key="item.value"
            :value="item.value"
            :label="item.label || item.value" />
    </mtd-select>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentSelectMultiple extends TemplateMixin {
}
</script>
<style lang="postcss" scoped>
.component-select-readonly {
    /deep/ .mtd-input-disabled .mtd-input {
        background-color: #FFFFFF;
    }
}
</style>
