<template>
    <div class="tt-quill-editor">
        <quill-editor
            ref="quillEditor"
            v-model="editorValue"
            :options="editorOption"
            :disabled="disabled"
            @blur="emitBlur">
            <div slot="toolbar">
                <slot name="toolbar" />
            </div>
        </quill-editor>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { quillEditor, Quill } from 'vue-quill-editor';
import { Getter } from 'vuex-class';
import { container, ImageExtend, QuillWatch } from './quill-image-extend-module';
import debounce from 'lodash.debounce';
import ImageResize from 'quill-image-resize-module';
import mention from '@/utils/quill-mention/src/quill.mention.js';
import * as api from '@/api';
import 'quill/dist/quill.snow.css';
import { getDisplayName } from '@/utils/tools/getDisplayName';
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/ImageExtend', ImageExtend);
Quill.register('modules/mention', mention);

let icons = Quill.import('ui/icons');
icons['bold'] = '<i class="iconfont icon-formatbold"></i>';
icons['italic'] = '<i class="iconfont icon-italic"></i>';
icons['underline'] = '<i class="iconfont icon-underlined"></i>';
icons['strike'] = '<i class="iconfont icon-serikeethrough"></i>';
icons['header']['1'] = '<i class="iconfont icon-h1"></i>';
icons['header']['2'] = '<i class="iconfont icon-h2"></i>';
icons['list']['ordered'] = '<i class="iconfont icon-list-numbered"></i>';
icons['list']['bullet'] = '<i class="iconfont icon-list-bulleted"></i>';
icons['indent']['-1'] = '<i class="iconfont icon-outdent-o"></i>';
icons['indent']['+1'] = '<i class="iconfont icon-indent-o"></i>';
icons['align'][''] = '<i class="iconfont icon-align-left"></i>';
icons['align']['center'] = '<i class="iconfont icon-align-center"></i>';
icons['align']['right'] = '<i class="iconfont icon-align-right"></i>';
icons['align']['justify'] = '<i class="iconfont icon-align-justify"></i>';
icons['image'] = '<i class="iconfont icon-picture"></i>';
icons['link'] = '<i class="iconfont icon-link-o"></i>';
icons['color'] = '<i class="iconfont icon-colorfont"></i>';
icons['quickReply'] = '<i class="iconfont icon-comment"></i>';

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
    isComment: Boolean;
    @Prop({ default: false })
    isReason: boolean;
    @Prop({ default: () => {
        return [];
    } })
    replyList: string[];
    @Prop()
    hasNoCatalog: boolean;

    @Getter inside;

    imgUploadStatus: Boolean = false;
    editorValue: string = '';
    members: string[] = [];
    debounceHandleAt: Function = debounce(this.handleAt, 200);

    get toolbarSetting () {
        const completeCofig = [
            'bold',
            'italic',
            'underline',
            'strike',
            { 'header': 1 },
            { 'header': 2 },
            { 'list': 'ordered' },
            { 'list': 'bullet' },
            { 'indent': '-1' },
            { 'indent': '+1' },
            { 'color': [] },
            { 'align': [] },
            'image'
        ];
        const replyConfig = ['image', 'quickReply'];
        const imageConfig = ['image'];
        if (!this.isComment) {
            return completeCofig;
        } else if (this.replyList.length) {
            return replyConfig;
        } else {
            return imageConfig;
        }
    }
    editorOption: any = {
        modules: {
            toolbar: {
                container: this.toolbarSetting,
                handlers: {
                    'image': function () {
                        QuillWatch.emit(this.quill.id);
                    },
                    'quickReply': () => {
                        const h = this.$createElement;
                        const self = this;
                        this.$mtd.confirm({
                            title: this.$getText('quill_editor_quick_reply_title', '常用回复'),
                            maskClosable: true,
                            showOkButton: false,
                            message: this.replyList.length ? h('mtd-list', {
                                attrs: {
                                    size: 'small'
                                }
                            }, this.replyList.map(item => {
                                return h('mtd-list-item', {
                                    style: {
                                        cursor: 'pointer'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleQuickReply(item);
                                        }
                                    }
                                }, item);
                            })) : h('div', null, this.$getText('quill_editor_no_reply_tip', '当前TT所在服务组没有设置常用回复'))
                        }).catch(e => e);
                        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_techportal_ns674f49_mc');
                    }
                }
            },
            mention: {
                allowedChars: /^[\u4e00-\u9fa5.a-zA-Z0-9]+$/,
                mentionDenotationChars: ['@'],
                source: (searchTerm, renderList, mentionChar) => {
                    if (!this.isComment) {
                        return ;
                    }
                    this.debounceHandleAt(searchTerm, renderList, mentionChar);
                }
            },
            imageResize: {
                displaySize: true
            },
            ImageExtend: {
                loading: true,
                name: 'file',
                action: this.action,
                size: 10,
                sizeError: () => {
                    this.$mtd.message.error(this.$getText('quill_editor_image_size_tip', '图片大小不能超过10M'));
                },
                response: (res) => {
                    let errMsg = this.$getText('quill_editor_upload_fail_tip', '上传图片失败');
                    if (res.data) {
                        return res.data.url;
                    }
                    if (res.data && res.data.errorMsg) {
                        errMsg = res.data.errorMsg;
                    }
                    this.errorTip(errMsg);
                    return;
                },
                headers: (xhr) => {
                    let loginType = window.location.href.includes('meituan') ? 'PASSPORT' : 'SSO';
                    xhr.setRequestHeader('X-Login-Type', loginType);
                },
                start: () => {
                    this.onImgStart();
                },
                success: () => {
                    this.onImgEnd();
                },
                error: () => {
                    this.onImgEnd();
                }
            }
        },
        theme: 'snow',
        scrollingContainer: 'body',
        placeholder: this.placeholder
    };

    mounted () {
        this.editorValue = this.value;
        this.$refs.quillEditor.quill.on('text-change', this.handleQuillChange);
    }
    beforeDestory () {
        this.$refs.quillEditor.quill.off('text-change', this.handleQuillChange);
    }

    throttleChange = this.throttling(this.emitBlur, 2000);

    handleQuillChange (e) {
        if (e) {
            this.throttleChange();
        }
    }

    throttling (fn, t) {
        let tid;
        return function () {
            let that = this;
            let args = arguments;
            clearTimeout(tid);
            tid = setTimeout(function () {
                fn.apply(that, args);
            }, t);
        };
    }

    @Watch('value', { immediate: true })
    onValueChanged (val) {
        this.editorValue = val;
    }
    @Watch('editorValue', { immediate: true })
    onEditorValueChanged (val) {
        this.$emit('input', val);
        this.$emit('change-val', val ? true : false);
    }
    @Watch('imgUploadStatus')
    onImgUploadStatus (val) {
        this.$emit('imgUpload', val);
    }
    clear () {
        this.editorValue = '';
    }
    focus () {
        this.$refs.quillEditor && this.$refs.quillEditor.quill && this.$refs.quillEditor.quill.focus();
    }
    blur () {
        this.$refs.quillEditor.quill.blur();
    }
    onImgStart () {
        this.$emit('imgStart');
        this.imgUploadStatus = true;
    }
    onImgEnd () {
        this.$emit('imgEnd');
        this.imgUploadStatus = false;
    }
    async handleAt (searchTerm, renderList, mentionChar) {
        let members = [];
        if (!searchTerm.length) {
            renderList(members, searchTerm);
        } else {
            try {
                const res = await api.ctiApi.searchUser({ keyword: searchTerm.toLowerCase() });
                members = res.data.items.map(item => {
                    return {
                        id: item.username,
                        value: getDisplayName(this.inside, item.i18nDisplayName, item.displayName, item.username)
                    };
                });
                renderList(members, searchTerm);
            } catch (e) {
                console.log(e);
            }
        }
    }
    getMentionUsers () {
        let mentionDom = this.$refs.quillEditor.quill.querySelector('mention');
        return '';
    }
    errorTip (errMsg) {
        this.$mtd.message.error(errMsg);
    }
    handleQuickReply (content?: string) {
        this.$emit('reply-quick', content);
        this.$mtd.confirm.closeAll();
    }
    emitBlur () {
        if (this.editorValue && this.$route.params.space === 'ticket' && this.$route.name === 'tt_create' && this.hasNoCatalog) {
            this.$emit('blur', this.editorValue);
        }
    }
}
</script>

<style lang="scss">
.tt-quill-editor {
    position: relative;
    .ql-toolbar.ql-snow {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-bottom: none;
        border-radius: 3px 3px 0 0;
        background: #f5f5f5;
        background-clip: padding-box;
        height: 36px;
        line-height: 36px;
        padding: 6px 0;
        .ql-formats {
            color: rgba(0, 0, 0, 0.6);
            line-height: 24px;
            vertical-align: top;
            button {
                line-height: 16px;
            }
            .ql-picker-label {
                padding: 0 4px;
            }
        }
    }
    .ql-container.ql-snow {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 0 0 3px 3px;
    }
    .ql-container {
        .ql-editor {
            color: rgba(0, 0, 0, 0.87);
            min-height: 123px;
            padding: 9px;
            max-height: 563px;
            overflow: auto;
        }
        .at-user-tag {
            display: inline-block;
            padding: 0 5px;
            margin: 0 2px;
            background: #f5f5f5;
            border: 1px solid #ddd;
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
        .iconfont {
            line-height: 16px;
        }
        .ql-fill {
            fill: #666;
            line-height: 16px;
        }
        .ql-stroke {
            stroke: #666;
        }
    }
    .ql-mention-list-container {
        border-radius: 2px;
        min-width: fit-content;
        .ql-mention-list {
            max-height: 200px;
            overflow: auto;
            .ql-mention-list-item {
                height: auto;
                padding: 7px 12px;
                line-height: 20px;
                color: #6f6f6f;
                font-size: 14px;
                &.selected {
                    background: #edf0f7;
                }
            }
        }
    }
}
.ql-editor.ql-blank::before {
    font-style: normal;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.24);
    margin-left: -7px;
}
span.mention {
    background: #edf0f7;
    border-radius: 2px;
    color: #333;
}
</style>
