<template>
    <div class="custom-permission-container">
        <mtd-checkbox
            v-model="permissionValue"
            size="small"
            :disabled="readonly"
            @input="valueChange">设为保密</mtd-checkbox>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
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

    @Watch('value', { immediate: true })
    initPermission () {
        this.permissionValue = this.value === 'private';
    }

    valueChange () {
        this.value = this.permissionValue ? 'private' : 'public';
        this.$emit('change', this.value, this.field);
    }
}
</script>

<style lang="postcss" scoped>
.field-icon {
    display: inline-block;
    width: 72px;
    height: 72px;
    padding: 12px 0;
    margin: 5px 5px 0 0;
    text-align: center;
    font-size: 12px;
    cursor: grab;
    border: 1px solid #CCCCCC;
    border-radius: 4px;
    i {
        font-size: 20px;
    }
}
</style>
