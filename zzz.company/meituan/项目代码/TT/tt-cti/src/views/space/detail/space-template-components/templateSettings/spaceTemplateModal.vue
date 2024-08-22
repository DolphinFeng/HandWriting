<template>
    <mtd-modal
        title="操作设置"
        width="600px"
        @close="closeModal"
        v-model="show">
        <mtd-form
            :model="formData"
            ref="formModal"
            :rules="formRule">
            <template v-if="this.type !== 'Announcement'">
                <mtd-form-item
                    label="标题："
                    prop="title">
                    <mtd-input
                        type="text"
                        placeholder="标题字数限制30个字"
                        v-model="formData.title"
                        style="width: 100%;"
                        maxlength="30" />
                </mtd-form-item>
                <mtd-form-item label="内容：" prop="content">
                    <mtd-input
                        type="text"
                        placeholder="请输入URL"
                        v-model="formData.content"
                        maxlength="2000"
                        style="width: 100%;" />
                </mtd-form-item>
            </template>
            <mtd-form-item
                v-else
                label="内容："
                prop="content">
                <mtd-textarea
                    placeholder="内容字数限制100个字"
                    v-model="formData.content"
                    style="width: 100%;"
                    rows="3"
                    maxlength="100" />
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="closeModal">取消</mtd-button>
            <mtd-button type="primary" @click="close">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Form } from '@ss/mtd-vue';

const urlReg = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const formRule = {
    Announcement: {
        content: {
            required: true,
            message: '必填项'
        }
    },
    RgFaq: {
        title: {
            required: true,
            message: '必填项'
        },
        content: {
            required: true,
            message: '必填URL',
            validator: (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('必填URL'));
                }
                const regex = new RegExp(urlReg);
                if (value.match(regex)) {
                    return callback();
                } else {
                    return callback(new Error('必填URL'));
                }
            }
        }
    }
};

/**
 * 添加RG user
 *
 * @author liyuyao
 * @date 03/22/2020
 */
@Component({
    components: {}
})
export default class RgTemplateModal extends Vue {
    @Prop({ default: false })
    visible: Boolean;

    @Prop()
    type: string;

    @Prop()
    data: any;

    show: Boolean = false;
    formData: any = {};
    formRule: any = {};

    $refs: {
        formModal: Form;
    };

    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
    }
    @Watch('data')
    onChangeData (val) {
        this.formData = val;
    }

    created () {
        this.formRule = formRule[this.type];
    }
    handleReset () {
        this.$refs.formModal.resetFields();
    }

    clearValidationErrors () {
        this.$refs.formModal.clearValidate();
    }

    close () {
        this.$refs.formModal.validate((valid) => {
            if (valid) {
                this.show = false;
                this.$emit('addItem', Object.assign(this.formData, {
                    rgId: parseInt(this.$route.query.rgId as string, 10)
                }));
                this.formData = {};
            }
        }).catch(e => e);
    }
    closeModal () {
        this.show = false;
        // this.handleReset(); // 重置表单字段和错误提示
        this.clearValidationErrors(); // 清除表单验证错误信息
        this.$emit('closeModal', false);
    }
}
</script>
