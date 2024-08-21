<template>
    <mtd-input
        v-model="value"
        @input="valueChange"
        @blur="blurChange"
        :disabled="disabled"
        :placeholder="$getText('component_input_placeholder', '请输入')"
        class="component-input" />
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
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
<style lang="scss" scoped>
.component-input {
    width: 100%;
}
</style>