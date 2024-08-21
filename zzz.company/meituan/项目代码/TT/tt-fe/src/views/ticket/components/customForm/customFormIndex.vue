<template>
    <mtd-form
        :class="`custom-form-index ${name}`"
        ref="customFormIndex"
        :label-width="80"
        :model="formData">
        <mtd-form-item
            v-for="field in formatFieldSchema"
            :key="field.name"
            :label="field.name"
            :prop="field.prop"
            :rules="rule(field)"
            :class="[{'mtd-form-item-required': field.required }, `custom-form__item ${field.prop} custom-label-${textAlign}`]">
            <component
                :is="field.component"
                :field="field"
                @change="handleItemChange"
                @finish-upload="handleUpload"
                :form="formData"
                :form-value="formData[field.prop]"
                :has-no-catalog="hasNoCatalog"
                :rg-id="rgId" />
            <div class="form-item-instruction" v-if="field.instruction">{{ field.instruction }}</div>
        </mtd-form-item>
        <div v-if="!formatFieldSchema.length">
            {{ $getText('form_index_no_form', '暂无表单，可直接发起工单') }}
        </div>
    </mtd-form>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { FieldToCompontent } from '@/config/custom.conf.ts';
import { importComponents, firstUpperCase } from '@/utils/tools/index.ts';

import * as systemValidator from './Template/System/systemValidator';
import clonedeep from 'lodash.clonedeep';
import { Getter } from 'vuex-class';
import { FieldToDataType } from '@/config/custom.conf';

// 批量注册组件
let systemComponent = require.context('./Template/System', false, /\.vue$/);
let basicComponent = require.context('./Template/Basic', false, /\.vue$/);
let components: any = {};

importComponents(systemComponent, components);
importComponents(basicComponent, components);

/**
 * 自定义表单
 *
 * @author zhanglinna
 * @date 03/12/2020
 */

@Component({
    components
})

export default class FormIndex extends Vue {
    @Getter misX;
    @Getter inside;
    @Prop({ default: () => {
        return [];
    }})
    fieldSchema: CommonTypes.customField[];

    @Prop({ default: '' })
    name: string;

    // @Prop({ default: false })
    // isOriginEdit: boolean;

    @Prop({ default: 'left' })
    textAlign: string;

    @Prop({ default: false })
    noHidden: boolean;

    @Prop({ default: false })
    disabled: boolean;

    @Prop({ default: null })
    rgId: number;

    @Prop()
    defaultContent: any;

    @Prop()
    hasNoCatalog: boolean;

    // 发起方式
    @Prop({ default: 'BASIC' })
    createType: string;

    @Prop()
    formType: string;

    @Watch('defaultContent', { immediate: true, deep: true })
    getStaticConfig (config) {
        if (config && (config.hasOwnProperty('name') || config.hasOwnProperty('desc'))) {
            this.mountformData(this.fieldSchema);
        }
    }

    @Getter spaceDomain;

    $refs: any;

    formData: any = {};
    formatSubmitData: any = {};

    lastItemId: number = 0;

    formatFieldSchema: any = [];

    @Watch('fieldSchema', { immediate: true, deep: true })
    mountformData (schema) {
        // reset schema
        if (!schema.length) {
            this.formatFieldSchema = [];
            this.formData = {};
            return;
        }
        const formatFieldSchema = [];
        this.formData = Object.assign({},{ file: this.formData.file });
        schema.forEach(field => {
            const formatField: any = {
                name: field.name,
                instruction: field.instruction || '',
                identify: field.identify || '',
                inputType: field.inputType || '',
                prop: field.identify || `"${field.id}"`,
                id: field.id,
                // 融合系统字段和自定义字段 系统字段没有inputType 有identify
                component: field.inputType ? FieldToCompontent[field.inputType] : `component${firstUpperCase(field.identify)}`,
                defaultValue: this.initDefaultValue(field),
                options: field.options,
                required: field.isRequired === undefined ? field.defaultAttributes.isRequired : field.isRequired,
                hidden: field.isHidden === undefined ? field.defaultAttributes.isHidden : field.isHidden,
                editable: field.defaultAttributes === undefined ? true : field.defaultAttributes.editable,
                extraSettings: field.extraSettings ? field.extraSettings : {}
            };
            if (formatField.identify === 'assigned') {
                formatField.name = '处理人';
                // 如果设置对发起人隐藏/不允许指定处理人，隐藏该表单项
                formatField.hidden = field.extraSettings.isAssignedHidden || !field.extraSettings.specificAssigned;
                // 根据可选目录范围展示默认目录
                this.getAssignedCti(field.extraSettings.itemsScope);
            }
            if (!formatField.hidden && formatField.identify !== 'city' && (this.inside || !['cc', 'permission', 'assigned', 'reporter'].includes(formatField.identify))) {
                formatFieldSchema.push(formatField);
            }
            const resVal = this.formData[formatField.prop] || formatField.defaultValue;
            this.formData[formatField.prop] = resVal;
            this.formatSubmitData[formatField.prop] = this.getFormatSubmitData(resVal, formatField);
            this.formatFieldSchema = formatFieldSchema;
        });
        this.$emit('change', this.formatSubmitData);
    }
    rule (field) {
        const validateFunc = systemValidator[`validate${firstUpperCase(field.identify || field.component || '')}`];
        if (validateFunc) {
            return { trigger: 'blur', required: field.required, validator: validateFunc(this.$getText) };
        }
        return { trigger: 'blur', required: field.required, validator: systemValidator['validate'](this.$getText) };
    }
    getAssignedCti (ctiScope) {
        if (ctiScope && ctiScope.items) {
            // 指定目录范围（全部目录、RG绑定目录、指定目录）
            // 包含了发起人无该目录的发起权限的情况
            this.$emit('get-assigned-cti', ctiScope.items);
        } else if (ctiScope && ctiScope.categoryId) {
            // 默认目录（无items，直接提供三级目录）
            let defaultCti = Object.assign({}, ctiScope);
            this.$emit('get-default-cti', defaultCti);
        }
    }

    handleItemChange (val, field) {
        this.formData[field.prop] = val;
        this.formatSubmitData[field.prop] = this.getFormatSubmitData(val, field);
        this.$emit('change', this.formatSubmitData);
    }
    getFormatSubmitData (val, field) {
        if (field.inputType && field.id) {
            return {
                customFieldId: field.id,
                dataType: FieldToDataType[field.inputType],
                value: Array.isArray(val) ? val.join(',') : val
            };
        } else {
            return val;
        }
    }
    // 初始化默认值
    initDefaultValue (field) {
        let defaultVal: any = '';
        if (field.identify === 'cc') {
            if (field.defaultValue && field.defaultValue.length) {
                defaultVal = field.defaultValue.split(',');
            } else {
                defaultVal = [];
            }
            return defaultVal;
        } else if (field.identify === 'labels') {
            if (field.defaultValue && field.defaultValue.length) {
                defaultVal = field.defaultValue.split(',');
            } else {
                defaultVal = [];
            }
            return defaultVal;
        } else if (field.identify === 'name') {
            if (this.createType === 'BASIC') {
                // 官网发起时，保留用户在02输入的值
                defaultVal = this.defaultContent?.name ? (this.defaultContent.name + (field.defaultValue ? field.defaultValue : '')) : field.defaultValue;
            } else {
                // 其他发起方式，不保留用户之前的输入，此时defaultContent是normal表单的默认值，仅在normal情况下保留
                if (this.formType === 'normal' || !this.inside) {
                    defaultVal = this.defaultContent?.name ? this.defaultContent.name : (field.defaultValue || '');
                } else {
                    defaultVal = field.defaultValue ? field.defaultValue : '';
                }
            }
            return defaultVal;
        } else if (field.identify === 'desc') {
            if (this.createType === 'BASIC') {
                // 官网发起时，保留用户在02输入的值
                defaultVal = this.defaultContent?.desc ? (this.defaultContent.desc + (field.defaultValue ? field.defaultValue : '')) : field.defaultValue;
            } else {
                // 其他发起方式，不保留用户之前的输入，此时defaultContent是normal表单的默认值，仅在normal情况下保留
                if (this.formType === 'normal') {
                    defaultVal = this.defaultContent?.desc ? this.defaultContent.desc : '';
                } else {
                    defaultVal = field.defaultValue ? field.defaultValue : '';
                }
            }
            return defaultVal;
        }
        if (field.defaultValue) {
            defaultVal = field.defaultValue;
        } else if (field.options && field.options.length > 0) {
            let defaultOptions = [];
            field.options.forEach((option) => {
                if (option.isDefault) {
                    defaultOptions.push(option.value);
                }
            });
            // 如果是多选 默认值是数组
            if (field.inputType === 'MULTI_DROP_DOWN') {
                defaultVal = defaultOptions;
            } else {
                defaultVal = defaultOptions[0] || '';
            }
        }
        return defaultVal;
    }
    getData () {
        const formData: any = clonedeep(this.formData);
        return formData;
    }
    validate (callback?: any) {
        // console.log('validate', this.formData, callback);
        Object.keys(this.formData).map(key => {
            if (this.formData[key] === undefined) {
                this.formData[key] = '';
            }
        });
        // console.log('validate after', this.formData, callback);
        return new Promise(async (resolve, reject) => {
            try {
                const r: any = await this.getValidateFn(this.$refs.customFormIndex, this.getData, callback);
                resolve(r);
            } catch (e) {
                reject(e);
            }
        });
    }
    getValidateFn (C: any, getFromDataFn: any, callback?: any) {
        let promise;

        if (typeof callback !== 'function') {
            promise = new Promise(((resolve, reject) => {
                callback = (valid: boolean, errMsg: string) => {
                    valid ? resolve({
                        valid,
                        payload: getFromDataFn()
                    }) : reject({
                        valid,
                        payload: errMsg || '请检查表单信息'
                    });
                };
            }));
        }
        C.validate((valid: boolean) => {
            callback(valid);
        }).catch(err => console.log(`validate msg: `, err));
        if (promise) return promise;
    }
    handleUpload () {
        this.$emit('finish-upload');
    }
}
</script>
<style lang="scss" scoped>
.form-item-instruction {
    color: rgba(0, 0, 0, 0.38);
    font-size: 12px;
    line-height: 20px;
    margin-top: 0;
}
</style>
