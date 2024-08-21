<template>
    <mtd-select
        v-model="selectedLabel"
        value-key="relationIntefaceIdentify"
        @input="valueChange"
        :disabled="readonly"
        filterable
        :class="{'component-select-readonly': readonly}">
        <mtd-option
            v-for="(item, index) in relationTypes"
            :key="index"
            :value="item.value"
            :label="item.label || item.value" />
    </mtd-select>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';

/**
 * 关联字段
 *
 * @author liyuyao
 * @date 03/12/2021
 */
@Component
export default class ComponentRelationSelect extends TemplateMixin {
    selectedLabel = '美团/点评门店ID';
    @Watch('selectedLabel', { immediate: true })
    getValueChange (val) {
        console.log('ComponentRelationSelect val', val);
    }

    relationTypes: CommonTypes.mapObject[] = [{
        value: {
            relationIntefaceIdentify: 'MEITUAN_DIANPING_POI'
        },
        label: '美团/点评门店ID'
    }];
}
</script>
