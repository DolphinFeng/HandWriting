<template>
    <mtd-select
        v-model="value"
        @input="totalEmit"
        filterable
        class="component-select"
        :disabled="disabled">
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
export default class ComponentSelect extends TemplateMixin {

}
</script>
<style lang="scss" scoped>
.component-select {
    width: 100%;
}
</style>