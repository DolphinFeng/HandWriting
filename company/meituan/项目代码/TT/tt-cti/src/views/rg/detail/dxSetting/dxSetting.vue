<template>
    <div class="common-table-list">
        <div class="header group">大象群相关设置</div>
        <div class="group-setting-item">
            <span class="text">默认建群类型</span>
            <mtd-radio-group v-model="settingForm.external" @change="change('external')">
                <mtd-radio :value="false">内部群</mtd-radio>
                <mtd-radio :value="true">外部群</mtd-radio>
            </mtd-radio-group>
        </div>
        <div class="group-setting-item">
            <span class="text">建群拉当前抄送人</span>
            <mtd-switch
                v-model="settingForm.inviteCc"
                @change="change('inviteCc')"
                size="small" />
        </div>
        <div class="group-setting-item">
            <span class="text">新增群成员添加为抄送人</span>
            <mtd-switch
                v-model="settingForm.addCc"
                @change="change('addCc')"
                size="small" />
        </div>
        <div class="group-setting-item">
            <span class="text">默认解散问题处理群聊</span>
            <mtd-switch
                v-model="settingForm.dissolveGroupSwitch"
                @change="change('dissolveGroupSwitch')"
                size="small" />
        </div>
        <div class="group-setting-item">
            <span class="text">绑定业务机器人<mtd-tooltip
                size="small"
                placement="bottom"
                content="接入后，TT创建大象群时会将对应的机器人拉进群聊">
                <i class="mtdicon mtdicon-question-circle-o" />
            </mtd-tooltip></span>
            <mtd-switch
                v-model="settingForm.inviteThirdPartyRobotSwitch"
                @change="onRobotSwitch"
                size="small" />
        </div>
        <div class="bot-setting" v-show="settingForm.inviteThirdPartyRobotSwitch">
            <div
                class="bot-setting-line"
                v-for="(item, index) in settingForm.thirdPartyRobotCtiList"
                :key="index">
                BotId：
                <mtd-input-number
                    size="small"
                    :controls="false"
                    style="width: 150px;"
                    v-model="item.robotId"
                    placeholder="请输入BotId" />
                绑定目录：
                <mtd-select
                    size="small"
                    collapse-tags
                    show-select-all
                    class="cti-select"
                    multiple
                    placeholder="请选择绑定目录"
                    show-checkbox
                    @change="onRobotBindItemChanged(item, $event)"
                    v-model="item.itemList"
                    filterable>
                    <mtd-option
                        v-for="cti in categoryList"
                        :key="cti.itemId"
                        :label="`${cti.categoryName}/${cti.typeName}/${cti.itemName}`"
                        :value="cti.itemId" />
                </mtd-select>
                <mtd-button
                    type="text"
                    icon="mtdicon mtdicon-file-add-o"
                    @click="addBotLine" />
                <mtd-button
                    type="text"
                    v-show="settingForm.thirdPartyRobotCtiList.length > 1"
                    icon="mtdicon mtdicon-delete-o"
                    @click="deleteBotLine(index)" />
            </div>
            <span v-if="showErrorTip" class="error-tip">输入不能为空</span>
            <mtd-button
                size="small"
                type="primary"
                @click="change('thirdPartyRobot')">提交</mtd-button>
        </div>
        <div class="header message">大象消息相关配置</div>
        <div class="message-wrapper">
            <div
                class="message-setting-block"
                v-for="item in contentMap"
                :key="item.key">
                <span class="title">{{ item.title }}</span>
                <mtd-switch
                    v-model="settingForm[item.key]"
                    @change="change(item.key)"
                    size="small" />
                <div class="content-item">
                    发送时间：<span v-if="item.time === 'input'">工单未处理完成，且TT大象群内
                        <mtd-input-number
                            v-model="settingForm[item.inputKey]"
                            @change="change(item.inputKey)"
                            :min="0"
                            :precision="2"
                            size="small" />
                        小时没有新消息且工单无动作</span>
                    <span v-else>{{ item.time }}</span>
                </div>
                <div class="content-item">发送方式：<mtd-radio-group
                    size="small"
                    v-if="item.type === 'radio'"
                    @change="change(item.radioKey)"
                    v-model="settingForm[item.radioKey]">
                    <mtd-radio value="OFFICIAL_ACCOUNT">TT小助手公众号</mtd-radio>
                    <mtd-radio value="CHATROOM_CARD">TT大象群</mtd-radio>
                </mtd-radio-group>
                    <span v-else>{{ item.type }}</span></div>
                <div class="content-item">发送内容：<span>{{ item.content }}</span></div>
                <div class="content-item" v-if="showReciever(item)">
                    通知人：<mtd-checkbox-group v-model="settingForm[item.checkKey]" @input="change(item.checkKey)">
                        <mtd-checkbox
                            size="small"
                            :value="option.value"
                            :key="option.value"
                            v-for="option in item.checkList">{{ option.label }}</mtd-checkbox>
                    </mtd-checkbox-group>
                </div>
            </div>
        </div>
        <dx-setting-member-group />
    </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import { dxSettingMap } from '@/config/map.conf';
import DxSettingMemberGroup from './dxMemberGroup.vue';
@Component({
    components: {
        DxSettingMemberGroup
    }
})

export default class DxSetting extends Vue {
    settingForm: any = {
        external: false,
        inviteCc: false,
        addCc: false,
        welcomeMessage: true,
        assignedUpdate: true,
        ticketReminder: false,
        associateSystemReminder: true,
        satisfyReminder: true,
        reopenReminder: true,
        dissolveGroupSwitch: false,
        ticketReminderTime: 12.0, // 注意这个要带小数点
        satisfyReminderMethod: 'OFFICIAL_ACCOUNT',
        reopenReminderMethod: 'OFFICIAL_ACCOUNT', // 公众号
        associateSystemReminderMethod: 'CHATROOM_CARD', // 消息卡片
        assignedUpdateReminderMethod: 'CHATROOM_CARD', // 消息卡片
        associateSystemAdditionalReceiver: [],
        inviteThirdPartyRobotSwitch: false, // 是否绑定业务机器人
        thirdPartyRobotCtiList: [{
            robotId: null,
            itemList: []
        }]
    };
    contentMap: any[] = dxSettingMap;
    categoryList = [];
    showErrorTip: boolean = false;

    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    showReciever (item) {
        const needReceiverList = ['associateSystemReminder', 'pauseReminder', 'descUpdateReminder'];
        return needReceiverList.includes(item.key) && this.settingForm[item.radioKey] === 'OFFICIAL_ACCOUNT';
    }
    created () {
        this.getDxSetting();
        this.getCtiByRgUnfold();
    }
    addBotLine () {
        this.$set(this.settingForm.thirdPartyRobotCtiList, this.settingForm.thirdPartyRobotCtiList.length, {
            robotId: null,
            itemList: this.categoryList.map(item => item.itemId)
        });
    }
    deleteBotLine (index: number) {
        this.settingForm.thirdPartyRobotCtiList.splice(index, 1);
    }
    async getCtiByRgUnfold () {
        // 直接展示所有数据，不考虑分页
        try {
            const res = await api.rgApi.getCtiByRgUnfold({
                cn: 1,
                sn: 999,
                rgId: this.rgId
            });
            const { code, data } = res;
            if (code === 200) {
                this.categoryList = data.items || [];
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getDxSetting () {
        const res = await api.ticketApi.getDxSetting(this.rgId);
        const { data, code } = res;
        if (code === 200 && data) {
            this.settingForm = data;
            if (!this.settingForm?.thirdPartyRobotCtiList?.length) {
                this.settingForm.thirdPartyRobotCtiList = [{
                    robotId: null,
                    itemList: []
                }];
            }
        }
    }
    validateBotList (): Promise<boolean> {
        return new Promise((resolve) => {
            const isValid = this.settingForm.thirdPartyRobotCtiList.every((item) => {
                return item.robotId && item.itemList.length > 0;
            });
            resolve(isValid);
        });
    }
    async change (type: string) {
        if (type === 'ticketReminderTime' && !this.settingForm[type]) {
            this.$mtd.message.error('提醒时间需大于0');
            this.getDxSetting();
            return;
        }
        const requestParam: any = {};
        requestParam[type] = this.settingForm[type];
        if (type === 'thirdPartyRobot') {
            const valid = await this.validateBotList();
            if (valid) {
                this.showErrorTip = false;
                requestParam.inviteThirdPartyRobotSwitch = true;
                requestParam.thirdPartyRobotCtiList = this.settingForm.thirdPartyRobotCtiList;
            } else {
                this.showErrorTip = true;
                return;
            }
        }
        try {
            const res = await api.ticketApi.setDxSetting({
                rgId: this.rgId,
                ...requestParam
            });
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success('保存成功');
                this.getDxSetting();
            }
        } catch (error) {
            this.getDxSetting();
        }
    }
    onRobotBindItemChanged (item, data) {
        item.itemList = data;
    }
    onRobotSwitch (val) {
        if (!val) {
            this.change('inviteThirdPartyRobotSwitch');
        }
    }
}
</script>

<style lang='postcss' scoped>
.header {
    font-weight: 500;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.84);
    letter-spacing: 0;
    margin-top: 21px;
    &.group {
        margin-bottom: 21px;
    }
    &.message {
        margin-top: 40px;
        margin-bottom: 14px;
    }
}
.group-setting-item {
    margin-bottom: 17px;
    display: flex;
    align-items: center;
    .text {
        margin-right: 20px;
    }
}
.bot-setting {
    .mtd-btn-primary {
        margin-top: 12px;
        position: absolute;
        left: 540px;
    }
    .bot-setting-line {
        display: flex;
        align-items: center;
        .cti-select {
            width: 260px;
            /deep/.mtd-select-tags {
                .mtd-select-choice {
                    max-width: 145px;
                    line-height: 24px;
                }
                .mtd-select-search-line {
                    width: 10px;
                }
                .mtd-select-tags-text {
                    line-height: 24px;
                }
            }
        }
        .mtd-select-small {
            margin: 0 8px;
        }
        .mtd-btn-text {
            padding: 0;
        }
        .mtd-input-number-wrapper {
            text-align: left;
            padding: 0 8px;
            margin: 0 8px;
        }
        .error-tip {
            font-size: 12px;
            color: #FF5F57;
        }
    }
}
.message-wrapper {
    display: flex;
    flex-wrap: wrap;
    width: 1016px;
    justify-content: space-between;
}
.message-setting-block {
    width: 496px;
    flex: 0 0 496px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    .title {
        font-weight: 500;
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        margin-bottom: 12px;
        display: inline-block;
    }
    .mtd-switch {
        float: right;
    }
    .content-item {
        font-size: 12px;
        margin-bottom: 6px;
        /deep/.mtd-input-number-small {
            width: 68px;
            height: 18px;
            .mtd-input-number-handle {
                width: 16px;
                height: 16px;
                font-size: 12px;
                line-height: 16px;
            }
            .mtd-input-number {
                padding: 0 15px;
            }
        }
        /deep/.mtd-checkbox-group {
            display: inline;
            .mtd-checkbox {
                line-height: 18px;
                margin-right: 10px;
            }
        }
    }
}
</style>
