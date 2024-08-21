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

}
</script>
<style lang="scss" scoped>
.component-select-multiple {
    width: 100%;
}
</style>
