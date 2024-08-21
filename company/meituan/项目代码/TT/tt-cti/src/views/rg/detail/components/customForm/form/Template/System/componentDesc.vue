<template>
    <div>
        <div
            class="pretend-editor"
            v-html="value"
            v-if="readonly" />
        <QuillEditor
            v-else
            ref="editor"
            :is-comment="false"
            @input="handleDescChange"
            @blur="valueChange"
            :value="value"
            action="/api/tt/1.0/file/upload/desc?area=desc"
            placeholder="请输入问题描述，可以使用 Command+V 粘贴截图"
            :disabled="readonly" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TemplateMixin from '../TemplateMixin.vue';
import QuillEditor from '@/views/components/quill-editor.vue';

/**
 * 自定义字段展示列表
 *
 * @author liyuyao
 * @date 03/12/2020
 */
@Component({
    components: {
        QuillEditor
    }
})
export default class ComponentDesc extends TemplateMixin {
    $refs: { editor: QuillEditor };

    handleDescChange (val: string) {
        this.value = val;
    }

    mounted () {
        const editor = this.$refs.editor;
        if (this.readonly) {
            editor && editor.enable(false);
        }
    }
}
</script>

<style lang="postcss" scoped>
.quill-editor {
    /deep/ .ql-container.ql-snow.ql-disabled {
        display: none !important;
    }
}
.pretend-editor {
    padding: 12px 15px;
    border: 1px solid #D3D8E4;
    min-height: 125px;
}
</style>
