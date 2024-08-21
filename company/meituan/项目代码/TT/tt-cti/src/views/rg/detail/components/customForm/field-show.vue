<template>
    <div class="field-show-container">
        <i class="mtdicon mtdicon-close" @click="handleClose" />
        <mtd-tabs v-model="fieldType">
            <!-- <mtd-tab-pane label="系统字段" value="systemField" /> -->
            <mtd-tab-pane label="自定义字段" value="customField" />
        </mtd-tabs>
        <div class="field-show-list">
            <Container
                behaviour="copy"
                group-name="move-container"
                :get-child-payload="getChildPayload">
                <Draggable
                    :key="index"
                    v-for="(field, index) in FieldList">
                    <fieldIcon
                        @click.native.stop="addFieldToSchema(field)"
                        :field="field" />
                </Draggable>
            </Container>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

import fieldIcon from './field-icon.vue';
import { CustomFieldList } from '@/config/custom.conf.ts';
import { Container, Draggable } from 'vue-smooth-dnd';

import eventBus from '@/utils/event-bus';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component({
    components: {
        Container,
        Draggable,
        fieldIcon
    }
})
export default class FieldShow extends Vue {
    @State(state => state.cti.systemFields)
    systemFields: CommonTypes.mapObject[];

    @Prop({
        default: () => {
            return [];
        }
    })
    totalFields: CommonTypes.mapObject[];

    fieldType: string = 'customField';
    // systemFieldList: CommonTypes.customField[] = [];
    customFieldList: CommonTypes.customField[] = [];

    mounted () {
        this.customFieldList = CustomFieldList.map((field) => {
            return Object.assign(field, {
                type: 2,
                defaultValue: '',
                isRequired: false,
                isHidden: false,
                // NOTE: 如果这里不加 instruction 字段的话 ts 编译过程会报错不符合 CommonTypes.customField 定义
                instruction: ''
            });
        });
    }
    handleClose () {
        this.$emit('close');
    }
    getChildPayload (index) {
        return this.FieldList[index];
    }
    addFieldToSchema (field) {
        eventBus.$emit('clickAddField', field);
        this.handleClose();
    }
    get systemFieldList () {
        const existSys = this.totalFields.filter(sys => sys.type === 1).map(sys => sys.identify);
        return this.systemFields.filter((field) => {
            return !existSys.includes(field.identify);
        });
    }
    get FieldList () {
        return this.fieldType === 'systemField' ? this.systemFieldList : this.customFieldList;
    }
}
</script>

<style lang="postcss">
.field-show-container {
    padding: 5px;
    width: 100%;
    .mtdicon-close {
        z-index: 10;
        padding: 5px;
        position: absolute;
        right: 5px;
        cursor: pointer;
    }
    .smooth-dnd-draggable-wrapper {
        display: inline-block !important;
        margin: 8px 8px 0 0;
        &:nth-child(3n) {
            margin-right: 0;
        }
    }
}
</style>
