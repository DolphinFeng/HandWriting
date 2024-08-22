<template>
    <div class="custom-form-wrapper">
        <div class="basic-setting">
            <div class="title-name">基本信息</div>
            <mtd-form
                :rules="ruleCustom"
                :model="customBasicForm"
                :label-width="110"
                ref="inspectionTotalForm">
                <mtd-form-item
                    label="质检模板名称："
                    prop="name">
                    <mtd-textarea
                        v-model="customBasicForm.name"
                        @input="handleBasicChange('name', $event)"
                        :autosize="{ minRows: 1, maxRows: 3}"
                        style="width: 400px;" />
                </mtd-form-item>
                <mtd-form-item label="质检模板说明：" prop="desc">
                    <mtd-textarea
                        v-model="customBasicForm.desc"
                        @input="handleBasicChange('desc', $event)"
                        :autosize="{ minRows: 1, maxRows: 3}"
                        style="width: 400px;" />
                </mtd-form-item>
            </mtd-form>
        </div>
        <div class="custom-setting">
            <div class="title-name">人工质检项配置</div>
            <div class="template-setting-container">
                <div class="setting-tip">
                    <i class="mtdicon mtdicon-info-circle-o" />
                    <span>评分规则为扣分制，建议总扣分分值不高于初始分值</span>
                </div>
                <div class="edit-wrapper">
                    <div class="edit-part total-count">
                        <div class="part-title">初始分值</div>
                        <div class="total-edit-wrapper">
                            <span class="total-number" v-show="!isEditTotal"> {{ totalPoints }} </span>
                            <mtd-icon-button
                                class="edit"
                                type="secondary"
                                size="small"
                                v-show="!isEditTotal"
                                @click="enterEdit"
                                icon="mtdicon mtdicon-edit-o" />
                            <mtd-input-number
                                v-model="totalPoints"
                                v-show="isEditTotal"
                                @blur="totalSave"
                                :precision="0"
                                :controls="false"
                                id="totalInput"
                                @keydown.enter="preventCheckEnter" />
                        </div>
                    </div>
                    <div class="edit-part item-setting">
                        <div class="part-title">扣分项配置</div>
                        <span class="total-deduction">总扣分分值：<span>{{ totalDeduction }}</span></span>
                        <deduction-table
                            ref="inspectionDeduction"
                            :data="tableData"
                            @change="onChanged('deduction', $event)" />
                    </div>
                    <div class="edit-part remark-wrapper">
                        <div class="part-title">
                            <span>备注字段</span><mtd-switch
                                v-model="noteSwitch"
                                size="small"
                                @change="onChanged('noteSwitch', $event)" />
                        </div>
                        <mtd-checkbox
                            v-model="noteRequired"
                            v-show="noteSwitch"
                            @change="onChanged('noteRequired', $event)">必填</mtd-checkbox>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import DeductionTable from './deductionTable.vue';
import InspectionTemplatePreview from './inspectionTemplatePreview.vue';
import { Form } from '@ss/mtd-vue';

const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('模板名称不能为空'));
    }
    if (value.length > 30) {
        return callback(new Error('模板名称不能超过30个字'));
    }
    return callback();
};
const validateInstruction: Function = (_rule, value, callback) => {
    if (value && value.length > 100) {
        return callback(new Error('模板说明不能超过100个字'));
    }
    return callback();
};

@Component({
    components: {
        InspectionTemplatePreview,
        DeductionTable
    }
})
export default class InspectionTemplateEdit extends Vue {
    @Prop() inspectionForm: CommonTypes.mapObject;
    @Prop() basicForm: CommonTypes.mapObject;

    $refs: { totalForm: Form };
    btnLoading: boolean = false;
    isEditTotal: boolean = false;
    noteSwitch: boolean = false;
    noteRequired: boolean = false;
    totalPoints: number = 0;
    tableData: CommonTypes.mapObject[] = [];
    ruleCustom = {
        name: [
            { validator: validateName, trigger: 'blur', required: true }
        ],
        desc: [
            { validator: validateInstruction, trigger: 'blur' }
        ]
    };
    customBasicForm: CommonTypes.mapObject = {
        name: '',
        desc: ''
    };

    @Watch('inspectionForm', { immediate: true, deep: true })
    onFormChanged () {
        if (this.inspectionForm) {
            this.inspectionForm.systemFields.forEach(item => {
                switch (item.name) {
                    case 'totalPoints':
                        this.totalPoints = item.value;
                        break;
                    case 'noteSwitch':
                        this.noteSwitch = item.value;
                        break;
                    case 'noteRequired':
                        this.noteRequired = item.value;
                        break;
                    default:
                        break;
                }
            });
            this.tableData = Object.assign([], this.inspectionForm.deduction);
        }
    }
    @Watch('basicForm', { immediate: true })
    onBasicFormChanged () {
        this.customBasicForm = Object.assign({}, this.basicForm);
    }

    enterEdit () {
        this.isEditTotal = true;
        const ele: any = document.getElementById('totalInput').getElementsByClassName('mtd-input-number')[0];
        this.$nextTick(() => {
            ele.focus();
        });
    }
    totalSave () {
        if (this.totalPoints < 0) {
            this.$mtd.message({
                type: 'error',
                message: '初始分值必须为非负整数'
            });
            return;
        }
        this.isEditTotal = false;
        this.onChanged('totalPoints', this.totalPoints);
    }
    preventCheckEnter (e) {
        if (e.preventDefault) e.preventDefault();
        return false;
    }

    handleBasicChange (type: string, val: string) {
        this.$emit('basic-change', type, val);
    }
    onChanged (part: string, val) {
        this.$emit('change', part, val);
    }
    formChanged (val) {
        this.tableData = val;
        this.$emit('change', 'deduction', val);
    }

    preview () {
        this.$router.push({
            name: 'preview-inspection-form',
            query: {
                ...this.$route.query
            }
        }).catch(e => e);
    }
    // 取消编辑
    cancelBack () {
        this.$mtd.confirm({
            message: '确定要离开吗？系统可能不会保存您所做的更改',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                this.$router.push(`/space/${this.spaceId}/quality-inspection-template`).catch(e => e);
            }
        }).catch(e => e);
    }

    get spaceId () {
        return parseInt(this.$route.query.spaceId as string, 10);
    }
    get formId () {
        return parseInt(this.$route.query.formId as string, 10);
    }
    get totalDeduction () {
        if (!this.tableData.length) return 0;
        let total: number = 0;
        this.tableData.forEach((ele) => {
            total += ele.value || 0;
        });
        return total;
    }
}
</script>

<style lang="postcss">
.inspection-form-edit-container {
    .mtd-btn {
        &:not(.mtd-btn-text-primary) {
            background: rgba(0, 0, 0, 0.06);
            border: none;
            &.mtd-btn-primary {
                background: #FFD100;
            }
        }
    }

    background: #FFFFFF;
    .steps-header {
        position: sticky;
        top: 0;
        width: 100%;
        padding: 11px 24px;
        box-shadow: 0 1px 6px 0 rgba(192, 196, 204, 0.39);
        background: #FFFFFF;
        z-index: 5;
        height: 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .header-title {
            display: inline-block;
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.84);
            i {
                margin-right: 8px;
                line-height: 28px;
            }
            span {
                line-height: 28px;
                display: inline-block;
                vertical-align: top;
            }
        }
        .operate-buttons {
            float: right;
            .mtd-btn {
                min-width: 80px;
                margin-left: 8px;
                border-radius: 6px;
                span {
                    font-weight: 500;
                    opacity: 0.9;
                    font-family: PingFangSC-Medium;
                    font-size: 14px;
                    color: #000000;
                    letter-spacing: 0;
                    text-align: center;
                    line-height: 22px;
                }
            }
        }
    }
    .custom-form-wrapper {
        padding: 24px 0;
        margin: 0 auto;
        width: 1120px;
    }
    .basic-setting {
        width: 100%;
        margin-bottom: 32px;
        .mtd-form {
            display: flex;
            justify-content: space-between;
            .mtd-form-item {
                flex: 0 0 510px;
                .mtd-form-item-label {
                    text-align: left;
                    padding-right: 0;
                }
            }
        }
    }
    .title-name {
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 16px;
        border-left: 5px solid #FF8800;
        padding-left: 8px;
        margin-bottom: 12px;
    }
    .custom-setting {
        .template-setting-container {
            .setting-tip {
                font-weight: 400;
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.35);
                letter-spacing: 0;
                line-height: 22px;
                span {
                    vertical-align: top;
                    display: inline-block;
                    margin-left: 2px;
                }
            }
            .edit-wrapper {
                background: rgba(231, 231, 235, 0.35);
                border-radius: 12px;
                padding: 24px;
                margin-top: 12px;
                .edit-part {
                    background: #FFFFFF;
                    border-radius: 8px;
                    padding: 12px 16px;
                    .part-title {
                        font-weight: 500;
                        font-family: PingFangSC-Medium;
                        font-size: 16px;
                        color: rgba(0, 0, 0, 0.84);
                        line-height: 22px;
                    }
                    .total-edit-wrapper {
                        text-align: center;
                        margin-bottom: 18px;
                        .total-number {
                            font-weight: 500;
                            font-family: PingFangSC-Medium;
                            font-size: 28px;
                            color: rgba(0, 0, 0, 0.84);
                            line-height: 32px;
                            display: inline-block;
                            margin-right: 4px;
                        }
                        .mtd-input-number-wrapper {
                            border: none;
                            border-radius: none;
                            .mtd-input-number {
                                border-bottom: 1px solid rgba(0, 0, 0, 0.12);
                                border-radius: none;
                                font-size: 28px;
                                &:hover {
                                    border-color: #F9D272;
                                }
                            }
                        }
                    }
                }
                .item-setting {
                    margin: 12px 0;
                    padding-bottom: 6px;
                    .part-title {
                        display: inline-block;
                    }
                    .total-deduction {
                        float: right;
                        color: rgba(0, 0, 0, 0.35);
                        span {
                            color: rgba(0, 0, 0, 0.84);
                        }
                    }
                }
                .remark-wrapper {
                    .part-title {
                        display: flex;
                        align-items: center;
                        margin-bottom: 12px;
                        .mtd-switch {
                            margin-left: 4px;
                        }
                    }
                }
            }
        }
    }
}
.add-field-tooltip {
    width: 344px;
    max-width: 344px;
}
</style>
