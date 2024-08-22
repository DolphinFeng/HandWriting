<template>
    <mtd-textarea
        v-model="value"
        @input="valueChange"
        @blur="blurChange"
        class="component-textarea"
        :disabled="disabled" />
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
<style lang="scss" scoped>
.component-textarea {
    width: 100%;
}
</style>