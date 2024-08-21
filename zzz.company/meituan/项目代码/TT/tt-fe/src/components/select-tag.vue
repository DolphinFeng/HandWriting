<template>
    <span :class="['select-tag-item', { 'is-selected': selected}]" onselectstart="return false">
        <slot />
    </span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
/**
 * 带选中tag
 *
 * @author liyuyao
 * @date 09/27/2020
 */
@Component
export default class SelectTag extends Vue {
    @Prop({ default: false })
    selected: boolean;
}
</script>

<style lang="scss" scoped>
.select-tag-item {
    display: inline-block;
    padding: 0 4px;
    margin-right: 8px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.06);
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    text-align: center;
    line-height: 18px;
    cursor: pointer;
    &.is-selected {
        color: #f80;
        background-color: #fdeac3;
    }
}
</style>