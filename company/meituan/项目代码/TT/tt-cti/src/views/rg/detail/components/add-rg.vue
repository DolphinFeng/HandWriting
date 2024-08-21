<template>
    <mtd-modal
        title="添加 RG"
        class="add-rg-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="80"
            :rules="ruleCustom">
            <mtd-form-item prop="name" label="RG名称">
                <mtd-input
                    v-model.trim="formCustom.name"
                    placeholder="支持中英文、下划线、横线和数字"
                    type="text" />
            </mtd-form-item>
            <mtd-form-item prop="owner" label="负责人">
                <mtd-select
                    v-model="formCustom.owner"
                    class="select-width"
                    :loading="searchLoading"
                    :filterable="true"
                    :debounce="200"
                    auto-clear-query
                    :remote="true"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in userList"
                        :key="item.username"
                        :label="`${item.displayName}(${item.username})`"
                        :value="item.username" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item prop="description" label="描述">
                <mtd-textarea
                    placeholder="输入内容不超过500个字符"
                    rows="3"
                    maxlength="500"
                    v-model="formCustom.description"
                    type="text" />
            </mtd-form-item>
            <mtd-form-item
                label="头像"
                prop="icon"
                :label-width="80">
                <mtd-loading
                    size="small"
                    :loading="imgUploading"
                    :delay="300"
                    message="上传中">
                    <img :src="formCustom.icon" class="avatar">
                </mtd-loading>
                <mtd-upload
                    class="avatar-uploader"
                    action="/api/cti/1.0/upload/rg/icon"
                    accept="image/*"
                    :show-file-list="false"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    :on-progress="handleUploadProgress"
                    :before-upload="beforeUpload">
                    <mtd-button type="primary" size="small">上传头像</mtd-button>
                    <mtd-tooltip
                        trigger="hover"
                        theme="dark"
                        placement="right"
                        content="支持.png.jpg.jpeg，且不超过10M，推荐使用256x256"
                        size="small">
                        <i class="iconfont icon-question-circle-o" />
                    </mtd-tooltip>
                </mtd-upload>
                <!-- <span>该头像将会成为大象微客服>客服组头像</span> -->
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close">取消</mtd-button>
            <mtd-button
                :loading="btnLoading || imgUploading"
                type="primary"
                @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import * as validators from '@/utils/validator';
/**
 * 添加rg
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
interface Form {
    name: string;
    description: string;
    owner: string;
    icon: string;
}
const validateOwner: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('负责人不能为空'));
    }
    return callback();
};
/**
 * 添加RG
 *
 * @author xiaokunyu
 * @date 01/11/2010
 */
@Component
export default class AddRgDialog extends Vue {
    @Prop({ default: false })
    visible: Boolean;
    @Prop({ default: false })
    isEdit: Boolean;
    @Prop({ default: false })
    isSpace: Boolean;
    @Prop()
    rgInfo: Form;

    userList: CommonTypes.UserInfoItem[] = [];
    show: Boolean = false;
    ruleCustom = {
        name: [
            { validator: validators.validateName, trigger: 'blur' }
        ],
        owner: [
            { validator: validateOwner, trigger: 'blur, change' }
        ]
    };
    formCustom: Form = {
        name: '',
        description: '',
        owner: '',
        icon: '//s3plus.sankuai.com/v1/mss_4a5c70e8b289484393a22a82f4c3ed40/static-source/TT_logo.png'
    };
    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    imgUploading: boolean = false;

    $refs: any;
    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        val && this.$refs.formCustom.resetFields();
        if (val && this.isEdit) {
            for (const key in this.formCustom) {
                this.formCustom[key] = this.rgInfo[key];
            }
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    async remoteMethod (query) {
        this.searchLoading = true;
        try {
            const res = await api.rgApi.searchUser({ keyword: query });
            this.userList = res.data.items as any;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        interface AddRgParams {
            name: string;
            description: string;
            owner: string;
            icon: string;
            spaceId?: number;
        }
        interface EditRgParams extends AddRgParams { rgId: number }
        this.$refs.formCustom.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                const params: AddRgParams = {
                    name: this.formCustom.name,
                    description: this.formCustom.description,
                    owner: this.formCustom.owner,
                    icon: this.formCustom.icon
                };
                if (this.isSpace) {
                    params.spaceId = parseInt(this.$route.params.id, 10);
                }
                if (this.isEdit) {
                    (params as EditRgParams).rgId = this.rgId;
                }
                try {
                    const res = this.isEdit
                        ? await api.rgApi.editRg(params as EditRgParams)
                        : (this.isSpace
                            ? await api.spaceApi.addSpaceRg(params as Required<AddRgParams>)
                            : await api.rgApi.addRg(params)
                        );
                    const { code, data } = res;
                    if (code === 200) {
                        this.$mtd.message({
                            message: this.isEdit ? '编辑 RG 成功' : '添加 RG 成功',
                            type: 'success'
                        });
                        this.close();
                        this.$emit('success', data.id);
                    }
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            } else {
                console.error('Fail!');
            }
        }).catch(e => e);
    }
    beforeUpload (file) {
        const name = file.name;
        const type = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
        const imageType = ['png', 'jpg', 'jpeg'];
        if (imageType.indexOf(type) < 0) {
            this.$mtd.message.error('上传头像图片格式有误');
            return false;
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            this.$mtd.message.error('上传头像图片大小不能超过 10MB');
        }
        return isLt10M;
    }
    handleUploadSuccess (res) {
        this.formCustom.icon = res.data.url;
        this.imgUploading = false;
    }
    handleUploadError () {
        this.imgUploading = false;
        this.$mtd.message.error('上传失败');
    }
    handleUploadProgress () {
        this.imgUploading = true;
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.add-rg-dialog {
    .mtd-loading-nested {
        width: 100px;
    }
    .avatar {
        width: 100px;
        height: 100px;
        display: block;
        border-radius: 10px;
        border: 1px solid #C3CFDB;
    }
    .avatar-uploader {
        padding-left: 15px;
    }
    .icon-question-circle-o {
        vertical-align: middle;
        color: #999999;
    }
}
</style>
