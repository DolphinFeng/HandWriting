<template>
    <span :class="`ticket-sla ${size}`"> 
        <img :src="imgSrc" class="ticket-sla-icon">
        <span class="ticket-sla-text">{{ $getText(sla2CN[sla]) }}</span>
    </span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Sla2CN } from '@/config/map.conf.ts';
/**
 * 无权限页面
 *
 * @author liyuyao
 * @date 04/17/2020
 */
@Component
export default class SlaIcon extends Vue {
    @Prop({ default: '' })
    sla: string;

    @Prop({ default: 'normal' })
    size: string;

    sla2CN: CommonTypes.mapObject = Sla2CN;

    get imgSrc () {
        return require(`../assets/img/sla/${this.sla || 'S4'}.svg`);
    }
}
</script>

<style lang="scss">
.ticket-sla {
    min-width: 45px;
    display: inline-block;
    .ticket-sla-icon {
        vertical-align: middle;
    }
    .ticket-sla-text {
        vertical-align: middle;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.84);
        display: inline-block;
        max-width: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    &.large .ticket-sla-text {
        font-size: 16px;
    }
}
</style>