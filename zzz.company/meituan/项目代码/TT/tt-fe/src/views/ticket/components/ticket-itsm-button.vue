<template>
    <mtd-button
        size="small"
        @click="createItsm"
        class="ticket-itsm-button">
        <span class="ticket-about-btn-content">
            <img
                src="@/assets/img/itsm-icon.png"
                class="itsm-logo">
            <span class="btn-label">{{ itsmText }}</span>                
        </span>
    </mtd-button>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

const TRANSFER_TYPE = {
    IT: 1,
    ADMINISTRATION: 2
};

import * as api from '@/api';
/**
 * 转派itsm
 *
 * @author liyuyao
 * @date 03/15/2019
 */
@Component
export default class TicketItsmButton extends Vue {
    @State(state => state.tt.ticketAbout)
    ticketAbout: any;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    // 是否转派行政
    @Prop({ default: false })
    isTransferAdministration: boolean;

    itsmUrl: string = '';

    get ticketId () {
        return this.$route.query.id;
    }
    get itsmText () {
        if (this.isTransferAdministration) {
            return this.itsmUrl ? this.$getText('ticket_itsm_button_view_qianxun', '查看千寻') : this.$getText('ticket_itsm_button_transfer_administration', '转派行政服务');
        }
        return this.itsmUrl ? this.$getText('ticket_itsm_button_view_qianxun', '查看千寻') : this.$getText('ticket_itsm_button_transfer_it', '转派IT服务');
    }
    // 千寻操作
    createItsm () {
        if (this.itsmUrl) {
            window.open(this.itsmUrl, '_blank');
        } else {
            let text = this.$getText('ticket_itsm_button_confirm_tip', '行政');
            this.$mtd.confirm({
                title: this.$getText('ticket_itsm_button_confirm_transfer_qianxun', { system: this.isTransferAdministration ? text : 'IT' }),
                width: '433px',
                showCancelButton: true,
                type: 'warning',
                okButtonText: this.$getText('ticket_itsm_button_confirm', '确定'),
                cancelButtonText: this.$getText('ticket_clone_custom_btn_cancel', '取消'),
                onOk: () => {
                    this.createItsmRequest();
                }
            }).catch(e => { console.log(e); });
        }
    }
    async createItsmRequest () {
        const res: Ajax.AxiosResponse = await api.ticketApi.createItsm(this.ticketId, this.isTransferAdministration ? TRANSFER_TYPE.ADMINISTRATION : TRANSFER_TYPE.IT);
        let { code, data } = res;
        if (code === 200) {
            // 后端会进行工单关闭操作
            this.$mtd.message.success(this.$getText('ticket_itsm_button_transfer_success', '转派成功'));
            this.$emit('update');
            this.itsmUrl = data.targetURL;
        }
    }
}
</script>
<style lang="scss" scoped>
.btn-label {
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
}
.ticket-itsm-button {
    background-color: #fff !important;
    height: 24px !important;
    .itsm-logo {
        width: 16px;
        height: 16px;
        margin-right: 2px;
        border-radius: 2px;
    }
}
</style>