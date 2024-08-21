<template>
    <mtd-modal
        class="handle-modal"
        :mask-closable="false"
        width="500px"
        :title="$getText('confirm_close_ticket_title', '关闭提醒')"
        @close="handleClose"
        v-model="show">
        <div>{{ $getText('confirm_close_ticket_content', '您好，当前TT工单绑定的') }}<span>{{ this.sysType }}</span>{{ $getText('confirm_close_ticket_content_2', '工作项未结束，是否确认') }}{{ this.clickState === 'close' ? $getText('confirm_close_ticket_close', '关闭TT') : $getText('confirm_close_ticket_finish', '处理完成') }}？</div>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button type="primary" @click="handleClose">{{ $getText('confirm_close_ticket_cancel', '取消') }}</mtd-button>
            <mtd-button @click="handleConfirm">{{ $getText('confirm_close_ticket_confirm', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({})
export default class ConfirmCloseTicket extends Vue {
    show: boolean = true;

    @Prop()
    sysType: string;

    @Prop()
    clickState: string;

    handleClose () {
        this.show = false;
        this.$emit('close');
    }
    handleConfirm () {
        this.handleClose();
        this.$emit('confirm');
    }
}
</script>
<style lang="scss">
.handle-modal {
    .mtd-modal-content-wrapper {
        height: 40px;
        .mtd-modal-content {
            margin-left: 15px;
        }
    }
}
</style>