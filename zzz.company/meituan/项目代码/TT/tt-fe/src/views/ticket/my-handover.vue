<template>
    <div class="handover-wrapper">
        <div class="handover-header">
            <span class="header-title">{{ $getText('my_handover_header_title', '我的工作交接') }}</span>
            <span class="header-deadline"> {{ $getText('my_handover_deadline', {date: lastDay}) }} </span>
        </div>
        <handover-content
            :user="misX"
            @get-user-date="showLastDay" />
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import HandoverContent from '@/views/ticket/components/handover-content.vue';
import { Getter } from 'vuex-class';

@Component({
    components: {
        HandoverContent
    }
})
export default class MyHandover extends Vue {
    @Getter misX;
    lastDay: string = '';

    showLastDay (date: string) {
        this.lastDay = date || '0000-00-00';
    }
}
</script>
<style lang="scss">
.handover-wrapper {
    width: 800px;
    margin: 12px auto;
    margin-bottom: 24px;
    height: calc(100% - 36px);
    .handover-header {
        padding: 17px 0 17px 20px;
        background: #fff;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        margin-bottom: 12px;
        .header-title {
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 20px;
            color: rgba(0, 0, 0, 0.84);
            line-height: 26px;
        }
        .header-deadline {
            font-weight: 400;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: #626262;
            letter-spacing: 0;
            line-height: 28px;
            padding-left: 12px;
            margin-left: 12px;
            border-left: 1px solid rgba(0, 0, 0, 0.12);
        }
    }
}
</style>
