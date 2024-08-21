<template>
    <mtd-modal
        :title="isEdit ? `编辑空间` : `新建空间`"
        class="add-space-dialog form-dialog"
        :mask-closable="false"
        width="480px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="80"
            :rules="ruleCustom">
            <mtd-form-item prop="name" label="名称:">
                <mtd-input
                    v-model.trim="formCustom.name"
                    placeholder="支持中英文、下划线、连字符和数字"
                    type="text" />
            </mtd-form-item>
            <mtd-form-item prop="orgId" label="维护部门:">
                <mtd-select
                    v-model="formCustom.orgId"
                    :loading="searchLoading"
                    filterable
                    remote
                    auto-clear-query
                    :debounce="500"
                    :remote-method="searchOrg"
                    :formatter="formatOrg"
                    style="width: 348px;">
                    <mtd-option
                        v-for="(org, orgIndex) in orgList"
                        :key="orgIndex"
                        :label="org.orgPath"
                        :value="org.orgId" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                prop="accessLinkPrefix"
                label="访问链接"
                v-if="!isEdit">
                <mtd-input v-model="formCustom.accessLinkPrefix">
                    <template slot="prepend">{{ baseUrl }}/</template>
                </mtd-input>
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
import { Form } from '@ss/mtd-vue';
import { State } from 'vuex-class';
import { ssoEnvUrl } from '@/config/baseUrl.conf.ts';
import * as api from '@/api';
import * as validators from '@/utils/validator';
/**
 * 添加rg
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
interface SpaceInfo {
    name: string;
    description: string;
    orgId: number;
    orgPath?: string;
    icon: string;
    id?: number;
}
const validateOrg: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('负责部门不能为空'));
    }
    return callback();
};
const validateSpaceName: Function = (_rule, value, callback) => {
    const reg = new RegExp(/^[0-9a-z-]{1,}$/);
    if (!value.length) {
        return callback(new Error('名称不能为空'));
    } else if (value.length > 50) {
        return callback(new Error('名称不能超过50个字符'));
    } else if (!reg.test(value)) {
        return callback(new Error('支持小写字母、数字、中划线'));
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
    @State(state => state.cti.env)
    env: string;

    @Prop({ default: false })
    visible: Boolean;
    @Prop({ default: false })
    isEdit: Boolean;
    @Prop()
    spaceInfo: SpaceInfo;

    orgList: any = [];
    show: Boolean = false;
    ruleCustom = {
        name: [
            { validator: validators.validateName, trigger: 'blur' }
        ],
        orgId: [
            { validator: validateOrg, trigger: 'blur' }
        ],
        accessLinkPrefix: [
            { validator: validateSpaceName, trigger: 'blur' }
        ]
    };
    formCustom: CommonTypes.SpaceItem = {
        accessLinkPrefix: '',
        orgId: null,
        name: ''
    };
    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    imgUploading: boolean = false;

    $refs: { formCustom: Form };

    get baseUrl () {
        return ssoEnvUrl[this.env];
    }

    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        val && this.$refs.formCustom.resetFields();
        if (val && this.isEdit) {
            for (const key in this.formCustom) {
                this.formCustom[key] = this.spaceInfo[key];
            }
            this.orgList = [{
                orgPath: this.spaceInfo.orgPath,
                orgId: this.spaceInfo.orgId
            }];
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.$refs.formCustom.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                try {
                    this.isEdit ? await api.spaceApi.editSpace({
                        id: this.spaceInfo.id,
                        name: this.formCustom.name,
                        orgId: this.formCustom.orgId
                    }) : await api.spaceApi.addSpace({
                        name: this.formCustom.name,
                        orgId: this.formCustom.orgId,
                        accessLinkPrefix: this.formCustom.accessLinkPrefix
                    });
                    this.$mtd.message({
                        message: this.isEdit ? '空间编辑成功' : `空间创建成功！访问链接为：${this.formCustom.accessLinkPrefix}.${this.baseUrl}`,
                        type: 'success'
                    });
                    this.close();
                    this.$emit('success');
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            } else {
                console.error('Fail!');
            }
        }).catch(e => e);
    }
    async searchOrg (query) {
        this.orgList = [];
        if (query.length < 2 || query === '集团') {
            return;
        }
        this.searchLoading = true;
        try {
            const res = await api.ruleApi.searchOrg(query);
            this.orgList = res.data.items;
        } catch (e) {
            this.orgList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    formatOrg (org) {
        const orgArr = org.label && org.label.split('-') || [];
        if (orgArr[0] === 'IPH') {
            orgArr.shift();
        }
        return orgArr.join('/');
    }
}
</script>

<style lang="postcss">
.add-space-dialog {
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
