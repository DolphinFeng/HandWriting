<template>
    <mtd-select
        v-model="value"
        @input="valueChange"
        class="component-permission">
        <mtd-option value="private" :label="$getText('create_form_permission_option_secret', '保密')" />
        <mtd-option value="public" :label="$getText('create_form_permission_option_not_secret', '不保密')" />
    </mtd-select>
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
export default class ComponentPermission extends TemplateMixin {}
</script>

<style lang="scss" scoped>
.component-permission {
    width: 280px;
}
</style>
