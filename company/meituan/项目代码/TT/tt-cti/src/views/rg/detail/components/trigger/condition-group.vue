<template>
    <div class="trigger-group-conditions-container">
        <mtd-form :model="itemForm">
            <mtd-form-item label="条件：" :label-width="76">
                <mtd-radio-group v-model="itemForm.itemLogic">
                    <mtd-radio value="AND">满足以下所有条件</mtd-radio>
                    <mtd-radio value="OR">满足以下任一条件</mtd-radio>
                </mtd-radio-group>
                <span
                    v-if="showDeleteGroup"
                    class="text-button delete-group"
                    @click="deleteGroup">删除组</span>
            </mtd-form-item>
            <mtd-form-item
                :key="index"
                v-for="(condition, index) in itemForm.conditions"
                :label="`条件${index + 1}：`"
                :helper="!condition.conditionItemStatus ? (condition.itemInvalidReason || '触发条件异常，请修改') : ''"
                :label-width="76">
                <mtd-select
                    v-model="condition.fieldName"
                    style="width: 172px; margin-right: 10px;"
                    @change="conditionChange(index)">
                    <mtd-option
                        v-for="field in fieldOptionsArr"
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
                    <mtd-tooltip
                        :content="orgDisplay[index] || ''"
                        :disabled="!orgDisplay[index]"
                        placement="top">
                        <mtd-select
                            v-if="condition.fieldName === 'ORG'"
                            v-model="condition.fieldValue"
                            :loading="searchLoading"
                            filterable
                            remote
                            auto-clear-query
                            :debounce="200"
                            @change="onConditionOrgChanged(index)"
                            :class="{'mtd-input-invalid': !condition.conditionItemStatus}"
                            :remote-method="searchOrg"
                            style="width: 348px; margin-right: 10px;">
                            <mtd-option
                                v-for="(org, orgIndex) in orgList"
                                :key="orgIndex"
                                :label="org.orgPath"
                                :value="org.orgId" />
                        </mtd-select>
                    </mtd-tooltip>
                    <mtd-input
                        v-if="condition.fieldName === 'NAME'"
                        type="text"
                        v-model="condition.fieldValue"
                        style="width: 348px; margin-right: 10px;" />
                    <ComponentCity
                        style="margin-right: 10px;"
                        v-if="condition.fieldName === 'REPORTER_CITY'"
                        :field="{ defaultValue: condition.fieldValue }"
                        @change="(e) => { handleCityChange(e, index) }" />
                </div>
                <span
                    v-if="itemForm.conditions.length > 1"
                    class="text-button"
                    @click="deleteCondition(index)">删除</span>
                <div class="mtd-form-item-error-tip" v-if="withErrorArr[index]">请将条件{{ index + 1 }}补充完整</div>
            </mtd-form-item>
            <span class="text-icon-button" @click="addCondition"><i class="iconfont icon-add-square-o" /> 添加条件</span>
        </mtd-form>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { fieldOptionsArr, predicateOptions, predicateCn } from '@/config/map.conf';
import * as api from '@/api';
import ComponentCity from '@/views/rg/detail/components/customForm/form/Template/System/componentCity.vue';

/**
 * 触发器 触发条件
 *
 * @author liyuyao
 * @date 08/20/2019
 */
@Component({
    components: { ComponentCity }
})
export default class ConditionGroup extends Vue {
    @Prop()
    conditionGroup: CommonTypes.conditionGroupDo;

    @Prop({ default: 0 })
    groupIndex: number;

    @Prop({ default: 0 })
    submitSingle: number;

    @Prop({ default: false })
    showDeleteGroup: boolean;

    fieldOptionsArr: Array<{ value: any; label: string }> = fieldOptionsArr;
    predicateOptions: any = predicateOptions;
    predicateCn: any = predicateCn;
    orgDisplay: string[] = [];

    itemForm: any = {
        itemLogic: 'OR',
        parentId: 0,
        id: 0,
        conditions: [{
            fieldName: '',
            fieldPredicate: '',
            fieldValue: '',
            parentId: 0,
            id: 0,
            conditionItemStatus: true
        }]
    };
    searchLoading: boolean = false;
    orgList: any = [];

    withErrorArr: boolean[] = [false];
    withInvalidArr: boolean[] = [false];

    @Watch('submitSingle')
    catchSubmitSingle () {
        if (!this.formError) {
            this.$emit('change', this.formatItemForm, this.groupIndex);
        }
    }
    @Watch('conditionGroup')
    onGetDetailCondition () {
        if (this.conditionGroup.conditions && this.conditionGroup.conditions.length) {
            this.itemForm = this.conditionGroup;
            this.itemForm.conditions.forEach((condition, index) => {
                if (condition.fieldName === 'ORG') {
                    this.getOrgDetail(condition.fieldValue, index);
                }
            });
        }
    }
    onConditionOrgChanged (index) {
        this.itemForm.conditions[index].conditionItemStatus = true;
    }
    deleteGroup () {
        this.$emit('delete', this.groupIndex);
    }
    addCondition () {
        if (this.itemForm.conditions.length < 10) {
            this.itemForm.conditions.push({
                fieldName: '',
                fieldPredicate: '',
                fieldValue: '',
                conditionItemStatus: true
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
        this.itemForm.conditions[index].conditionItemStatus = true;
        this.itemForm.conditions[index].itemInvalidReason = '';
    }
    handleCityChange (city, index) {
        this.itemForm.conditions[index].fieldValue = city;
    }
    async searchOrg (query) {
        this.orgList = [];
        if (query.length < 2 || query === '集团') {
            return;
        }
        this.searchLoading = true;
        try {
            const res = await api.ruleApi.searchOrg(query);
            this.orgList = res.data.items;
        } catch (e) {
            this.orgList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async getOrgDetail (orgId, index) {
        try {
            const res = await api.ruleApi.getOrgDetail(orgId);
            this.orgList.push(res.data);
            this.orgDisplay[index] = res.data.orgPath;
        } catch (e) {
            this.orgList = [];
            console.log(e);
        }
    }
    get formatItemForm () {
        const format: CommonTypes.conditionGroupDo = {
            itemLogic: this.itemForm.itemLogic,
            conditions: this.itemForm.conditions.map((condition) => {
                const formatCondition: CommonTypes.conditionDO = {
                    fieldName: condition.fieldName,
                    fieldPredicate: condition.fieldPredicate,
                    fieldValue: condition.fieldValue,
                    conditionItemStatus: condition.conditionItemStatus,
                    itemInvalidReason: condition.itemInvalidReason
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
    get formError () {
        this.itemForm.conditions.forEach((condition, index) => {
            const validate = (condition.fieldName && condition.fieldPredicate && condition.fieldValue) || false;
            const statusValid = condition.conditionItemStatus;
            this.$set(this.withErrorArr, index, !validate);
            this.$set(this.withInvalidArr, index, !statusValid);
        });
        const hasArror = this.withErrorArr.includes(true);
        const hasInvalidArror = this.withInvalidArr.includes(true);
        // 在原有的校验逻辑上增加对invalid信息的校验
        this.$emit('error', hasArror || hasInvalidArror || false);
        return hasArror;
    }
}
</script>

<style lang="postcss">
.trigger-group-conditions-container {
    margin: 0 0 12px 42px;
    padding: 10px 0;
    background: #F7F7F7;
    border-radius: 4px;
    .text-icon-button {
        margin-left: 75px;
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
}
</style>
