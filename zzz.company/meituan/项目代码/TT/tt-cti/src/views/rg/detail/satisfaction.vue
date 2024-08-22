<template>
    <div class="rg-satisfaction-container" v-if="permission">
        <div class="main-switch-line"><div class="header">开启工单解决满意度评价</div>
            <mtd-switch
                v-model="satisfySettingForm.commentsRequire"
                @change="(val) => switchChange()"
                size="small" />
        </div>
        <div v-show="satisfySettingForm.commentsRequire">
            <div class="basic-setting-header"><div class="title-with-border">基本设置</div></div>
            <mtd-form>
                <div class="switch-line">开启工单处理结束后评价截止时间
                    <mtd-switch
                        v-model="satisfySettingForm.commentsDeadlineRequire"
                        @change="(val) => switchChange()"
                        size="small" />
                </div>
                <mtd-form-item
                    :label-width="130"
                    label="工单处理结束后"
                    prop="maxPushNum">
                    <div class="end-time-setting">
                        <mtd-input-group compact>
                            <mtd-input-number
                                :disabled="!satisfySettingForm.commentsDeadlineRequire"
                                @change="(val) => switchChange()"
                                :max="maxTime"
                                v-model="satisfySettingForm.commentsDeadlineInterval"
                                controls-position="right"
                                :min="minTime" />
                            <mtd-select
                                :disabled="!satisfySettingForm.commentsDeadlineRequire"
                                @change="onDeadlineUnitChanged"
                                v-model="satisfySettingForm.commentsDeadlineUnit">
                                <mtd-option
                                    v-for="(item, index) in timeTypes"
                                    :key="index"
                                    :label="item"
                                    :value="index" />
                            </mtd-select>
                        </mtd-input-group>
                        截止提交评价
                    </div>
                </mtd-form-item>

                <div class="switch-line">开启未评价多次推送
                    <mtd-switch
                        v-model="satisfySettingForm.uncommentMultiPush"
                        @change="(val) => switchChange()"
                        size="small" />
                </div>
                <mtd-form-item
                    :label-width="130"
                    label="发送次数上限"
                    prop="maxPushNum">
                    <mtd-radio-group
                        :disabled="!satisfySettingForm.uncommentMultiPush"
                        @change="(val) => switchChange()"
                        v-model="satisfySettingForm.maxPushNum">
                        <mtd-radio :value="1">1次</mtd-radio>
                        <mtd-radio :value="2">2次</mtd-radio>
                        <mtd-radio :value="3">3次</mtd-radio>
                    </mtd-radio-group>
                </mtd-form-item>
                <mtd-form-item
                    :label-width="130"
                    label="间隔时间"
                    prop="intervalSecond">
                    <mtd-input-number
                        :formatter="formatterIntervals"
                        :parser="parserIntervals"
                        v-model="satisfySettingForm.intervalSecond"
                        @change="(val) => switchChange()"
                        :disabled="!satisfySettingForm.uncommentMultiPush"
                        :max="24"
                        :min="1" />
                </mtd-form-item>
            </mtd-form>
            <div
                class="low-score-reason"
                v-for="obj in scoreInfo"
                :key="obj.type">
                <div class="title-with-border">{{ obj.type === 'dissatisfied' ? '不满意' : '一般' }}评价设置</div>

                <div class="switch-line">
                    {{ obj.type === 'dissatisfied' ? '不满意' : '一般' }}工单自动抄送：
                    <satisfy-notice-receiver :users="obj.ccList" @change="onReceiverChanged($event, obj.type + 'TtToCcEmps')" />
                </div>
                <div class="switch-line">
                    TT小助手推送{{ obj.type === 'dissatisfied' ? '不满意' : '一般' }}评价至：
                    <satisfy-notice-receiver :users="obj.pushList" @change="onReceiverChanged($event, obj.type + 'TtToPushEmps')" />，并且
                    <mtd-select
                        style="width: 70px; margin: 0 4px;"
                        @change="(val) => switchChange()"
                        v-model="satisfySettingForm[obj.type + 'TtGroupJoinRequire']">
                        <mtd-option
                            v-for="item in settingOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value" />
                    </mtd-select>
                    重新打开工单时自动入群
                </div>
                <div class="switch-line">{{ obj.type === 'dissatisfied' ? '不满意' : '一般' }}评价时原因必填
                    <mtd-switch
                        v-model="satisfySettingForm[obj.type + 'ReasonRequire']"
                        @change="(val) => switchChange()"
                        size="small" />
                </div>
                <div class="switch-line">{{ obj.type === 'dissatisfied' ? '不满意' : '一般' }}原因：
                    <mtd-tag
                        :key="reason"
                        :closeable="obj.reasonList.length > 1"
                        v-for="(reason, index) in obj.reasonList"
                        theme="gray"
                        type="pure"
                        style="margin-right: 4px;"
                        @close="deleteReason(obj.type, reason, index)">{{ reason }}</mtd-tag>
                    <mtd-button
                        type="text"
                        icon="mtdicon mtdicon-file-add-o"
                        :disabled="obj.reasonList.length >= (obj.type === 'dissatisfied' ? 7 : 9)"
                        @click="addReason(obj.type)">添加</mtd-button>
                </div>
            </div>
            <div
                class="low-score-reason">
                <div class="title-with-border">未解决评价设置</div>
                <div class="switch-line">是否为发起人推送问题解决评价
                    <mtd-switch
                        v-model="satisfySettingForm.resolvedOptionDisplay"
                        @change="(val) => {
                            this.satisfySettingForm.unresolvedTtToCcEmps = {};
                            switchChange()
                        }"
                        size="small" />
                </div>
                <div class="switch-line" v-if="satisfySettingForm.resolvedOptionDisplay">
                    未解决工单自动抄送：
                    <satisfy-notice-receiver
                        :users="satisfySettingForm.unresolvedTtToCcEmps"
                        :fixed-receiver-options="
                            [{ role: 'LEVEL_ONE_LEADER', label: '一级主管', misId: null, value: 'LEVEL_ONE_LEADER' },
                             { role: 'LEVEL_TWO_LEADER', label: '二级主管', misId: null, value: 'LEVEL_TWO_LEADER' }
                            ]"
                        @change="onReceiverChanged($event, 'unresolvedTtToCcEmps')" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as api from '@/api';
import { debounce } from 'lodash';
import TimeInput from './sla/time-input.vue';
// import * as validators from '@/utils/validator';
import SatisfyNoticeReceiver from './satisfaction/satisfy-notice-component.vue';
import { TimeTypes } from '@/config/map.conf';

const oneHour: number = 60 * 60;
const CreateGroupSettingOptions = [{
    value: true,
    label: '开启'
}, {
    value: false,
    label: '关闭'
}];

const CommentsDeadlineMaxAndMin = {
    MINUTE: {
        min: 1,
        max: 4320
    },
    HOUR: {
        min: 1,
        max: 720
    },
    DAY: {
        min: 1,
        max: 365
    },
    WEEK: {
        min: 1,
        max: 4320
    }
};
/**
 * rg成员列表
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        TimeInput,
        SatisfyNoticeReceiver
    }
})
export default class RgSatisfaction extends Vue {
    @State(state => state.cti.permission.rg_satisfaction)
    permission: boolean;

    timeTypes: CommonTypes.mapObject = TimeTypes;
    commentsDeadlineMaxAndMin: CommonTypes.mapObject = CommentsDeadlineMaxAndMin;

    satisfySettingForm: CommonTypes.mapObject = {
        commentsRequire: true,
        commentsDeadlineRequire: false,
        commentsDeadlineInterval: 1,
        commentsDeadlineUnit: 'HOUR',
        maxPushNum: 1,
        intervalSecond: 1,
        uncommentMultiPush: true,
        dissatisfiedTtToCcEmps: {},
        dissatisfiedTtToPushEmps: {},
        dissatisfiedTtGroupJoinRequire: false,
        dissatisfiedReasonRequire: false,
        dissatisfiedReasons: [],
        commonTtToCcEmps: {},
        commonTtToPushEmps: {},
        commonTtGroupJoinRequire: true,
        commonReasonRequire: true,
        commonReasons: [],
        resolvedOptionDisplay: true,
        unresolvedTtToCcEmps: {},
    };
    settingOptions: CommonTypes.mapObject[] = CreateGroupSettingOptions;

    scoreInfo: any = {
        dissatisfied: {
            type: 'dissatisfied',
            ccList: [],
            pushList: [],
            reasonList: [],
        },
        common: {
            type: 'common',
            ccList: [],
            pushList: [],
            reasonList: [],
        }
    };

    switchChange: Function;

    created () {
        this.switchChange = debounce(this.setSatisfactionFunc, 500);
        this.getSatisfaction();
    }

    onReceiverChanged (val, key) {
        this.satisfySettingForm[key] = val;
        this.switchChange();
    }

    onDeadlineUnitChanged () {
        // 切换时间unit时，更新数值为最接近的合法值
        // 如果大于新unit的max，置为max；如果小于新unit的min，置为min
        const { commentsDeadlineInterval, commentsDeadlineUnit } = this.satisfySettingForm;
        const max = this.commentsDeadlineMaxAndMin[commentsDeadlineUnit]?.max;
        const min = this.commentsDeadlineMaxAndMin[commentsDeadlineUnit]?.min;
        if (commentsDeadlineInterval > max) {
            this.satisfySettingForm.commentsDeadlineInterval = max;
        } else if (commentsDeadlineInterval < min) {
            this.satisfySettingForm.commentsDeadlineInterval = min;
        }
        this.switchChange();
    }
    async getSatisfaction () {
        if (!Number(this.rgId)) {
            return;
        }
        const { code, data } = await api.ctiApi.getSatisfation({ rgId: Number(this.rgId) });
        if (code === 200) {
            const { rgId, id, createdBy, createdAt, updatedAt, updatedBy, ...rest } = data;
            this.satisfySettingForm = {
                ...rest,
                maxPushNum: data.maxPushNum || 1,
                intervalSecond: data.intervalSecond / oneHour || 1
            };
            this.scoreInfo.dissatisfied = {
                type: 'dissatisfied',
                ccList: this.satisfySettingForm.dissatisfiedTtToCcEmps || [],
                pushList: this.satisfySettingForm.dissatisfiedTtToPushEmps || [],
                reasonList: this.satisfySettingForm.dissatisfiedReasons || []
            };
            this.scoreInfo.common = {
                type: 'common',
                ccList: this.satisfySettingForm.commonTtToCcEmps || [],
                pushList: this.satisfySettingForm.commonTtToPushEmps || [],
                reasonList: this.satisfySettingForm.commonReasons || []
            };
        }
    }
    formatterIntervals (num) {
        return `${num}小时`;
    }
    parserIntervals (num) {
        return num.replace('小时', '');
    }
    /**
     * 当原因发生改变时的处理函数
     * @param {string} key - satisfySettingForm的键值
     * @param {string} operate - 操作类型，可以是 'add' 或 'delete'
     * @param {string|number} data - 数据，当 operate 为 'add' 时为新增的 reason，当 operate 为 'delete' 时为要删除的索引
     */
    onReasonChanged (key, operate: 'add' | 'delete', data) {
        if (operate === 'add') {
            this.satisfySettingForm[key].push(data);
        } else {
            this.satisfySettingForm[key].splice(data, 1);
        }
        this.switchChange();
    }
    async setSatisfactionFunc () {
        const { code, message } = await api.ctiApi.setSatisfaction({
            rgId: Number(this.rgId),
            ...this.satisfySettingForm,
            intervalSecond: this.satisfySettingForm.intervalSecond * oneHour,
        });
        if (code === 200) {
            this.$mtd.message.success('保存成功');
            this.getSatisfaction();
        } else {
            this.$mtd.message.error(message);
        }
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get maxTime () {
        return this.commentsDeadlineMaxAndMin[this.satisfySettingForm.commentsDeadlineUnit]?.max;
    }
    get minTime () {
        return this.commentsDeadlineMaxAndMin[this.satisfySettingForm.commentsDeadlineUnit]?.min;
    }

    addReason (type: string) {
        this.$mtd.confirm({
            title: `添加${type === 'dissatisfied' ? '不满意' : '一般'}原因`,
            message: '<input id="add-low-score-reason" class="mtd-input" style="width: 100%" />',
            dangerouslyUseHTMLString: true,
            onOk: async () => {
                const inputElement = document.getElementById('add-low-score-reason') as HTMLInputElement;
                const newReason = inputElement.value;
                if (newReason.length) {
                    if (newReason.includes(',') || newReason.includes(';')) {
                        this.$mtd.message.error('原因中不能包含“, ;”等特殊字符，请重新输入');
                        return Promise.reject(new Error('原因中不能包含“, ;”等特殊字符，请重新输入'));
                    }
                    this.onReasonChanged(type + 'Reasons', 'add', newReason);
                }
            }
        }).catch(e => e);
    }
    deleteReason (type: string, reason: string, index: number) {
        this.$mtd.confirm({
            title: `删除${type === 'dissatisfied' ? '不满意' : '一般'}原因`,
            message: `确定要删除${type === 'dissatisfied' ? '不满意' : '一般'}原因“${reason}”吗？`,
            type: 'warning',
            dangerouslyUseHTMLString: true,
            onOk: async () => {
                this.onReasonChanged(type + 'Reasons', 'delete', index);
            }
        }).catch(e => e);
    }
}
</script>

<style lang="postcss">
.rg-satisfaction-container {
    padding-top: 12px;
    .main-switch-line {
        display: inline-flex;
        margin: 14px 0 10px 0;
        align-items: center;
    }
    .title-with-border {
        margin-bottom: 12px;
    }
    .header {
        /* font-size: 16px; */
        font-weight: 600;
        margin-right: 4px;
        display: inline-block;
    }
    .basic-setting-header {
        /* border-top: 1px solid rgba(0, 0, 0, 0.06); */
        padding-top: 16px;
    }
    .switch-line {
        color: rgba(0, 0, 0, 0.87);
        line-height: 32px;
        display: flex;
        align-items: center;
        padding: 4px 0 4px 10px;
        .mtd-switch {
            margin-left: 4px;
        }
        .satisfy-receiver-select {
            margin-right: 4px;
        }
    }
    .low-score-reason {
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        padding: 16px 0;
    }
    .mtd-form {
        .end-time-setting {
            display: flex;
            .mtd-input-group {
                width: 150px;
                display: inline-block;
                margin-right: 8px;
                .mtd-input-number-wrapper {
                    width: 80px;
                    .mtd-input-number {
                        padding: 0 36px 0 8px;
                    }
                }
                .mtd-select {
                    width: 70px;
                }
            }
        }
    }
}
#add-low-score-reason {
    height: 32px;
    padding: 0 4px;
}
</style>
