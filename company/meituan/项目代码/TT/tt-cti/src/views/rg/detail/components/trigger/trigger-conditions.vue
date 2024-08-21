<template>
    <div class="trigger-conditions-container">
        <mtd-form :model="conditionsForm">
            <mtd-form-item label="条件组：" :label-width="120">
                <mtd-radio-group v-model="conditionsForm.groupLogic">
                    <mtd-radio value="AND">满足以下所有条件组</mtd-radio>
                    <mtd-radio value="OR">满足以下任一条件组</mtd-radio>
                </mtd-radio-group>
            </mtd-form-item>
            <condition-group
                v-for="(conditionGroup, index) in conditionsForm.conditionGroups"
                :key="index"
                :group-index="index"
                @delete="deleteGroup"
                @change="conditionGroupChange"
                @error="hasError"
                :submit-single="submitSingle"
                :condition-group="conditionsForm['conditionGroups'][index]"
                :show-delete-group="conditionsForm.conditionGroups.length > 1" />
        </mtd-form>
        <span
            v-if="conditionsForm.conditionGroups.length < 2"
            @click="addGroup"
            class="text-icon-button"><i class="iconfont icon-add-square-o" /> 添加条件组</span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ConditionGroup from './condition-group.vue';

/**
 * 触发器 触发条件
 *
 * @author liyuyao
 * @date 08/20/2019
 */
@Component({
    components: {
        ConditionGroup
    }
})
export default class TriggerConditions extends Vue {
    @Prop({ default: 0 })
    submitSingle: number;
    @Prop()
    conditions: CommonTypes.conditionGroupDo[];
    @Prop()
    itemLogic: string;

    conditionsForm: any = {
        groupLogic: 'OR',
        // NOTE: 修复 ts 编译报错问题
        conditionGroups: [{} as any, {} as any]
        // conditionGroups: [{}, {}]
    };
    mounted () {
        if (!this.triggerId) {
            this.conditionsForm.conditionGroups = [{} as any];
            // this.conditionsForm.conditionGroups = [{}];
        }
    }
    @Watch('conditions', { deep: true })
    onGetDetailConditions () {
        if (this.conditions && this.conditions.length) {
            this.conditionsForm.conditionGroups = this.conditions;
        }
    }
    @Watch('itemLogic', { immediate: true })
    onItemChange () {
        if (this.itemLogic) {
            this.conditionsForm.groupLogic = this.itemLogic;
        }
    }
    addGroup () {
        this.conditionsForm.conditionGroups.push({} as any);
    }

    deleteGroup (index) {
        this.conditionsForm.conditionGroups.splice(index, 1);
        this.$emit('change', this.conditionsForm);
    }

    conditionGroupChange (conditions, index) {
        this.conditionsForm.conditionGroups[index] = conditions;
        this.$emit('change', this.conditionsForm);
    }
    hasError (hasArror) {
        this.$emit('error', hasArror);
    }
    get triggerId () {
        return this.$route.query.id;
    }
}
</script>
