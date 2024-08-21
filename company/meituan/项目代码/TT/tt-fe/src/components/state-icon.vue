<template>
    <span :class="`ticket-state ${size}`"> 
        <span :class="'ticket-state-icon ticket-state-' + ticketStateEn[state]" />
        <span class="ticket-state-text">{{ stateDisplayName }}</span>
    </span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { STATE_MAP_EN } from '@/config/map.conf';
/**
 * 无权限页面
 *
 * @author liyuyao
 * @date 04/17/2020
 */
@Component
export default class StateIcon extends Vue {
    @Prop({ default: '' })
    state: string;

    @Prop({ default: '' })
    stateDisplayName: string;

    @Prop({ default: 'normal' })
    size: string;

    ticketStateEn: CommonTypes.mapObject = STATE_MAP_EN;
}
</script>

<style lang="scss">
.ticket-state {
    &.large {
        font-size: 16px;
    }

    font-family: PingFangSC-Medium;
    .ticket-state-icon {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.36);
        vertical-align: middle;
        &.ticket-state-doing {
            background: #3288f7;
        }
        &.ticket-state-done {
            background: #39c694;
        }
        &.ticket-state-todo {
            background: #fe6557;
        }
    }
    .ticket-state-text {
        vertical-align: middle;
    }
}
</style>