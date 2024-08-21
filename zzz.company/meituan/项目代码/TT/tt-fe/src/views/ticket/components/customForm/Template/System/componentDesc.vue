<template>
    <editor
        ref="editor"
        :is-comment="false"
        @input="handleDescChange"
        @imgUpload="handleImgUpload"
        @blur="emitRecommend"
        :value="value"
        :action="uploadApi"
        :has-no-catalog="hasNoCatalog"
        :placeholder="$getText('component_desc_placeholder', '请简单描述您的需求')" />
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import editor from '@/components/quill-editor.vue';
import { State, Getter, Mutation } from 'vuex-class';
import eventBus from '@/utils/event-bus';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component({
    components: {
        editor
    }
})
export default class ComponentDesc extends TemplateMixin {
    // 占位用，实际上是没有uploadTicketId的: number = 0;
    @Getter loginType;
    @Getter uploadTicketId;
    @Mutation imgUploadStatus;
    ticketId: number = 0;

    @Watch('uploadTicketId')
    onUploadTicketIdChange () {
        this.ticketId = this.uploadTicketId;
    }
    handleDescChange (val: string) {
        this.value = val;
        this.valueChange();
    }
    handleImgUpload (val) {
        this.imgUploadStatus(val);
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload/desc?area=desc` : `/api/tt/1.0/file/upload/desc?area=desc`;
    }

    emitRecommend (val) {
        if (this.hasNoCatalog) {
            this.$nextTick(() => {
                eventBus.$emit('recommendCti', val);
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.field-icon {
    display: inline-block;
    width: 72px;
    height: 72px;
    padding: 12px 0;
    margin: 5px 5px 0 0;
    text-align: center;
    font-size: 12px;
    cursor: grab;
    border: 1px solid #ccc;
    border-radius: 4px;
    i {
        font-size: 20px;
    }
}
</style>
