<template>
    <mtd-input
        :disabled="disabled"
        :readonly="readonly"
        v-model="value"
        @input="valueChange" />
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
export default class ComponentInput extends TemplateMixin {
}
</script>

<style lang="postcss" scoped>
.mtd-input-wrapper {
    width: 100%;
}
</style>
