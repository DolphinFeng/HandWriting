<template>
    <div>
        <mtd-form
            class="form-index"
            ref="mtdFormIndex"
            :label-width="80"
            :label-position="labelPosition"
            :model="formData">
            <mtd-form-item
                v-for="field in formatFieldSchema"
                :key="field.name"
                :label="field.name"
                :prop="field.prop"
                :rules="rule(field)"
                :class="[{'mtd-form-item-required': field.required }, `custom-form__item ${field.prop} custom-label-${textAlign}`]"
                v-show="!(field.identify === 'assigned' && isHiddenAssign(field))">
                <component
                    v-if="field.identify === 'cc'"
                    :is="field.component"
                    :field="field"
                    :with-default="true"
                    :cc-list="defaultCcListArr"
                    @change="handleItemChange"
                    :form="formData"
                    :form-value="formData[field.identify]" />
                <!-- <component
                    v-else-if="field.identify === 'labels'"
                    :is="field.component"
                    :field="field"
                    :tag-list="defaultLabelList"
                    @change="handleItemChange"
                    :form="formData"
                    :form-value="formData[field.identify]" /> -->
                <!-- <component
                    v-else-if="field.identify === 'permission'"
                    :is="field.component"
                    :field="field"
                    @change="handleItemChange"
                    :form="formData"
                    :form-value="formData[field.identify]" /> -->
                <!-- 详情编辑 -->
                <hover-field v-else-if="isOriginEdit">
                    <component
                        :is="field.component"
                        :field="field"
                        @change="handleItemChange"
                        @blur-change="handleItemBlurChange"
                        :form="formData"
                        :disabled="disabled" />
                </hover-field>
                <component
                    v-else
                    :is="field.component"
                    :field="field"
                    @change="handleItemChange"
                    @blur-change="handleItemBlurChange"
                    :form="formData"
                    :form-value="formData[field.identify]" />
                <div class="form-item-instruction" v-if="field.instruction">{{ field.instruction }}</div>
            </mtd-form-item>
        </mtd-form>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { FieldToCompontent, SysFieldToComponent } from '@/config/custom.conf.ts';
import { importComponents, firstUpperCase } from '@/utils/tools/index.ts';

import * as systemValidator from './Template/System/systemValidator';
import clonedeep from 'lodash.clonedeep';
import { State, Getter } from 'vuex-class';

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
    @State(state => state.tt.userInfo)
    userDisplayInfo: CommonTypes.userDisplayItem;

    @Prop({ default: () => {
        return [];
    }})
    fieldSchema: CommonTypes.customField[];

    @Prop({ default: () => {
        return [];
    }})
    defaultCcList: string[];

    @Prop({ default: false })
    isOriginEdit: boolean;

    @Prop({ default: 'right' })
    textAlign: string;

    @Prop({ default: false })
    noHidden: boolean;

    @Prop({ default: () => {
        return {};
    }})
    data: CommonTypes.mapObject;

    @Prop({ default: false })
    disabled: boolean;

    @Prop({ default: 'right' })
    labelPosition?: string;

    @Getter spaceDomain;

    $refs: any;

    formData: any = {};
    pureFormData: any = {};

    lastItemId: number = 0;

    @Watch('data', { immediate: true })
    mountData () {
        // 重置formData 防止被删除的字段再出现
        this.formData = {};
        for (let key in this.data) {
            this.$set(this.formData, key, this.data[key]);
        }
    }

    @Watch('formatFieldSchema', { immediate: true })
    mountformData (schema) {
        schema.forEach(field => {
            this.formData[field.prop] = this.formData[field.prop] || field.defaultValue;
            // console.log(index, field.prop, this.formData[field.prop]);
        });
    }
    // 获取默认展示项
    get defaultCcListArr () {
        const defaultCcList: any[] = [];
        // 去重
        Array.from(new Set(this.defaultCcList)).forEach((elem) => {
            let obj = {
                username: elem,
                withDefault: true
            };
            defaultCcList.push(obj);
        });
        this.fieldSchema.forEach((field) => {
            if (field.identify === 'cc') {
                let nameList: string[] = this.formData['cc'] || [];
                if (field.defaultValue && field.defaultValue.length > 0) {
                    nameList = nameList.concat(field.defaultValue.split(','));
                }
                nameList.forEach((elem) => {
                    let objName = {
                        username: elem,
                        withDefault: false
                    };
                    defaultCcList.push(objName);
                });
            }
        });
        return defaultCcList;
    }
    // get defaultLabelList () {
    //     let defaultLabelList: number[] = [];
    //     this.fieldSchema.forEach((field) => {
    //         if (field.identify === 'labels' && field.defaultValue && field.defaultValue.length > 0) {
    //             field.defaultValue.split(',').forEach((elem) => {
    //                 defaultLabelList.push(parseInt(elem, 10));
    //             });
    //         }
    //     });
    //     console.log('defaultLabelList', defaultLabelList);
    //     return defaultLabelList;
    // }
    rule (field) {
        const validateFunc = systemValidator[`validate${firstUpperCase(field.identify || field.component || '')}`];
        if (validateFunc) {
            return { trigger: 'blur', required: field.required, validator: validateFunc(this.$getText) };
        }
        return { trigger: 'blur', required: field.required, validator: systemValidator['validate'](this.$getText) };
    }

    handleItemChange (val, field, templateInfo ?: any) {
        // 对向谁发起作特殊处理
        if (field.identify === 'assigned') {
            Object.keys(val).forEach(key => {
                this.formData[key] = val[key];
                this.pureFormData[key] = val[key];
            });
            this.$emit('assignedChange', val);
        } else {
            this.formData[field.prop] = val;
            this.pureFormData[field.identify || field.prop] = val;
        }
        this.formData[field.prop] = val;
        this.$emit('change-data', this.pureFormData);
        if (templateInfo && templateInfo.id !== +this.$route.params.id) {
            if (this.lastItemId !== val.itemId) {
                this.lastItemId = val.itemId;
                switch (templateInfo.type) {
                    case 'CUSTOM':
                        // 如果是克隆工单，不要跳
                        let route = null;
                        if (this.$route.name === 'tt_clone_custom') {
                            const cloneId = this.$route.query.id;
                            const customFormId = parseInt(this.$route.query.custom, 10);
                            if (templateInfo.id === customFormId) break;
                            route = this.$router.resolve({
                                name: 'tt_clone_custom',
                                params: {
                                    space: this.spaceDomain
                                },
                                query: {
                                    custom: templateInfo.id,
                                    id: cloneId,
                                    categoryInfo: JSON.stringify(val)
                                }
                            });
                        } else {
                            route = this.$router.resolve({
                                name: 'tt_helpdesk_create',
                                params: {
                                    id: templateInfo.id,
                                    rgId: templateInfo.rgId,
                                    space: this.spaceDomain
                                },
                                query: {
                                    categoryInfo: JSON.stringify(val)
                                }
                            });
                        }
                        window.location.href = route.href;
                        break;
                    case 'NORMAL':
                        const descItem = this.fieldSchema.find(item => item.prop === 'desc');
                        if (descItem && descItem.prop) this.formData[descItem.prop] = templateInfo.content;
                        this.$emit('templateChange', templateInfo, val.itemId);
                        break;
                    default:
                        console.log('未绑定模板');
                }
            }
        }
        this.$emit('change', this.formData);
    }
    handleItemBlurChange () {
        this.$emit('blur-change', this.formData);
    }
    get formatFieldSchema () {
        let fieldSchema = [];
        // 是否隐藏隐藏字段（详情下不隐藏）
        if (this.noHidden) {
            fieldSchema = this.fieldSchema;
        } else {
            this.fieldSchema.forEach((field) => {
                if (!field.isHidden && field.identify !== 'city') {
                    fieldSchema.push(field);
                }
            });
        }
        return fieldSchema.map((field) => {
            let obj: any = {
                name: field.name,
                instruction: field.instruction || '',
                identify: field.identify || '',
                // 创建模式下没有id，前端自行定义了组件类型+数字的prop
                prop: `'${field.id}'`,
                // 融合系统字段和自定义字段 系统字段没有inputType 有identify
                component: field.inputType ? FieldToCompontent[field.inputType] : (SysFieldToComponent[field.identify] || `component${firstUpperCase(field.identify)}`),
                defaultValue: this.initDefaultValue(field),
                options: field.options,
                required: field.isRequired === undefined ? field.defaultAttributes.isRequired : field.isRequired,
                hidden: field.isHidden === undefined ? field.defaultAttributes.isHidden : field.isHidden,
                editable: field.defaultAttributes === undefined ? true : field.defaultAttributes.editable
            };
            if (field.identify === 'assigned') {
                obj.extraSettings = field.extraSettings;
            }
            return obj;
        });
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
        } else if (field.identify === 'reporter') {
            if (field.defaultValue) {
                defaultVal = field.defaultValue;
            } else {
                defaultVal = this.userDisplayInfo.username;
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
        return new Promise(async (resolve, reject) => {
            try {
                const r: any = await this.getValidateFn(this.$refs.mtdFormIndex, this.getData, callback);
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
                callback = (valid: boolean, errMsg: string = '请检查表单信息') => {
                    valid ? resolve({
                        valid,
                        payload: getFromDataFn()
                    }) : reject({
                        valid,
                        payload: errMsg
                    });
                };
            }));
        }
        C.validate((valid: boolean) => {
            callback(valid);
        }).catch(err => console.log(`validate msg: `, err));
        if (promise) return promise;
    }
    isHiddenAssign (field) {
        return field.identify === 'assigned' && field.extraSettings.isItemHidden && field.extraSettings.isAssignedHidden;
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
.custom-label-left {
    /deep/ .mtd-form-item-label {
        text-align: left !important;
    }
}
</style>
