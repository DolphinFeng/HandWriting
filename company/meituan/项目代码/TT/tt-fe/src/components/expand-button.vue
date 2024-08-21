<template>
    <div
        :class="[fold ? 'fold-more' : 'expand-more', size === 'small' ? 'fold-small' : '' , 'fold-line-wrapper']"
        @click="clickButton">
        <span>{{ text || $getText(fold ? 'expand_button_fold' : 'expand_button_expand', '展开更多') }}</span><i :class="[fold ? 'icon-expand-more' : 'icon-expand-less', 'iconfont']" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
/**
 * 折叠按钮
 *
 * @author liyuyao
 * @date 04/17/2020
 */
@Component
export default class ExpandButton extends Vue {
    @Prop({ default: false })
    fold: boolean;

    @Prop({ default: 'normal' })
    size: string;

    @Prop({ default: '' })
    text: string;

    clickButton () {
        this.$emit('update:fold', !this.fold);
    }
}
</script>

<style lang="scss">
.fold-line-wrapper {
    cursor: pointer;
    color: rgba(0, 0, 0, 0.6);
    &.fold-more {
        color: rgba(0, 0, 0, 0.84);
        font-family: PingFangSC-Medium;
    }
    &.fold-small {
        font-size: 12px;
    }
}
</style>
