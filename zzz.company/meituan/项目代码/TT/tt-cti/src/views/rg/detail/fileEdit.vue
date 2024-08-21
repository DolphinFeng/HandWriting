<template>
    <div class="auto-wrapper" v-if="showEdit">
        <p style="margin-bottom: 16px;">
            自动归档
            <mtd-switch
                v-model="triggerForm.active"
                @change="autoArchiveChanged"
                size="small" />
        </p>
        <mtd-form
            :model="itemForm"
            v-if="triggerForm.active"
            ref="itemForm">
            <mtd-form-item
                label="条件关系："
                :label-width="86"
                prop="itemLogic">
                <mtd-radio-group v-model="itemForm.itemLogic">
                    <mtd-radio value="AND">满足以下所有条件</mtd-radio>
                    <mtd-radio value="OR">满足以下任一条件</mtd-radio>
                </mtd-radio-group>
            </mtd-form-item>
            <mtd-form-item
                :key="index"
                v-for="(condition, index) in itemForm.conditions"
                prop="conditions"
                :label="`条件${index + 1}：`"
                :label-width="86">
                <mtd-select
                    v-model="condition.fieldName"
                    style="width: 172px; margin-right: 10px;"
                    @change="conditionChange(index)">
                    <mtd-option
                        v-for="field in autoArchiveOptionsArr"
                        :key="field.value"
                        :label="field.label"
                        :value="field.value" />
                </mtd-select>
                <mtd-select
                    v-model="condition.fieldPredicate"
                    style="width: 120px; margin-right: 10px;"
                    v-if="condition.fieldName">
                    <mtd-option
                        v-for="(predicate, predicateIndex) in predicateOptions"
                        :key="predicateIndex"
                        :label="predicateCn[predicate]"
                        :value="predicate" />
                </mtd-select>
                <div style="display: inline-block;" v-if="condition.fieldName">
                    <mtd-input
                        type="text"
                        v-model="condition.fieldValue"
                        style="width: 348px; margin-right: 10px;" />
                </div>
                <span
                    v-if="itemForm.conditions.length > 1"
                    class="text-button"
                    @click="deleteCondition(index)">删除</span>
                <div class="mtd-form-item-error-tip" v-if="withErrorArr[index]">请将条件{{ index + 1 }}补充完整</div>
            </mtd-form-item>
            <span class="text-icon-button" @click="addCondition"><i class="iconfont icon-add-square-o" /> 添加条件</span>
        </mtd-form>
        <div class="steps-footer" v-if="triggerForm.active">
            <mtd-button
                :loading="btnLoading"
                type="primary"
                @click="submit">保存</mtd-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { autoArchiveOptionsArr, predicateOptions, predicateCn } from '@/config/map.conf';
import * as api from '@/api';
import { Form } from '@ss/mtd-vue';
// import { keys } from 'lodash';

/**
 * rg问题归档
 *
 * @author liyuyao
 * @date 11/07/2020
 */
@Component({
    components: {}
})
export default class RgFileEdit extends Vue {
    @Prop({ default: {} }) node: any;
    @Prop() showEdit: boolean;
    autoArchiveOptionsArr: Array<{ value: any; label: string }> = autoArchiveOptionsArr;
    predicateOptions: any = predicateOptions;
    predicateCn: any = predicateCn;
    itemForm: any = {
        itemLogic: 'OR',
        parentId: 0,
        id: 0,
        conditions: [{
            fieldName: '',
            fieldPredicate: '',
            fieldValue: '',
            parentId: 0,
            id: 0
        }]
    };
    triggerForm: any = {
        name: '',
        triggerTime: 'ARCHIVE_RECOMMEND',
        scene: 'RG',
        itemLogic: 'OR',
        active: false,
        actions: []
    };
    triggerId: number = 0;
    withErrorArr: boolean[] = [false];
    btnLoading: boolean = false;
    $refs: { itemForm: Form };

    @Watch('node', { immediate: true })
    getNodeChanged () {
        this.showEdit && this.node.itemId && this.node.ruleId && this.getTriggerDetail();
    }

    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    resetForm () {
        this.itemForm = {
            itemLogic: 'OR',
            parentId: 0,
            id: 0,
            conditions: [{
                fieldName: '',
                fieldPredicate: '',
                fieldValue: '',
                parentId: 0,
                id: 0
            }]
        };
        this.triggerForm = {
            name: '',
            triggerTime: 'ARCHIVE_RECOMMEND',
            scene: 'RG',
            itemLogic: 'OR',
            active: false,
            actions: []
        };
    }

    async getTriggerDetail () {
        const res = await api.ruleApi.getTriggerDetail(this.node.ruleId);
        const { code, data } = res;
        if (code === 200 && data) {
            const { name, active, actions, conditionGroups } = data;
            this.triggerForm.name = name;
            this.triggerForm.actions = actions;
            this.triggerForm.active = active;
            this.itemForm = conditionGroups[0];
        }
    }

    async autoArchiveChanged (actived: boolean) {
        if (!this.node.inUse) {
            this.$mtd.message.error('问题归档已停用无法开启自动归档');
            this.triggerForm.active = false;
            return;
        }
        if (this.node.ruleId) await api.ruleApi.triggerSwitch(this.node.ruleId, actived);
    }
    addCondition () {
        if (this.itemForm.conditions.length < 10) {
            this.itemForm.conditions.push({
                fieldName: '',
                fieldPredicate: '',
                fieldValue: ''
            });
            this.withErrorArr.push(false);
        } else {
            this.$mtd.message.error('最多允许添加10个条件');
        }
    }
    deleteCondition (index) {
        this.itemForm.conditions.splice(index, 1);
        this.withErrorArr.splice(index, 1);
    }
    conditionChange (index) {
        this.itemForm.conditions[index].fieldPredicate = '';
        this.itemForm.conditions[index].fieldValue = '';
    }
    get formatItemForm () {
        const format: CommonTypes.conditionGroupDo = {
            itemLogic: this.itemForm.itemLogic,
            conditions: this.itemForm.conditions.map((condition) => {
                const formatCondition: CommonTypes.conditionDO = {
                    fieldName: condition.fieldName,
                    fieldPredicate: condition.fieldPredicate,
                    fieldValue: condition.fieldValue,
                };
                if (!!condition.id) {
                    formatCondition.id = condition.id;
                    formatCondition.parentId = condition.parentId;
                }
                return formatCondition;
            })
        };
        if (!!this.itemForm.id) {
            format.id = this.itemForm.id;
            format.parentId = this.itemForm.parentId;
        }
        return format;
    }
    async submit () {
        this.$refs.itemForm.validate(async (valid) => {
            if (valid && (!this.formError)) {
                const submitForm: CommonTypes.triggerForm = {
                    name: this.triggerForm.name || this.node.nodeName,
                    scene: this.triggerForm.scene,
                    sceneId: this.rgId,
                    active: this.triggerForm.active,
                    triggerTime: this.triggerForm.triggerTime,
                    conditionGroups: [this.formatItemForm],
                    actions: this.triggerForm.actions,
                    itemLogic: this.triggerForm.itemLogic,
                    sequence: this.node.depth
                };
                if (this.node.ruleId) {
                    // 更新触发器
                    submitForm.id = this.node.ruleId;
                } else {
                    // 新增触发器
                    submitForm.actions = [{
                        fieldName: 'ARCHIVE',
                        fieldAction: 'UPDATE',
                        fieldValue: (this.node.itemId).toString(),
                        parentScene: 1
                    }];
                    submitForm.name = '问题归档-' + submitForm.name;
                }
                const res = this.node.ruleId ? await api.ruleApi.updateTrigger(this.node.ruleId, submitForm) : await api.ruleApi.createTrigger(submitForm);
                const { code, data } = res;
                if (code === 200 && data) {
                    this.$mtd.message.success('自动归档条件保存成功');
                    if (!this.node.ruleId) {
                        this.$emit('update', data);
                    }
                }
            }
        }).catch(e => e);
    }
    get formError () {
        this.itemForm.conditions.forEach((condition, index) => {
            const validate = (condition.fieldName && condition.fieldPredicate && condition.fieldValue) || false;
            this.$set(this.withErrorArr, index, !validate);
        });
        const hasArror = this.withErrorArr.find((error) => {
            return error === true;
        });
        return hasArror;
    }
}
</script>

<style lang="postcss">
.auto-wrapper {
    flex: 1 1 auto;
    margin: 0 0 12px 42px;
    /* padding: 10px 0; */
    /* background: #F7F7F7; */
    border-radius: 4px;
    padding: 16px 0;
    position: relative;
    p {
        /* font-family: PingFangSC-Medium; */
        margin-left: 3px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: 0;
        line-height: 22px;
        .mtd-switch {
            vertical-align: middle;
        }
    }
    .text-icon-button {
        margin-left: 75px;
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
    .text-button {
        /* margin-left: 4px; */
        display: inline-block;
        cursor: pointer;
        font-size: 14px;
        color: #FF8800;
        line-height: 22px;
        &.delete-group {
            float: right;
            margin-right: 16px;
        }
    }
    .steps-footer {
        margin-top: 20px;
        float: right;
        margin-right: 70px;
    }
}
</style>
