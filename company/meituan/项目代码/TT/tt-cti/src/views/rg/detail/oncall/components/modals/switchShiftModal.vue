<template>
    <mtd-modal
        v-model="showModal"
        :destroy-on-close="true"
        title="换班"
        @close="close"
        class="switch-shift-modal common-modal"
        width="450px">
        <mtd-form
            :model="modalForm"
            :rules="rules"
            :label-width="80"
            ref="modalForm">
            <mtd-form-item
                label="换班人"
                prop="switchProposer">
                <mtd-select
                    v-model="modalForm.switchProposer"
                    placeholder="请输入换班人的mis号"
                    :filterable="true"
                    :debounce="200"
                    :remote="true"
                    style="width: 100%;"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in userOptions"
                        :key="item.identify"
                        :label="`${item.displayName}(${item.identify})`"
                        :value="item.identify" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                label="换班周期"
                prop="dateList">
                <mtd-date-picker
                    type="daterange"
                    value-format="timestamp"
                    :options="ruleDateOptions"
                    v-model="modalForm.dateList"
                    placeholder="请选择换班日期"
                    style="width: 100%;" />
            </mtd-form-item>
            <mtd-form-item
                label="换班原因"
                prop="switchReason">
                <mtd-textarea
                    placeholder="请填写换班原因"
                    type="text"
                    style="width: 100%;"
                    v-model="modalForm.switchReason"
                    rows="3" />
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="close">取消</mtd-button>
            <mtd-button
                type="primary"
                class="tt-pure-btn"
                :loading="btnLoading"
                @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { Form } from '@ss/mtd-vue';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { OncallReportMap } from '@/config/lx.conf';
const TODAY: number = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();

@Component({
    components: {}
})
export default class SwitchShiftModal extends Vue {
    @Prop({ default: false }) visible: boolean;
    @Prop({ default: '' }) proposer: string;

    showModal: boolean = false;
    btnLoading: boolean = false;
    userOptions: CommonTypes.mapObject[] = [];
    modalForm: CommonTypes.mapObject = {
        switchProposer: '',
        dateList: [],
        switchReason: ''
    };
    rules: CommonTypes.mapObject = {
        switchProposer: [{
            validator: (_rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入mis号'));
                } else {
                    callback();
                }
            },
            required: true,
            trigger: 'blur'
        }],
        dateList: [{
            validator: (_rule, value, callback) => {
                if (!value || !value[0] || !value[1]) {
                    callback(new Error('请输入换班时间'));
                } else {
                    callback();
                }
            },
            required: true,
            trigger: 'blur'
        }],
        switchReason: [{
            validator: (_rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入换班原因'));
                } else {
                    callback();
                }
            },
            required: true,
            trigger: 'blur'
        }]
    };
    ruleDateOptions: any = {
        disabledDate (date: any) {
            return date && !((date.getTime() - TODAY) / (1000 * 60 * 60 * 24) > 0 && (date.getTime() - TODAY) / (1000 * 60 * 60 * 24) < 31);
        }
    };

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }

    async submit () {
        const modalForm = this.$refs.modalForm as Form;
        modalForm.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                try {
                    const res = await api.oncallApi.switchOncallMember({
                        rgId: this.rgId,
                        switchProposer: this.modalForm.switchProposer,
                        switchAcceptor: this.proposer,
                        startAt: this.modalForm.dateList[0],
                        endAt: this.modalForm.dateList[1],
                        switchReason: this.modalForm.switchReason
                    });
                    if (res && res.code === 200) {
                        this.btnLoading = false;
                        this.$mtd.message.success('换班成功');
                        lxReportClick(OncallReportMap.submit_switch_oncall);
                        this.$emit('success');
                        this.close();
                    }
                } catch (e) {
                    console.log(e);
                    this.btnLoading = false;
                }
            } else {
                console.error('Fail!');
            }
        }).catch(e => e);
    }
    // 远程搜索用户
    async remoteMethod (query?: any) {
        const params = {
            rgId: this.rgId,
            identify: query || ''
        };
        const res = await api.rgApi.getRgUser(params);
        if (res && res.code === 200) {
            this.userOptions = res.data.items;
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="scss">
.switch-shift-modal {
    .mtd-modal-content-wrapper {
        padding-top: 24px !important;
        padding-bottom: 12px;
    }
}
</style>
