<template>
    <div class="catalog-tree">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :rules="ruleCustom"
            :label-width="115"
            v-if="formCustom.id">
            <mtd-form-item label="ID:" prop="ID">
                {{ formCustom.id }}
            </mtd-form-item>
            <mtd-form-item label="名称:" prop="name">
                <mtd-input
                    type="text"
                    v-model="formCustom.name"
                    :disabled="!editable"
                    style="width: 260px;" />
            </mtd-form-item>
            <mtd-form-item label="状态:" prop="state">
                <mtd-select
                    type="text"
                    @change="toggleState"
                    :disabled="!editable"
                    v-model="formCustom.state">
                    <mtd-option :value="1" label="启用" />
                    <mtd-option :value="2" label="停用" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                label=""
                prop="ticketRelated"
                v-if="level !== 3  && !noChildren">
                <mtd-checkbox
                    :disabled="!editable"
                    v-model="formCustom.ticketRelated">支持从当前目录直接发起TT</mtd-checkbox>
            </mtd-form-item>
            <mtd-form-item
                label=""
                prop="defaultCatalog"
                v-if="level !== 3 && !noChildren">
                <span>默认三级目录</span>
                <mtd-select
                    v-model="formCustom.defaultCatalog"
                    class="select-width"
                    :loading="loading"
                    :filterable="false"
                    :remote="true"
                    no-data-text="该目录下没有可用三级目录，请在该目录下创建或启用目录"
                    :disabled="!editable || !formCustom.ticketRelated"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in options"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id" />
                </mtd-select>
                <mtd-select
                    v-if="level === 1 && formCustom.defaultCatalog"
                    v-model="formCustom.defaultLevel3"
                    class="select-width"
                    :loading="loading1"
                    :filterable="true"
                    :disabled="!editable || !formCustom.ticketRelated"
                    :remote="true"
                    no-data-text="该目录下没有可用三级目录，请在该目录下创建或启用目录"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in level3Options"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                label="绑定RG:"
                prop="rg"
                v-if="level === 3">
                <mtd-select
                    type="text"
                    :disabled="!editable"
                    :filterable="true"
                    :remote="true"
                    :loading="loadingRg"
                    clearable
                    :remote-method="initRgOption"
                    @change="rgIdChangedHandler"
                    v-model="formCustom.rgId">
                    <mtd-option
                        v-for="item in rgOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                label="绑定模版:"
                prop="template"
                v-if="level === 3">
                <mtd-select
                    type="text"
                    :filterable="false"
                    :remote="true"
                    :loading="loadingTemplate"
                    :remote-method="findTemplate"
                    @change="templateChangeHandler"
                    clearable
                    :disabled="!editable"
                    :value="formCustom.templateId">
                    <mtd-option
                        v-for="item in templateOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                prop="mainSpaceVisible"
                label="公共发起页可见:"
                v-if="level === 1">
                <mtd-radio-group v-model="formCustom.mainSpaceVisible" :disabled="!editable">
                    <mtd-radio :value="false">不可见</mtd-radio>
                    <mtd-tooltip
                        class="main-sapce-tooltip"
                        content="勾选可见后，该目录在tt.sankuai.com可见"
                        placement="right">
                        <mtd-radio :value="true">可见</mtd-radio>
                    </mtd-tooltip>
                </mtd-radio-group>
            </mtd-form-item>
            <mtd-form-item label="创建人:" prop="createdBy">
                {{ formCustom.createdBy }}
            </mtd-form-item>
            <mtd-form-item label="创建时间:" prop="createdAt">
                {{ createdTime }}
            </mtd-form-item>
            <mtd-form-item
                label="发起链接:"
                prop="ticketCreateLink"
                v-if="level === 3">
                <span>{{ formCustom.ticketCreateLink }}</span>
                <mtd-button
                    v-clipboard="linkFilter(formCustom.ticketCreateLink)"
                    size="small"
                    type="primary"
                    @success="handleCopySuccess">复制链接</mtd-button>
            </mtd-form-item>
            <mtd-form-item v-if="editable">
                <mtd-button
                    type="primary"
                    style="margin-right: 12px;"
                    @click="handleSubmit">
                    保存
                </mtd-button>
                <mtd-button @click="resetForm">取消</mtd-button>
            </mtd-form-item>
            <mtd-form-item v-else>
                <mtd-button @click="makeEdit">编辑</mtd-button>
            </mtd-form-item>
        </mtd-form>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Form } from '@ss/mtd-vue';
import moment from 'moment';
import * as api from '@/api';
import { get, findIndex, keys, cloneDeep } from 'lodash';
import VueClipboards from 'vue-clipboards';
Vue.use(VueClipboards);
// const defaultOption = [
//     {
//         orgId: 0,
//         orgPath: '可从大象个人名片中查找完整部门链，部门链至少三级(如：美团/基础研发平台/研发质量及效率部)',
//         disabled: true,
//         orgName: ''
//     }
// ];

@Component({
    name: 'Catalog'
})
export default class Catalog extends Vue {
    @Prop()
    level: number;
    @Prop()
    node: any;
    @Prop()
    currentCatalog: any;
    @Prop()
    edit: boolean;
    @Prop()
    noChildren: boolean;

    ruleCustom: any = {
        name: {
            required: true,
            min: 2,
            max: 20
        }
    };
    templateOptions: any = [];
    rgOptions: any = [];
    enable: boolean = false;
    editable: boolean = false;
    templateType: string = '';
    formCustom: any = {
        id: '',
        name: '',
        state: 1,
        ticketRelated: true,
        defaultCatalog: '',
        defaultItemId: '',
        rgId: '',
        templateId: null,
        createdBy: '',
        createdAt: (() => {
            return new Date();
        })(),
        ticketCreateLink: '',
        mainSpaceVisible: false
    };
    // authActive:boolean = false;
    loading: boolean = false;
    loading1: boolean = false;
    loadingRg: boolean = false;
    loadingTemplate: boolean = false;
    options: any = [];
    level3Options: any = [];
    oldFormCustom: any = {};

    get createdTime () {
        return moment(this.formCustom.createdAt).format('YYYY-MM-DD HH:mm:ss');
    }

    @Watch('formCustom.defaultCatalog')
    level3Hanlder (val) {
        if (val) {
            this.initLevel3Options(val);
        }
    }

    @Watch('formCustom.rgId')
    rgIdHandler (val) {
        this.initRgOption(val);
        this.findTemplate();
    }

    @Watch('formCustom.templateId')
    templateIdHandler () {
        if (this.formCustom.rgId) {
            this.findTemplate();
        }
    }

    @Watch('edit', { immediate: true })
    editHandler (val) {
        this.editable = val;
        if (val && this.options.length === 0) {
            this.initOptions();
        }
    }

    created () {
        this.formCustom = this.currentCatalog;
        this.oldFormCustom = cloneDeep(this.currentCatalog);
        this.initOptions();
    }

    rgIdChangedHandler () {
        this.formCustom.templateId = 0;
    }

    linkFilter (link: string) {
        if (!link) {
            return '';
        }
        return link.replace(/\+/g, '%2B');
    }

    handleCopySuccess () {
        this.$mtd.message({
            message: '复制TT链接成功',
            type: 'success'
        });
    }

    templateChangeHandler (val) {
        this.formCustom.templateId = val;
        const index = findIndex(this.templateOptions, (item) => {
            return item.id === val;
        });
        this.formCustom.templateType = this.templateOptions[index].type;
    }

    toggleState (val) {
        let msg = '当前目录停用后，下级目录跟随停用';
        msg = val === 2 ? msg : '当前目录启用后，上级目录跟随启用';
        this.$mtd.message.info(msg);
    }

    async initRgOption (query) {
        this.loadingRg = true;
        let params = null;
        if (!query) {
            params = {
                spaceId: this.$route.params.id
            };
        } else if (isNaN(query)) {
            params = {
                spaceId: this.$route.params.id,
                name: query
            };
        } else {
            params = {
                spaceId: this.$route.params.id,
                id: query
            };
        }
        const res = await api.ctiApi.getAllSpaceRg(params);
        this.rgOptions = get(res, ['data', 'items'], []);
        this.loadingRg = false;
    }

    async findTemplate () {
        this.loadingTemplate = true;
        let res = {};
        if (this.formCustom.rgId) {
            res = await api.rgApi.getRgTemplateList({
                rgId: this.formCustom.rgId,
                sn: 100
            });
        }
        this.loadingTemplate = false;
        this.templateOptions = get(res, ['data', 'items'], []).concat({ id: 0, name: '无', type: '' });
    }

    async initOptions () {
        if (this.currentCatalog && this.currentCatalog.id) {
            this.options = await this.getChildTreeData(this.level - 1, this.currentCatalog.id);
            this.enable = !!this.options.length;
        } else {
            this.enable = false;
        }
    }

    async initLevel3Options (id) {
        this.level3Options = await this.getChildTreeData(1, id);
    }

    resetForm () {
        const formKeys = keys(this.formCustom);
        (this.$refs.formCustom as Form).resetFields(formKeys);
        this.editable = false;
    }

    makeEdit () {
        this.editable = true;
        this.oldFormCustom = cloneDeep(this.currentCatalog);
    }

    handleSubmit () {
        if (this.level === 1) {
            this.formCustom.defaultItemId = this.formCustom.defaultLevel3;
        } else {
            this.formCustom.defaultItemId = this.formCustom.defaultCatalog;
        }
        this.$emit('updateCatalog', this.formCustom, this.level, this.node);
        this.editable = false;
    }

    async getChildTreeData (level, parentId) {
        let childList;
        if (level === 0) {
            childList = await api.ctiApi.getCatalogLevel2Tree({ parentId, states: 1 });
        } else if (level === 1) {
            childList = await api.ctiApi.getCatalogLevel3Tree({ parentId, states: 1 });
        } else {
            return [];
        }
        return get(childList, ['data', 'items'], []);
    }

    async remoteMethod (query) {
        console.log(query);
    }

    formatter (val) {
        if (val.value) {
            return `${val.value.orgName}`;
        }
    }
}
</script>
<style lang="postcss" scoped>
.auth-list {
    span {
        display: inline-block;
        background-color: #AAAAAA;
        color: #FFFFFF;
        margin-right: 15px;
        margin-bottom: 5px;
        padding: 0 5px;
        :last-child {
            margin-right: 0;
        }
    }
}
.main-sapce-tooltip {
    display: flex;
}
</style>
