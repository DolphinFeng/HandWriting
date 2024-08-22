<template>
    <mtd-modal
        title="模板预览"
        class="preview-template form-dialog"
        :mask-closable="false"
        width="960px"
        @close="close"
        v-model="show">
        <FormIndex :field-schema="fieldSchema" :readonly="false" />
        <div slot="footer">
            <mtd-button type="primary" @click="close">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import FormIndex from './customForm/form/formIndex.vue';

/**
 * 添加RG user
 *
 * @author liyuyao
 * @date 03/22/2020
 */
@Component({
    components: {
        FormIndex
    }
})
export default class AddRgUserDialog extends Vue {
    @Prop({ default: false })
    visible: Boolean;

    @Prop()
    fieldSchema: any;

    show: Boolean = false;

    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
    }
    close () {
        this.$emit('update:visible', false);
    }
}
</script>
