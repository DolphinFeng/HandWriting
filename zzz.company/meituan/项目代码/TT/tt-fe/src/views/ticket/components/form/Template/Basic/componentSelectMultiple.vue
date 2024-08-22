<template>
    <mtd-select
        v-model="value"
        multiple
        filterable
        @input="totalEmit"
        class="component-select-multiple"
        :disabled="disabled">
        <mtd-option
            v-for="item in options"
            :key="item.value"
            :value="item.value"
            :label="item.label || item.value" />
    </mtd-select>
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
export default class ComponentSelectMultiple extends TemplateMixin {

    // 选项可以来自于接口配置，或组件参数
    get options () {
        return this.field.options || [];
    }
}
</script>
<style lang="scss" scoped>
.component-select-multiple {
    width: 280px;
}
</style>
