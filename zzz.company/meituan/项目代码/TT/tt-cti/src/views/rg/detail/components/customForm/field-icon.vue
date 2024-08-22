<template>
    <div class="field-icon">
        <i :class="customFieldIcon[field.inputType || field.identify] || 'iconfont icon-star-o'" />
        <div>{{ field.name }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { CustomFieldIcon } from '@/config/custom.conf.ts';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component
export default class FieldIcon extends Vue {
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

    customFieldIcon: CommonTypes.mapObject = CustomFieldIcon;
}
</script>

<style lang="postcss" scoped>
.field-icon {
    display: inline-block;
    width: 72px;
    height: 72px;
    padding: 12px 0;
    text-align: center;
    font-size: 12px;
    cursor: grab;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    background: #FFFFFF;
    i {
        font-size: 20px;
    }
    &:hover {
        border: 1px solid #FF8800;
        box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.02), 0 2px 6px 6px rgba(0, 0, 0, 0.02), 0 2px 6px 0 rgba(0, 0, 0, 0.06);
    }
}
</style>
