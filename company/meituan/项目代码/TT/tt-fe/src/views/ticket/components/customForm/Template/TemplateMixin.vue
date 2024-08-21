<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class TemplateMixin extends Vue {
    @Prop({
        default: () => {
            return {
                name: '',
                instruction: '',
                type: '',
                prop: '',
                inputType: 'SINGLE_LINE_TEXT',
                defaultValue: '',
                isRequired: false,
                isHidden: false,
                validator: ''
            };
        }
    })
    field: CommonTypes.CustomField;

    @Prop({ default: false })
    disabled: boolean;

    @Prop({ default: null })
    rgId: number;

    @Prop({ default: () => {
        return {};
    } })
    data: any;
    // 当前表单项的值
    @Prop({ default: null })
    formValue: any;

    @Prop()
    hasNoCatalog: boolean;

    value: any = '';


    @Watch('formValue', { immediate: true })
    setVal (formValue) {
        if (formValue !== null) this.value = formValue;
    }

    get options () {
        return this.field.options || [];
    }

    //  初始化默认值
    // @Watch('field', { immediate: true })
    // getFieldSetting (field) {
    //     // 硬编码：如果是系统字段可以取value，自定义字段只能取defaultValue，为兼容克隆工单的情况
    //     this.value = this.field.identify ? (this.formValue || field.defaultValue) : field.defaultValue;
    // }

    // value变化触发
    valueChange () {
        this.$emit('change', this.value, this.field);
    }
    // 原位编辑模式下触发变化
    blurChange () {
        this.$emit('blur-change', this.value, this.field);
    }

    // 同时触发两种变化
    totalEmit () {
        this.valueChange();
        this.blurChange();
    }
}
</script>