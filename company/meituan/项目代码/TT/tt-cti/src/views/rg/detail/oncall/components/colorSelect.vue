<template>
    <span :class="['color-option-wrapper', {'block': !inline}]">
        <span
            class="option-item"
            v-for="(item, index) in colorOptions "
            :key="index">
            <i class="mtdicon mtdicon-check-thick" v-show="item.selected" />
            <mtd-tooltip
                class="shift-tooltip-wrapper"
                size="small"
                :disabled="!item.disabled"
                :content="disableHint">
                <span
                    @click="onItemClicked(item)"
                    :class="['color-option', item.color,
                             {'selected': item.selected, 'disabled': item.disabled}]">{{ item[labelText] }}</span>
            </mtd-tooltip>
        </span>
    </span>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';
@Component
export default class ColorSelect extends Vue {
    @Prop({ default: () => [] }) options: CommonTypes.mapObject[];
    @Prop({ default: false }) multiple: boolean;
    @Prop({ default: true }) inline: boolean;
    @Prop({ default: '不可选择' }) disableHint: string;
    @Prop({ default: 'label' }) labelText: string;

    colorOptions: CommonTypes.mapObject[] = [];
    selectedColors: string[] = [];

    @Watch('options', { immediate: true, deep: true })
    onOptionsChanged(options) {
        if (options) {
            this.colorOptions = cloneDeep(options);
            this.selectedColors = this.colorOptions.filter(item => item.selected).map(item => item.color);
        }
    }
    onItemClicked (item: CommonTypes.mapObject) {
        if (item.disabled) {
            return;
        }
        if (!this.multiple) {
            this.colorOptions.map(option => {
                option.selected = option.color === item.color ? !option.selected : false;
            });
        } else {
            item.selected = !item.selected;
        }
        this.selectedColors = this.colorOptions.filter(item => item.selected).map(item => item.color);
        this.$emit('change', this.colorOptions);
    }
}
</script>

<style lang="scss">
.color-option-wrapper {
    display: flex;
    .option-item {
        width: 76px;
        display: inline-block;
        height: 32px;
        margin-right: 6px;
        position: relative;
        &:last-child {
            margin-right: 0;
        }
        .mtdicon-check-thick {
            position: absolute;
            color: #FFFFFF;
            right: 1px;
            top: 0;
            line-height: 12px;
            font-size: 12px;
        }
        .color-option {
            width: 100%;
            display: inline-block;
            height: 100%;
            text-align: center;
            border-radius: 6px;
            cursor: pointer;
            line-height: 32px;
            color: rgba(0, 0, 0, 0.4);
            &.selected {
                background-size: 76px 32px;
                border-top-right-radius: 6px;
                font-weight: 600;
                color: #000000;
            }
            &.COLOR_1 {
                background: #E7F0FF;
                &.selected {
                    background: linear-gradient(38deg, #AFCFFE 78%, #049BE5 0%);
                }
            }
            &.COLOR_2 {
                background: #E2F6F5;
                &.selected {
                    background: linear-gradient(38deg, #A0E1E3 78%, #41C0A0 0%);
                }
            }
            &.COLOR_3 {
                background: #F1EAFC;
                &.selected {
                    background: linear-gradient(38deg, #D3BAFB 78%, #8C66CC 0%);
                }
            }
            &.COLOR_4 {
                background: #FFF2DF;
                &.selected {
                    background: linear-gradient(38deg, #FFD799 78%, #F1B100 0%);
                }
            }
            &.COLOR_5 {
                background: #FDEAF0;
                &.selected {
                    background: linear-gradient(38deg, #F8B7CF 78%, #CB5A8F 0%);
                }
            }
            &.ALL {
                background: #F0F0F0;
                &.selected {
                    color: #FFFFFF;
                    background: linear-gradient(38deg, #7F7F7F 78%, #000000 0%);
                }
            }
            &.disabled {
                cursor: not-allowed;
            }
        }
    }
    &.block {
        flex-direction: column;
        .option-item {
            width: 100%;
            display: block;
            margin-bottom: 4px;
            height: 36px;
            .color-option {
                line-height: 36px;
                &.COLOR_1 {
                    &.selected {
                        background: linear-gradient(40deg, #AFCFFE 92%, #049BE5 0%);
                    }
                }
                &.COLOR_2 {
                    &.selected {
                        background: linear-gradient(40deg, #A0E1E3 92%, #41C0A0 0%);
                    }
                }
                &.COLOR_3 {
                    &.selected {
                        background: linear-gradient(40deg, #D3BAFB 92%, #8C66CC 0%);
                    }
                }
                &.COLOR_4 {
                    &.selected {
                        background: linear-gradient(40deg, #FFD799 92%, #F1B100 0%);
                    }
                }
                &.COLOR_5 {
                    &.selected {
                        background: linear-gradient(40deg, #F8B7CF 92%, #CB5A8F 0%);
                    }
                }
                &.ALL {
                    &.selected {
                        background: linear-gradient(40deg, #7F7F7F 92%, #000000 0%);
                    }
                }
            }
        }
    }
}
</style>
