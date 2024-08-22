<template>
    <mtd-date-picker
        v-model="value"
        type="datetime"
        @input="totalEmit"
        :disabled="disabled"
        class="component-date" />
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
export default class ComponentDate extends TemplateMixin {
}
</script>
<style lang="scss" scoped>
.component-date {
    width: 280px;
}
</style>