<template>
    <div class="deduction-form-container">
        <div class="header title">人工质检</div>
        <div class="total">
            <span class="count" :class="[inDisplayMode ? 'display' : '', hasDeduction ? 'error' : '']">{{ systemContent.totalCount }}</span>分
        </div>
        <div class="wrapper">
            <div class="deduction">
                <div class="title">扣分项</div>
                <div v-if="!inDisplayMode">
                    <div
                        class="mtd-checkbox-group"
                        v-for="(item, index) in editForm"
                        :key="index">
                        <span class="label">
                            <mtd-checkbox
                                v-model="item.checked"
                                @input="checkboxChanged($event, item)">{{ item.name }}
                                <mtd-tooltip
                                    :content="item.desc"
                                    size="small"
                                    placement="top">
                                    <i v-show="item.desc" class="mtdicon mtdicon-info-circle-o" />
                                </mtd-tooltip>
                            </mtd-checkbox>
                        </span>
                        <span class="count" v-show="item.checked">{{ `-${item.value}` }}<span>分</span></span>
                    </div>
                </div>
                <div v-else>
                    <div
                        class="display-group"
                        v-for="(item, index) in editForm"
                        :key="index">
                        <span class="label">
                            {{ item.name }}：<span class="bold" v-if="item.checked">-{{ item.value }}</span>
                            <span v-else>0</span>
                            <mtd-tooltip
                                :content="item.desc"
                                size="small"
                                placement="top">
                                <i v-show="item.desc" class="mtdicon mtdicon-info-circle-o" />
                            </mtd-tooltip>
                        </span>
                    </div>
                </div>
            </div>
            <div class="note" v-if="systemContent.noteSwitch">
                <div class="title" :class="{'required': systemContent.noteRequired && !inDisplayMode}">备注</div>
                <mtd-textarea
                    v-if="!inDisplayMode"
                    placeholder="输入内容不超过500个字符"
                    style="width: 100%;"
                    rows="3"
                    @input="onInput"
                    v-model="systemContent.noteContent"
                    :invalid="invalidNote"
                    maxlength="500" />
                <span v-else class="display-note">{{ systemContent.noteContent }}</span>
                <div v-if="invalidNote && !inDisplayMode" class="mtd-form-item-error-tip">请填写备注</div>
            </div>
        </div>
        <div class="operations">
            <div class="tips" v-if="displayMode === 'preview'">预览模式不支持点击确定</div>
            <div class="btn-wrapper" :class="[{'equal-split': isAlreadyCheck, 'not-equal-split': !isAlreadyCheck && !isLastItem}]">
                <mtd-button 
                    v-show="showOrdinaryBtn"
                    @click="onClick('ordinary')">{{ ordinaryBtnText }}</mtd-button>
                <mtd-button
                    v-show="!inDisplayMode"
                    @click="onClick('primary')"
                    type="primary">{{ primaryBtnText }}</mtd-button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';
import { QualityFormBtnMap, QualityConfirmMap } from '@/config/inspection.conf';
import * as api from '@/api';
import { INSPECTION_KNOWLEDGE_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';

@Component({
    components: {}
})
export default class DeductionForm extends Vue {
    @Prop() deductionForm: CommonTypes.mapObject;
    // 展示模式：编辑、查看
    @Prop({ default: 'display' }) displayMode: 'display' | 'edit';
    // 质检任务是否已提交
    @Prop({ default: false }) isAlreadySubmit: boolean;
    // 质检任务是否已被质检
    @Prop({ default: false }) isAlreadyCheck: boolean;
    // 是否为任务中最后一个待质检项
    @Prop({ default: true }) isLastItem: boolean;
    // 子任务所有工单是否完成质检
    @Prop({ default: false }) allCompleted: boolean;

    checkedDeductionList: string[] = [];
    editForm: CommonTypes.mapObject[] = [];
    systemContent: CommonTypes.mapObject = {
        totalCount: 0,
        noteSwitch: false,
        noteRequired: false,
        noteContent: ''
    };
    btnLabelMap: any = QualityFormBtnMap;
    confirmMap: any = QualityConfirmMap;
    invalidNote: boolean = false;

    @Watch('deductionForm', { immediate: true, deep: true })
    onFormChanged () {
        if (this.deductionForm) {
            this.editForm = cloneDeep(this.deductionForm.deduction);
            this.systemContent = { ...this.deductionForm.systemFields };
        }
    }

    checkboxChanged (val, item) {
        this.systemContent.totalCount = val ? (this.systemContent.totalCount - item.value) : (this.systemContent.totalCount + item.value);
    }

    async onClick (type: 'primary' | 'ordinary') {
        if (type === 'primary') {
            if (this.hasInvalidNote()) {
                return;
            }
            if (this.inspectionType === 'submitedReInspect') {
                this.confirm('hasSubmited');
            } else {
                await this.save(this.inspectionType === 'notLast' ? 'next' : 'current');
            }
        } else {
            if (this.inspectionType === 'notLast') {
                if (this.hasInvalidNote()) {
                    return;
                }
                await this.save('current');
            } else if (this.inspectionType === 'reInspect') {
                this.$emit('display', 'edit');
                lxReportClick(INSPECTION_KNOWLEDGE_MAP['re_inspect_ticket']);
            } else {
                this.resetForm();
                this.$emit('display', 'display');
            }
        }
    }
    resetForm () {
        this.editForm = cloneDeep(this.deductionForm.deduction);
        this.systemContent = { ...this.deductionForm.systemFields };
    }
    confirm (type) {
        this.$mtd.confirm({
            title: this.confirmMap[type].title,
            message: this.confirmMap[type].message,
            width: '400px',
            className: 'inspection-confirm',
            showCancelButton: true,
            onOk: async () => {
                if (type === 'notSubmit') {
                    await this.submit();
                } else {
                    await this.save('current');
                }
            },
            okButtonText: this.confirmMap[type].okText,
            cancelButtonText: this.confirmMap[type].cancelText
        }).catch(e => e);
    }

    async save (type: 'current' | 'next') {
        if (this.invalidNote) {
            this.$mtd.message.error('请填写备注！');
            return;
        }
        const res: Ajax.AxiosResponse = await api.inspectApi.saveInspectorResult({
            inspectorTicketId: Number(this.inspectorTicketId),
            customFieldInfo: this.editForm.map(item => {
                return {
                    id: item.id,
                    content: item.checked ? '1' : '0'
                };
            }),
            systemFieldInfo: [{
                name: 'NOTE',
                content: this.systemContent.noteContent
            }]
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success(this.isAlreadyCheck ? '重新质检成功' : '质检成功');
            this.$emit('update', type);
            if (['isLast', 'unSubmitLastReInspect'].includes(this.inspectionType)) {
                this.confirm('notSubmit');
            }
            if (this.inspectionType === 'submitedReInspect') {
                this.submit();
            }
        }
    }
    async submit () {
        const res: Ajax.AxiosResponse = await api.inspectApi.submitInspectorTask({
            inspectorTaskId: Number(this.inspectorTaskId),
            reInspectorTicketId: this.inspectionType === 'submitedReInspect' ? Number(this.inspectorTicketId) : null
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message.success(this.isAlreadySubmit ? '重新质检并提交质检结果成功' : '质检结果提交成功');
            this.$router.push(`/quality/inspection/detail?inspectorTaskId=${this.inspectorTaskId}`);
        }
    }
    cancelBack () {
        this.$router.push(`/quality/inspection/detail?inspectorTaskId=${this.inspectorTaskId}`);
    }
    hasInvalidNote () {
        const invalid = this.systemContent.noteSwitch && this.systemContent.noteRequired && !this.systemContent.noteContent;
        this.invalidNote = invalid;
        return invalid;
    }
    onInput () {
        this.hasInvalidNote();
    }
    // 按照是否质检、是否提交等区分出当前页面的六种交互类型
    get inspectionType () {
        if (this.isAlreadyCheck) {
            // 已质检
            return this.inDisplayMode
                ? 'reInspect'
                : (this.isAlreadySubmit
                ? 'submitedReInspect'
                : (this.allCompleted ? 'unSubmitLastReInspect' : 'unSubmitNotLastReInspect'));
        } else {
            // 未质检
            return this.isLastItem ? 'isLast' : 'notLast';
        }
    }
    get primaryBtnText () {
        return this.btnLabelMap[this.inspectionType]?.primaryLabel;
    }
    get ordinaryBtnText () {
        return this.btnLabelMap[this.inspectionType]?.ordinaryLabel;
    }
    get showOrdinaryBtn () {
        return this.inDisplayMode ||
        (!this.inDisplayMode && (this.isAlreadyCheck || (!this.isAlreadyCheck && !this.isLastItem)));
    }
    get hasDeduction () {
        return this.editForm.find(item => item.checked) ? true : false;
    }
    // 质检员子任务ID
    get inspectorTaskId () {
        return this.$route.query.inspectorTaskId || 0;
    }
    get inDisplayMode () {
        return this.displayMode === 'display';
    }
    get inspectorTicketId () {
        return this.$route.query.inspectorTicketId || 0;
    }
}
</script>
<style lang="postcss">
.deduction-form-container {
    width: 304px;
    flex: 0 0 304px;
    padding: 20px 0;
    position: relative;
    background-color: #fff;
    .title {
        font-weight: 500;
        font-family: PingFangSC-Medium;
        font-size: 20px;
        line-height: 26px;
    }
    .header {
        margin: 0 20px;
    }
    .total {
        margin: 20px 20px 41px 20px;
        height: 63px;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 8px;
        text-align: center;
        padding: 14px;
        color: rgba(0, 0, 0, 0.5);
        .count {
            font-family: MEITUANTYPE-BOLD;
            font-size: 32px;
            color: #000;
            line-height: 36px;
            margin-right: 4px;
            &.display {
                color: #029055;
                &.error {
                    color: #d41e21;
                }
            }
        }
    }
    .wrapper {
        height: calc(100% - 200px);
        overflow: auto;
    }
    .note {
        margin: 0 20px;
        .title {
            font-size: 14px;
            margin-top: 21px;
        }
    }
    .deduction {
        margin: 0 20px;
        .title {
            font-size: 14px;
        }
        .mtd-checkbox-group {
            display: flex;
            align-items: top;
            .label {
                flex: 0 1 219px;
                display: flex;
                align-items: center;
                margin-right: 5px;
                margin-top: 12px;
                .mtd-checkbox {
                    margin-right: 4px;
                    position: relative;
                    display: inline-flex;
                    .mtd-checkbox-inner {
                        flex: 1 0 auto;
                        margin-top: 3px;
                    }
                    .mtd-checkbox-text {
                        display: inline-block;
                        line-height: 22px;
                        max-width: 190px;
                    }
                }
                .mtd-tooltip-rel {
                    position: relative;
                    .mtdicon-info-circle-o {
                        color: rgba(0, 0, 0, 0.25);
                        cursor: pointer;
                        font-size: 16px;
                        position: absolute;
                        left: 4px;
                        line-height: 22px;
                    }
                }
            }
            .count {
                flex: 1 0 auto;
                color: #d41e21;
                text-align: right;
                margin-top: 12px;
                span {
                    margin-left: 2px;
                    color: rgba(0, 0, 0, 0.35);
                }
            }
        }
        .display-group {
            .label {
                line-height: 22px;
                margin-top: 12px;
                display: inline-block;
                .bold {
                    color: #d41e21;
                    font-weight: 500;
                    font-family: PingFangSC-Medium;
                }
                .mtd-tooltip-rel {
                    position: relative;
                    .mtdicon-info-circle-o {
                        color: rgba(0, 0, 0, 0.25);
                        cursor: pointer;
                        font-size: 16px;
                        position: absolute;
                        left: 4px;
                        line-height: 22px;
                    }
                }
            }
        }
    }
    .note {
        .mtd-textarea {
            margin-top: 12px;
        }
        .required {
            position: relative;
            &::before {
                font-family: SimSun, sans-serif;
                display: inline-block;
                margin-right: 4px;
                content: "*";
                color: #f5483b;
                position: absolute;
                left: -10px;
            }
        }
        .display-note {
            color: rgba(0, 0, 0, 0.5);
            display: inline-block;
            margin-top: 8px;
            line-height: 22px;
            width: 100%;
        }
    }
    .operations {
        position: absolute;
        bottom: 20px;
        text-align: center;
        margin: 0 16px;
        width: calc(100% - 32px);
        .tips {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
            margin-bottom: 8px;
        }
        .btn-wrapper {
            display: flex;
            font-weight: 500;
            font-family: PingFangSC-Medium;
            justify-content: space-between;
            .mtd-btn {
                border-radius: 6px;
                margin: 0 4px;
                flex: 1 1 auto;
                border: none;
                &:not(.mtd-btn-primary) {
                    background: rgba(0, 0, 0, 0.06);
                }
            }
            &.not-equal-split {
                .mtd-btn {
                    flex: 0 0 80px;
                }
                .mtd-btn-primary {
                    flex: 1 1 auto;
                }
            }
            &.equal-split {
                .mtd-btn {
                    flex: 1 1 50%;
                }
            }
        }
    }
}
</style>
