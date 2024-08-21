<template>
    <mtd-modal
        :title="$getText('create_chatroom_dialog_title', '添加大象群成员')"
        class="create-chatroom-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="handleClose"
        v-model="visible">
        <mtd-form
            ref="formCustom"
            :label-width="88">
            <mtd-form-item
                :label="$getText('create_chatroom_dialog_label_member', '群成员')">
                <mtd-checkbox v-model="includeCc">{{ $getText('create_chatroom_dialog_include_cc', '拉入全部抄送人') }}</mtd-checkbox>
                <div>{{ $getText('create_chatroom_dialog_not_include_cc', '不勾选则不会将抄送人拉入大象群') }}</div>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="handleClose">{{ $getText('create_chatroom_dialog_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                type="primary"
                @click="submit">{{ $getText('create_chatroom_dialog_confirm_btn', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as api from '@/api';

/**
 * 创建大象群 确认弹窗
 *
 * @author liyuyao
 * @date 09/02/2019
 */

@Component
export default class CreateChatroomDialog extends Vue {
    visible: Boolean = true;

    includeCc: Boolean = false;
    @Prop() rgId: number;
    handleClose () {
        this.$emit('close');
        this.visible = false;
    }
    created () {
        this.getCcSetting();
    }

    async getCcSetting () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getGroupCcSetting(this.rgId);
        const { code, data } = res;
        if (code === 200 && data) {
            this.includeCc = data.inviteCc || false;
        }
    }

    async submit () {
        this.$emit('success', this.includeCc);
        this.handleClose();
    }
}
</script>
