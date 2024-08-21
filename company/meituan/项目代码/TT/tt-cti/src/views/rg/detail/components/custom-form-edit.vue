<template>
    <div class="custom-form-edit-container">
        <div class="steps-header">
            <div class="header-center-container">
                <div class="header-title">
                    <i class="mtdicon mtdicon-arrow-left" @click="cancelBack" />
                    <span>{{ formId ? `编辑模板` : `添加模板` }}</span>
                </div>
                <div class="operate-buttons">
                    <mtd-button @click="cancelBack" class="close-btn">取消</mtd-button>
                    <mtd-button
                        :loading="btnLoading"
                        type="primary"
                        @click="preview">预览</mtd-button>
                    <mtd-button
                        :loading="btnLoading"
                        type="primary"
                        @click="submit">保存</mtd-button>
                </div>
            </div>
        </div>
        <div class="custom-form-wrapper">
            <div class="basic-setting">
                <div class="title-name">基本信息</div>
                <mtd-form
                    :rules="ruleCustom"
                    :model="customBasicForm"
                    ref="totalForm">
                    <mtd-form-item label="模板名称：" prop="name">
                        <mtd-input v-model="customBasicForm.name" style="width: 100%;" />
                    </mtd-form-item>
                    <mtd-form-item label="模板说明：" prop="instruction">
                        <mtd-textarea
                            v-model="customBasicForm.instruction"
                            style="width: 100%;" />
                    </mtd-form-item>
                </mtd-form>
            </div>
            <div class="custom-setting">
                <div class="title-name">自定义设置</div>
                <div class="template-setting-container">
                    <div class="card-title">
                        模板预览
                        <mtd-tooltip
                            class="item"
                            placement="right-start"
                            popper-class="add-field-tooltip"
                            theme="light"
                            :visible="addFieldVisible">
                            <FieldShow
                                slot="content"
                                @close="addFieldVisible = false"
                                :total-fields="totalRes" />
                            <span
                                class="text-button"
                                style="float: right;"
                                type="text"
                                @click="addFieldVisible = !addFieldVisible"><i class="iconfont icon-add-square-o" />添加字段</span>
                        </mtd-tooltip>
                    </div>
                    <div class="readonly-preview-wrapper">
                        <FormIndex
                            name="visibleFields"
                            ref="visibleFields"
                            :field-schema="visibleFields"
                            :editable="true"
                            :dragable="true"
                            :readonly="true"
                            @edit="editFieldItem"
                            @schema-change="visibleSchemaChange" />
                    </div>
                    <div class="fold-wrapper">
                        <mtd-collapse v-model="isFold" type="sample">
                            <mtd-collapse-item :title="`查看对发起人隐藏的字段(${hiddenFields.length})`" value="1">
                                <FormIndex
                                    ref="hiddenFields"
                                    v-show="isFold === '1'"
                                    :field-schema="hiddenFields"
                                    :editable="true"
                                    :readonly="true"
                                    @edit="editHiddenFieldItem"
                                    @schema-change="hiddenSchemaChange" />
                            </mtd-collapse-item>
                        </mtd-collapse>
                    </div>
                </div>
                <div class="field-setting-container" v-if="currentField.type">
                    <div class="card-title">字段设置</div>
                    <FieldEdit
                        :field="currentField"
                        :pos="currentPos"
                        @change="fieldEditChange"
                        @hidden-change="hiddenChange" />
                </div>
            </div>
        </div>
        <custom-preview
            :visible.sync="showPreview"
            :field-schema="visibleFields"
            @close="showPreview = false" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { Form } from '@ss/mtd-vue';

import FieldShow from './customForm/field-show.vue';
import FieldEdit from './customForm/field-edit.vue';
import FormIndex from './customForm/form/formIndex.vue';
import CustomPreview from './custom-preview.vue';

import store from '@/store';
import * as api from '@/api';

import { pick } from 'lodash';

// 全局注册拖拽组件
import { Container, Draggable } from 'vue-smooth-dnd';
Vue.component('Container', Container);
Vue.component('Draggable', Draggable);

const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('模板名称不能为空'));
    }
    if (value.length > 60) {
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

/**
 *  迁移页面
 *
 * @author liyuyao
 * @date 03/12/2019
 */
@Component({
    components: {
        FieldShow,
        FormIndex,
        FieldEdit,
        CustomPreview
    }
})
export default class CustomFormEdit extends Vue {
    @State(state => state.cti.systemFields)
    systemFields: CommonTypes.mapObject[];

    @Mutation setRgSetting;

    $refs: { totalForm: Form; hiddenFields: FormIndex; visibleFields: FormIndex };
    customBasicForm: CommonTypes.mapObject = {
        name: '',
        instruction: ''
    };
    addFieldVisible: boolean = false;

    btnLoading: boolean = false;

    configList: any = [];

    currentField: any = {};
    currentPos: number = null;

    isFold: string = '0';

    showPreview: boolean = false;

    hiddenFields: any = [];
    visibleFields: any = [];

    groupConfigList: any = [];

    // defaultRgSetting: CommonTypes.mapObject = {};

    ruleCustom = {
        name: [
            { validator: validateName, trigger: 'blur' }
        ],
        instruction: [
            { validator: validateInstruction, trigger: 'blur' }
        ]
    };

    async mounted () {
        if (!this.systemFields || !this.systemFields.length) {
            await this.getSystemFields();
        }
        if (!this.formId) {
            // const listShow = this.systemFields.filter((item) => {
            //     return !foldSys.includes(item.identify);
            // });
            this.separateVisibleHidden(this.systemFields);
        } else {
            this.getCustomFormDetail(this.formId);
        }
        // window.onbeforeunload = () => {
        //     return '确定要离开吗，离开后数据不会保存';
        // };
    }

    beforeDestroy () {
        window.onbeforeunload = () => {

        };
    }

    // 获取系统字段
    async getSystemFields () {
        const res = await api.rgApi.getSystemFields(this.rgId);
        const { code, data } = res;
        if (code === 200) {
            store.commit('GET_SYSTEM_SETTINGS', data.items.filter(item => {
                return item.identify !== 'city';
            }));
        }
    }
    separateVisibleHidden (list) {
        const visibleArr = [];
        const hiddenArr = [];
        list.forEach((field) => {
            if (field.identify === 'city') {
                return;
            }
            // 将系统字段的默认属性转换为字段属性
            if (field.isRequired === undefined) {
                field.isRequired = field.defaultAttributes.isRequired;
            }
            if (field.isHidden === undefined) {
                field.isHidden = field.defaultAttributes.isHidden;
            }
            if (field.extraSettings === undefined && field.defaultAttributes && field.defaultAttributes.extraSettings) {
                field.extraSettings = field.defaultAttributes.extraSettings;
            }
            if (field.isHidden) {
                hiddenArr.push(field);
            } else {
                visibleArr.push(field);
            }
        });
        this.groupConfigList = visibleArr.concat(hiddenArr);
        this.hiddenFields = hiddenArr;
        this.visibleFields = visibleArr;
    }
    async getCustomFormDetail (id) {
        const res = await api.rgApi.getCustomFormDetail(id, true);
        const { code, data } = res;
        if (code === 200) {
            this.customBasicForm.name = data.name;
            this.customBasicForm.instruction = data.instruction;
            this.separateVisibleHidden(data.customFieldContents);
        }
    }
    preview () {
        this.showPreview = true;
    }
    async submit () {
        interface AddParams {
            customFieldContents: any;
            rgId: number;
            type: string;
            id?: number;
        }
        this.$refs.totalForm.validate(async (valid) => {
            if (valid) {
                const addParams: AddParams = {
                    customFieldContents: this.totalRes,
                    rgId: this.rgId,
                    type: '定制表单'
                };
                this.formId && (addParams.id = this.formId);
                const params = Object.assign(this.customBasicForm, addParams);
                const res = await api.rgApi.addRgCustomTemplate(params);
                const { code, data } = res;
                const link = data.copyLink || '';
                if (code === 200) {
                    this.$mtd.confirm({
                        title: '保存成功',
                        message: `<a target="_blank" href="${link}">${link}</a>`,
                        dangerouslyUseHTMLString: true,
                        width: '433px',
                        showCancelButton: true,
                        type: 'success',
                        okButtonText: '复制链接',
                        cancelButtonText: '关闭',
                        onOk: () => {
                            const input = document.createElement('input');
                            document.body.appendChild(input);
                            input.setAttribute('value', link);
                            input.select();
                            if (document.execCommand('copy')) {
                                document.execCommand('copy');
                                this.$mtd.message.success('复制成功');
                                // remove input
                                input.parentElement.removeChild(input);
                            }
                            this.$router.push({
                                name: 'rg_template_custom',
                                query: {
                                    rgId: `${this.rgId}`
                                }
                            }).catch(e => e);
                        },
                        onCancel: () => {
                            this.$router.push({
                                name: 'rg_template_custom',
                                query: {
                                    rgId: `${this.rgId}`
                                }
                            }).catch(e => e);
                        }
                    }).catch(e => e);
                }
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
                this.$router.push({
                    name: 'rg_template_custom',
                    query: {
                        rgId: `${this.rgId}`
                    }
                }).catch(e => e);
            }
        }).catch(e => e);
    }
    editFieldItem (field, index) {
        const ref = this.$refs.hiddenFields;
        ref && ref.clearEditStatus();
        this.currentField = field;
        this.currentPos = index;
    }
    editHiddenFieldItem (field, index) {
        // 清除另一个表单的选中态
        const ref = this.$refs.visibleFields;
        ref && ref.clearEditStatus();
        this.currentField = field;
        this.currentPos = this.visibleFields.length + index;
    }
    hiddenChange (isHidden) {
        const ref = isHidden ? this.$refs.visibleFields : this.$refs.hiddenFields;
        ref && ref.setFirstStatus();
    }
    fieldEditChange (editConfig, pos) {
        // 如果是系统字段，还要保留它defaultAttributes和editableFields的默认设置，再加上
        if (editConfig.type === 1) {
            const sysField = this.systemFields.find((item) => {
                return item.identify === editConfig.identify;
            });
            editConfig = Object.assign(editConfig, {
                defaultAttributes: sysField.defaultAttributes
            });
        }
        const refVisibleFields = this.$refs.visibleFields;
        const refHiddenFields = this.$refs.hiddenFields;
        if (editConfig.identify) {
            pos = this.groupConfigList.findIndex(item => editConfig.identify === item.identify);
            if (editConfig.isHidden && refHiddenFields) {
                refHiddenFields.activeKey = editConfig.identify;
            }
            if (!editConfig.isHidden && refVisibleFields) {
                refVisibleFields.activeKey = editConfig.identify;
            }
        }
        this.$set(this.groupConfigList, pos, editConfig);
        this.separateVisibleHidden(this.groupConfigList);
    }
    visibleSchemaChange (schema) {
        this.visibleFields = schema;
        this.groupConfigList = this.visibleFields.concat(this.hiddenFields);
    }
    hiddenSchemaChange (schema) {
        this.hiddenFields = schema;
        this.groupConfigList = this.visibleFields.concat(this.hiddenFields);
    }
    formatDefaultCc (userMap) {
        return Object.keys(userMap).map((user) => {
            return {
                displayName: userMap[user],
                username: user
            };
        });
    }
    get totalRes () {
        const total = this.visibleFields.concat(this.hiddenFields);
        const sysKey = ['id', 'name', 'instruction', 'type', 'identify', 'options', 'defaultValue', 'isRequired', 'isHidden', 'extraSettings'];
        const customKey = ['id', 'name', 'instruction', 'type', 'inputType', 'options', 'defaultValue', 'isRequired', 'isHidden'];
        const totalRes = total.map((item) => {
            const keys = item.type === 1 ? sysKey : customKey;
            return pick(item, keys);
        });
        return totalRes;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get formId () {
        return parseInt(this.$route.query.formId as string, 10);
    }
}
</script>

<style lang="postcss">
.custom-form-edit-container {
    background: #FFFFFF;
    .steps-header {
        position: sticky;
        top: 0;
        width: 100%;
        padding: 14px;
        box-shadow: 0 1px 6px 0 rgba(192, 196, 204, 0.39);
        background: #FFFFFF;
        z-index: 5;
        .header-center-container {
            width: 1200px;
            margin: 0 auto;
            .header-title {
                display: inline-block;
                font-family: PingFangSC-Semibold;
                font-size: 18px;
                color: rgba(0, 0, 0, 0.87);
                letter-spacing: 0;
                line-height: 26px;
                i {
                    margin-right: 10px;
                }
            }
            .operate-buttons {
                float: right;
                .mtd-btn {
                    width: 80px;
                    margin-left: 16px;
                }
            }
            .close-btn {
                margin-right: 8px;
            }
        }
    }
    .custom-form-wrapper {
        padding-top: 20px;
        margin: 0 auto;
        width: 1200px;
    }
    .basic-setting {
        width: 60%;
    }
    .title-name {
        font-family: PingFangSC-Semibold;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 16px;
        border-left: 5px solid #FF8800;
        padding-left: 8px;
        margin-bottom: 15px;
    }
    .template-setting-container,
    .field-setting-container {
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        width: 60%;
        margin-right: 24px;
        display: inline-block;
        vertical-align: top;
        .card-title {
            background: rgba(0, 0, 0, 0.06);
            box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.12);
            border-radius: 4px 4px 0 0;
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.87);
            line-height: 40px;
            text-align: center;
        }
    }
    .readonly-preview-wrapper {
        padding: 20px 5px 0 0;
    }
    .field-setting-container {
        position: sticky;
        top: 60px;
        display: inline-block;
        width: calc(40% - 55px);
    }
    .text-button {
        float: right;
        margin-right: 6px;
        display: inline-block;
        cursor: pointer;
        font-size: 14px;
        color: #FF8800;
        i {
            margin-right: 3px;
            vertical-align: bottom;
        }
    }
    .mtd-collapse-item-content {
        padding: 0;
    }
}
.add-field-tooltip {
    width: 344px;
    max-width: 344px;
}
</style>
