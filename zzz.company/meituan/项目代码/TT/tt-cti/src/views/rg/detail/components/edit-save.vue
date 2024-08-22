<template>
    <div class="edit-save-wrapper">
        <mtd-button
            v-if="!editable"
            type="text"
            icon="mtdicon mtdicon-edit-o"
            size="small"
            @click="edit">编辑</mtd-button>
        <mtd-button
            v-if="editable"
            size="small"
            type="primary"
            @click="save"
            style="margin-left: 5px;">保存</mtd-button>
        <mtd-button
            v-if="editable"
            size="small"
            @click="cancel">取消</mtd-button>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

/**
 * 编辑 / 保存 按钮
 *
 * @author liyuyao
 * @date 12/23/2019
 */
@Component
export default class EditSave extends Vue {
    @Prop({ default: false })
    editable: Boolean;

    edit () {
        this.$emit('update:editable', true);
    }

    save () {
        this.$emit('save');
        // this.$emit('update:editable', false);
    }

    cancel () {
        this.$emit('cancel');
        this.$emit('update:editable', false);
    }
}
</script>

<style lang="postcss">
.edit-save-wrapper {
    float: right;
}

</style>
