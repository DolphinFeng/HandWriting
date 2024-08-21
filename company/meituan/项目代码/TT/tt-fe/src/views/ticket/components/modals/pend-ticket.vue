<template>
    <mtd-modal
        :title="$getText('pend_ticket_modal_title', '请选择暂停原因')"
        class="handle-ticket-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="120"
            :rules="ruleCustom"
            v-loading="!replyReady">
            <mtd-form-item
                class="require"
                prop="pendingReason"
                :label="$getText('pend_ticket_label_reason', '暂停原因')">
                <mtd-select
                    v-model="formCustom.pendingReason"
                    style="width: 260px;"
                    :placeholder="$getText('selector_default_placeholder', '请输入')">
                    <mtd-option
                        v-for="(item, index) in closeReason"
                        :key="index"
                        :label="item.label"
                        :value="item.value" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                prop="desc"
                :label="$getText('pend_ticket_label_desc', '描述')"
                :class="{ 'require': pendingReasonCustomized }">
                <editor
                    v-if="replyReady"
                    ref="editor"
                    :value="formCustom.desc"
                    :action="uploadApi"
                    :reply-list="replyList"
                    @input="handleChange"
                    @imgUpload="handleImgUpload"
                    @reply-quick="replyQuick">
                    <div slot="toolbar">
                        <slot name="toolbar" />
                    </div>
                </editor>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close">{{ $getText('pend_ticket_cancel', '取消') }}</mtd-button>
            <mtd-button
                :loading="btnLoading"
                type="primary"
                :disabled="imgUploadStatus || descOverflow"
                @click="submit">{{ $getText('pend_ticket_confirm', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import editor from '@/components/quill-editor.vue';
import * as api from '../../../../api/index';
interface Form {
    desc: string;
    pendingReason: string;
}
const validateReason: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(Vue.prototype.$getText('pend_ticket_error_not_empty', '暂停原因不能为空')));
    }
    return callback();
};


/**
 * 挂起ticket 还没开始的tt，要暂停
 *
 * @author wutong
 */
@Component({
    components: {
        editor
    }
})
export default class PendTicket extends Vue {
    @Getter loginType;

    @Prop({ default: '' })
    id: string;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    show: Boolean = true;
    replyReady: boolean = false;

    ruleCustom = {
        pendingReason: [
            { validator: validateReason, trigger: 'blur, change' }
        ],
        desc: [
            {
                validator: (_rule, value, cb) => {
                    if (this.pendingReasonCustomized && !value) {
                        return cb(new Error(this.$getText('pend_ticket_error_desc', '请描述暂停原因')));
                    }
                    return cb();
                },
                trigger: 'blur'
            }
        ]
    };
    formCustom: Form = {
        desc: '',
        pendingReason: ''
    };
    btnLoading: Boolean = false;
    closeReason: {value: string, label: string}[] = [];
    replyList: string[] = [];
    imgUploadStatus: boolean = false;
    $refs: any;

    get pendingReasonCustomized () {
        return this.formCustom.pendingReason === '其他';
    }

    @Watch('info.rgId', { immediate: true })
    rgIdChange (rgId: number) {
        if (rgId) {
            this.replyReady = false;
            this.initCloseReason(rgId);
            this.getRgReplyText(rgId);
        }
    }

    close () {
        this.show = false;
        this.$emit('close');
    }
    async initCloseReason (rgId) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyField({
                rgId: rgId,
                type: 'PENDING_REASON'
            });
            let { code, data } = res;
            if (code === 200) {
                this.closeReason = data.items.map(item => {
                    return {
                        value: item.content,
                        label: item.displayName
                    };
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.$refs['formCustom'].validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                const pendingReason = this.formCustom.desc || this.formCustom.pendingReason;
                try {
                    await api.ticketApi.updateTicket(this.id, {
                        state: '挂起中',
                        pendingReason
                    });
                    this.$mtd.message({
                        message: this.$getText('pend_ticket_tip_state_change', '状态变更成功'),
                        type: 'info'
                    });
                    this.$emit('success');
                    this.close();
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            }
        }).catch(err => console.log(`validate msg: `, err));
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment`;
    }
    get descOverflow () {
        return this.formCustom.desc.length > 5000;
    }
    get ticketId () {
        return this.$route.query.id;
    }
    replyQuick (value: string) {
        this.$set(this.formCustom, 'desc', value);
        this.handleChange(value);
    }
    handleChange (value) {
        this.formCustom.desc = value;
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    async getRgReplyText (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyText({
            rgId: rgId,
            type: 'PENDING_REASON'
        });
        let { code, data } = res;
        if (code === 200) {
            this.replyList = data.items.map(item => item.content);
            this.replyReady = true;
        }
    }
}
</script>