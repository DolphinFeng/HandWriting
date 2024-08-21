<template>
    <mtd-form
        class="form-index"
        :model="formData"
        ref="form">
        <Container
            behaviour="contain"
            group-name="move-container"
            :remove-on-drop-out="true"
            non-drag-area-selector=".fold-wrapper,.form-undragable"
            @drop="onDropEvent"
            :get-child-payload="getChildPayload">
            <Draggable
                v-for="(field, index) in formatFieldSchema"
                :key="field.prop">
                <mtd-form-item
                    :label="field.name"
                    :prop="field.prop"
                    :rules="rule(field)"
                    :class="[{'mtd-form-item-required': field.required, 'form-item-editable': editable && (activeKey === field.prop), 'form-undragable': !dragable }, `custom-form__item ${field.prop}`]"
                    v-if="!(field.identify === 'defaultValue' && !field.editable)"
                    @click.native="editFormItem(field, index)"
                    v-show="!(field.identify === 'assigned' && isHiddenAssign(field))">
                    <keep-alive>
                        <component
                            :is="field.component"
                            :readonly="readonly"
                            :field="field"
                            @change="handleItemChange"
                            @hidden-change="hiddenChange"
                            :form-value="formData[field.prop]"
                            :form="formData"
                            :form-name="name" />
                    </keep-alive>
                    <div class="form-item-instruction" v-if="field.instruction">{{ field.instruction }}</div>
                    <i
                        class="mtdicon mtdicon-close-thick"
                        v-if="editable && canDelete(field)"
                        @click="deleteItem(index)" />
                </mtd-form-item>
            </Draggable>
        </Container>
    </mtd-form>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Form } from '@ss/mtd-vue';
import { FieldToCompontent, SysFieldToComponent } from '@/config/custom.conf.ts';
import { importComponents, firstUpperCase } from '@/utils/tool.ts';
import { applyDrag } from '@/utils/helpers';
import eventBus from '@/utils/event-bus';

import * as systemValidator from './Template/System/systemValidator';

// 批量注册组件
const systemComponent = require.context('./Template/System', false, /\.vue$/);
const basicComponent = require.context('./Template/Basic', false, /\.vue$/);

const components: any = {};

importComponents(systemComponent, components);
importComponents(basicComponent, components);

/**
 * 自定义表单
 *
 * @author liyuyao
 * @date 03/12/2020
 */

@Component({
    components
})

export default class FormIndex extends Vue {
    @Prop({
        default: () => {
            return [];
        }
    })
    fieldSchema: CommonTypes.customField[];

    @Prop({ default: false })
    editable: boolean; // 能否编辑字段设置

    @Prop({ default: false })
    readonly: boolean; // 能否填写表单内容

    @Prop({ default: false })
    dragable: boolean; // 能否拖拽

    @Prop({
        default: () => {
            return {};
        }
    })
    data: CommonTypes.mapObject;

    @Prop({ default: '' })
    name: string;

    schema: CommonTypes.customField[] = [];
    formData: any = {};

    activeKey: string = '';

    dragField: CommonTypes.customField = null;

    mounted () {
        if (this.name === 'visibleFields') {
            eventBus.$on('clickAddField', this.clickAddField);
        }
    }

    beforeDestroy () {
        eventBus.$off('clickAddField');
    }

    getChildPayload (index) {
        return this.formatFieldSchema[index];
    }

    clickAddField (field) {
        let formatField = field;
        if (field.type === 1) {
            formatField = Object.assign(field, {
                isHidden: field.defaultAttributes.isRequired,
                isRequired: field.defaultAttributes.isHidden
            });
        }
        this.schema.push(formatField);
        this.schemaChange();
    }

    @Watch('fieldSchema', { immediate: true })
    getFieldSchema () {
        this.schema = this.fieldSchema;
        this.schemaChange();
    }

    @Watch('formatFieldSchema', { immediate: true })
    mountformData (schema, oldSchema) {
        // 重置formData 防止被删除的字段再出现
        this.formData = {};
        this.$refs.form && (this.$refs.form as Form).clearValidate();
        schema.forEach((field) => {
            const prop = field.prop;
            // 使用传入的值或者默认值
            this.$set(this.formData, prop, this.data[prop] || field.defaultValue);
        });
        // console.log('this.formData', this.formData);
        if (this.name === 'visibleFields') {
            // 首次进入选中第一个选项
            if ((!oldSchema || !oldSchema.length) && schema.length > 0) {
                this.editFormItem(schema[0], 0);
            }
        }
    }

    @Watch('data', { immediate: true })
    mountData () {
        // 重置formData 防止被删除的字段再出现
        this.formData = {};
        for (const key in this.data) {
            this.$set(this.formData, key, this.data[key]);
        }
    }
    rule (field) {
        // 只读状态不需要校验
        if (this.readonly) {
            return;
        }
        const validateFunc = systemValidator[`validate${firstUpperCase(field.identify || '')}`];
        return { trigger: 'blur', required: field.required, validator: validateFunc && validateFunc.bind(this) };
    }

    handleItemChange (val, field) {
        // 对向谁发起作特殊处理
        if (field.prop === 'assigned') {
            Object.keys(val).forEach(key => {
                this.formData[key] = val[key];
            });
        } else {
            this.formData[field.prop] = val;
        }
        // 对setting作特殊处理
        if (field.prop === 'setting') {
            this.formData.hidden = val.includes('isHidden');
            this.formData.required = val.includes('isRequired');
        }
        this.$emit('change', this.formData);
    }
    // hack方式：如果向谁发起设置了服务目录和处理人都隐藏，需要隐藏向谁发起（但是暂时还要依赖里面的逻辑）
    isHiddenAssign (field) {
        return this.name !== 'visibleFields' && field.identify === 'assigned' && field.extraSettings.isItemHidden && field.extraSettings.isAssignedHidden;
    }

    get formatFieldSchema () {
        const schema = [];
        this.schema.forEach(val => {
            if (val.identify !== 'city') {
                schema.push(val);
            }
        });
        return schema.map((field, index) => {
            const defaultAttributes = field.defaultAttributes;
            const fieldRes: CommonTypes.customField = {
                name: field.name,
                instruction: field.instruction || '',
                // 1为系统字段
                type: field.type,
                identify: field.identify || '',
                // 创建模式下没有id，前端自行定义了组件类型+数字的prop
                prop: field.identify || `${FieldToCompontent[field.inputType]}${index}`,
                // 融合系统字段和自定义字段 系统字段没有inputType 有identify
                component: field.inputType ? FieldToCompontent[field.inputType] : (SysFieldToComponent[field.identify] || `component${firstUpperCase(field.identify)}`),
                defaultValue: this.initDefaultValue(field),
                options: field.options,
                required: field.isRequired === undefined ? defaultAttributes.isRequired : field.isRequired,
                hidden: field.isHidden === undefined ? defaultAttributes.isHidden : field.isHidden,
                // 展示表单都可以编辑，适配编辑表单的特殊情况
                editable: field.editable === undefined ? true : field.editable,
                extraSettings: field.extraSettings === undefined ? defaultAttributes && defaultAttributes.extraSettings : field.extraSettings
            };
            if (field.id) {
                fieldRes.id = field.id;
            }
            return fieldRes;
        });
    }
    // 初始化默认值
    initDefaultValue (field) {
        let defaultVal: any = '';
        if (field.defaultValue) {
            defaultVal = field.defaultValue;
        } else if (field.options && field.options.length > 0) {
            const defaultOptions = [];
            field.options.forEach((option) => {
                if (option.isDefault) {
                    defaultOptions.push(option.value);
                }
            });
            // 如果是多选 默认值是数组
            if (field.inputType && field.inputType.indexOf('MULTI') > -1) {
                defaultVal = defaultOptions;
            } else {
                defaultVal = defaultOptions[0] || '';
            }
        }
        return defaultVal;
    }
    editFormItem (field, index: number) {
        this.clearEditStatus();
        this.activeKey = field.prop;
        this.$emit('edit', field, index);
    }
    deleteItem (index: number) {
        this.activeKey = '';
        this.schema.splice(index, 1);
        this.schemaChange();
        this.clearEditStatus();
    }
    // 清除选中状态
    clearEditStatus () {
        this.activeKey = '';
    }
    // 重置为当前第一个选项
    setFirstStatus () {
        this.$nextTick(() => {
            this.editFormItem(this.formatFieldSchema[0], 0);
        });
    }
    canDelete (field) {
        // 当字段属于自定义字段或者以上系统字段时，可以删除
        // return (field.type === 2 || canDeleteArr.includes(field.prop));
        return (field.type === 2);
    }
    onDropEvent (dropResult) {
        const { removedIndex, addedIndex, payload } = dropResult;
        // 每次拖拽重新填装数据 忽略这种情况触发的事件
        if (removedIndex === null && addedIndex === null) {
            return;
        }
        // removeIndex 区分是否从外部拖拽
        if (removedIndex !== null && addedIndex !== null) {
            // 如果拖拽的是当前active的字段 需要更新字段位置
            if (payload && payload.prop === this.activeKey) {
                this.$emit('edit', payload, addedIndex);
            }
            this.schema = applyDrag(this.schema, dropResult);
            this.schemaChange();
        }
    }
    schemaChange () {
        this.$emit('schema-change', this.schema);
    }
    hiddenChange (isHidden) {
        this.$emit('hidden-change', isHidden);
    }
}
</script>
<style lang="postcss" scoped>
.form-index {
    background-color: #FFFFFF;
}
.mtd-form-item {
    border: 1px solid #FFFFFF;
    background-color: #FFFFFF;
}
.form-item-editable {
    border: 1px solid #FF8800;
    border-radius: 2px;
    .mtdicon-close-thick {
        visibility: visible;
        color: #FFFFFF;
        background: #FF8800;
        padding: 2px;
        float: right;
    }
}
.mtdicon-close-thick {
    visibility: hidden;
}
.ticket-about-container {
    display: inline-block;
}
.form-item-instruction {
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    line-height: 20px;
    margin-top: 0;
}
</style>
