<template>
    <mtd-tooltip
        theme="dark"
        placement="right">
        <div
            slot="content"
            v-html="content"
            class="info-tip-content" />
        <i class="mtdicon mtdicon-question-circle-o" />
    </mtd-tooltip>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
/**
 * 提示信息
 *
 * @author liyuyao
 * @date 08/24/2020
 */
@Component
export default class InfoTip extends Vue {
    @Prop({ default: '' })
    content: string;
}
</script>
<style lang="scss" scoped>
.info-tip-content {
    font-size: 12px;
}
.mtdicon-question-circle-o {
    vertical-align: middle;
    color: rgba(0, 0, 0, 0.36);
}
</style>