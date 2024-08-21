<template>
    <mtd-select
        v-model="value"
        @input="totalEmit"
        class="component-select"
        :disabled="disabled">
        <mtd-option
            v-for="item in ticketType"
            :key="item.value"
            :value="item.value"
            :label="$getText(item.key)" />
    </mtd-select>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import { TicketType } from '@/config/map.conf';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentTicketType extends TemplateMixin {
    ticketType: {key: string, value: string}[] = TicketType;
}
</script>
<style lang="scss" scoped>
.component-select {
    width: 280px;
}
</style>