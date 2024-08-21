<template>
    <mtd-modal
        :title="$getText('retry_ticket_modal_title', '重新处理的原因：')"
        v-model="show"
        @close="close"
        width="480px">
        <div>
            <mtd-textarea
                :placeholder="$getText('retry_ticket_modal_placeholder', '请输入重新处理原因，最多可输入300字符')"
                v-model="reopenReason"
                style="width: 552px;"
                rows="3"
                maxlength="300" />
        </div>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="close">{{ $getText('retry_ticket_modal_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                type="primary"
                :loading="btnLoading"
                @click="submit">{{ $getText('retry_ticket_modal_confirm_btn', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import * as api from '../../../../api/index';

/**
 * 重新打开TT，输入重新打开原因
 *
 * @author liyuyao
 */
@Component
export default class RetryTicket extends Vue {
    @Getter loginType;

    @Prop({ default: '' })
    id: string;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    show: Boolean = true;

    btnLoading: Boolean = false;
    $refs: any;

    reopenReason: string = '';

    async submit () {
        if (this.reopenReason.length <= 300) {
            this.btnLoading = true;
            await api.ticketApi.updateTicket(this.id, {
                state: '重新打开',
                reopenReason: this.reopenReason
            });
            this.btnLoading = false;
            this.reopenReason = '';
            this.$emit('success');
            this.$mtd.message({
                message: this.$getText('retry_ticket_modal_success_message', '重新打开成功'),
                type: 'success'
            });
            this.close();
        }
    }
    close () {
        this.show = false;
        this.$emit('close');
    }
}
</script>
