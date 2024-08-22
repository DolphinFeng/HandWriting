<template>
    <mtd-checkbox
        v-model="permissionValue"
        size="small"
        @input="valueChange">{{ $getText('component_permission_checkbox_label', '设为保密') }}</mtd-checkbox>
</template>
<script lang="ts">
import { Component, Watch, Prop } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class ComponentPermission extends TemplateMixin {
    permissionValue: boolean = false;

    @Watch('permissionValue')
    initPermission () {
        this.value = this.permissionValue ? 'private' : 'public';
        this.valueChange();
    }
    mounted () {
        this.permissionValue = this.value === 'private';
        this.value = this.permissionValue ? 'private' : 'public';
        this.valueChange();
    }
}
</script>

<style lang="scss" scoped>
.field-icon {
    display: inline-block;
    width: 72px;
    height: 72px;
    padding: 12px 0;
    margin: 5px 5px 0 0;
    text-align: center;
    font-size: 12px;
    cursor: grab;
    border: 1px solid #ccc;
    border-radius: 4px;
    i {
        font-size: 20px;
    }
}
</style>
