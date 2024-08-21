<template>
    <div class="ticket-state-title">
        <StatePicker
            :options="slaOptions"
            :value.sync="value"
            :class="`ticket-sla-selected sla-type-${info.sla}`"
            :disabled="!itemPermission('sla').editable"
            @change="selectChange">
            <div slot="selected">
                {{ $getText(Sla2CN[info.sla]) }}
            </div>
        </StatePicker>
        <mtd-modal
            class="sla-change-modal"
            :mask-closable="false"
            width="400px"
            :title="$getText('ticket_sla_change_modal_title', 'TT工单SLA等级变更')"
            @close="closeModal"
            v-model="showChangeModal">
            <mtd-form
                :model="slaChangeForm"
                ref="slaChangeForm"
                :label-width="80">
                <mtd-form-item
                    :label="$getText('ticket_sla_change_modal_reason_label', '变更原因')"
                    required
                    :rules="validateReason"
                    prop="slaChangeReason">
                    <mtd-textarea
                        class="catalog-level-cascader"
                        style="width: 100%;"
                        :row="3"
                        v-model="slaChangeForm.slaChangeReason" />
                </mtd-form-item>
            </mtd-form>
            <div slot="footer">
                <mtd-button @click="closeModal">{{ $getText('ticket_sla_change_modal_cancel_btn', '取消') }}</mtd-button>
                <mtd-button
                    :loading="submitBtnLoading"
                    type="primary"
                    @click="submitSlaAndReason">{{ $getText('ticket_sla_change_modal_submit_btn', '提交') }}</mtd-button>
            </div>
        </mtd-modal>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { TicketSla, Sla2CN, SLA_RULE_DESC, SlaOptions } from '@/config/map.conf';
import StatePicker from '@/components/state-picker.vue';
import { itemPermission } from '@/utils/tools';

import get from 'lodash.get';
import sortBy from 'lodash.sortby';

import eventBus from '@/utils/event-bus';

import * as api from '@/api';

interface SlaChangeForm {
    sla: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
    slaChangeReason: string;
}
@Component({
    components: {
        StatePicker
    }
})
export default class TicketSlaChange extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    info: any;

    @Prop({ default: 'normal' })
    size: string;
    onCancel: boolean = false;
    Sla2CN: CommonTypes.mapObject = Sla2CN;
    ticketSla: string[] = TicketSla;
    // oldVal: string = '';

    value: string = '';

    slaOptions: CommonTypes.mapObject = SlaOptions; // 取一个默认值，首屏dom不变化
    itemPermission: Function = itemPermission;
    upgradeReasonRequire: boolean = false;
    showChangeModal: boolean = false;
    submitBtnLoading: boolean = false;
    slaChangeForm: SlaChangeForm = {
        sla: 'S5',
        slaChangeReason: ''
    };
    validateReason = {
        validator: (_rule, value, callback) => {
            if (!value || /^\s*$/.test(value)) {
                // 为空或者只有空格换行也不行
                return callback(new Error(this.$getText('ticket_sla_change_modal_reason_required', '变更原因不能为空')));
            }
            return callback();
        }
    };
    @Watch('info')
    onInfoChange (info, oldInfo) {
        this.value = info.sla;
        // 如果rg变化 获取当前rg的sla等级设置
        if (!oldInfo || (oldInfo && oldInfo.rgId !== info.rgId)) {
            this.getSlaConfig();
        }
    }

    selectChange (val) {
        this.onCancel = false;
        const oldVal = this.info.sla;
        if (!oldVal || val === oldVal) return;
        // 新值需要警告，并且原本不是最高等级，而且新值较旧值升级了
        // undefined 和 string比较大小均为false
        if (['S1', 'S2'].includes(val) && oldVal !== 'S1' && (get(val, '1') < get(oldVal, '1'))) {
            this.$mtd.confirm({
                title: val === 'S1' ? this.$getText('ticket_sla_change_modal_urgent_confirm', '选择非常紧急会抄送您的上级') : this.$getText('ticket_sla_change_modal_confirm_title', '确定使用该等级？'),
                message: this.$getText(SLA_RULE_DESC[val]),
                width: '460px',
                type: 'warning',
                okButtonText: this.$getText('ticket_sla_change_modal_confirm_btn', '确定'),
                onOk: this.submitSla ,
                cancelButtonText: this.$getText('ticket_sla_change_modal_cancel_btn', '取消'),
                onCancel: this.cancelSlaChanging,
                showCancelButton: true
            }).catch(e => e);
        } else {
            if (this.onCancel) {
                this.onCancel = false;
            } else {
                this.submitSla();
            }
        }
    }
    cancelSlaChanging () {
        this.onCancel = true;
        this.value = this.info.sla;
    }
    closeModal () {
        this.cancelSlaChanging();
        this.slaChangeForm.slaChangeReason = '';
        this.showChangeModal = false;
    }
    submitSlaAndReason () {
        this.$refs['slaChangeForm']?.validate(async (valid) => {
            if (valid) {
                this.submit('sla', this.value);
            }
        }).catch(err => console.log(`validate msg: `, err));
    }
    async submitSla () {
        // 如果配置了 变更原因必填 ，展示弹窗
        if (this.upgradeReasonRequire) {
            this.showChangeModal = true;
        } else {
            await this.submit('sla', this.value);
        }
    }
    async submit (param, result) {
        try {
            this.submitBtnLoading = true;
            let obj = {};
            obj[param] = result;
            await api.ticketApi.updateTicket(this.ticketId, {
                ...obj,
                slaChangeReason: this.slaChangeForm.slaChangeReason
            });
            this.info[param] = result;
            this.$mtd.message({
                message: this.$getText('ticket_sla_change_modal_edit_success', '编辑成功'),
                type: 'success'
            });
            this.submitBtnLoading = false;
            this.closeModal();
            this.$emit('update');
            eventBus.$emit('updateTicket', {
                ticketId: this.ticketId,
                key: param,
                value: result
            });
        } catch (e) {
            console.log(e);
            this.submitBtnLoading = false;
        }
    }
    async getSlaConfig () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getSlaConfigGlobal(this.info.rgId);
            const slaSettings = res.data.items;
            console.log(slaSettings);
            this.slaOptions = sortBy(slaSettings, ['name']).filter(item => {
                return item.displayWhenLauch;
            }).map(item => {
                return {
                    value: item.name,
                    label: this.$getText(Sla2CN[item.name]),
                    instruction: item.description
                };
            });
            this.upgradeReasonRequire = res.data.upgradeReasonRequire || false;
        } catch (e) {
            console.log(e);
        }
    }
    get ticketId () {
        return this.$route.query.id;
    }
}
</script>

<style lang="scss">
.ticket-state-title {
    display: inline-block;
    .mtd-picker-selection {
        padding: 0 12px;
        border-radius: 4px;
        background: #fff;
        // width: 88px;
        color: #fff;
        .mtdicon-down-thick {
            vertical-align: middle;
            color: #fff;
        }
    }
    .sla-type-S1 {
        .mtd-picker-selection {
            max-width: 120px;
            background-color: #f5483b;
        }
    }
    .sla-type-S2 {
        .mtd-picker-selection {
            background-color: #f5483b;
        }
    }
    .sla-type-S3 {
        .mtd-picker-selection {
            background-color: #f80;
        }
    }
    .sla-type-S4 {
        .mtd-picker-selection {
            background-color: #0a70f5;
        }
    }
    .sla-type-S5 {
        .mtd-picker-selection {
            background-color: #929292;
        }
    }
}
.sla-change-modal {
    .mtd-modal-content-wrapper {
        padding-bottom: 4px;
    }
}
</style>
