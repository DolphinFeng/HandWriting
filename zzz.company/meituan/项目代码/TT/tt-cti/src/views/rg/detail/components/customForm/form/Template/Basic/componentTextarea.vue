<template>
    <mtd-textarea
        class="custom-textarea"
        v-model="value"
        @input="valueChange"
        :readonly="readonly" />
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
export default class ComponentTextarea extends TemplateMixin {
}
</script>

<style lang="postcss" scoped>
.mtd-textarea {
    width: 100%;
}
.custom-textarea {
    resize: none;
}
</style>
