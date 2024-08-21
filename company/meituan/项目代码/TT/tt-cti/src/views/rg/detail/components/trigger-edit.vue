<template>
    <div class="trigger-edit-container">
        <div class="trigger-edit-form-container">
            <h2>添加触发器</h2>
            <mtd-form
                :rules="rules"
                :model="form"
                ref="form">
                <div class="trigger-info-card">
                    <h3>基本信息</h3>
                    <mtd-form-item
                        class="mtd-form-item-required"
                        label="标题："
                        :label-width="120"
                        prop="name">
                        <mtd-input
                            type="text"
                            v-model="form.name"
                            style="width: 100%;" />
                    </mtd-form-item>
                    <mtd-form-item
                        class="mtd-form-item-required"
                        label="触发时间："
                        :label-width="120"
                        prop="triggerTime">
                        <mtd-select v-model="form.triggerTime" style="width: 320px;">
                            <mtd-option
                                v-for="time in triggerTimeOptions"
                                :key="time.value"
                                :label="time.label"
                                :value="time.value" />
                        </mtd-select>
                    </mtd-form-item>
                </div>
                <div class="trigger-info-card">
                    <h3>触发条件（如果）</h3>
                    <trigger-conditions
                        :conditions="conditionGroupDo"
                        :item-logic="itemLogic"
                        :submit-single="submitSingle"
                        @change="conditionChange"
                        @error="hasConditionError" />
                </div>
                <div class="trigger-info-card last-card">
                    <h3>执行动作（则）</h3>
                    <trigger-actions
                        :actions="actionDO"
                        :submit-single="submitSingle"
                        @change="actionChange"
                        @error="hasActionError" />
                </div>
            </mtd-form>
        </div>
        <div class="steps-footer">
            <div class="footer-center-container">
                <mtd-button @click="cancelBack" class="close-btn">取消</mtd-button>
                <mtd-button
                    :loading="btnLoading"
                    type="primary"
                    @click="submit">提交</mtd-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Form } from '@ss/mtd-vue';
import * as api from '@/api';
import { getStringLength } from '@/utils/tool';
import { triggerTimeOptions } from '@/config/map.conf';
import TriggerConditions from './trigger/trigger-conditions.vue';
import TriggerActions from './trigger/trigger-actions.vue';
/**
 * 美维工单 迁移页面
 *
 * @author liyuyao
 * @date 07/09/2019
 */
@Component({
    components: {
        TriggerConditions,
        TriggerActions
    }
})
export default class TriggerEdit extends Vue {
    submitSingle: number = 0;

    btnLoading: boolean = false;
    form: any = {
        name: '',
        triggerTime: 'BEFORE_TT'
    };
    triggerTimeOptions: any = triggerTimeOptions;
    // 对应conditionGroups字段
    conditionGroupDo: CommonTypes.conditionGroupDo[] = [];
    // 对应actions字段
    actionDO: CommonTypes.actionDoItem[] = [];
    // 对应itemLogic字段，标识条件组之间关系
    itemLogic: string = '';

    actionError: boolean = true;
    conditionError: boolean = true;

    rules: any = {
        name: [{
            validator: (_rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入触发器标题'));
                } else if (getStringLength(value) > 40) {
                    callback(new Error('标题不能超过40个字符'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }],
        triggerTime: [{
            validator: (_rule, value, callback) => {
                if (!value) {
                    callback(new Error('请选择触发时间'));
                } else {
                    callback();
                }
            },
            trigger: 'change'
        }]
    };
    mounted () {
        this.triggerId && this.getTriggerDetail();
    }
    cancelBack () {
        this.$mtd.confirm({
            title: '确定要离开吗？系统可能不会保存您所做的更改',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                this.$router.push({
                    name: 'rg_trigger',
                    query: {
                        rgId: `${this.rgId}`,
                        cn: this.$route.query.cn
                    }
                }).catch(e => e);
            }
        }).catch(e => e);
    }
    submit () {
        this.submitSingle++;
        setTimeout(() => {
            this.formatSubmit();
        }, 0);
    }
    hasConditionError (error) {
        this.conditionError = error;
    }
    hasActionError (error) {
        this.actionError = error;
    }
    $refs: {
        form: Form;
    };
    async formatSubmit () {
        this.$refs.form.validate(async (valid) => {
            console.log(valid, this.conditionError, this.actionError);
            if (valid && (!this.conditionError) && (!this.actionError)) {
                const submitForm: CommonTypes.triggerForm = {
                    name: this.form.name,
                    scene: 'RG',
                    sceneId: this.rgId,
                    active: false,
                    triggerTime: this.form.triggerTime,
                    conditionGroups: this.conditionGroupDo,
                    actions: this.actionDO,
                    itemLogic: this.itemLogic
                };
                if (this.triggerId) submitForm.id = this.triggerId;
                const res = this.triggerId ? await api.ruleApi.updateTrigger(this.triggerId, submitForm) : await api.ruleApi.createTrigger(submitForm);
                const { code } = res;
                if (code === 200) {
                    this.$mtd.message.success(this.triggerId ? '触发器更新成功' : '触发器创建成功');
                    this.$router.push({
                        name: 'rg_trigger',
                        query: {
                            rgId: `${this.rgId}`,
                            cn: this.$route.query.cn
                        }
                    }).catch(e => e);
                }
            }
        }).catch(e => e);
    }
    async getTriggerDetail () {
        const res = await api.ruleApi.getTriggerDetail(this.triggerId);
        const { code, data } = res;
        if (code === 200) {
            this.form.name = data.name;
            this.form.triggerTime = data.triggerTime;
            this.actionDO = data.actions;
            this.conditionGroupDo = data.conditionGroups;
            this.itemLogic = data.itemLogic;
        }
    }
    actionChange (action) {
        this.actionDO = action;
    }
    conditionChange (condition) {
        this.conditionGroupDo = condition.conditionGroups;
        this.itemLogic = condition.groupLogic;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get triggerId () {
        return parseInt(this.$route.query.id as string, 10);
    }
}
</script>

<style lang="postcss">
.trigger-edit-container {
    background: #FFFFFF;
    padding-bottom: 60px;
    .trigger-edit-form-container {
        padding: 20px 0;
        width: 950px;
        margin: 0 auto;
        h2 {
            font-family: PingFangSC-Semibold;
            font-size: 20px;
            color: rgba(0, 0, 0, 0.87);
            line-height: 28px;
        }
        h3 {
            margin-bottom: 20px;
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            letter-spacing: 0;
            line-height: 24px;
        }
        .trigger-conditions-container,
        .trigger-group-actions-container {
            .mtd-form-item {
                .mtd-form-item-helper {
                    color: #F5483B;
                    margin-top: 0;
                }
            }
        }
    }
    .trigger-info-card {
        padding: 24px 0 10px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        &.last-card {
            border-bottom: none;
        }
    }
    .text-icon-button {
        margin-left: 40px;
        display: inline-block;
        font-size: 14px;
        color: #FF8800;
        letter-spacing: 0;
        line-height: 22px;
        cursor: pointer;
        .iconfont {
            font-size: 20px;
            vertical-align: middle;
        }
    }
    .steps-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        padding: 14px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.07);
        background: #FFFFFF;
        z-index: 5;
        .footer-center-container {
            margin: 0 auto;
            width: 750px;
            text-align: right;
            .close-btn {
                margin-right: 8px;
            }
        }
    }
}
</style>
