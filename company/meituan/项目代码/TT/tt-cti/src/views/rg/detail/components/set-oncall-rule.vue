<template>
    <mtd-modal
        class="set-oncall-dialog form-dialog"
        :mask-closable="false"
        @close="handleClose"
        v-model="visible">
        <div slot="title">
            <span class="dialog-title">值班设置</span>
        </div>
        <mtd-form :label-width="90">
            <mtd-form-item label="值班模式">
                <mtd-select v-model="dutyMode">
                    <mtd-option
                        v-for="mode of dutyModes"
                        :key="mode.value"
                        :label="mode.label"
                        :value="mode.value" />
                </mtd-select>
                <p class="multi-tip" v-if="isMultiDuty">至少一人在线，多人在线时TT将按需轮流分配</p>
            </mtd-form-item>
        </mtd-form>

        <mtd-form
            v-if="!isMultiDuty"
            :model="singleFormCustom"
            ref="singleFormCustom"
            :label-width="90"
            :rules="ruleCustom">
            <mtd-form-item prop="ruleCycle" label="轮值周期">
                <mtd-select v-model="singleFormCustom.ruleCycle" @change="cycleChange">
                    <mtd-option
                        v-for="value of oncallCycle"
                        :key="value"
                        :label="oncallCycleText[value]"
                        :value="value" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item prop="ruleStart" label="轮换时间点">
                <mtd-select v-model="singleFormCustom.ruleStart" :disabled="!timePoints.length">
                    <mtd-option
                        v-for="(value, index) in timePoints"
                        :key="index"
                        :label="value"
                        :value="index + 1" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                prop="startTime"
                label="轮值顺序"
                class="oncall-order-drop">
                <div class="drop-tip">拖拽人名进行排序<span>共{{ rgOncallList.length }}人</span></div>
                <div class="drop-filter">
                    <Container @drop="onDropEvent">
                        <Draggable v-for="(item, index) in rgOncallList" :key="index">
                            <div class="draggable-item">
                                <img
                                    class="user-img"
                                    :src="item.avatar || defaultAvatar"
                                    alt="头像">
                                <span>{{ `${item.displayName}（${item.identify}）` }}</span>
                                <span class="online-status"><span class="online-icon" />在线</span>
                            </div>
                        </Draggable>
                    </Container>
                </div>
            </mtd-form-item>
        </mtd-form>

        <div class="multi-mode-container checkbox-vertical" v-else>
            <p>选择值班人员
                <span class="choose-tip">已选{{ `${multiUsers.length}/${rgOncallList.length}` }}人</span>
            </p>
            <mtd-checkbox-group style="display: block;" v-model="multiUsers">
                <ul>
                    <li
                        v-for="user in rgOncallList"
                        :key="user.identify"
                        class="user-item">
                        <mtd-checkbox :value="user">
                            <img
                                class="user-img"
                                :src="user.avatar || defaultAvatar"
                                alt="头像">{{ `${user.displayName}(${user.identify})` }}
                        </mtd-checkbox>
                    </li>
                </ul>
            </mtd-checkbox-group>
        </div>
        <div slot="footer">
            <mtd-button @click="handleClose">取消</mtd-button>
            <mtd-button
                :disabled="isMultiDuty && (!paramsMultiUsers.length)"
                :loading="btnLoading"
                type="primary"
                @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { OncallCycle, OncallCycleText, WeekDays, DutyModes, DutyModeMap, DEFAULT_AVATAR } from '@/config/map.conf';
import * as validators from '@/utils/validator';
import * as api from '@/api';
// 拖拽排序插件
import { Container, Draggable } from 'vue-smooth-dnd';
import { applyDrag } from '@/utils/helpers';

import { Form } from '@ss/mtd-vue';

const sanitizeDutyMode = (mode: string) => {
    if (['SINGLE_TURN', 'MULTI_ONLINE'].indexOf(mode) > -1) {
        return mode;
    }
    // 默认是多人在线的
    return 'MULTI_ONLINE';
};

/**
 * 设置轮值规则
 *
 * @author liyuyao
 * @date 04/12/2019
 */
@Component({
    components: {
        Container,
        Draggable
    }
})
export default class SetOncallRule extends Vue {
    @Prop({ default: '' })
    ruleCycle: string;
    @Prop({ default: '' })
    ruleStart: string;
    @Prop({ default: '' })
    duty: string;

    singleFormCustom: any = {
        ruleCycle: 'day',
        ruleStart: ''
    };
    ruleCustom: any = {
        ruleCycle: [
            { validator: validators.validateOncallCycle, trigger: 'change' }
        ],
        ruleStart: [
            { validator: validators.validateOncallStart, trigger: 'change' }
        ]
    };
    visible: Boolean = true;
    btnLoading: Boolean = false;

    dutyMode: string = 'MULTI_ONLINE';

    oncallCycle: string[] = OncallCycle;
    oncallCycleText: any = OncallCycleText;
    dutyModes: any = DutyModes;
    weekDays: string[] = WeekDays;
    rgOncallList: any = [];

    multiUsers: any = [];

    defaultAvatar: string = DEFAULT_AVATAR;

    mounted () {
        this.getRgOncallList();
        this.singleFormCustom.ruleCycle = this.ruleCycle === 'nothing' ? '' : this.ruleCycle;
        this.singleFormCustom.ruleStart = this.ruleStart === 'nothing' ? '' : this.ruleStart;
        this.dutyMode = sanitizeDutyMode(this.duty);
    }
    handleClose () {
        this.$emit('close');
    }
    submit () {
        // HACK: 依赖 this.$parent 获取当前生效的值班模式
        const currentMode = (this.$parent as any).dutyMode;

        // 如果当前没有生效的模式，或者没有变更模式，就直接跳过
        if (!currentMode || currentMode === this.dutyMode) {
            this.isMultiDuty ? this.multiSubmit() : this.singleSubmit();
            return;
        }

        const currentModeText = DutyModeMap[currentMode];
        const switchTo = DutyModeMap[this.dutyMode];
        this.$mtd.confirm({
            title: '切换值班模式',
            message: `当前值班模式为 <strong>${currentModeText}</strong>，是否切换为 <strong>${switchTo}</strong>？`,
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            okButtonProps: { type: 'danger' },
            onOk: async () => {
                this.isMultiDuty ? this.multiSubmit() : this.singleSubmit();
            }
        }).catch(e => e);
    }
    singleSubmit () {
        const singleFormCustom = this.$refs.singleFormCustom as Form;
        singleFormCustom.validate(async (valid) => {
            if (valid) {
                this.setSortAndSetting();
            }
        }).catch(e => e);
    }
    async multiSubmit () {
        const res = await api.rgApi.multiModeSetting({
            rgId: this.rgId,
            mode: 'MULTI_ONLINE',
            users: this.paramsMultiUsers
        });
        if (res.code === 200) {
            this.handleSuccess();
        }
    }
    async setSortAndSetting () {
        this.btnLoading = true;
        try {
            const oncallSuccess = await this.postOncallRule();
            if (oncallSuccess) {
                const sortSuccess = await this.postOncallSort();
                if (sortSuccess) {
                    this.handleSuccess();
                }
            }
        } catch (error) {
            console.error('Error in setSortAndSetting:', error);
        } finally {
            this.btnLoading = false; // 确保按钮加载状态在所有情况下都能被重置
        }
    }
    async postOncallSort () {
        const users = this.rgOncallList.map((item) => {
            return item.identify;
        });
        let success = false;
        const res = await api.rgApi.oncallSort({
            rgId: this.rgId,
            users: users,
            ruleCycle: this.singleFormCustom.ruleCycle
        });
        if (res.code === 200) {
            success = true;
        }
        return success;
    }
    async postOncallRule () {
        const ruleStart = this.handleCycleResult();
        const res = await api.rgApi.singleModeSetting({
            mode: 'SINGLE_TURN',
            rule: {
                rgId: this.rgId,
                ruleCycle: this.singleFormCustom.ruleCycle,
                ruleStart: ruleStart
            }
        });
        if (res.code === 200) {
            this.$emit('sort-success');
        }
        return (res && res.code === 200);
    }
    handleSuccess () {
        this.$mtd.message({
            message: '值班设置成功',
            type: 'success'
        });
        this.$emit('rule-success');
        this.handleClose();
    }
    cycleChange () {
        this.singleFormCustom.ruleStart = null;
    }
    onDropEvent (dropResult) {
        this.rgOncallList = applyDrag(this.rgOncallList, dropResult);
    }
    handleCycleResult () {
        let cycle = '';
        if (this.singleFormCustom.ruleCycle === 'day' || this.singleFormCustom.ruleCycle === 'day_skip') {
            cycle = '0-' + (this.singleFormCustom.ruleStart - 1);
        }
        if (this.singleFormCustom.ruleCycle === 'week') {
            cycle = this.singleFormCustom.ruleStart + '-0';
        }
        return cycle;
    }
    async getRgOncallList () {
        try {
            const res = await api.rgApi.getOncallUserList({ rgId: this.rgId });
            this.rgOncallList = res.data.items;
            this.multiUsers = this.rgOncallList.filter((user) => {
                return user.isOncall === true;
            });
            this.getUserAvatar();
        } catch (e) {
            console.log(e);
        }
    }
    async getUserAvatar () {
        const users = this.rgOncallList.map((user) => {
            return user.identify;
        });
        const res = await api.ctiApi.searchDisplayNameList(users);
        const { code, data } = res;
        if (code === 200) {
            this.rgOncallList.forEach((user, index) => {
                this.$set(this.rgOncallList[index], 'avatar', (data[user.identify] && data[user.identify].avatar) || DEFAULT_AVATAR);
            });
        }
    }
    get timePoints () {
        let pointsList = [];
        if (this.singleFormCustom.ruleCycle === 'day' || this.singleFormCustom.ruleCycle === 'day_skip') {
            for (let i = 0; i < 24; i++) {
                pointsList[i] = `每天${i}点`;
            }
        }
        if (this.singleFormCustom.ruleCycle === 'week') {
            pointsList = this.weekDays.map((num) => {
                return `每周${num}0点`;
            });
        }
        return pointsList;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get isMultiDuty () {
        return this.dutyMode === 'MULTI_ONLINE';
    }
    get paramsMultiUsers () {
        return this.multiUsers.map((user) => {
            return {
                onCallId: user.oncallId,
                misId: user.identify,
                userId: user.id
            };
        });
    }
}
</script>
<style lang="postcss">
    .set-oncall-dialog {
        .mtd-modal {
            width: 480px;
            max-height: 740px;
            border-radius: 3px;
            .mtd-modal-header,
            .mtd-modal-footer {
                background: #F7F8FA;
                padding: 11px 20px;
            }
            .mtd-modal-content-wrapper {
                padding-top: 10px;
                padding-bottom: 0;
            }
        }
        .oncall-order-drop {
            .mtd-form-item-content {
                border: 1px solid #D3D8E4;
            }
            .drop-tip {
                padding: 0 16px;
                span {
                    float: right;
                }
            }
            .drop-filter {
                .smooth-dnd-container.vertical {
                    .smooth-dnd-draggable-wrapper:first-child {
                        .online-status {
                            display: block;
                        }
                    }
                }
                .smooth-dnd-ghost {
                    background: rgba(247, 248, 250, 0.88);
                }
                .draggable-item {
                    cursor: grab;
                    &:active {
                        cursor: -webkit-grabbing;
                    }

                    padding: 5px 16px;
                    span {
                        vertical-align: middle;
                    }
                    .online-status {
                        display: none;
                        float: right;
                        .online-icon {
                            vertical-align: middle;
                            display: inline-block;
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            background: #97D783;
                            margin-right: 8px;
                        }
                    }
                }
            }
        }
        .mtd-modal-close {
            top: 8px;
        }
        .multi-tip {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 20px;
        }
        .multi-mode-container {
            margin: 0 0 20px 90px;
            padding: 8px 14px;
            border: 1px solid rgba(0, 0, 0, 0.13);
            border-radius: 4px;
            .choose-tip {
                float: right;
                color: rgba(0, 0, 0, 0.6);
            }
            .user-item {
                line-height: 36px;
                .mtd-checkbox {
                    width: 100%;
                    .mtd-checkbox-inner {
                        float: right;
                        margin-top: 10px;
                    }
                    &.mtd-checkbox-checked {
                        color: #FF8800;
                    }
                }
            }
        }
        .user-img {
            width: 26px;
            height: 26px;
            margin-right: 10px;
            border-radius: 50%;
            vertical-align: middle;
        }
    }
</style>
