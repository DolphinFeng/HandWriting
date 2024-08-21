<template>
    <div class="inspection-form-container">
        <div class="header title">人工质检</div>
        <div class="total">
            <span class="count">{{ totalCount }}</span>分
        </div>
        <div class="wrapper">
            <div class="deduction">
                <div class="title">扣分项</div>
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
            <div class="remark" v-if="noteSwitch">
                <div class="title" :class="{'required': noteRequired}">备注</div>
                <mtd-textarea
                    placeholder="输入内容不超过500个字符"
                    style="width: 100%;"
                    rows="3"
                    maxlength="500" />
            </div>
        </div>
        <div class="operations">
            <div class="tips">预览模式不支持点击确定</div>
            <div class="btn-wrapper">
                <mtd-button
                    type="primary"
                    disabled>确定</mtd-button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';
@Component({
    components: {}
})
export default class InspectionForm extends Vue {
    @Prop() inspectionForm: CommonTypes.mapObject;

    checkedDeductionList: string[] = [];
    editForm: CommonTypes.mapObject = [];
    totalCount: number = 0;
    noteSwitch: boolean = false;
    noteRequired: boolean = false;

    @Watch('inspectionForm', { immediate: true, deep: true })
    onFormChanged () {
        if (this.inspectionForm) {
            this.editForm = cloneDeep(this.inspectionForm.deduction);
            (this.inspectionForm.systemFields || []).forEach(item => {
                switch (item.name) {
                    case 'totalPoints':
                        this.totalCount = item.value;
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
        }
    }

    checkboxChanged (val, item) {
        this.totalCount = val ? (this.totalCount - item.value) : (this.totalCount + item.value);
    }
}
</script>
<style lang="postcss">
.inspection-form-container {
    width: 304px;
    flex: 0 0 304px;
    padding: 20px 0;
    position: relative;
    background-color: #FFFFFF;
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
            color: #000000;
            line-height: 36px;
            margin-right: 4px;
        }
    }
    .wrapper {
        height: calc(100% - 210px);
        overflow: auto;
    }
    .deduction,
    .remark {
        margin: 0 20px;
        .title {
            font-size: 14px;
            margin-top: 21px;
        }
    }
    .deduction {
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
                    }
                }
            }
            .count {
                flex: 1 0 auto;
                color: #D41E21;
                text-align: right;
                margin-top: 12px;
                span {
                    margin-left: 2px;
                    color: rgba(0, 0, 0, 0.35);
                }
            }
        }
    }
    .remark {
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
                color: #F5483B;
                position: absolute;
                left: -10px;
            }
        }
    }
    .operations {
        position: absolute;
        bottom: 20px;
        text-align: center;
        width: calc(100% - 32px);
        margin: 0 16px;
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
            }
        }
    }
}
</style>
