<template>
    <div class="rg-oncall-by-group">
        <div class="operate-line">
            <span class="current-rule">
                <span class="duty-type">{{ oncallModeDisplay }}</span>
            </span>
            <div class="operate-button">
                <mtd-button
                    icon="iconfont icon-oncall-"
                    class="set-oncall-rule"
                    @click="openGroupOncallEditor()"
                    :disabled="!permission">值班设置</mtd-button>
                <mtd-button
                    type="primary"
                    icon="iconfont icon-sousuo-"
                    class="add-onduty-people"
                    @click="openGroupEditor()"
                    :disabled="!permission">添加值班组</mtd-button>
            </div>
        </div>

        <mtd-table
            :data="oncallGroupList"
            row-key="id"
            :cell-class="computeCellClass"
            :row-class="computeRowClass">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                prop="name"
                label="名称"
                class="group-name-column" />
            <mtd-table-column prop="onCallUserListDisplay" label="成员">
                <template slot-scope="scope">
                    <span v-html="scope.row.onCallUserListDisplay" />
                </template>
            </mtd-table-column>

            <mtd-table-column
                prop="isOnCall"
                label="状态"
                v-if="isOncallByGroup">
                <template slot-scope="scope">
                    <span :class="{ isOncall: scope.row.isOnCall }">{{ scope.row.isOnCall ? '在线' : '休息中' }}</span>
                </template>
            </mtd-table-column>

            <mtd-table-column label="操作">
                <template slot-scope="scope">
                    <!-- NOTE: 仅 “轮流值班” 模式下需要手动切换的 “上线” 操作 -->
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        v-if="oncallMode === 'GROUP_TURN' && !scope.row.isOnCall"
                        @click="setGroupOncallStatus({ groupId: scope.row.id, action: 'online' })">
                        上线
                    </mtd-button>
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        :disabled="!permission"
                        @click="openGroupEditor(scope.row)">编辑</mtd-button>
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        :disabled="!permission"
                        @click="confirmDeletion(scope.row.id)">删除</mtd-button>
                </template>
            </mtd-table-column>
        </mtd-table>

        <mtd-modal
            class="oncall-by-group-form-modal"
            title="设置值班规则"
            v-model="showGroupOncallEditor">
            <group-oncall-editor
                :whole-rg-user-list="currentRgUsers"
                :whole-group-list="oncallGroupList"
                :init-data="groupOncallSetting"
                @submit="confirmChange"
                @cancel="closeGroupOncallEditor" />
        </mtd-modal>

        <mtd-modal
            class="oncall-by-group-form-modal"
            :title="groupFormTitle"
            v-model="showGroupEditor">
            <mtd-form
                :model="groupFormData"
                ref="groupForm"
                :rules="groupFormRules">
                <mtd-form-item prop="name" label="值班组名称">
                    <mtd-input
                        placeholder="输入值班组名"
                        v-model="groupFormData.name"
                        type="text" />
                </mtd-form-item>
                <br>
                <mtd-form-item prop="checkedUsers" label="值班组成员">
                    <OverrideTransfer
                        :data="currentRgUsers"
                        v-model="groupFormData.checkedUsers"
                        ref="transfer"
                        :titles="['RG成员', '值班组成员']"
                        filterable />
                </mtd-form-item>
            </mtd-form>

            <div slot="footer" class="demo-modal-footer">
                <mtd-button @click="closeGroupEditor">取消</mtd-button>
                <mtd-button
                    type="primary"
                    @click="submitGroupForm"
                    :disabled="currentRgUsers.length === 0">{{ groupFormSubmitBtnText }}</mtd-button>
            </div>
        </mtd-modal>

    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { get } from 'lodash';
import { State } from 'vuex-class';
import { Form, FormRules } from '@ss/mtd-vue';
import { DutyModeMap, WeekDays } from '@/config/map.conf';
import * as api from '@/api';
import GroupOncallEditor from './group-oncall-editor.vue';

import { OverrideTransfer } from '@/views/components/mtd-override/transfer';

type OncallModeType = 'GROUP_TURN' | 'GROUP_TIME_TURN' | '';

// 文案配置
const GROUP_FORM_WORDING = {
    UPDATE_FORM_TITLE: '编辑值班组',
    ADD_FORM_TITLE: '添加值班组',
    UPDATE_BTN_TEXT: '提交修改',
    ADD_BTN_TEXT: '添加'
};
const GROUP_ONCALL_FORM_WORDING = {
    UPDATE_FORM_TITLE: '修改值班规则',
    ADD_FORM_TITLE: '设置值班规则',
    UPDATE_BTN_TEXT: '提交修改',
    ADD_BTN_TEXT: '提交'
};

@Component({
    name: 'oncall-by-group',
    components: {
        GroupOncallEditor,
        OverrideTransfer: OverrideTransfer
    }
})
export default class OncallByGroup extends Vue {
    @Prop({ default: null })
    rgId: number | null;

    @State(state => state.cti.permission.rg_onCall)
    permission: boolean;

    currentRgUsers: Array<CommonTypes.RgUserItem> = [];

    // 值班模式
    @Prop({ required: true, default: '' })
    oncallMode: OncallModeType;

    get isOncallByGroup () {
        return this.oncallMode === 'GROUP_TIME_TURN' || this.oncallMode === 'GROUP_TURN';
    }

    get oncallModeDisplay () {
        let display = '';
        if (this.oncallMode === 'GROUP_TURN') {
            display = '值班模式: ';
            const cycle = get(this.groupOncallSetting, 'onCallRule.ruleCycle') || '';
            const ruleStart = get(this.groupOncallSetting, 'onCallRule.ruleStart') || '';

            const ruleStartArr = ruleStart.split('-');
            if (cycle === 'week') {
                const startDigit = ruleStartArr.length > 1 && ruleStartArr.shift();
                const idx = parseInt(startDigit, 10) - 1;
                display += `按周轮值 每周${WeekDays[idx]}0点`;
            }
            if (cycle === 'day') {
                const startDigit = ruleStartArr.length > 1 && ruleStartArr.pop();
                display += `按天轮值 每天${startDigit}点`;
            }
            if (cycle === 'day_skip') {
                const startDigit = ruleStartArr.length > 1 && ruleStartArr.pop();
                display += `按天轮值（跳过节假日） 每天${startDigit}点`;
            }
        } else if (this.oncallMode === 'GROUP_TIME_TURN') {
            display = '值班模式: 按固定时间段值班';
        } else {
            display = '当前值班设置为按人值班，如需查看当前值班设置，请切换到 "按人值班" 标签页';
        }

        return display;
    }

    oncallGroupList: any[] = [];

    showGroupEditor: boolean = false;
    groupFormTitle: string = GROUP_FORM_WORDING.ADD_FORM_TITLE;
    groupFormTip: string = '';
    groupFormSubmitBtnText: string = GROUP_FORM_WORDING.ADD_BTN_TEXT;
    groupFormData: { name?: string; checkedUsers?: any[]; onCallUserList?: any[]; [key: string]: any } = {};
    groupFormRules: FormRules = {
        name: { required: true, message: '请输入值班组名称' },
        checkedUsers: {
            required: true,
            // NOTE: TS 类型声明要求必须返回 boolean，MTD 需要改文档或者改 form.d.ts
            validator: (_, value, callback) => {
                if (!Array.isArray(value)) {
                    const e = new Error('请选择值班组成员');
                    callback(e.message);
                    return false;
                }
                if (this.currentRgUsers.length > 0 && value.length === 0) {
                    const e = new Error('请选择至少一个值班组成员');
                    callback(e.message);
                    return false;
                }
                callback();
                return true;
            }
        }
    };

    showGroupOncallEditor: boolean = false;
    groupOncallFormTitle: string = GROUP_ONCALL_FORM_WORDING.ADD_FORM_TITLE;
    groupOncallFormSubmitBtnText: string = GROUP_ONCALL_FORM_WORDING.ADD_BTN_TEXT;
    groupOncallSetting: any = {};

    created () {
        if (!this.rgId) return;

        // 查询值班组列表和他们各自当前的状态
        this.getGroupList();

        // NOTE: 查询当前RG组的员工人员、查询当前RG排班设置，都可以优化为懒加载，当打开响应的弹窗时才加载
        this.getCurrentRgUsers();
        this.getGroupOncallSetting();
    }

    // 查询 group on-call 设置详情
    async getGroupOncallSetting (mode = this.oncallMode) {
        let sendFetchRequest;
        if (mode === 'GROUP_TURN') {
            sendFetchRequest = () => api.rgApi.getGroupOncallSettingCyclic(this.rgId);
        } else if (mode === 'GROUP_TIME_TURN') {
            sendFetchRequest = () => api.rgApi.getGroupOncallSettingFixed(this.rgId);
        } else {
            return;
        }

        try {
            const res = await sendFetchRequest();
            const { code, data } = res;
            if (code === 200) {
                this.groupOncallSetting = data || {};
            } else {
                this.$mtd.message({ type: 'error', message: '查询本 RG 按组值班的设置时出错' });
                this.groupOncallSetting = {};
            }
        } catch (e) {
            console.error(e);
            this.groupOncallSetting = {};
        }
    }

    // NOTE: 分页获取用户列表接口，参照按人值班页查询值班页的 getOncallUserList 方法，限制参数特殊逻辑 limit=10000
    async getCurrentRgUsers () {
        try {
            const res: any = await api.rgApi.getRgUser({
                cn: 1,
                sn: 10000,
                rgId: this.rgId
            });
            const { code, data } = res;
            if (code === 200) {
                this.currentRgUsers = data.items.map(item => {
                    return {
                        ...item,
                        key: item.identify,
                        label: `${item.displayName}(${item.identify})` + (item.active ? '' : ' 离职'),
                        // 离职员工也要考虑
                        disabled: !item.active
                    };
                });
            } else {
                this.$mtd.message({ type: 'error', message: '查询本 RG 下的用户列表出错' });
            }
        } catch (e) {
            console.error(e);
            this.currentRgUsers = [];
        }
    }

    // 初始化时查询 gorup 列表、修改了值班设置后，重新查询
    async getGroupList () {
        try {
            const params = {
                rgId: this.rgId,
                cn: 1, // 值班列表特殊逻辑：不分页
                sn: 10000 // 值班列表特殊逻辑：不分页
            };
            const res = await api.rgApi.getOncallGroupList(params);
            const { code, data } = res;
            if (code === 200) {
                this.oncallGroupList = data.items.map(item => {
                    const html = Array.isArray(item.onCallUserList) && item.onCallUserList.length > 0
                        ? `<span class="cell-text-bold">(${item.onCallUserList.length}人)</span>${item.onCallUserList.map(item => item.displayName).join()}`
                        : '';
                    return Object.assign(item, { onCallUserListDisplay: html });
                });
            }
        } catch (e) {
            this.oncallGroupList = [];
            console.log(e);
        }
    }

    async setGroupOncallStatus ({ groupId, action }) {
        try {
            const res: any = await api.rgApi.setGroupOncallStatus({
                rgId: this.rgId,
                groupId,
                action
            });
            if (res && res.code === 200) {
                this.$mtd.message({ message: '修改成功', type: 'success' });

                this.getGroupList();
            } else {
                this.$mtd.message({ message: `切换值班组出错: ${res.msg}`, type: 'success' });
            }
        } catch (e) {
            console.error(e);
        }
    }

    confirmDeletion (groupId: number) {
        this.$mtd.confirm({
            title: '确定删除该值班组？',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确认',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    const res: any = await api.rgApi.deleteOncallGroup(groupId);
                    if (res && res.code === 200) {
                        this.$mtd.message({
                            message: '删除成功',
                            type: 'success'
                        });
                    }

                    this.getGroupList();
                    this.getGroupOncallSetting();
                } catch (e) {
                    console.error(e);
                }
            }
        }).catch(e => {
            // 点击取消
            console.error(e);
        });
    }

    openGroupEditor (groupInfo?: any) {
        // 如果当前正在值班，不允许修改
        if (this.isOncallByGroup && groupInfo && groupInfo.isOnCall) {
            this.$mtd.message({ message: '值班组正在值班，不能修改', type: 'error' });
            return;
        }

        if (groupInfo == null) {
            // 创建模式
            this.groupFormTitle = GROUP_FORM_WORDING.ADD_FORM_TITLE;
            this.groupFormSubmitBtnText = GROUP_FORM_WORDING.ADD_BTN_TEXT;
        } else {
            this.groupFormTitle = GROUP_ONCALL_FORM_WORDING.ADD_FORM_TITLE;
            this.groupFormSubmitBtnText = GROUP_ONCALL_FORM_WORDING.ADD_BTN_TEXT;
        }

        this.showGroupEditor = true;

        const initFormData = { ...groupInfo, checkedUsers: (groupInfo && groupInfo.onCallUserList || []).map(item => item.identify) };
        this.groupFormData = initFormData;
    }
    closeGroupEditor () {
        this.showGroupEditor = false;
    }

    openGroupOncallEditor (groupOncallInfo?: any) {
        if (groupOncallInfo == null) {
            // 创建模式
            this.groupFormTitle = GROUP_ONCALL_FORM_WORDING.ADD_FORM_TITLE;
            this.groupFormSubmitBtnText = GROUP_ONCALL_FORM_WORDING.ADD_BTN_TEXT;
        } else {
            this.groupFormTitle = GROUP_ONCALL_FORM_WORDING.ADD_FORM_TITLE;
            this.groupFormSubmitBtnText = GROUP_ONCALL_FORM_WORDING.ADD_BTN_TEXT;
        }

        this.showGroupOncallEditor = true;

        /**
         * NOTE: 现在如果要获取目前的设置内容，需要两步:
         * 1. 初始化时 GET /oncall/setting 接口获取 mode 字段，判断出是按组值班
         * 2. 再 GET /on/call/group/setting 获取详细的设置
         */
        const mode = (this.oncallMode === 'GROUP_TURN' || this.oncallMode === 'GROUP_TIME_TURN') ? this.oncallMode : 'GROUP_TURN';
        this.groupOncallSetting = {
            onCallModeName: mode,
            ...this.groupOncallSetting,
            ...groupOncallInfo
        };
    }

    closeGroupOncallEditor () {
        this.showGroupOncallEditor = false;
    }

    computeCellClass ({ columnIndex }) {
        if (columnIndex === 0) {
            return 'cell-text-bold';
        }
        return '';
    }

    computeRowClass ({ row }) {
        if (this.isOncallByGroup && !row.isOnCall) {
            return 'offline';
        }
        return '';
    }

    async confirmChange (data) {
        const currentMode = this.oncallMode;
        // 如果当前没有生效的模式，或者没有变更模式，就直接跳过
        if (currentMode === data.onCallModeName || !currentMode) {
            this.submitGroupOncallForm(data);
            return;
        }

        const currentModeText = DutyModeMap[currentMode];
        const switchTo = DutyModeMap[data.onCallModeName];
        this.$mtd.confirm({
            title: '切换值班模式',
            message: `当前值班模式为 <strong>${currentModeText}</strong>，是否切换为 <strong>${switchTo}</strong>？`,
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            okButtonProps: { type: 'danger' },
            onOk: async () => {
                this.submitGroupOncallForm(data);
            }
        }).catch(e => e);
    }

    // 提交接口
    async submitGroupOncallForm (data) {
        let sendSubmitRequest;
        if (data.onCallModeName === 'GROUP_TURN') {
            sendSubmitRequest = () => api.rgApi.setGroupOncallCyclic({
                groupList: data.groupList,
                onCallRule: data.onCallRule,
                rgId: this.rgId
            });
        }
        if (data.onCallModeName === 'GROUP_TIME_TURN') {
            sendSubmitRequest = () => api.rgApi.setGroupOncallFixedSchedule({
                rgId: this.rgId,
                weekTimeList: data.weekTimeList,
                userList: data.userList
            });
        }

        try {
            const res: any = await sendSubmitRequest();
            if (res && res.code === 200) {
                this.$mtd.message({ message: '设置成功', type: 'success' });

                this.$emit('mode-change', data.onCallModeName);
                this.showGroupOncallEditor = false;

                this.getGroupList();
                this.getGroupOncallSetting(data.onCallModeName);
            } else {
                this.$mtd.message({ message: '设置失败', type: 'error' });
                console.log(res.message);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async submitGroupForm () {
        const groupFormRef = this.$refs.groupForm as Form;
        groupFormRef.validate(async (valid) => {
            if (valid) {
                try {
                    const { id, name, checkedUsers } = this.groupFormData;
                    const payload = {
                        rgId: this.rgId,
                        id,
                        name,
                        onCallUserList: checkedUsers
                    };

                    const existed = !(id == null);
                    const sendSubmitRequest = existed ? () => api.rgApi.updateOncallGroup(id, payload) : () => api.rgApi.addOncallGroup(payload);

                    const res: any = await sendSubmitRequest();
                    const { code } = res;

                    console.log('submit oncall group end:', res);

                    if (code === 200) {
                        this.$mtd.message({
                            message: existed ? '修改值班组成功' : '添加值班组成功',
                            type: 'success'
                        });

                        this.closeGroupEditor();

                        this.getGroupList();
                        this.getGroupOncallSetting();
                    } else {
                        console.error(res.code, res.msg);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                const e = new Error('表单校验不通过');
                (e as any).valid = valid;
                console.error(valid);
            }
        }).catch(e => {
            console.debug('calling validate() on groupForm throws error');
            console.error(e);
        });
    }
}
</script>
<style lang="postcss">
.rg-oncall-by-group {
    position: relative;
}
</style>
