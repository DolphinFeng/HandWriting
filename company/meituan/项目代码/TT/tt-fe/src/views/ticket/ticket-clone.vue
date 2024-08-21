<template>
    <div class="ticket-create">
        <div class="create-content">
            <div class="create-header">
                <h1 class="ticket-create-title">克隆TT</h1>
                <div class="operate-button-container">
                    <mtd-button
                        :loading="btnLoading"
                        :disabled="btnLoading || imgUploadStatus"
                        type="primary"
                        @click="preSubmit">{{ submitText }}</mtd-button>
                    <mtd-button @click="cancel" class="close-btn">取消</mtd-button>
                </div>
            </div>
            <mtd-form
                :model="form"
                ref="form"
                class="create-form"
                :rules="ruleCustom"
                :label-width="72">
                <mtd-container>
                    <mtd-aside width="356px" class="ticket-info-aside">
                        <div class="create-cti-container">
                            <catalog-create
                                :catalog-info="defaultCti"
                                :show-assigned="false"
                                @template-change="handleTemplateChange"
                                @change="updateCategoryAssigned"
                                style="display: inline-block;"
                                ref="category" />
                            <div
                                v-if="form.rgId"
                                :class="'rg-info-wrapper rg-tip-' + form.sla">
                                <h3>{{ form.rgName }}</h3>
                                <p>{{ slaConfig }}<p /></div>
                        </div>
                        <mtd-form-item
                            class="require"
                            prop="ticketType"
                            label="问题类型:">
                            <mtd-select v-model="form.ticketType" @change="lxSubmit('click_type')">
                                <mtd-option
                                    v-for="(item, index) in ticketType"
                                    :key="index"
                                    :label="$getText(item.key)"
                                    :value="item.value" />
                            </mtd-select>
                        </mtd-form-item>
                        <mtd-form-item
                            class="require form-sla"
                            prop="sla"
                            label="问题等级:">
                            <create-change-sla
                                :value.sync="form.sla"
                                :options="rgSlaOptions"
                                @change="lxSubmit('click_sla')" />
                            <!-- <mtd-select
                                :class="form.sla"
                                v-model="form.sla"
                                @change="lxSubmit('click_sla')"
                                style="width: 100%;">
                                <mtd-option
                                    v-for="(value, index) in ticketSla"
                                    :key="index"
                                    :label="sla2CN[value]"
                                    :value="value" />
                            </mtd-select> -->
                            <div class="rg-level-tip" v-if="form.rgId"> {{ slaConfig2 }} </div>
                        </mtd-form-item>
                        <mtd-form-item
                            prop="reporter"
                            label="发起人:"
                            v-if="inside">
                            <change-reporter
                                :reporter="form.reporter"
                                @change="reporterChange" />
                        </mtd-form-item>
                        <mtd-form-item
                            v-if="inside"
                            prop="cc"
                            label="抄送:"
                            class="mini-line-height">
                            <change-cc
                                class="tag-item"
                                @change="ccChange"
                                :cc-list="form.cc" />
                        </mtd-form-item>
                        <mtd-form-item
                            prop="labels"
                            label="标签:"
                            class="mini-line-height">
                            <change-tag
                                class="tag-item"
                                :tag-list="form.labels"
                                :rg-id="form.rgId"
                                @change="tagChange" />
                        </mtd-form-item>
                        <mtd-form-item
                            prop="permission"
                            label="保密:"
                            v-if="inside"
                            class="permission-switch-item">
                            <mtd-switch
                                v-model="form.permission"
                                size="small"
                                :disabled="rgSetPermission"
                                @input="lxSubmit('switch_permission')" />
                            <mtd-tooltip
                                content="只允许创建人、发起人、处理组、抄送人查看和编辑"
                                trigger="hover"
                                theme="dark"
                                placement="right"
                                size="small">
                                <i class="mtdicon mtdicon-question-circle-o" />
                            </mtd-tooltip>
                        </mtd-form-item>
                    </mtd-aside>
                    <mtd-main class="ticket-main-container">
                        <mtd-form-item
                            class="form-name"
                            prop="name"
                            :label-width="82">
                            <span slot="label">
                                标题:
                                <info-tip :content="createTip['name']" />
                            </span>
                            <mtd-input
                                class="input-wrapper"
                                v-model="form.name"
                                placeholder="请输入标题"
                                type="text" />
                        </mtd-form-item>
                        <mtd-form-item
                            class="mtd-form-item-required"
                            prop="desc"
                            :label-width="82">
                            <span slot="label">
                                描述:
                                <info-tip :content="createTip['desc']" />
                            </span>
                            <div class="comment-input">
                                <editor
                                    ref="editor"
                                    :is-comment="false"
                                    @input="handleDescChange"
                                    @imgUpload="handleImgUpload"
                                    :value="form.desc"
                                    :action="descUploadApi"
                                    placeholder="请输入问题描述，可以使用 Command+V 粘贴截图" />
                            </div>
                        </mtd-form-item>
                        <mtd-form-item class="upload-form-item" :label-width="82">
                            <span slot="label">
                                附件:
                                <info-tip :content="createTip['attachment']" />
                            </span>
                            <ul>
                                <li
                                    class="mtd-upload-list-item-name"
                                    :key="item.id"
                                    v-for="item in form.attachment">
                                    <i class="mtdicon mtdicon-link-o" />{{ item.name }}
                                </li>
                            </ul>
                            <mtd-upload
                                class="upload-attachment"
                                :action="attachUploadApi"
                                :headers="{
                                    'X-Login-Type': loginType
                                }"
                                :on-exceed="handleExceed"
                                :before-upload="beforeUpload"
                                :on-remove="handelFileRemove"
                                :on-change="handelFileChange"
                                :on-success="handelFileSuccess"
                                :on-error="handelFileError"
                                :auto-upload="false"
                                ref="upload"
                                :limit="10"
                                drag
                                multiple>
                                <div class="ticket-drag-upload-wrapper">
                                    <i class="mtdicon mtdicon-export-o" />
                                    <div class="file-upload-text">点击或拖拽文件到此处上传</div>
                                </div>
                            </mtd-upload>
                        </mtd-form-item>
                    </mtd-main>
                </mtd-container>
            </mtd-form>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import sortBy from 'lodash.sortby';
import * as api from '@/api';
import CatalogCreate from '@/components/catalog-create.vue';
import ChangeReporter from '@/components/change-reporter.vue';
import ChangeCc from '@/components/change-cc.vue';
import ChangeTag from '@/components/change-tag.vue';
import CreateChangeSla from '@/components/create-change-sla.vue';
import Editor from '@/components/quill-editor.vue';
import expandButton from '@/components/expand-button.vue';
import InfoTip from '@/components/info-tip.vue';
import { State, Getter } from 'vuex-class';
import { TicketSla, TicketType, Sla2CN, SLA_RULE_DESC, CreateTip, SlaOptions } from '@/config/map.conf';
import { CREATE_LX_MAP, PAGE_VIEW } from '@/config/lx_map.conf';
import { lxReportView, lxReportClick } from '@/utils/directive/lxanaly';
import { formatTimeStr, getSimpleText } from '@/utils/tools';
import pick from 'lodash.pick';

import eventBus from '@/utils/event-bus';

/**
 * 克隆Ticket
 *
 * @author liyuyao
 * @date 01/11/2021
 */
const validateName: Function = (_rule, value, callback) => {
    if (value.length > 60) return callback(new Error('标题不能超过60个字'));
    return callback();
};
const validateDesc: Function = (_rule, value, callback) => {
    if (!value) return callback(new Error('问题描述不能为空'));
    return callback();
};
const validateTicketType: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择问题类型'));
    }
    return callback();
};
const validateSla: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择问题等级'));
    }
    return callback();
};
const validateReporter: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择发起人'));
    }
    return callback();
};
const validateCc: Function = (_rule, value, callback) => {
    if (value && value.length > 30) {
        return callback(new Error('最多可输入30个协助人'));
    }
    return callback();
};
@Component({
    components: {
        CatalogCreate,
        ChangeReporter,
        ChangeCc,
        ChangeTag,
        CreateChangeSla,
        // CitySelect,
        Editor,
        expandButton,
        InfoTip
    }
})
export default class TicketClone extends Vue {
    @Getter inside;
    @Getter misX;
    @Getter loginType;
    @Getter spaceDomain;

    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @State(state => state.tt.userChooseCti)
    userChooseCti: number[];

    form: CommonTypes.CreateTicketItem = {
        name: '',
        desc: '',
        ticketType: '',
        categoryName: '',
        categoryId: 0,
        typeName: '',
        typeId: 0,
        itemName: '',
        itemId: 0,
        assigned: '',
        rgId: 0,
        cc: [],
        reporter: '',
        sla: '',
        permission: false,
        labels: [],
        sourceId: 0
        // city: ''
    };
    defaultCti: any = {
        categoryName: '',
        categoryId: 0,
        typeName: '',
        typeId: 0,
        itemName: '',
        itemId: 0
    };
    defaultCustomId: number = 0;
    ticketSla: string[] = TicketSla;
    ticketType: {key: string, value: string}[] = TicketType;
    userLoading: Boolean = false;
    btnLoading: Boolean = false;
    ticketId: number = 0;
    attachment: any[] = [];
    userList: CommonTypes.UserInfoItem[] = [];
    RgUserList: CommonTypes.RgUserItem[] = [];
    RgWithCategory: any = [];
    timer: number = 0;
    submitText: string = '提交';
    sla2CN: CommonTypes.mapObject = Sla2CN;
    createTip: CommonTypes.mapObject = CreateTip;
    withCategoryList: any = [];
    fileSizeOk: boolean = true;
    constDefault: any = {
        label: '暂无对应的服务目录',
        value: '',
        disabled: true
    };
    constEmpty: any = {
        label: '请输入 MIS',
        value: '',
        disabled: true
    };
    currentTemplate: number = 0;
    RgList: any = [];
    imgUploadStatus: boolean = false;
    categorySearchType: string = 'category';

    rgSetPermission: boolean = false;

    pageReferrer: string = '';
    slaConfigInfo: any = [];

    createFold: boolean = false;
    // oldCategoryList: any = []; // 用户回显取消跳转自定义表单后的原有RG
    curCategory: any = {};

    rgSlaOptions: CommonTypes.mapObject[] = SlaOptions;
    uploadedNum: number = 0;

    ruleCustom = {
        name: [
            { validator: validateName, trigger: 'blur' }
        ],
        desc: [
            { validator: validateDesc, trigger: 'blur,change' }
        ],
        itemName: [
            { validator: this.validateCatalog, trigger: 'blur, change' }
        ],
        ticketType: [
            { validator: validateTicketType, trigger: 'change' }
        ],
        sla: [
            { validator: validateSla, trigger: 'blur,change' }
        ],
        reporter: [
            { validator: validateReporter, trigger: 'blur,change' }
        ],
        cc: [
            { validator: validateCc, trigger: 'blur,change' }
        ]
    };

    get attachUploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach`;
    }
    get descUploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload/desc?area=` : `/api/tt/1.0/file/upload/desc?area=`;
    }
    get userRealChooseCti () {
        const noChoosePos = this.userChooseCti.indexOf(-1);
        let level = noChoosePos > -1 ? noChoosePos : null;
        let id = this.userChooseCti[noChoosePos - 1] || null;
        return {
            level: level,
            id: id
        };
    }
    get cloneId () {
        return this.$route.query.id;
    }
    mounted () {
        eventBus.$emit('changeTab', '');
        this.getTicketDetail();
        this.RgList = [this.constEmpty];
        this.setDefaultReporter(this.userInfo);
    }
    // 默认设置报告人是自己
    @Watch('userInfo')
    setDefaultReporter (val) {
        if (val && val.username) {
            this.form.reporter = val.username;
            this.userList = [{
                username: val.username,
                displayName: val.displayname
            }];
        }
        // 如果是外部账号 获取是否是外卖代理商账号 自动填写标题
        (!this.inside) && this.getWmDistrictCityTitle();
    }
    // 获取rg的默认设置
    @Watch('form.rgId')
    getRgSetting (val) {
        if (val) {
            this.getSlaConfig();
            this.getDefaultSetting();
        } else {
            this.slaConfigInfo = [];
        }
    }
    async getTicketDetail () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketDetail(this.cloneId);
            let { code, data } = res;
            if (code === 200) {
                let defaultForm = pick(data, ['name', 'desc', 'ticketType', 'categoryId', 'typeId', 'itemId', 'sla', 'cc', 'permission', 'labels', 'attachment']);
                defaultForm.permission = defaultForm.permission === 'private';
                this.defaultCti = Object.assign(this.defaultCti, {
                    categoryId: parseInt(data.categoryId, 10),
                    typeId: parseInt(data.typeId, 10),
                    itemId: parseInt(data.itemId, 10)
                });
                this.form = Object.assign(this.form, defaultForm);
                this.defaultCustomId = data.customFormId;
                // 对自定义字段进行处理
                if (data.customFormId && data.customFieldValues) {
                    const customFieldValues = data.customFieldValues;
                    let content = '<p><br></p>';
                    customFieldValues.forEach(field => {
                        content += `<p>${field.name}：${field.value}</p>`;
                    });
                    this.form.desc += content;
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getDefaultSetting () {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgSetting(this.form.rgId);
            let { code, data } = res;
            if (code === 200) {
                if (data.ccSwitch === 'on') {
                    let ccArr = this.formatToArr(data.userMap);
                    this.form.cc = this.form.cc.concat(ccArr);
                }
                this.form.permission = this.form.permission || (data.auth === 'private');
                this.rgSetPermission = data.auth === 'private';
            }
        } catch (error) {
            console.log('error', error);
        }
    }
    async getSlaConfig () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getSlaConfig(this.form.rgId);
            this.slaConfigInfo = res.data.items;
            const slaSort = sortBy(this.slaConfigInfo, ['name']).filter(item => {
                return item.displayWhenLauch;
            });
            this.ticketSla = slaSort.map(item => {
                return item.name;
            });
            this.rgSlaOptions = slaSort.map(item => {
                return {
                    value: item.name,
                    label: this.$getText(Sla2CN[item.name]),
                    instruction: item.description
                };
            });
        } catch (e) {
            console.log(e);
        }
    }
    get slaConfig () {
        let slaTip = '该处理组的';
        let config = this.slaConfigInfo.find((config) => {
            return config.name === this.form.sla;
        });
        if (config) {
            let resolve = config.resolveWorkHour || config.resolve;
            let response = config.responseWorkHour || config.response;
            slaTip += parseInt(response.ruleValue, 10) ? `响应时长：${formatTimeStr(response.ruleValue, response.ruleUnit)}；` : '';
            slaTip += parseInt(resolve.ruleValue, 10) ? `处理时长：${formatTimeStr(resolve.ruleValue, resolve.ruleUnit)}；` : '';
        }
        return slaTip;
    }
    get slaConfig2 () {
        let config = this.slaConfigInfo.find((config) => {
            return config.name === this.form.sla;
        });
        if (config) {
            return config.description;
        } else {
            return '';
        }
    }
    formatToArr (obj) {
        let result = [];
        for (let key in obj) {
            result.push(key);
        }
        return result;
    }
    updateCategoryAssigned (result, categorySearchType, fromUrl, isRecommendAssigned?) {
        // this.makeOldCategoryList(result);
        this.curCategory = result;
        for (let key in result) {
            this.form[key] = result[key];
        }
        this.form.sourceId = isRecommendAssigned ? 1 : 0;
        this.categorySearchType = categorySearchType || 'category';
        if (!fromUrl) this.$refs.form && this.$refs.form.validateField('itemName');
    }
    // makeOldCategoryList (res) {
    //     let resList = this.oldCategoryList.map((item) => {
    //         if (item.itemId === res.itemId) {
    //             return item;
    //         }
    //     });
    //     if (resList.length === 0) {
    //         this.oldCategoryList.unshift(JSON.parse(JSON.stringify(res)));
    //         if (this.oldCategoryList.length > 2) {
    //             this.oldCategoryList.length = 2;
    //         }
    //     }
    // }
    async handleTemplateChange () {
        if (!this.form.itemId) {
            return ;
        }
        let newTemplate = await this.getTemplateByItem(this.form.itemId);
        if (!newTemplate) return;
        let queryObj = {
            custom: newTemplate.id,
            id: this.cloneId
        };
        if (newTemplate.type === 'CUSTOM') {
            console.log('defaultCustomId', this.defaultCustomId);
            // 标记是否使用 categoryInfo
            if (newTemplate.id === this.defaultCustomId) {
                queryObj.mountCti = true;
            } else {
                queryObj.categoryInfo = JSON.stringify(this.curCategory);
            }
            this.$mtd.confirm({
                title: '当前目录绑定了自定义模板，是否使用自定义模板？',
                width: '500px',
                showCancelButton: true,
                type: 'warning',
                okButtonText: '确定',
                onOk: () => {
                    this.$router.push({
                        name: 'tt_clone_custom',
                        params: {
                            space: this.spaceDomain
                        },
                        query: queryObj
                    });
                }
            }).catch(e => e);
        } else {
            // 从空到有模板
            if (newTemplate.id && (!this.currentTemplate)) {
                this.form.desc += newTemplate.content;
                this.currentTemplate = newTemplate.id;
            } else if (newTemplate.id && this.currentTemplate && (this.currentTemplate !== newTemplate.id)) { // 切换模板
                this.changeTemplate(newTemplate);
            }
        }
    }
    changeTemplate (newTemplate) {
        this.$mtd.confirm({
            title: '服务目录已切换，是否清空当前问题描述内容，切换到新的模板？',
            width: '500x',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                this.form.desc = this.pageReferrer;
                this.form.desc += newTemplate.content;
                this.currentTemplate = newTemplate.id;
            }
        }).catch(e => e);
    }
    // 根据itemId获取模板
    async getTemplateByItem (itemId: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getTemplateByItem(itemId);
            let { code, data } = res;
            return data;
        } catch (e) {
            console.log(e);
        }
    }
    // 验证三级目录不能为空
    validateCatalog (_rule, value, callback) {
        this.$nextTick(function () {
            if (!this.form.itemName) {
                if (this.categorySearchType === 'category') {
                    return callback(new Error('请选择/搜索服务目录'));
                } else {
                    return callback(new Error('请搜索处理人'));
                }
            }
            return callback();
        });
    }
    // 外卖代理商标题
    async getWmDistrictCityTitle () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getWmDistrictCityTitle(this.misX);
        let { code, data } = res;
        if (code === 200 && data.prefix) {
            this.form.name = data.prefix;
        }
    }
    handleExceed () {
        this.$mtd.message.error('仅允许上传10个附件');
    }
    handelFileRemove (file, files) {
        this.attachment = files;
        this.judgeFileList(file, files);
    }
    handelFileChange (file, files) {
        this.lxSubmit('click_uploadfile');
        this.attachment = files;
        if (file.size / 1024 / 1024 > 50) {
            this.$mtd.message.error('上传附件大小需控制在50M以内');
        }
        this.judgeFileList(file, files);
    }
    judgeFileList (file, files) {
        this.fileSizeOk = true;
        for (let i = 0; i < files.length; i++) {
            if (files[i].size / 1024 / 1024 > 50) {
                this.fileSizeOk = false;
                break;
            }
        }
    }
    handelFileSuccess (file) {
        this.uploadedNum ++;
        if (this.uploadedNum === this.attachment.length) {
            this.successRedirect();
        }
    }
    handelFileError (err) {
        this.$mtd.message({
            message: err,
            type: 'error',
            duration: 5000
        });
        this.btnLoading = false;
        this.submitText = '提交';
    }
    handleDescChange (value) {
        this.form.desc = value;
    }
    // 附件上传前校验
    beforeUpload (file) {
        const isLt50M = file.size / 1024 / 1024 <= 50;
        if (!isLt50M) {
            this.$mtd.message.error('上传附件大小控制在50M以内');
        }
        this.fileSizeOk = isLt50M;
        return isLt50M;
    }
    // 所在城市
    // cityChange (city) {
    //     this.lxSubmit('select_city');
    //     this.form.city = city;
    // }
    // 取消创建需提示用户
    cancel () {
        this.lxSubmit('click_cancelsave');
        this.$mtd.confirm({
            message: '确定要离开吗？系统可能不会保存您所做的更改',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                window.close();
            }
        }).catch(e => { console.log(e); });
    }
    successRedirect () {
        this.btnLoading = false;
        this.$router.push({
            name: 'tt_detail',
            params: {
                space: this.spaceDomain
            },
            query: {
                id: this.ticketId
            }
        }).catch(e => e);
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    reporterChange (val) {
        this.lxSubmit('click_reporter');
        this.form.reporter = val;
    }
    ccChange (val) {
        this.lxSubmit('click_cc');
        this.form.cc = val;
    }
    tagChange (val) {
        this.form.labels = val;
    }
    // 埋点函数
    lxSubmit (eventName) {
        lxReportClick(CREATE_LX_MAP[eventName]);
    }
    preSubmit () {
        this.lxSubmit('click_create');
        if (['S1', 'S2'].includes(this.form.sla)) {
            this.$mtd.confirm({
                title: this.form.sla === 'S1' ? '选择非常紧急会抄送您的上级' : '确定使用该等级？',
                message: this.$getText(SLA_RULE_DESC[this.form.sla]),
                width: '460px',
                type: 'warning',
                okButtonText: '确定',
                onOk: this.submit,
                cancelButtonText: '取消',
                showCancelButton: true
            }).catch(e => { console.log(e); });
        } else {
            this.submit();
        }
    }
    async submit () {
        if (!this.fileSizeOk) {
            this.$mtd.message.error('上传附件大小需控制在50M以内');
            return ;
        }
        const { id, level } = this.userRealChooseCti;
        const cloneId = this.cloneId;
        this.$refs['form'].validate(async (valid) => {
            if (valid && this.fileSizeOk) {
                this.submitText = '正在提交';
                this.btnLoading = true;
                try {
                    const res: Ajax.AxiosResponse = await api.ticketApi.createTicket({
                        name: this.splitDescToName(this.form.name, this.form.desc),
                        desc: this.form.desc,
                        ticketType: this.form.ticketType,
                        categoryName: this.form.categoryName,
                        categoryId: this.form.categoryId || '',
                        typeName: this.form.typeName,
                        typeId: this.form.typeId || '',
                        itemName: this.form.itemName,
                        itemId: this.form.itemId || '',
                        assigned: this.form.assigned,
                        cc: this.form.cc.length ? this.form.cc : [],
                        reporter: this.form.reporter,
                        rgId: this.form.rgId,
                        sla: this.form.sla,
                        permission: (!this.inside) ? 'private' : (this.form.permission ? 'private' : 'public'),
                        labels: this.form.labels || [],
                        sourceId: this.form.sourceId || 0,
                        // city: this.form.city || '',
                        source: 'ticket',
                        appointAssigned: this.categorySearchType === 'assigned',
                        selectDirectoryId: id,
                        selectDirectoryLevel: level
                    });
                    let { code, data } = res;
                    if (code === 200) {
                        this.ticketId = data.id;
                        // 关联被克隆的TT
                        await this.associateTicket(this.ticketId, cloneId);
                        if (typeof sessionStorage === 'object') {
                            try {
                                sessionStorage.setItem('createData', JSON.stringify(data));
                            } catch (error) {
                                console.log(error);
                            }
                        }
                        if (this.attachment.length === 0) {
                            this.successRedirect();
                        }
                        setTimeout(async () => {
                            if (this.form.attachment.length) {
                                await this.associateAttachment(this.ticketId, cloneId);
                            }
                            this.$refs.upload && this.$refs.upload.submit();
                        }, 0);
                    }
                } catch (e) {
                    this.btnLoading = false;
                    this.submitText = '提交';
                    console.log(e);
                }
            }
        }).catch(err => console.log(`validate msg: `, err));
    }
    splitDescToName (name: string, desc: string) {
        if (name.length) {
            return name;
        } else {
            let text = getSimpleText(desc);
            return text ? text.slice(0, 60) : '问题反馈';
        }
    }
    async associateAttachment (id: number, cloneId: number) {
        try {
            await api.ticketApi.associateAttachment({
                oldTicketId: cloneId,
                cloneTicketId: id
            });
        } catch (e) {
            console.log(e);
        }
    }
    async associateTicket (id: number, cloneId: number) {
        try {
            await api.ticketApi.connectTT([{
                destination: id,
                linkType: 'TT',
                source: cloneId
            }]);
        } catch (e) {
            console.log(e);
        }
    }
}
</script>

<style lang="scss">
.ticket-create {
    height: 100%;
    .create-form {
        // .mtd-form-item-label {
        //     text-align: left !important;
        // }
        .form-name {
            .input-wrapper {
                width: 100%;
            }
        }
        .mtd-select {
            width: 100%;
        }
        .mtd-form-item {
            margin-bottom: 12px;
            &.form-catalog {
                margin-bottom: 16px;
                .mtd-form-item-error-tip {
                    position: absolute;
                    margin-top: 0;
                    line-height: 16px;
                }
                .category-tree {
                    width: 100%;
                }
            }
            &.form-sla {
                margin-bottom: 8px;
            }
        }
        .S1 {
            .mtd-input {
                color: #ff6459;
            }
        }
        .S2 {
            .mtd-input {
                color: #ff9801;
            }
        }
        .upload-attachment,
        .mtd-upload,
        .mtd-upload-dragger {
            width: 100%;
        }
        .upload-attachment {
            .mtd-upload-dragger {
                height: 60px;
                .mtdicon-export-o {
                    margin: 0;
                    font-size: 12px;
                    line-height: 1;
                    // color: rgba(0, 0, 0, 0.6);
                }
                .file-upload-text {
                    line-height: 22px;
                    font-size: 12px;
                }
            }
        }
        .ticket-drag-upload-wrapper {
            text-align: center;
        }
        .rg-level-tip {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.36);
            line-height: 20px;
        }
        .mtdicon-info-circle {
            position: relative;
            top: 2px;
            color: #4e73ff;
            font-size: 14px;
        }
        .ql-toolbar.ql-snow {
            line-height: initial;
        }
        .vertical-line-container {
            width: 310px;
            display: inline-block;
        }
        .mtd-switch {
            vertical-align: middle;
        }
        .permission-tip {
            color: #6f6f6f;
            display: inline-block;
            margin-left: 10px;
        }
    }
    .create-cti-container {
        padding: 0 0 10px 0;
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .ticket-info-aside {
        padding: 10px 20px;
        background: #f7f7f7;
        border-radius: 4px;
    }
    .ticket-main-container {
        padding: 12px 0 20px 20px;
        background: #fff;
        border-radius: 4px;
    }
    .ticket-create-title {
        display: inline-block;
        padding-bottom: 16px;
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: #333;
        line-height: 22px;
    }
    .operate-button-container {
        float: right;
        .mtd-btn {
            min-width: 80px;
            margin-left: 12px;
            font-weight: 600;
        }
    }
    .create-content {
        width: 1000px;
        margin: 0 auto;
        padding: 24px 0 66px;
    }
    .comment-input .ql-container {
        height: auto;
        min-height: 200px;
        max-height: 600px;
        overflow: auto;
        .ql-editor.ql-blank {
            height: 200px;
        }
    }
    .text-button {
        display: inline-block;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        cursor: pointer;
    }
    .mtdicon-question-circle-o {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.24);
    }
    .permission-switch-item.mtd-form-item {
        .mtd-tooltip-rel {
            vertical-align: middle;
            line-height: 12px;
        }
    }
    .upload-form-item.mtd-form-item {
        .mtd-tooltip-rel {
            vertical-align: top;
        }
    }
    .uploaded-attachment-list {
        margin-bottom: 10px;
    }
    .rg-tip-S1 {
        background: #ffe9e6;
        .triangle {
            border-right-color: #ffe9e6;
        }
        .tip-wrapper {
            background: #ffe9e6;
        }
    }
    .rg-tip-S2 {
        background: #fff2e2;
        .triangle {
            border-right-color: #fff2e2;
        }
        .tip-wrapper {
            background: #fff2e2;
        }
    }
    .rg-tip-S3 {
        background: #fff9e2;
        .triangle {
            border-right-color: #fff9e2;
        }
        .tip-wrapper {
            background: #fff9e2;
        }
    }
    .rg-tip-S4 {
        background: #eef5ff;
        .triangle {
            border-right-color: #eef5ff;
        }
        .tip-wrapper {
            background: #eef5ff;
        }
    }
    .rg-tip-S5 {
        background: #ededed;
        .triangle {
            border-right-color: #ededed;
        }
        .tip-wrapper {
            background: #ededed;
        }
    }
    .rg-info-wrapper {
        padding: 2px 8px 6px 8px;
        border-radius: 2px;
        font-family: PingFangSC-Regular;
        color: #592d00;
        h3 {
            font-size: 14px;
        }
        p {
            font-size: 12px;
        }
    }
    .mini-line-height .mtd-form-item-label {
        line-height: 22px;
    }
    .tag-item {
        display: flex;
        align-items: center;
    }
}
.mtd-confirm-title {
    padding-right: 25px;
}
</style>
