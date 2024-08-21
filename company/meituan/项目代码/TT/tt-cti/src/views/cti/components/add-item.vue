<template>
    <mtd-modal
        :title=" isEdit ? '编辑三级目录' : '添加三级目录'"
        :mask-closable="false"
        class="add-item-dialog form-dialog"
        width="430px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            :label-width="80"
            ref="formCustom"
            :rules="ruleCustom">
            <mtd-form-item prop="name" label="目录名称">
                <mtd-input
                    placeholder="请输入名称"
                    v-model.trim="formCustom.name"
                    type="text" />
                <div class="mtd-form-item-helper">{{ createTip }}</div>
            </mtd-form-item>
            <mtd-form-item
                prop="rgId"
                label="绑定RG"
                class="rg-item">
                <mtd-select
                    v-model="formCustom.rgId"
                    no-match-text="对不起，没有该RG，请先去创建RG"
                    :loading="searchLoading"
                    :filterable="true"
                    :debounce="200"
                    :remote="true"
                    :remote-method="remoteMethod"
                    @change="rgChange"
                    clearable>
                    <mtd-option
                        v-for="item in rgList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id" />
                </mtd-select>
                <!-- <div class="mtd-form-item-helper">没有匹配的RG？<a :href="rgURL" target="_blank" class="click-this">点击此处</a>去创建一个</div> -->
            </mtd-form-item>
            <mtd-form-item
                label="绑定模板"
                prop="template"
                style="margin-bottom: 0;">
                <mtd-select
                    v-model="formCustom.template"
                    no-match-text="对不起，没有该模板，请先去创建模板"
                    :loading="searchLoading"
                    :filterable="true"
                    :debounce="200"
                    clearable
                    @change="handleTemplate">
                    <mtd-option
                        :key="0"
                        label="空（不绑定）"
                        :value="0" />
                    <mtd-option
                        v-for="item in templateList"
                        :key="item.id"
                        :label="`${item.name}(${templateTypeLabel[item.type]})`"
                        :value="item.id" />
                </mtd-select>
            </mtd-form-item>
            <!-- <mtd-form-item>
                <mtd-checkbox v-model="formCustom.sendXmNotify" :disabled="originXmNotify && (!userInfo.sysAdmin)">开通大象微客服</mtd-checkbox>
                <div class="mtd-form-item-helper">微客服使用<a target="_blank" href="https://km.sankuai.com/page/134109797#id-五、微客服">帮助文档</a>
                开通后如需关闭请<a target="_blank" href="https://tt.sankuai.com/ticket/create?category=TroubleTracker&type=需求反馈&item=需求建议">联系我们</a></div>
            </mtd-form-item> -->
        </mtd-form>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="close">取消</mtd-button>
            <mtd-button
                :loading="btnLoading"
                type="primary"
                @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Form as MtdForm } from '@ss/mtd-vue';
import { State } from 'vuex-class';
import * as api from '@/api';
import * as validators from '@/utils/validator';
interface Form {
    name: string;
    rgId: number | string;
    template: string;
    templateType: string;
    sendXmNotify: boolean;
}
/**
 * 添加三级目录
 *
 * @author xiaokunyu
 * @date 01/11/2010
 */
@Component
export default class AddItemDialog extends Vue {
    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @State(state => state.cti.env)
    env: string;

    @Prop({ default: false })
    visible: Boolean;
    @Prop({ default: 0 })
    parentId: number;
    @Prop({ default: 0 })
    itemId: number;
    @Prop({ default: false })
    isEdit: Boolean;

    show: Boolean = false;
    rgList: CommonTypes.RgItem[] = [];
    btnLoading: Boolean = false;
    searchLoading: Boolean = false;
    rgURL: string = '';
    templateTypeLabel = {
        CUSTOM: '自定义模板',
        NORMAL: '普通模板'
    };

    templateList: any = [];
    formCustom: Form = {
        name: '',
        rgId: '',
        template: '',
        templateType: '',
        sendXmNotify: false
    };
    originXmNotify: boolean = false;
    ruleCustom = {
        name: [
            { validator: validators.validateName, trigger: 'blur' }
        ],
        rgId: [
            { validator: validators.validateRg, trigger: 'change' }
        ]
    };
    mounted () {
        this.getRgList('');
        const ONLINE_ENV: string = 'cti.sankuai.com';
        this.rgURL = window.location.host.indexOf(ONLINE_ENV) > -1 ? 'https://cti.sankuai.com/rg' : 'http://cti.cloud.test.sankuai.com/rg';
    }
    @Watch('visible', { immediate: true })
    onShowChanged (val) {
        this.show = val;
        val && (this.$refs.formCustom as MtdForm).resetFields();
        if (val && this.isEdit && this.itemId) {
            this.getItemDetail();
        }
    }
    @Watch('formCustom.rgId')
    onRgIdChange (val) {
        this.templateList = [];
        if (val) {
            this.searchTemplate();
        }
    }
    rgChange () {
        this.formCustom.template = '';
    }
    close () {
        this.$emit('update:visible', false);
    }
    remoteMethod (query) {
        this.getRgList(query);
    }
    async getItemDetail () {
        try {
            const res = await api.ctiApi.getItemInfo(this.itemId);
            const { data } = res;
            this.formCustom.name = data.itemName;
            this.formCustom.rgId = data.rgId;
            this.formCustom.template = data.templateId;
            this.formCustom.templateType = data.templateType;
            this.formCustom.sendXmNotify = data.sendXmNotify || false;
            this.originXmNotify = this.formCustom.sendXmNotify;
            const ifRg = this.rgList.find(item => {
                return item.id === data.rgId;
            });
            if (!ifRg) {
                // FIXME: 这里有类型报错，因为 name, id 两个属性不满足 rgList 的类型声明: CommonTypes.RgItem
                this.rgList.push({
                    name: data.rgName,
                    id: data.rgId,
                } as any);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getRgList (query) {
        this.searchLoading = true;
        try {
            const res = await api.ctiApi.getAllSpaceRg({ name: query, spaceId: 1 });
            this.rgList = res.data.items.map((item) => {
                return {
                    name: item.name,
                    id: item.id
                };
            });
        } catch (e) {
            this.rgList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async searchTemplate () {
        this.searchLoading = true;
        try {
            const { rgId } = this.formCustom;
            const res = await api.rgApi.getRgTemplateList({
                rgId: rgId as number,
                sn: 100
            });
            this.templateList = res.data.items;
        } catch (e) {
            this.templateList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        (this.$refs.formCustom as MtdForm).validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                try {
                    const params = {
                        name: this.formCustom.name,
                        rgId: this.formCustom.rgId as number,
                        parentId: this.parentId,
                        templateId: (this.formCustom.template || 0) as number,
                        templateType: this.formCustom.templateType || '',
                        sendXmNotify: this.formCustom.sendXmNotify
                    };
                    if (this.isEdit) {
                        await api.ctiApi.editItem(this.itemId, params);
                    } else {
                        const paramsObj = Object.assign({}, params, {
                            state: 1
                        });
                        await api.ctiApi.addItem(paramsObj);
                    }
                    const successMessage = this.isEdit ? '编辑三级目录成功' : '添加三级目录成功';
                    // if (this.formCustom.sendXmNotify) {
                    //     successMessage += '及绑定大象微客服成功';
                    // }
                    this.$mtd.message({
                        message: successMessage,
                        type: 'success'
                    });
                    this.$emit('success');
                    this.close();
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            } else {
                console.error('Fail!');
            }
        }).catch(e => e);
    }
    get createTip () {
        let tipContent = '可以以产品功能或是用户常见问题命名三级';
        if ((this.env === 'prod' && this.parentId === 172) || (this.env === 'test' && this.parentId === 907)) {
            tipContent = '该目录下不创建其他目录，请到对应的一级目录下创建二、三级目录';
        }
        return tipContent;
    }
    handleTemplate (e) {
        let type = '';
        this.templateList.forEach((item) => {
            if (item.id === e) {
                type = item.type;
            }
        });
        this.formCustom.templateType = type;
    }
}
</script>

<style lang="postcss">
.add-item-dialog {
    .rg-item {
        margin-bottom: 14px;
    }
    .click-this {
        text-decoration: none;
    }
}
</style>
