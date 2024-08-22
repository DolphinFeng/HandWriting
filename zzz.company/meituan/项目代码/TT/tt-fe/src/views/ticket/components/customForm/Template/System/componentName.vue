<template>
    <mtd-input
        v-model="value"
        :placeholder="$getText('component_name_input_placeholder', '请输入标题')"
        @input="valueChange"
        @blur="blurChange"
        :disabled="disabled"
        class="component-name" />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';

/**
 * 自定义表单-标题
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentName extends TemplateMixin {
}
</script>
<style lang="scss" scoped>
.component-name {
    width: 100%;
}
</style>