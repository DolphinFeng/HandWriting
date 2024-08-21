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
    field: CommonTypes.customField;

    // 整个表单的值，componentOptions需要用
    @Prop({
        default: () => {
            return {};
        }
    })
    form: CommonTypes.mapObject;

    // 当前表单项的值
    @Prop({ default: '' })
    formValue: any;

    // 当前表单的名称 用于处理一些特殊情况
    @Prop({ default: '' })
    formName: string;

    @Prop({ default: false })
    readonly: boolean;

    value: any = '';

    //  初始化默认值
    @Watch('field.defaultValue', { immediate: true })
    getFieldSetting (field) {
        this.value = this.formValue || field.defaultValue;
    }

    @Watch('formValue', { immediate: true })
    setVal () {
        if (this.formValue !== null) this.value = this.formValue;
    }

    // value变化触发
    valueChange () {
        this.$emit('change', this.value, this.field);
    }

    get options () {
        return this.field.options || [];
    }
    get disabled () {
        return !this.field.editable;
    }
}
</script>
