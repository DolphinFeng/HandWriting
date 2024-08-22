<template>
    <div class="sla-container">
        <div class="sla-body">
            <div class="left-content">
                <span class="common-setting-item">等级变更时填写原因<mtd-switch
                    v-model="upgradeReasonRequire"
                    size="small"
                    @change="setSlaSharedSetting" /></span>
                <mtd-form
                    :model="form"
                    ref="form"
                    :inline="true"
                    :rules="ruleCustom"
                    :label-width="90">
                    <div class="sla-div" style="padding-bottom: 0;">
                        <div class="sla-name s1">{{ sla2CN['S1'] }}<span class="sla-desc">（{{ slaTip['S1'] }}）</span>
                            <mtd-tooltip
                                class="noun-explain"
                                placement="top-start"
                                popper-class="explain-popper">
                                <div slot="content" v-html="slaExplain['S1']" />
                                <span class="explain"><i class="mtdicon mtdicon-question-circle-o" />规则说明</span>
                            </mtd-tooltip>
                        </div>
                        <mtd-form
                            class="form-item-wrapper inline-item"
                            :model="form.S1">
                            <mtd-form-item
                                label="提示文案："
                                prop="S1.description">
                                <mtd-input
                                    type="text"
                                    v-model="form.S1.description"
                                    maxlength="30"
                                    @change="(val)=>itemChangeHanler('S1', val)"
                                    style="width: 260px;" />
                            </mtd-form-item>
                            <mtd-form-item
                                label=""
                                prop="S1.displayWhenLauch"
                                :label-width="0">
                                <mtd-checkbox
                                    v-model="form.S1.displayWhenLauch"
                                    @change="(val)=>itemChangeHanler('S1', val)">设置发起人可见</mtd-checkbox>
                            </mtd-form-item>
                        </mtd-form>
                        <div class="form-item-wrapper">
                            <mtd-form-item  prop="S1.response.ruleValue" label="响应时长：">
                                <div slot="label">
                                    响应时长<info-tip :content="slaSettingTip['responseTime']" />
                                </div>
                                <time-input :unit.sync="form.S1.response.ruleUnit" :time.sync="form.S1.response.ruleValue" />
                            </mtd-form-item>
                            <mtd-form-item  prop="S1.resolve.ruleValue" label="解决时长：">
                                <div slot="label">
                                    解决时长<info-tip :content="slaSettingTip['resolveTime']" />
                                </div>
                                <time-input :unit.sync="form.S1.resolve.ruleUnit" :time.sync="form.S1.resolve.ruleValue" />
                            </mtd-form-item>
                            <mtd-form-item class="assistRgs-form" label="协助RG：">
                                <mtd-select
                                    v-model="assistRgs"
                                    placeholder="请输入 Rg"
                                    multiple
                                    :debounce="200"
                                    filterable
                                    remote
                                    @change="(val)=>itemChangeHanler('S1', val)"
                                    :remote-method="remoteMethod">
                                    <mtd-option
                                        v-for="item in userList"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.name" />
                                </mtd-select>
                                <div class="s1-tip">{{ sla2CN['S1'] }}问题发生时需唤醒的其他协助团队</div>
                            </mtd-form-item>
                        </div>
                    </div>
                    <div class="sla-div">
                        <div class="sla-name s2">{{ sla2CN['S2'] }}
                            <span class="sla-desc">（{{ slaTip['S2'] }}）</span>
                            <mtd-tooltip
                                class="noun-explain"
                                :content="slaExplain['S2']"
                                placement="top-start"
                                popper-class="explain-popper">
                                <span class="explain"><i class="mtdicon mtdicon-question-circle-o" />规则说明</span>
                            </mtd-tooltip>
                        </div>
                        <mtd-form class="form-item-wrapper inline-item" :model="form.S2">
                            <mtd-form-item
                                :label-width="90"
                                label="提示文案："
                                prop="S4.description">
                                <mtd-input
                                    type="text"
                                    v-model="form.S2.description"
                                    maxlength="30"
                                    @change="(val)=>itemChangeHanler('S2', val)"
                                    style="width: 260px;" />
                            </mtd-form-item>
                            <mtd-form-item
                                label=""
                                prop="S2.displayWhenLauch"
                                :label-width="0">
                                <mtd-checkbox
                                    v-model="form.S2.displayWhenLauch"
                                    @change="(val)=>itemChangeHanler('S2', val)">设置发起人可见</mtd-checkbox>
                            </mtd-form-item>
                        </mtd-form>
                        <div class="form-item-wrapper">
                            <div class="s2-time">工作时间
                                <info-tip :content="slaSettingTip['workTime']" />
                            </div>
                            <mtd-form-item prop="S2.responseWorkHour.ruleValue" label="响应时长：">
                                <time-input :unit.sync="form.S2.responseWorkHour.ruleUnit" :time.sync="form.S2.responseWorkHour.ruleValue" />
                            </mtd-form-item>
                            <mtd-form-item prop="S2.resolveWorkHour.ruleValue" label="解决时长：">
                                <time-input :unit.sync="form.S2.resolveWorkHour.ruleUnit" :time.sync="form.S2.resolveWorkHour.ruleValue" />
                            </mtd-form-item>
                        </div>
                        <div class="form-item-wrapper">
                            <div class="s2-time">非工作时间
                                <info-tip :content="slaSettingTip['noWorkTime']" />
                            </div>
                            <mtd-form-item prop="S2.response.ruleValue" label="响应时长：">
                                <time-input :unit.sync="form.S2.response.ruleUnit" :time.sync="form.S2.response.ruleValue" />
                            </mtd-form-item>
                            <mtd-form-item prop="S2.resolve.ruleValue" label="解决时长：">
                                <time-input :unit.sync="form.S2.resolve.ruleUnit" :time.sync="form.S2.resolve.ruleValue" />
                            </mtd-form-item>
                        </div>
                    </div>
                    <div class="sla-div">
                        <div class="sla-name s3">{{ sla2CN['S3'] }}
                            <span class="sla-desc">（{{ slaTip['S3'] }}）</span>
                            <mtd-tooltip
                                class="noun-explain"
                                :content="slaExplain['S3']"
                                placement="top-start"
                                popper-class="explain-popper">
                                <span class="explain"><i class="mtdicon mtdicon-question-circle-o" />规则说明</span>
                            </mtd-tooltip>
                        </div>
                        <mtd-form class="form-item-wrapper inline-item" :model="form.S3">
                            <mtd-form-item
                                :label-width="90"
                                label="提示文案："
                                prop="S3.description">
                                <mtd-input
                                    type="text"
                                    v-model="form.S3.description"
                                    maxlength="30"
                                    @change="(val)=>itemChangeHanler('S3', val)"
                                    style="width: 260px;" />
                            </mtd-form-item>
                            <mtd-form-item
                                label=""
                                prop="S3.displayWhenLauch"
                                :label-width="0">
                                <mtd-checkbox
                                    v-model="form.S3.displayWhenLauch"
                                    @change="(val)=>itemChangeHanler('S3', val)">设置发起人可见</mtd-checkbox>
                            </mtd-form-item>
                        </mtd-form>
                        <div class="form-item-wrapper">
                            <mtd-form-item prop="S3.response.ruleValue" label="响应时长：">
                                <time-input :unit.sync="form.S3.response.ruleUnit" :time.sync="form.S3.response.ruleValue" />
                            </mtd-form-item>
                            <mtd-form-item prop="S3.resolve.ruleValue" label="解决时长：">
                                <time-input :unit.sync="form.S3.resolve.ruleUnit" :time.sync="form.S3.resolve.ruleValue" />
                            </mtd-form-item>
                        </div>
                    </div>
                    <div class="sla-div">
                        <div class="sla-name s4">{{ sla2CN['S4'] }}
                            <span class="sla-desc">（{{ slaTip['S4'] }}）</span>
                            <mtd-tooltip
                                class="noun-explain"
                                :content="slaExplain['S4']"
                                placement="top-start"
                                popper-class="explain-popper">
                                <span class="explain"><i class="mtdicon mtdicon-question-circle-o" />规则说明</span>
                            </mtd-tooltip>
                        </div>
                        <mtd-form class="form-item-wrapper inline-item" :model="form.S4">
                            <mtd-form-item
                                :label-width="90"
                                label="提示文案："
                                prop="S4.description">
                                <mtd-input
                                    type="text"
                                    v-model="form.S4.description"
                                    maxlength="30"
                                    @change="(val)=>itemChangeHanler('S4', val)"
                                    style="width: 260px;" />
                            </mtd-form-item>
                        </mtd-form>
                        <div class="form-item-wrapper">
                            <mtd-form-item prop="S4.response.ruleValue" label="响应时长：">
                                <time-input :unit.sync="form.S4.response.ruleUnit" :time.sync="form.S4.response.ruleValue" />
                            </mtd-form-item>
                            <mtd-form-item prop="S4.resolve.ruleValue" label="解决时长：">
                                <time-input :unit.sync="form.S4.resolve.ruleUnit" :time.sync="form.S4.resolve.ruleValue" />
                            </mtd-form-item>
                        </div>
                    </div>
                    <div class="sla-div">
                        <div class="sla-name s5">{{ sla2CN['S5'] }}
                            <span class="sla-desc">（{{ slaTip['S5'] }}）</span>
                            <mtd-tooltip
                                class="noun-explain"
                                :content="slaExplain['S5']"
                                placement="top-start"
                                popper-class="explain-popper">
                                <span class="explain"><i class="mtdicon mtdicon-question-circle-o" />规则说明</span>
                            </mtd-tooltip>
                        </div>
                        <mtd-form class="form-item-wrapper inline-item" :model="form.S5">
                            <mtd-form-item
                                :label-width="90"
                                label="提示文案："
                                prop="S5.description">
                                <mtd-input
                                    type="text"
                                    v-model="form.S5.description"
                                    maxlength="30"
                                    @change="(val)=>itemChangeHanler('S5', val)"
                                    style="width: 260px;" />
                            </mtd-form-item>
                            <mtd-form-item
                                label=""
                                prop="S5.displayWhenLauch"
                                :label-width="0">
                                <mtd-checkbox
                                    v-model="form.S5.displayWhenLauch"
                                    @change="(val)=>itemChangeHanler('S5', val)">设置发起人可见</mtd-checkbox>
                            </mtd-form-item>
                        </mtd-form>
                        <div class="form-item-wrapper">
                            <mtd-form-item prop="S5.response.ruleValue" label="响应时长：">
                                <time-input
                                    :unit.sync="form.S5.response.ruleUnit"
                                    :disabled="form.S5.slaUpgrade"
                                    :time.sync="form.S5.response.ruleValue" />
                            </mtd-form-item>
                            <mtd-form-item prop="S5.resolve.ruleValue" label="解决时长：">
                                <time-input
                                    :unit.sync="form.S5.resolve.ruleUnit"
                                    :disabled="form.S5.slaUpgrade"
                                    :time.sync="form.S5.resolve.ruleValue" />
                            </mtd-form-item>
                            <mtd-checkbox
                                v-model="form.S5.slaUpgrade"
                                @change="(val)=>itemChangeHanler('S5', val)">超出时长不升级</mtd-checkbox>
                        </div>
                    </div>
                </mtd-form>
            </div>
        </div>
        <div class="sla-footer">
            <mtd-button
                :loading="btnLoading"
                @click="submit"
                type="primary">保存</mtd-button>
            <mtd-button @click="cancel" class="close-btn">取消</mtd-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { debounce, pick } from 'lodash';
import { Form } from '@ss/mtd-vue';
import TimeInput from './time-input.vue';
import { Sla2CN, SlaTip, SlaExplain, SlaSettingTip } from '@/config/map.conf';
import { formatTimeStr } from '@/utils/tool.ts';
import infoTip from '@/views/components/info-tip.vue';
import * as api from '@/api';

const validateSlaTime: Function = (_rule, value, callback) => {
    if ((value > 0) && Number.isInteger(Number(value))) {
        return callback();
    }
    return callback(new Error('时长设置必须大于0分钟'));
};
const validateS5ResolveTime: Function = (_rule, value, callback) => {
    if ((value > 0) && Number.isInteger(Number(value)) || value === 'NONE') {
        return callback();
    }
    return callback(new Error('时长设置必须大于0分钟或为“NONE”'));
};
/**
 * SLA设置
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        TimeInput,
        infoTip
    }
})
export default class SlaConfig extends Vue {
    itemChangeHanler: Function = () => {};
    upgradeReasonRequire: boolean = false;
    form: any = {
        S1: {
            description: '',
            displayWhenLauch: false,
            resolve: {},
            response: {},
            assistRgs: []
        },
        S2: {
            description: '',
            displayWhenLauch: false,
            resolve: {},
            response: {},
            resolveWorkHour: {},
            responseWorkHour: {}
        },
        S3: {
            description: '',
            displayWhenLauch: false,
            resolve: {},
            response: {}
        },
        S4: {
            description: '',
            resolve: {},
            response: {}
        },
        S5: {
            description: '',
            displayWhenLauch: false,
            resolve: {},
            response: {}
        }
    };
    ruleCustom = {
        'S1.response.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S1.resolve.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S2.response.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S2.resolve.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S3.response.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S3.resolve.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S4.response.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S4.resolve.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S5.response.ruleValue': [
            { validator: validateSlaTime, trigger: 'blur,change' }
        ],
        'S5.resolve.ruleValue': [
            { validator: validateS5ResolveTime, trigger: 'blur,change' }
        ]
    };
    rgId: number = 0;
    slaConfigInfo: any = [];
    userList: any[] = [];
    checked: Boolean = false;
    assistRgs: string[] = [];
    sla2CN: CommonTypes.mapObject = Sla2CN;
    slaTip: CommonTypes.mapObject = SlaTip;
    slaExplain: CommonTypes.mapObject = SlaExplain;
    FormatTimeStr: Function = formatTimeStr;
    btnLoading: boolean = false;
    slaSettingTip: CommonTypes.mapObject = SlaSettingTip;

    $refs: { form: Form };

    created () {
        this.itemChangeHanler = debounce(this.settingsHandler, 500);
        this.rgId = parseInt(this.$route.query.rgId as string, 10);
        this.getSlaConfig();
    }
    async settingsHandler (item) {
        const propMap = ['rgId', 'name', 'slaUpgrade', 'displayWhenLauch', 'description'];
        const submitData = pick(this.form[item], propMap);
        if (item === 'S1') {
            const assistRgsList = await this.getAssistRgs();
            Object.assign(submitData, {
                assistRgs: {
                    items: assistRgsList
                }
            });
        }
        await api.rgApi.setRgConfig(submitData);
        this.$mtd.message({
            message: '设置SLA成功',
            type: 'success'
        });
    }
    async getSlaConfig () {
        try {
            const res = await api.rgApi.getSlaConfig(this.rgId);
            this.slaConfigInfo = res.data.items;
            this.upgradeReasonRequire = res.data.upgradeReasonRequire;
            this.initForm();
        } catch (e) {
            this.slaConfigInfo = [];
            console.log(e);
        }
    }
    async setSlaSharedSetting () {
        await api.rgApi.setSlaSharedSetting({
            rgId: this.rgId,
            upgradeReasonRequire: this.upgradeReasonRequire
        });
        this.$mtd.message({
            message: '设置SLA成功',
            type: 'success'
        });
    }
    // 初始化表单
    initForm () {
        Object.keys(this.form).forEach(key => {
            this.slaConfigInfo.forEach(item => {
                if (item.name === key) {
                    this.form[key] = item;
                }
            });
        });
        if (this.form.S1.assistRgs && this.form.S1.assistRgs.length) {
            this.assistRgs = this.form.S1.assistRgs.map(item => {
                return item.name;
            });
        }
        if (!(this.form.S2.resolveWorkHour && this.form.S2.responseWorkHour)) {
            const defaultResolve = this.form.S2.resolve;
            this.form.S2.resolveWorkHour = {
                ruleValue: defaultResolve.ruleValue,
                ruleUnit: defaultResolve.ruleUnit,
                ruleExpress: 'LE',
                ruleType: 'SLARESOLVEWORKHOUR'
            };
            const defaultResponse = this.form.S2.response;
            this.form.S2.responseWorkHour = {
                ruleValue: defaultResponse.ruleValue,
                ruleUnit: defaultResponse.ruleUnit,
                ruleExpress: 'LE',
                ruleType: 'SLARESPONSEWORKHOUR'
            };
        }
    }
    async remoteMethod (query) {
        try {
            const res = await api.rgApi.getRgList({ name: query });
            this.userList = res.data.items;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
    }
    redirect () {
        this.$router.push({
            name: 'my_rg'
        }).catch(e => e);
    }
    submit () {
        if (this.btnLoading) {
            return;
        }
        this.$refs.form.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                let assistRgsList = [];
                try {
                    await api.rgApi.setSlaUpgrade({
                        name: 'S5',
                        rgId: (this.form.S5 as any).rgId,
                        slaUpgrade: this.form.S5.slaUpgrade
                    });
                    await api.rgApi.setSlaConfig(this.getConfigParams());
                    assistRgsList = await this.getAssistRgs();
                    await api.rgApi.setRgConfig({
                        name: this.form.S1.name,
                        rgId: this.rgId,
                        assistRgs: {
                            items: assistRgsList
                        }
                    });
                    this.$mtd.message({
                        message: '设置SLA成功',
                        type: 'success'
                    });
                    this.getSlaConfig();
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            } else {
                console.error('Fail!');
            }
        }).catch(e => e);
    }
    cancel () {
        this.$mtd.confirm({
            title: '确认放弃当前修改的内容吗？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                this.getSlaConfig();
            }
        }).catch(e => e);
    }
    // 获取协助rg
    async getAssistRgs () {
        await this.remoteMethod('');
        return this.userList.filter(item => {
            return this.assistRgs.indexOf(item.name) > -1;
        }).map(item => {
            return {
                id: item.id,
                name: item.name
            };
        });
    }
    getConfigParams () {
        const params: any[] = [];
        Object.keys(this.form).forEach(key => {
            const item = this.form[key];
            params.push({
                name: item.name,
                rgId: item.rgId,
                ruleType: 'SLARESOLVE',
                ruleValue: item.resolve.ruleValue,
                ruleUnit: item.resolve.ruleUnit,
                ruleExpress: 'LE'
            });
            params.push({
                name: item.name,
                rgId: item.rgId,
                ruleType: 'SLARESPONSE',
                ruleValue: item.response.ruleValue,
                ruleUnit: item.response.ruleUnit,
                ruleExpress: 'LE'
            });
            item.responseWorkHour && params.push({
                name: item.name,
                rgId: item.rgId,
                ruleType: 'SLARESPONSEWORKHOUR',
                ruleValue: item.responseWorkHour.ruleValue,
                ruleUnit: item.responseWorkHour.ruleUnit,
                ruleExpress: 'LE'
            });
            item.resolveWorkHour && params.push({
                name: item.name,
                rgId: item.rgId,
                ruleType: 'SLARESOLVEWORKHOUR',
                ruleValue: item.resolveWorkHour.ruleValue,
                ruleUnit: item.resolveWorkHour.ruleUnit,
                ruleExpress: 'LE'
            });
        });
        return params;
    }
}
</script>

<style lang="postcss">
.sla-container {
    .inline-item {
        display: flex;
    }
    .sla-body {
        padding-bottom: 50px;
        .sla-div {
            padding: 15px 0 25px 0;
            &:not(:last-child) {
                border-bottom: 1px solid rgba(0, 0, 0, 0.13);
            }
        }
        .sla-name {
            font-family: PingFangSC-Semibold;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.87);
            line-height: 16px;
            border-left: 5px solid #999999;
            padding-left: 8px;
            margin-bottom: 15px;
            &.s1 {
                border-left-color: #FF5F57;
            }
            &.s2 {
                border-left-color: #FF9B54;
            }
            &.s3 {
                border-left-color: #FFCC54;
            }
            &.s4 {
                border-left-color: #3D92F2;
            }
        }
        .sla-desc {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.38);
        }
        .s1-tip {
            font-size: 12px;
            color: #9AA2B4;
        }
        .mtd-form-item-label {
            text-align: left;
        }
        .mtd-form-item {
            margin-right: 0;
            &:not(:last-child) {
                margin-right: 48px;
            }
        }
        .assistRgs-form {
            margin-bottom: 10px;
            .mtd-select {
                width: 100%;
            }
            .mtd-select-tags {
                width: initial !important;
            }
        }
        .mtd-input-group-append .mtd-select .mtd-input-wrapper .mtd-input {
            border: none;
        }
        .mtd-input-wrapper.mtd-select-input.mtd-input-suffix.mtd-input-readonly {
            height: 30px;
        }
        .mtd-input-group {
            width: 140px;
        }
        .mtd-input-group > .mtd-input {
            border-radius: 4px 0 0 4px;
        }
        .s2-time {
            width: 110px;
            line-height: 32px;
            vertical-align: super;
            display: inline-block;
            text-align: right;
            border-right: 1px solid rgba(0, 0, 0, 0.07);
            font-family: PingFangSC-Semibold;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            padding-right: 16px;
            margin-right: 16px;
        }
        .common-setting-item {
            display: flex;
            color: rgba(0, 0, 0, 0.84);
            margin-bottom: 4px;
            .mtd-switch {
                margin-left: 6px;
            }
        }
    }
    .sla-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: right;
        padding: 14px;
        padding-right: 15%;
        border-top: 1px solid rgba(209, 209, 209, 0.8);
        background-color: #FFFFFF;
        .close-btn {
            margin-right: 8px;
        }
    }
    .noun-explain {
        display: inline-block;
        .explain {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            cursor: pointer;
        }
    }
}
.explain-popper {
    font-size: 12px;
}
</style>
