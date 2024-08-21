<template>
    <div class="rg-report-container" v-if="permission">
        <div class="switch-line">
            是否开启邮件报表：
            <mtd-switch
                v-model="sendConfig"
                @change="switchChange"
                size="small" />
        </div>
        <mtd-form
            :model="emailNotifForm"
            :label-width="90"
            ref="emailReportFormRef"
            :rules="ruleCustom"
            v-if="sendConfig"
            class="setting-form">
            <mtd-form-item
                label="发送周期"
                prop="sendCycle"
                class="mtd-form-item-required">
                <mtd-checkbox-group v-model="emailNotifForm.sendCycle">
                    <mtd-checkbox value="day">按天</mtd-checkbox>
                    <mtd-checkbox value="week">按周</mtd-checkbox>
                    <mtd-checkbox value="month">按月</mtd-checkbox>
                </mtd-checkbox-group>
            </mtd-form-item>
            <mtd-form-item
                label="发送时间"
                prop="sendTime"
                class="mtd-form-item-required">
                <mtd-select v-model="emailNotifForm.sendTime">
                    <mtd-option
                        v-for="item in hourOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value" />
                </mtd-select>
                <div class="send-time-description" v-if="sendTimeDescPreview">
                    <template>
                        {{ sendTimeDescPreview }}
                    </template>
                </div>
            </mtd-form-item>
            <mtd-form-item
                required
                label="发送对象"
                prop="sendRole"
                style="margin-bottom: 0;">
                <mtd-radio-group v-model="emailNotifForm.sendRole">
                    <mtd-radio value="NORMAL">RG成员</mtd-radio>
                    <mtd-radio value="RGADMIN">RG管理员及负责人</mtd-radio>
                </mtd-radio-group>
            </mtd-form-item>
            <mtd-form-item prop="sendCc">
                <add-report-cc
                    @change="changeReportCC"
                    :cc-list="emailNotifForm.sendCc" />
            </mtd-form-item>
            <mtd-form-item>
                <mtd-button type="primary" @click="setRgReport">保存</mtd-button>
            </mtd-form-item>
        </mtd-form>

        <hr class="divider">

        <div class="switch-line">
            是否开启大象群通知：
            <mtd-tooltip
                content="向指定大象群发送值班情况与工单处理情况"
                placement="top">
                <i class="mtdicon mtdicon-question-circle-o" />
            </mtd-tooltip>
            <mtd-switch
                v-model="enableXmGroupNotif"
                @change="setXmReportSwitch"
                size="small" />
        </div>
        <mtd-form
            class="setting-form"
            :model="xmReportFormData"
            :label-width="120"
            ref="xmReportFormRef"
            :rules="ruleCustom"
            v-show="enableXmGroupNotif">
            <mtd-form-item
                label="每天发送时间"
                prop="sendTime"
                class="mtd-form-item-required">
                <mtd-time-picker
                    type="time"
                    format="HH:mm"
                    style="width: 420px;"
                    v-model="xmReportFormData.sendTime"
                    placeholder="选择时间" />
            </mtd-form-item>
            <mtd-form-item
                required
                label="大象群"
                prop="xmGroupIds">
                <mtd-select
                    multiple
                    show-checkbox
                    filterable
                    remote
                    :remote-method="searchMyXmGroupList"
                    v-model="xmReportFormData.xmGroupIds"
                    popper-class="xm-group-select-options"
                    placeholder="选择大象群"
                    style="width: 420px;">
                    <mtd-option
                        class="xm-group-item"
                        v-for="item in xmGroupOptions"
                        :key="item.xmGroupId"
                        :value="item.xmGroupId"
                        :label="item.name">
                        <div class="group-with-avatar">
                            <img
                                class="group-avatar"
                                :src="item.avatarUrl"
                                alt="群聊">
                            <div class="group-info">
                                <p class="group-name">{{ item.name }}</p>
                                <p class="secondary-text">
                                    {{ item.xmGroupDesc || item.name }}
                                </p>
                            </div>
                        </div>
                    </mtd-option>
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item>
                <mtd-button
                    :loading="submittingXmReport"
                    type="primary"
                    @click="submitXmReportSettingFn">保存</mtd-button>
            </mtd-form-item>
        </mtd-form>
        <add-robot-guide-modal :visible.sync="showGuideModal" is-rg-report="true" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { omit } from 'lodash';
import { Form } from '@ss/mtd-vue';
import * as api from '@/api';
import AddRgUser from './components/add-rg-user.vue';
import AddReportCc from './components/add-report-cc.vue';
import * as validators from '@/utils/validator';
import AddRobotGuideModal from './moses/addRobotGuideModal.vue';

interface OptionDef<T = any> { value: T; label: string }

const HourOptions: Array<OptionDef<number>> = ([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]).map(hour => {
    return {
        value: hour,
        label: `每天${hour}:00`
    };
});
const baseTime = 8 * 3600 * 1000;

@Component({
    components: {
        AddRgUser,
        AddReportCc,
        AddRobotGuideModal
    }
})
export default class RgReport extends Vue {
    @State(state => state.cti.permission.rg_report)
    permission: boolean;

    showGuideModal: boolean = false;

    $refs: { emailReportFormRef: Form; xmReportFormRef: Form };

    hourOptions: Array<OptionDef<number>> = HourOptions;

    sendConfig: boolean = false;
    emailNotifForm: any = {
        sendCycle: ['day'],
        sendTime: null,
        sendRole: 'NORMAL',
        sendCc: []
    };
    ruleCustom = {
        sendCycle: [
            { validator: validators.validateSendCycle, trigger: 'change' }
        ],
        sendTime: [
            { validator: validators.validateSendTime, trigger: 'change' }
        ],
        xmGroupIds: [
            {
                required: true,
                message: '请选择至少一个大象群'
            }
        ]
    };

    enableXmGroupNotif: boolean = false;
    xmReportFormData: Omit<CommonTypes.RgXmGroupNotifSettingDef, 'rgId'> = {
        id: null,
        sendConfig: false,
        sendTime: null,
        xmGroupIds: []
    };
    xmGroupOptions: Array<CommonTypes.XmGroup> = [];
    recentXmGroupOptions: Array<CommonTypes.XmGroup> = [];

    get sendTimeDescPreview () {
        const { sendTime } = this.xmReportFormData;
        return sendTime ? '将在每天' + this.formatTimestampToTime(sendTime) + '点发送群消息' : '';
    }

    get checkedXmGroupOptions () {
        return this.xmGroupOptions.filter(item => this.xmReportFormData.xmGroupIds.indexOf(item.xmGroupId) > -1);
    }
    formatTimestampToTime(date: Date) {
        var hours = date.getHours();
        var minutes = '0' + date.getMinutes();
        return hours + ':' + minutes.slice(-2);
    }

    async setXmReportSwitch (toggle: boolean) {
        if (this.xmReportFormData.id == null) {
            this.xmReportFormData.sendConfig = toggle;
        } else {
            this.xmReportFormData.sendConfig = toggle;

            try {
                await this.submitXmReportSetting(true);
                const message = toggle ? '已开启' : '已关闭';
                this.$mtd.message({ message, type: 'success' });
            } catch (e) {
                if (e && e.name === 'ValidationError') {
                    return;
                }
                this.$mtd.message({ message: e.message || '操作出错，请稍后重试', type: 'error' });
            }
        }
    }

    applyFormData (data: any) {
        this.xmReportFormData.id = data.id;
        this.xmReportFormData.sendConfig = data.sendConfig;
        this.xmReportFormData.sendTime = data.sendTime;
        this.xmReportFormData.xmGroupIds = data.xmGroupIds || [];
    }

    transformAPIResData (data: CommonTypes.RgXmGroupNotifSettingResponse) {
        const hasAlreadySet = data.rgId && data.xmGroups?.length > 0;
        const setting: CommonTypes.RgXmGroupNotifSettingDef = {
            id: hasAlreadySet ? 1 : null,
            rgId: this.rgId,
            sendConfig: data.sendConfig == null ? false : data.sendConfig,
            sendTime: data.sendTime == null ? null : new Date(data.sendTime - baseTime),
            xmGroupIds: data.xmGroups?.map(item => item.xmGroupId) || []
        };
        const xmGroupItems: Array<CommonTypes.XmGroup> = (data.xmGroups || []).map(item => {
            return {
                name: item.xmGroupName,
                xmGroupId: item.xmGroupId,
                avatarUrl: item.xmGroupAvatarUrl,
                xmGroupDesc: item.xmGroupName
            };
        });

        return {
            setting,
            xmGroupItems
        };
    }

    async getRgXmReportSetting () {
        try {
            const res = await api.rgApi.getRgXmReportSetting(this.rgId);
            const { code, data } = res;
            if (code === 200) {
                const { setting, xmGroupItems } = this.transformAPIResData(data);
                this.enableXmGroupNotif = setting.sendConfig;
                this.applyFormData(setting);
                this.xmGroupOptions = this.xmGroupOptions.concat(xmGroupItems);
            } else {
                this.$mtd.message({ message: res.message, type: 'error' });
            }
        } catch (e) {
            console.log(e);
        }
    }

    async showSuccessMsg (isSwitch) {
        // if (this.xmReportFormData.id == null) {
        // this.$mtd.confirm({
        //     title: '设置成功',
        //     type: 'success',
        //     dangerouslyUseHTMLString: true,
        //     message: '预计<span style="color: red">一个工作日后</span>会向群管理员发送消息推送审核，请您提醒群管理员及时审批，否则信息无法发送到对应群组中',
        //     width: '433px'
        // });
        // return;
        // }
        //

        if (!isSwitch) {
            this.showGuideModal = true;
        }
    }

    submittingXmReport = false;
    async saveRgXmReportSetting (payload: Omit<CommonTypes.RgXmGroupNotifSettingDef, 'rgId'>, isSwitch: boolean) {
        this.submittingXmReport = true;
        try {
            const res = await api.rgApi.saveRgXmReportSetting({
                ...omit(payload, ['id']),
                sendTime: this.getMillisecond(payload.sendTime),
                rgId: this.rgId
            });
            const { code } = res;
            if (code === 200) {
                this.showSuccessMsg(isSwitch);
                // NOTE: 这里后端没返回 id 字段，但前端目前依赖该字段区分是否是全新设置
                this.xmReportFormData.id = 1;
            } else {
                this.$mtd.message({ message: res.message, type: 'error' });
            }
        } catch (e) {
            console.log(e);
        }
        this.submittingXmReport = false;
    }
    getMillisecond (date: Date) {
        if (date) {
            const hour = date.getHours();
            const min = date.getMinutes();
            return (hour * 3600 + min * 60) * 1000;
        } else {
            return 0;
        }
    }
    submitXmReportSettingFn () {
        this.submitXmReportSetting();
    }
    submitXmReportSetting (isSwitch = false) {
        this.$refs.xmReportFormRef.validate((valid) => {
            if (!valid) {
                const e = new Error('校验出错');
                e.name = 'ValidationError';
                throw e;
            }
            return this.saveRgXmReportSetting(this.xmReportFormData, isSwitch);
        }).catch(e => {
            throw e;
        });
    }

    async getRecentXmGroupList () {
        const res = await api.rgApi.getRecentXmGroupList();
        if (res.code === 200) {
            // NOTE: 合并已选中的群聊 和 最近群聊，去重后展示出来
            const xmGroupIds = [...this.checkedXmGroupOptions.map(item => item.xmGroupId), ...res.data.items.map(item => item.xmGroupId)];
            this.recentXmGroupOptions = res.data.items;
            this.xmGroupOptions = [...this.checkedXmGroupOptions, ...res.data.items].filter((item, index) => {
                return xmGroupIds.indexOf(item.xmGroupId) === index;
            });
        }
    }

    async searchMyXmGroupList (query: string) {
        if (!query) {
            return;
        }
        const res = await api.rgApi.searchXmGroupByKeyword(query);
        const { code, data } = res;
        if (code === 200 && Array.isArray(data.items)) {
            const xmGroupIds = [
                ...this.checkedXmGroupOptions.map(item => item.xmGroupId),
                ...data.items.map(item => item.xmGroupId)
            ];
            const computedOptions = [
                ...this.checkedXmGroupOptions,
                ...data.items
            ].filter((item, index) => {
                return xmGroupIds.indexOf(item.xmGroupId) === index;
            });
            this.xmGroupOptions = computedOptions;
        }
    }

    rgId: number = null;

    async created () {
        this.rgId = parseInt(this.$route.query.rgId as string, 10);

        this.getRgEmailReportSetting();

        await this.getRgXmReportSetting();
        this.getRecentXmGroupList();
    }

    changeReportCC (val) {
        this.emailNotifForm.sendCc = val;
    }

    async switchChange (val) {
        if (!val) {
            const res = await api.rgApi.setRgReport(this.rgId, {
                sendConfig: false,
                sendCycle: ['empty'],
                sendTime: 0,
                sendRole: 'empty',
                sendCc: ['empty']
            });
            const { code } = res;
            if (code === 200) {
                this.$mtd.message({
                    type: 'success',
                    message: '修改成功'
                });
            }
        } else {
            this.emailNotifForm = {
                sendCycle: ['day'],
                sendTime: null,
                sendRole: 'NORMAL',
                sendCc: []
            };
        }
    }
    async getRgEmailReportSetting () {
        const res = await api.rgApi.getRgEmailReportSetting(this.rgId);
        const { code, data } = res;
        if (code === 200) {
            this.sendConfig = data.sendConfig;
            if (this.sendConfig) {
                this.emailNotifForm.sendCycle = data.sendCycle;
                this.emailNotifForm.sendTime = data.sendTime;
                this.emailNotifForm.sendRole = data.sendRole;
                this.emailNotifForm.sendCc = data.sendCc;
            }
        }
    }
    async setRgReport () {
        this.$refs.emailReportFormRef.validate(async (valid) => {
            if (valid) {
                const params = {
                    sendConfig: this.sendConfig,
                    sendCycle: this.emailNotifForm.sendCycle,
                    sendTime: this.emailNotifForm.sendTime,
                    sendRole: this.emailNotifForm.sendRole,
                    sendCc: this.emailNotifForm.sendCc
                };
                const res = await api.rgApi.setRgReport(this.rgId, params);
                const { code } = res;
                if (code === 200) {
                    this.$mtd.message({
                        type: 'success',
                        message: '修改成功'
                    });
                }
            }
        }).catch(e => e);
    }
}
</script>

<style lang="postcss">
.rg-report-container {
    position: relative;
    margin-top: 8px;
    .switch-line {
        margin: 15px 0;
    }
    .mtd-switch.mtd-switch-small {
        vertical-align: middle;
    }
    hr.divider {
        margin-top: 24px;
        margin-bottom: 24px;
        height: 1px;
        background-color: rgba(0, 0, 0, 0.06);
    }
    .setting-form {
        max-width: 600px;
        .mtd-form-item {
            margin-bottom: 8px;
        }
    }
}
.xm-group-select-options {
    width: 420px;
    .xm-group-item {
        .mtd-checkbox-text {
            display: inline-block;
        }
        .group-with-avatar {
            display: flex;
            width: 342px;
            padding: 8px 0;
            .group-avatar {
                width: 40px;
                height: 40px;
                border-radius: 20px;
            }
            .group-info {
                margin-left: 12px;
                width: 310px;
                .group-name {
                    font-size: 14px;
                    font-family: PingFangSC-Medium;
                    line-height: 1.5;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    /* width: 100%; */
                }
                .secondary-text {
                    color: rgba(0, 0, 0, 0.36);
                    width: 100%;
                    font-size: 12px;
                    line-height: 1.5;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
            }
        }
    }
}
</style>
