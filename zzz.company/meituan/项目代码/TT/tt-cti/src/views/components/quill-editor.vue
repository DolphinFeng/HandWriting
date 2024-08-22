<template>
    <div class="quill-editor">
        <quill-editor
            ref="quillEditor"
            v-model="editorValue"
            :options="editorOption"
            :disabled="disabled"
            @focus="handleFocus"
            @blur="handleBlur">
            <div slot="toolbar">
                <slot name="toolbar" />
            </div>
        </quill-editor>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { quillEditor, Quill } from 'vue-quill-editor';
import { ImageExtend, QuillWatch } from './quill-image-extend-module';
import ImageResize from 'quill-image-resize-module';
import 'quill/dist/quill.snow.css';
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/ImageExtend', ImageExtend);
@Component({
    components: {
        quillEditor
    }
})
export default class QuillEditor extends Vue {
    @Prop({ default: '' })
    placeholder: string;
    @Prop({ default: '' })
    value: string;
    @Prop({ default: '' })
    action: string;
    @Prop({ default: false })
    disabled: Boolean;
    @Prop({ default: true })
    isComment: boolean;

    editorValue: string = '';
    editorOption: any;

    created () {
        this.editorOption = {
            modules: {
                toolbar: {
                    container: this.isComment ? [
                        ['image']
                    ] : [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ header: 1 }, { header: 2 }],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ indent: '-1' }, { indent: '+1' }],
                        [{ color: [] }],
                        [{ align: [] }],
                        ['link', 'image']
                    ],
                    handlers: {
                        image: function () {
                            QuillWatch.emit(this.quill.id);
                        }
                    }
                },
                imageResize: {
                    displaySize: true
                },
                ImageExtend: {
                    loading: true,
                    name: 'file',
                    action: this.action,
                    response: (res) => {
                        let errMsg = '上传图片失败';
                        if (res.data) {
                            return res.data.url;
                        }
                        if (res.data && res.data.errorMsg) {
                            errMsg = res.data.errorMsg;
                        }
                        this.$mtd.message.error(errMsg);
                    }
                }
            },
            theme: 'snow',
            placeholder: this.placeholder
        };
    };

    mounted () {
        this.editorValue = this.value;
    };

    @Watch('value')
    onvValueChanged (val) {
        this.editorValue = val;
    }
    @Watch('editorValue')
    onvEditorValueChanged (val) {
        this.$emit('input', val);
    }
    clear () {
        this.editorValue = '';
    }
    blur () {
        (this.$refs.quillEditor as any).quill.blur();
    }
    enable (val) {
        (this.$refs.quillEditor as any).quill.enable(val);
    }
    handleFocus () {
        this.$emit('focus');
    }
    handleBlur () {
        this.$emit('blur');
    }
}
</script>

<style lang="postcss">
.quill-editor {
    position: relative;
    .ql-toolbar.ql-snow {
        border: 1px solid #D3D8E4;
    }
    .ql-container {
        min-height: 125px;
        &.ql-snow {
            border: 1px solid #D3D8E4;
        }
        .at-user-tag {
            display: inline-block;
            padding: 0 5px;
            margin: 0 2px;
            background: #F7F7F7;
            border: 1px solid #DDDDDD;
            border-radius: 2px;
            font-size: 14px;
            font-style: normal;
            line-height: 18px;
            white-space: nowrap;
            padding-left: 2px;
            color: #888585;
            font-weight: 500;
        }
    }
    .ql-snow {
        .ql-color-picker,
        .ql-icon-picker {
            margin-bottom: 6px;
        }
        .ql-fill {
            fill: #666666;
        }
        .ql-stroke {
            stroke: #666666;
        }
    }
}
</style>
