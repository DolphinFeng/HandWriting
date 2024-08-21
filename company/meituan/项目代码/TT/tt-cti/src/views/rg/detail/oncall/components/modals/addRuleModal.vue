<template>
    <mtd-modal
        v-model="showModal"
        :destroy-on-close="true"
        :title="title"
        @close="close"
        class="oncall-rule-modal common-modal"
        width="550px">
        <template slot="title">
            <div class="title">{{ title }}</div>
            <div class="hint">{{ hint }}</div>
        </template>
        <mtd-form
            :model="ruleData"
            :label-width="76"
            ref="ruleForm"
            class="rules-form"
            :rules="rules">
            <mtd-form-item
                prop="name"
                label="规则名称：">
                <mtd-input
                    placeholder="请输入规则名称"
                    style="width: 100%;"
                    v-model.trim="ruleData.name"
                    type="text" />
            </mtd-form-item>
            <mtd-form-item
                prop="date"
                v-if="ruleDateType === 'special'"
                label="值班日期：">
                <mtd-date-picker
                    type="daterange"
                    value-format="timestamp"
                    :options="ruleDateOptions"
                    v-model="ruleData.ruleAtList"
                    placeholder="请选择值班日期"
                    style="width: 100%;" />
            </mtd-form-item>
            <mtd-form-item
                prop="ruleType"
                label="循环模式：">
                <mtd-radio-group v-model="ruleData.ruleType">
                    <mtd-radio value="FIXED_RULE">固定值班</mtd-radio>
                    <mtd-radio value="CYCLICAL_RULE">轮流值班</mtd-radio>
                </mtd-radio-group>
            </mtd-form-item>
            <template v-if="ruleData.ruleType === 'FIXED_RULE'">
                <mtd-form-item
                    prop="shiftType"
                    label="值班班次：">
                    <mtd-radio-group v-model="ruleData.shiftType">
                        <mtd-radio value="WHOLE_DAY">按天</mtd-radio>
                        <mtd-tooltip
                            class="shift-tooltip-wrapper"
                            :disabled="!disableShiftBtn"
                            content="当前RG未配置班次">
                            <mtd-radio :disabled="disableShiftBtn" value="SHIFT">按班次(可多选)</mtd-radio>
                        </mtd-tooltip>
                    </mtd-radio-group>
                    <color-select
                        v-if="ruleData.shiftType === 'SHIFT' && shiftList.length"
                        :multiple="true"
                        :options="colorOptions"
                        @change="onColorChanged" />
                </mtd-form-item>
                <mtd-form-item
                    prop="apply"
                    label="循环应用：">
                    <mtd-select
                        v-model="ruleData.dayOfWeek"
                        style="width: 100%;"
                        multiple
                        clearable>
                        <mtd-option
                            v-for="(item, index) in weekDays"
                            :key="index"
                            :label="`周${item}`"
                            :value="index + 1" />
                    </mtd-select>
                </mtd-form-item>
            </template>
            <mtd-form-item
                prop="circleType"
                v-if="ruleData.ruleType === 'CYCLICAL_RULE'"
                label="轮流方式：">
                <mtd-select
                    v-model="ruleData.cycleType"
                    style="width: 100%;">
                    <mtd-option
                        v-for="item in oncallCycleTypes"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value" />
                </mtd-select>
                <div class="cycle-detail-wrapper">每<mtd-select
                    v-model="ruleData.cycleDay"
                    v-if="ruleData.cycleType === 'BY_WEEK'"
                    class="cycle-week-input">
                    <mtd-option
                        v-for="(item, index) in weekDays"
                        :key="index"
                        :label="`周${item}`"
                        :value="index + 1" />
                </mtd-select>
                    <mtd-input-number
                        v-if="ruleData.cycleType === 'CUSTOM'"
                        v-model="ruleData.cycleDayForCustom"
                        :max="14"
                        :min="1"
                        controls-position="right" />
                    <span v-if="ruleData.cycleType !== 'BY_WEEK'">天</span>
                    <mtd-time-picker
                        type="time"
                        class="cycle-time"
                        format="HH:mm"
                        @input="emitTimeChange"
                        v-model="ruleData.cycleTime"
                        :clearable="true" />触发轮班
                </div>
            </mtd-form-item>
            <mtd-form-item
                :prop="`${ruleData.oncallType === 'BY_USERNAME' ? 'formatOncallUser' : 'oncallGroup'}`"
                label="值班成员：">
                <mtd-radio-group v-model="ruleData.oncallType">
                    <mtd-radio value="BY_USERNAME">按成员</mtd-radio>
                    <mtd-radio value="BY_ONCALL_GROUP">按值班组</mtd-radio>
                </mtd-radio-group>
                <mtd-select
                    v-if="ruleData.oncallType === 'BY_USERNAME'"
                    v-model="ruleData.formatOncallUser"
                    style="width: 100%;"
                    class="oncall-member-select"
                    multiple
                    filterable
                    :debounce="200"
                    remote
                    :loading="searchLoading"
                    :remote-method="searchUser"
                    clearable>
                    <mtd-option
                        v-for="item in oncallMemberList"
                        :key="item.identify"
                        :label="`${item.displayName}/${item.identify}`"
                        :value="`${item.displayName}/${item.identify}`" />
                </mtd-select>
                <mtd-select
                    v-else
                    v-model="ruleData.oncallGroup"
                    style="width: 100%;"
                    class="oncall-member-select"
                    multiple
                    filterable
                    clearable>
                    <mtd-option
                        v-for="item in oncallGroupList"
                        :key="item.identify"
                        :label="item.displayName"
                        :value="`${item.displayName}/${item.identify}`" />
                </mtd-select>
                <mtd-button
                    class="sort-oncall-btn"
                    type="text"
                    size="small"
                    @click="showSortModal = true"
                    v-if="ruleData.ruleType === 'CYCLICAL_RULE'"
                    icon="mtdicon mtdicon-import-export-o">调整轮班顺序</mtd-button>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="close">取消</mtd-button>
            <mtd-button
                type="primary"
                class="tt-pure-btn"
                :loading="btnLoading"
                @click="confirm">确定</mtd-button>
        </div>
        <sort-oncall-member-modal
            v-if="showSortModal"
            @success="onSorted"
            :list="ruleData.oncallType === 'BY_USERNAME' ? ruleData.formatOncallUser : ruleData.oncallGroup"
            :visible.sync="showSortModal"  />
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ColorSelect from '../colorSelect.vue';
import { cloneDeep } from 'lodash';
import { Form } from '@ss/mtd-vue';
import * as api from '@/api';
import SortOncallMemberModal from './sortOncallMemberModal.vue';

import { OncallRulesTable, WeekDays, OncallCycleTypeMap } from '@/config/map.conf';

const baseTime = 8 * 3600 * 1000;
const TODAY: number = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();

const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('规则名称不能为空'));
    }
    if (value.length > 10) {
        return callback(new Error('班次名称不能超过10个字'));
    }
    return callback();
};
const validateMember: Function = (_rule, value, callback) => {
    if (!value || !value.length) {
        return callback(new Error('值班成员不能为空'));
    }
    return callback();
};
@Component({
    components: {
        ColorSelect,
        SortOncallMemberModal

    }
})
export default class AddRuleModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 'add' })
    type: 'add' | 'update';
    @Prop({ default: 'normal' })
    ruleDateType: 'special' | 'normal';
    @Prop({ default: () => ({}) })
    formData: CommonTypes.mapObject;

    tableList: CommonTypes.mapObject = OncallRulesTable;
    oncallCycleTypes: CommonTypes.mapObject[] = OncallCycleTypeMap;
    weekDays: string[] = WeekDays;

    rules = {
        name: [
            { validator: validateName, trigger: 'blur' }
        ],
        formatOncallUser: [
            { validator: validateMember, trigger: 'blur' }
        ],
        oncallGroup: [
            { validator: validateMember, trigger: 'blur' }
        ]
    };
    $refs: {
        ruleForm: Form;
    };

    colorOptions: CommonTypes.mapObject[] = [];
    ruleData: CommonTypes.mapObject = {};
    selectedOncallMember: CommonTypes.mapObject[] = [];
    ruleDateOptions: CommonTypes.mapObject = {
        disabledDate (date: Date) {
            return date && !((date.getTime() - TODAY) / (1000 * 60 * 60 * 24) > 0 && (date.getTime() - TODAY) / (1000 * 60 * 60 * 24) < 16);
        }
    };

    shiftList: CommonTypes.mapObject[] = [];
    oncallMemberList: CommonTypes.mapObject[] = [];
    oncallGroupList: CommonTypes.mapObject[] = [];

    showModal: boolean = false;
    btnLoading: boolean = false;
    searchLoading: boolean = false;
    showSortModal: boolean = false;

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    @Watch('formData', { immediate: true, deep: true })
    onDataChanged () {
        this.ruleData = cloneDeep(this.formData);
        this.ruleData.cycleTime = new Date(this.ruleData.cycleTime - baseTime);
        this.ruleData = {
            ...this.ruleData,
            formatTime: this.getMillisecond(this.ruleData.cycleTime),
            formatOncallUser: this.ruleData.oncallUser?.map(item => `${item.displayName}/${item.identify}`),
            oncallGroup: this.ruleData.oncallGroup?.map(item => `${item.displayName}/${item.identify}`)
        };
    }
    formatSelectWeekDays ({ label }) {
        return label;
    }
    created () {
        this.getShifts();
        this.getOncallGroups();
    }
    async getOncallGroups () {
        const res = await api.oncallApi.getRgGroups({
            rgId: this.rgId
        });
        const { data, code } = res;
        if (code === 200 && data) {
            this.oncallGroupList = data.items || [];
        }
    }
    onSorted (list) {
        if (this.ruleData.oncallType === 'BY_USERNAME') {
            this.ruleData.formatOncallUser = [].concat(list);
        } else {
            this.ruleData.oncallGroup = [].concat(list);
        }
    }
    async getShifts () {
        const res = await api.oncallApi.getShifts(this.rgId);
        const { data, code } = res;
        if (code === 200 && data) {
            this.shiftList = data.items || [];
            this.colorOptions = this.shiftList.map(item => {
                return {
                    color: item.color,
                    label: item.abbreviation,
                    selected: this.ruleData.shiftId?.includes(item.id),
                    disabled: false,
                    id: item.id
                };
            });
        }
    }
    getMillisecond (date) {
        if (date) {
            const hour = date.getHours();
            const min = date.getMinutes();
            return (hour * 3600 + min * 60) * 1000;
        } else {
            return 0;
        }
    }
    async searchUser (query?: string) {
        // if (!query || !query.trim()) {
        //     this.oncallMemberList = [];
        //     return;
        // }
        const params = {
            rgId: this.rgId,
            identify: query || ''
        };
        const res = await api.rgApi.getRgUser(params);
        if (res && res.code === 200) {
            this.oncallMemberList = res.data.items;
            this.searchLoading = false;
        }
    }
    confirm () {
        this.$refs.ruleForm.validate(valid => {
            if (valid) {
                this.addOrUpdateRule();
            }
        }).catch(e => {
            console.log('error: ', e);
            this.btnLoading = false;
        });
    }
    async addOrUpdateRule () {
        this.btnLoading = true;
        try {
            const requestParam: any = {
                ...this.ruleData,
                rgId: this.rgId,
                ruleDateType: this.ruleDateType.toUpperCase(),
                oncallUser: this.ruleData.formatOncallUser?.map(item => item.split('/')[1]),
                oncallGroup: this.ruleData.oncallGroup?.map(item => item.split('/')[1]) || [],
                cycleDay: this.ruleData.cycleType === 'CUSTOM' ? this.ruleData.cycleDayForCustom : this.ruleData.cycleDay,
                cycleTime: this.ruleData.formatTime,
                ruleStartAt: this.ruleData.ruleAtList[0],
                ruleEndAt: this.ruleData.ruleAtList[1],
                shiftType: this.ruleData.ruleType === 'CYCLICAL_RULE' ? null : this.ruleData.shiftType
            };
            const res = await api.oncallApi[`${this.type}RgRule`](requestParam);
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success(`${this.type === 'add' ? '添加' : '编辑'}规则成功`);
                this.btnLoading = false;
                this.$emit('success', this.ruleDateType);
                this.close();
            }
        } catch (error) {
            console.log('error: ', error);
            this.btnLoading = false;
        }
    }
    emitTimeChange () {
        this.ruleData.formatTime = this.getMillisecond(this.ruleData.cycleTime);
    }
    onColorChanged (options) {
        this.ruleData.shiftId = options.filter(item => item.selected).map(item => item.id);
    }
    close () {
        this.$emit('update:visible', false);
    }
    get title () {
        return `${this.type === 'add' ? '添加' : '编辑'}${this.ruleDateType === 'special' ? '特定' : '日常'}值班规则`;
    }
    get hint () {
        return this.tableList.find(item => item.key === this.ruleDateType)[this.type === 'add' ? 'modalHint' : 'modalEditHint'];
    }
    get disableShiftBtn () {
        return !this.shiftList.length;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="scss">
.oncall-rule-modal {
    .mtd-modal-header {
        padding: 20px 24px 12px 24px;
        .title {
            font-size: 18px;
        }
        .hint {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.35);
            font-weight: 500;
        }
    }
    .mtd-modal-close {
        top: 18px;
    }
    .mtd-modal-content-wrapper {
        padding-top: 16px !important;
        padding-bottom: 4px;
    }
    .rules-form {
        .mtd-form-item-label {
            text-align: left;
            padding-right: 4px;
        }
        .shift-tooltip-wrapper {
            height: 22px;
        }
        .color-option-wrapper {
            margin-top: 16px;
        }
        .cycle-detail-wrapper {
            margin-top: 16px;
            .cycle-week-input {
                width: 66px;
                margin-left: 8px;
                .mtd-input {
                    padding: 0 6px;
                }
                .mtd-input-suffix-inner {
                    width: 30px;
                }
            }
            .mtd-input-number-wrapper {
                width: 66px;
                margin: 0 8px;
            }
            .cycle-time {
                width: 66px;
                margin: 0 8px;
                .mtd-input-suffix-inner {
                    display: none;
                }
                .mtd-input {
                    padding-right: 8px;
                }
            }
        }
        .sort-oncall-btn {
            border: none;
            padding: 0;
            color: rgba(0, 0, 0, 0.84);
            .mtd-btn-before {
                color: rgba(0, 0, 0, 0.84);
            }
        }
        .oncall-member-select {
            margin-top: 8px;
        }
    }
}
</style>
