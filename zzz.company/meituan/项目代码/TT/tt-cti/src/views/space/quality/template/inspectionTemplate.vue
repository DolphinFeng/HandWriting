<template>
    <div class="inspection-form-edit-container">
        <div class="steps-header">
            <div class="header-title">
                <i
                    v-show="isEditState"
                    class="mtdicon mtdicon-arrow-left"
                    @click="cancelBack" />
                <span>{{ headerTitle }}</span>
                <span class="hint">
                    <i
                        v-if="isEditState && formId"
                        class="mtdicon mtdicon-warning-circle-o" />
                    <span v-if="isEditState && formId">历史/正在使用此质检模板的质检任务不会随此编辑变更，编辑完成后再使用此模板的质检任务将使用更新后的模板</span>
                </span>
            </div>
            <div class="operate-buttons">
                <mtd-button v-show="isEditState" @click="cancelBack">取消</mtd-button>
                <mtd-button
                    :loading="btnLoading"
                    v-show="isEditState"
                    @click="preview">质检员视角预览</mtd-button>
                <mtd-button
                    :loading="btnLoading"
                    type="primary"
                    @click="handleClick">{{ isEditState ? '保存' : '关闭预览' }}</mtd-button>
            </div>
        </div>
        <inspection-template-edit
            v-show="isEditState"
            ref="inspectionEdit"
            :inspection-form="inspectionForm"
            :basic-form="basicForm"
            @basic-change="handleBasicChange"
            @change="handleTemplateChanged" />
        <inspection-template-preview
            v-show="!isEditState"
            :inspection-form="inspectionForm" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import InspectionTemplatePreview from './inspectionTemplatePreview.vue';
import InspectionTemplateEdit from './inspectionTemplateEdit.vue';
import * as api from '@/api';

@Component({
    components: {
        InspectionTemplatePreview,
        InspectionTemplateEdit
    }
})
export default class InspectionTemplate extends Vue {
    btnLoading: boolean = false;
    isEditState: boolean = true;
    $refs: any;
    inspectionForm: CommonTypes.mapObject = {
        systemFields: [],
        deduction: []
    };
    basicForm: CommonTypes.mapObject = {
        name: '',
        desc: ''
    };

    created () {
        this.formId ? this.getTemplateValues() : this.initForm();
    }
    initForm () {
        this.inspectionForm = {
            systemFields: [{
                fieldType: 'SYSTEM',
                name: 'totalPoints',
                value: 100,
                valueType: 'NUMERIC'
            }, {
                fieldType: 'SYSTEM',
                name: 'noteSwitch',
                value: false,
                valueType: 'BOOLEAN'
            }, {
                fieldType: 'SYSTEM',
                name: 'noteRequired',
                value: false,
                valueType: 'BOOLEAN'
            }],
            deduction: []
        };
    }
    validateForm () {
        const editComponent = this.$refs.inspectionEdit;
        if (editComponent) {
            const basicForm = editComponent.$refs.inspectionTotalForm || {};
            const deductionForm = editComponent.$refs.inspectionDeduction || {};
            Promise.all([basicForm.validate(), deductionForm.validateDeduction()]).then(() => {
                if (!this.inspectionForm.deduction.length) {
                    this.$mtd.message({
                        type: 'error',
                        message: '请填写扣分项'
                    });
                    return;
                }
                this.formId ? this.editTemplate() : this.createTemplate();
            }).catch(e => {
                console.log(e);
            });
        }
    }
    async editTemplate () {
        const res = await api.inspectApi.editInspectTemplate({
            name: this.basicForm.name,
            desc: this.basicForm.desc,
            objectId: this.spaceId,
            field: this.handleFormToData(),
            id: this.formId,
            version: this.version
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('编辑模板成功');
            // 跳转列表页
            this.$router.push(`/space/${this.spaceId}/quality-inspection-template`).catch(e => e);
        }
    }
    async createTemplate () {
        const res = await api.inspectApi.createInspectTemplate({
            name: this.basicForm.name,
            desc: this.basicForm.desc,
            objectId: this.spaceId,
            field: this.handleFormToData()
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success('创建模板成功');
            // 跳转列表页
            this.$router.push(`/space/${this.spaceId}/quality-inspection-template`).catch(e => e);
        }
    }
    async getTemplateValues () {
        // 根据formId查询模板数据，进行回显
        const res = await api.inspectApi.getTemplateDetail({
            templateId: this.formId,
            templateVersion: this.version
        });
        const { code, data } = res;
        if (code === 200) {
            this.handleDataToForm(data);
        }
    }
    handleDataToForm (data: any) {
        data.field.forEach(item => {
            if (item.fieldType === 'SYSTEM') {
                if (item.valueType === 'BOOLEAN') {
                    item.value = item.value === 'true';
                }
                this.inspectionForm.systemFields.push(item);
            } else {
                item.value = Number(item.value);
                this.inspectionForm.deduction.push(item);
            }
        });
        this.basicForm = {
            name: data.name,
            desc: data.desc
        };
    }
    handleFormToData () {
        return this.inspectionForm.systemFields.concat(this.inspectionForm.deduction);
    }
    async preview () {
        const editComponent = this.$refs.inspectionEdit;
        if (editComponent) {
            await (editComponent.$refs.inspectionDeduction || {}).validateDeduction();
            this.isEditState = false;
        }
    }
    handleClick () {
        if (this.isEditState) {
            // 编辑态为保存操作，校验表单
            this.validateForm();
        } else {
            // 预览态为关闭预览操作，变为编辑态
            this.isEditState = true;
        }
    }
    // 模板配置项修改
    handleTemplateChanged (part, val) {
        if (['noteRequired', 'noteSwitch', 'totalPoints'].includes(part)) {
            this.inspectionForm.systemFields.find(item => {
                if (item.name === part) {
                    item.value = val;
                    if (item.id) delete item.id;
                    return true;
                }
            });
        } else {
            this.$set(this.inspectionForm, part, val);
        }
    }
    // 基本信息修改
    handleBasicChange (type, val) {
        this.$set(this.basicForm, type, val);
    }
    // 取消编辑
    cancelBack () {
        this.$mtd.confirm({
            message: '确定要离开吗？系统可能不会保存您所做的更改',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            className: 'cancel-confirm',
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
    get version () {
        return parseInt(this.$route.query.version as string, 10);
    }
    get headerTitle () {
        return this.isEditState ? (this.formId ? '编辑质检模板' : '添加质检模板') : '质检模板预览';
    }
}
</script>

<style lang="postcss">
.inspection-form-edit-container {
    display: flex;
    height: 100%;
    flex-direction: column;
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
            .hint {
                font-size: 14px;
                i {
                    margin-left: 20px;
                    margin-right: 4px;
                }
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
.cancel-confirm {
    .mtd-btn {
        border-radius: 6px;
        border: none;
        font-weight: 500;
        opacity: 0.9;
        font-family: PingFangSC-Medium;
        &:not(.mtd-btn-primary) {
            background: rgba(0, 0, 0, 0.06);
        }
    }
}
</style>
