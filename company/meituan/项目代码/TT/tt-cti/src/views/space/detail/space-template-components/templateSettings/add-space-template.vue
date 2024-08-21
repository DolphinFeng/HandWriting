<template>
    <mtd-modal
        class="add-template-dialog form-dialog"
        :mask-closable="false"
        @close="handleClose"
        v-model="visible">
        <div slot="title">
            <span class="dialog-title">{{ isEdit ? '编辑模板' : '添加新模板' }}</span>
            <mtd-announcement
                type="warning"
                show-icon
                class="title-announcement">
                <div slot="description">
                    当服务目录绑定了模板后，将使用模板中的内容做为创建TT时的默认内容；请在服务目录管理（CTI）中进行绑定。
                    <router-link
                        :to="{name:'cti'}"
                        target= "_blank"
                        class="notice-title-link">前往设置</router-link>
                </div>
            </mtd-announcement>
        </div>
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="90"
            :rules="ruleCustom">
            <mtd-form-item prop="name">
                <span slot="label"><span style="color: #F85F6A;">*</span> 模板标题</span>
                <mtd-input placeholder="请输入模板标题" v-model="formCustom.name" />
            </mtd-form-item>
            <mtd-form-item
                label="模板内容"
                required
                class="template-content">
                <editor
                    ref="editor"
                    :is-comment="false"
                    :action="`/api/tt/1.0/file/upload/desc?area=desc`"
                    @input="handleContentChange"
                    :value="formCustom.content" />
                <span v-if="editorLength === 0" class="mtd-form-item-error-tip">请输入模板内容</span>
                <span v-if="editorLength > 10000" class="mtd-form-item-error-tip">模板文字个数不能超过10000个字符</span>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="cancelSave">取消</mtd-button>
            <mtd-button
                :loading="btnLoading"
                type="primary"
                @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import Editor from '@/views/components/quill-editor.vue';
import * as validators from '@/utils/validator';
import * as api from '@/api';

/**
 * 添加RG 模板
 *
 * @author liyuyao
 * @date 03/28/2019
 */
@Component({
    components: {
        Editor
    }
})
export default class AddRgTemplateDialog extends Vue {
    @Prop({ default: false })
    isEdit: Boolean;

    @Prop({ default: 0 })
    templateId: number;

    visible: Boolean = true;
    formCustom: any = {
        name: '',
        content: ''
    };
    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    $refs: any;

    ruleCustom = {
        name: [
            { validator: validators.validateName, trigger: 'blur' }
        ]
    };
    defaultPlaceholder: string = '<p>模板内容示例</p><p>【页面链接】：</p><p>【所属模块】：</p><p>【Appkey】：</p>';

    mounted () {
        if (this.isEdit && this.templateId) {
            this.getTemplateDetail();
        }
        this.formCustom.content = this.defaultPlaceholder;
    }
    handleContentChange (val) {
        this.formCustom.content = val;
    }
    // 获取模板内容（编辑）
    async getTemplateDetail () {
        try {
            const res = await api.rgApi.getTemplateById(this.templateId);
            const { code, data } = res;
            if (code === 200) {
                this.formCustom.name = data.name;
                this.formCustom.content = data.content || this.defaultPlaceholder;
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 提交模板创建/修改
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.btnLoading = true;
        this.$refs.formCustom.validate(async (valid) => {
            if (valid && this.editorLength > 0 && this.editorLength <= 10000) {
                try {
                    if (this.isEdit) {
                        await api.rgApi.updateRgTemplate(this.templateId, {
                            name: this.formCustom.name,
                            content: this.formCustom.content
                        });
                    } else {
                        await api.rgApi.addRgTemplate({
                            name: this.formCustom.name,
                            content: this.formCustom.content,
                            rgId: this.id
                        });
                    }
                    this.$mtd.message({
                        message: this.isEdit ? '编辑 RG 模板成功' : '添加 RG 模板成功',
                        type: 'success'
                    });
                    this.$emit('success');
                    this.visible = false;
                    this.handleClose();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
        this.btnLoading = false;
    }
    get id () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    get editorLength () {
        return this.formCustom.content.length;
    }
    // 取消编辑
    cancelSave () {
        this.$mtd.confirm({
            title: '确定要离开吗？系统可能不会保存您所做的更改',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                this.visible = false;
                this.handleClose();
            }
        }).catch(e => e);
    }
    handleClose () {
        this.$emit('close');
    }
}
</script>

<style lang="postcss">
.add-template-dialog {
    .mtd-modal {
        width: 75%;
        min-width: 860px;
        max-width: 1080px;
        height: 100%;
        .dialog-title {
            font-family: PingFangSC-Semibold;
            font-size: 20px;
            color: #464646;
            line-height: 34px;
            letter-spacing: 0;
        }
        .title-announcement {
            display: inline-block;
            margin-left: 30px;
            padding: 7px 12px;
            vertical-align: middle;
            .mtd-announcement-content {
                display: inline-block;
            }
            .mtd-announcement-description {
                margin-top: 0;
            }
            .notice-title-link {
                float: right;
            }
        }
        .mtd-modal-content-wrapper {
            padding: 0 50px;
            .mtd-modal-content,
            .mtd-modal-content form {
                height: 100%;
            }
        }
        .quill-editor {
            height: 100%;
            .ql-container.ql-snow {
                height: calc(100% - 60px);
            }
        }
        .template-content {
            height: calc(100% - 60px);
            margin-bottom: 0;
            .mtd-form-item-content {
                height: 100%;
            }
        }
        .mtd-modal-footer {
            margin-top: 20px;
        }
    }
}
</style>
