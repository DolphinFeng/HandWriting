<template>
    <div class="field-edit-container">
        <div
            class="mtd-form-item-helper"
            style="margin-left: 20px"
            v-if="field.identify === 'cc' || field.identify === 'permission'">
            <span v-if="field.identify === 'cc'">* RG组设置的默认抄送人将在工单发起后自动添加。如需修改，请前往RG「设置」</span>
            <span v-if="field.identify === 'permission'">* 若RG组设置了默认保密，向RG组发起的自定义表单也将为保密。如需修改，请前往RG「设置」</span>
        </div>
        <FormIndex
            :field-schema="fieldConfig"
            :data="field"
            @change="configChange"
            name="fieldSetting"
            @hidden-change="hiddenChange" />
        <div v-if="field.type === 2">
            <label class="mtd-form-item-label" style="width: 100px; margin-bottom: 10px;">字段类型</label><div class="mtd-form-item-content">{{ customFieldCn[field.component] }}</div>
        </div>
        <assigned-extra-setting
            v-if="field.identify && field.identify === 'assigned'"
            :data="field"
            @change="getExtraSetting" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import FormIndex from './form/formIndex.vue';
import AssignedExtraSetting from './assigned-extra-setting.vue';
import { CustomFieldCn, compontentToField } from '@/config/custom.conf';
import { customFieldEditForm, extraEditFields } from './edit-components/editField.conf';
import { State } from 'vuex-class';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component({
    components: {
        FormIndex,
        AssignedExtraSetting
    }
})
export default class FieldEdit extends Vue {
    @State(state => state.cti.systemFields)
    systemFields: CommonTypes.mapObject[];

    @Prop({
        default: () => {
            return {
                name: '单行文本',
                type: '1',
                inputType: 'SINGLE_LINE_TEXT',
                defaultValue: '',
                isRequired: false,
                isHidden: false,
                validator: ''
            };
        }
    })
    field: CommonTypes.customField;

    @Prop()
    pos: number;

    editRes: any = {};

    @Watch('field', { immediate: true })
    onFieldChange (field) {
        this.editRes = Object.assign({}, field);

        const settingDefault = [];
        const defaultAttributes = this.field.defaultAttributes;
        const required = field.required === undefined ? defaultAttributes.isRequired : field.required;
        const hidden = field.hidden === undefined ? defaultAttributes.isHidden : field.hidden;
        if (required) {
            settingDefault.push('isRequired');
        }
        if (hidden) {
            settingDefault.push('isHidden');
        }
        this.field.setting = settingDefault;
    }

    customFieldCn: CommonTypes.mapObject = CustomFieldCn;

    // todo 有问题 required
    get fieldConfig () {
        // 自定义字段 当是选项情况时，将默认值替换为选项选框; 当是日期情况时，将默认值替换为日期框；当是关联字段时，默认值替换为关联字段选项
        if (this.field.type === 2) {
            const specialComponents = ['componentWithOptions', 'componentDate', 'componentRelation'];
            const compName = this.field.options ? 'componentWithOptions' : this.field.component;
            if (this.field.options || specialComponents.includes(compName)) {
                return customFieldEditForm.map((editField) => {
                    let editFieldNew = JSON.parse(JSON.stringify(editField));
                    if (editFieldNew.identify === 'defaultValue') {
                        const assignObj = extraEditFields[compName];
                        editFieldNew = Object.assign(editFieldNew, assignObj);
                    }
                    return editFieldNew;
                });
            } else {
                return customFieldEditForm;
            }
        } else {
            if (this.field.identify) {
                return this.formatSystemSetting(this.field.identify);
            } else {
                return customFieldEditForm;
            }
        }
    }
    // 如果遇到系统字段的设置，需要先获取到系统字段有哪些属性可以编辑
    formatSystemSetting (identify) {
        const setting = this.systemFields.find((system) => {
            return system.identify === identify;
        });
        const resConfig = JSON.parse(JSON.stringify(customFieldEditForm));
        return resConfig.map((item) => {
            return this.settingToField(item, setting);
        });
    }
    settingToField (field, setting) {
        const editableFields = setting.defaultAttributes.editableFields;
        const extraSettings = setting.defaultAttributes.extraSettings;
        const canEditDefaultValue = editableFields.includes('defaultValue');
        let resField = Object.assign(field, {
            editable: editableFields.includes(field.identify)
        });
        if (field.identify === 'setting') {
            const options = field.options.map(item => {
                return Object.assign(item, {
                    disabled: !editableFields.includes(item.value)
                });
            });
            resField = Object.assign(resField, {
                options: options
            });
        }
        // 系统字段的默认值设置 = 系统字段组件
        if (canEditDefaultValue && field.identify === 'defaultValue') {
            const sysToComponent = `IDENTIFY_${setting.identify.toUpperCase()}`;
            const defaultValueField: any = {
                inputType: sysToComponent
            };
            if (setting.options) {
                defaultValueField.options = setting.options;
            }
            resField = Object.assign(resField, defaultValueField);
        }
        if (extraSettings) {
            resField.extraSettings = extraSettings;
        }
        return resField;
    }
    configChange (config) {
        this.editRes = {
            name: config.name,
            instruction: config.instruction,
            type: config.type,
            defaultValue: config.type === 2 && config.options ? config.options.filter(item => item.isDefault).map(item => item.value) : config.defaultValue,
            isRequired: config.required,
            isHidden: config.hidden,
            inputType: config.type === 2 ? compontentToField[config.component] : '',
            identify: config.type === 1 ? config.identify : '',
            id: config.id
        };
        if (config.options) {
            this.editRes.options = config.type === 1 ? config.options.map(item => {
                return {
                    value: item.value,
                    isDefault: item.value === this.editRes.defaultValue
                };
            }) : config.options;
        }
        if (config.setting) {
            this.editRes.setting = config.setting;
        }
        if (config.extraSettings) {
            this.editRes.extraSettings = config.extraSettings;
        }
        // TODO: 关联字段的硬编码，把defaultval改成extraSetting
        // if (config.component === "componentRelation") {
        //     this.editRes['extraSettings'] = {
        //         'relationIntefaceIdentify': config.defaultValue
        //     };
        //     this.editRes.defaultValue = '';
        // }
        console.log('editRes', this.editRes);
        this.$emit('change', this.editRes, this.pos);
    }
    getExtraSetting (extraSettings) {
        this.editRes = Object.assign(this.editRes, {
            extraSettings: extraSettings
        });
        this.$emit('change', this.editRes, this.pos);
    }
    hiddenChange (isHidden) {
        this.$emit('hidden-change', isHidden);
    }
}
</script>
<style lang="postcss" scoped>
.field-edit-container {
    padding: 20px 15px 0 0;
}
</style>
