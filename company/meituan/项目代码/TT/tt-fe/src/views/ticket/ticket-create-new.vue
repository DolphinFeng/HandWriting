<template>
    <div id="ticket-create-container" :class="{'mini-create-container': isMiniCreate}">
        <div class="ticket-create-center-wrapper" id="ticket-create-center">
            <create-cti
                :type="createType"
                :cti="defaultCti"
                :show-cti-check="showCtiCheck"
                :clear-cti="clearCti"
                :cti-index="ctiIndex"
                :show-desc="showDesc"
                :category-list="categoryList"
                :is-private-space="isPrivateSpace"
                :form-type="formType"
                @noCatalog="handleNoCatalog"
                @clear-value="clearValue"
                @has-cti-content="handleCti"
                @change="ctiChange" />
            <create-problem-desc
                :create-type="createType"
                :default-config="defaultConfig"
                :static-config="staticConfig"
                @change="descChange"
                @finish-desc-upload="finishDescUpload"
                :is-ordinary-file="ordinarySubmitFile"
                :show-desc-check="showDescCheck"
                :has-no-catalog="selectNoCatalog"
                ref="defaultCustom"
                v-if="showDesc" />
            <create-recommend-cti
                v-if="createType === 'BASIC' && selectNoCatalog && showRecommend"
                :recommend-list="recommendList"
                :clear-selected-cti="clearSelectedCti"
                @recommendChange="handleRecommendChange" />
            <create-custom-fields
                v-if="customConfig.length"
                :custom-config="customConfig"
                :default-content="defaultContent"
                :custom-index="customIndex"
                :rg-id="rgId"
                :create-type="createType"
                :form-type="formType"
                ref="customFields"
                @finish-custom-upload="finishCustomUpload"
                @get-assigned-cti="getAssignedCti"
                @get-default-cti="getDefaultCti"
                @change="bindFieldsChange" />
            <create-more-fields
                @change="moreFieldsChange"
                :rg-id="rgId"
                v-if="!customFormId" />
            <div class="create-submit-wrapper">
                <mtd-button
                    type="primary"
                    size="large"
                    :loading="btnLoading"
                    :class="{'btn-not-trigger': !hasContent}"
                    @click="preSubmit">{{ submitText || this.$getText('ticket_create_new_submit_question', '提交问题') }}</mtd-button>
                <mtd-button
                    size="large"
                    style="margin-left: 12px;"
                    class="cancel-btn"
                    @click="backToLastPage">{{ $getText('ticket_create_new_btn_cancel', '取消') }}</mtd-button>
            </div>
        </div>
        <create-prompt-dialog
            v-if="isTicket"
            :prompt-user-info="promptUserInfo" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import createDesc from './create-components/createDesc.vue';
import createCti from './create-components/createCti.vue';
import createRecommendCti from './create-components/createRecommendCti.vue';
import createProblemDesc from './create-components/createProblemDesc.vue';
import createMoreFields from './create-components/createMoreFields.vue';
import createCustomFields from './create-components/createCustomFields.vue';
import { NoCatalog, SLA_RULE_DESC } from '@/config/map.conf';
import * as api from '@/api';
import { NameDescConfig } from '@/views/ticket/components/customForm/basicConfig/basicMoreFields';
import CreatePromptDialog from './components/create-prompt-dialog.vue';
import eventBus from '@/utils/event-bus';
import { CREATE_TT_MAP, CREATE_CTI_CHOOSE, CREATE_CTI_RESULT, CREATE_METHODS_VIEW, CREATE_METHODS_CLICK } from '@/config/lx_map.conf';
import { lxReportClick, lxReportView } from '@/utils/directive/lxanaly';
/**
 * 最最最新版发起页
 *
 * @author liyuyao
 * @date 06/15/2021
 */
@Component({
    components: {
        createDesc,
        createCti,
        createMoreFields,
        createCustomFields,
        createRecommendCti,
        createProblemDesc,
        CreatePromptDialog
    }
})
export default class TicketCreate extends Vue {
    @Getter inside;
    @Getter spaceDomain;
    @Getter loginType;

    staticConfig: CommonTypes.mapObject = {};
    customConfig: CommonTypes.CustomField[] = [];
    defaultConfig: CommonTypes.CustomField[] = [];

    rgId: number = 0;
    ctiInfo: CommonTypes.mapObject = {};

    defaultCti: CommonTypes.mapObject = {};
    categoryList: CommonTypes.DefaultObject[] = [];

    ordinaryFormData: any = {};
    descForm: any = {};

    customFormId: number = 0;
    customFormData: any = {};
    submitCustomForm: any = {};

    submitText: string ;
    btnLoading: boolean = false;

    ticketId: number = 0;
    // attachment: any[] = [];

    defaultContent: any = {};

    hasDescContent: boolean = false;
    showDescCheck: boolean = false;
    hasCtiContent: boolean = false;
    showCtiCheck: boolean = false;

    showDesc: boolean = false;
    selectNoCatalog: boolean = false;
    showRecommend: boolean = false;

    // 控制CTI级联选择器选中状态和input内容
    clearCti: boolean = false;

    ordinarySubmitFile: boolean = true;

    descIndex: number = 1;
    ctiIndex: number = 1;
    customIndex: number = 2;

    isPrivateSpace: boolean = false;

    customFinish: boolean = false;
    descFinish: boolean = false;
    fileFinish: boolean = false;

    formType: string = 'basic';
    recommendList: CommonTypes.ctiTreeItem[] = [];
    clearSelectedCti: boolean = false;

    recommendCti: boolean = false;
    promptUserInfo: any = {};
    reportCreateType: string = 'create_from_basic';


    @Watch('customFinish', { immediate: true })
    getCustomFinish (v) {
        if (v) {
            if (!this.descForm?.file?.length || this.descFinish || !this.selectNoCatalog) {
                this.fileFinish = true;
            } else {
                this.fileFinish = false;
            }
        }
    }
    @Watch('descFinish', { immediate: true })
    getDescFinish (v) {
        if (v) {
            if (!this.submitCustomForm?.ticket?.file?.length || this.customFinish || !this.selectNoCatalog) {
                this.fileFinish = true;
            } else {
                this.fileFinish = false;
            }
        }
    }
    @Watch('fileFinish', { immediate: true })
    getFinish (v) {
        if (v) {
            this.successRedirect();
        }
    }

    get createType () {
        const routeQuery = this.$route.query;
        const routeName = this.$route.name;
        console.log(this.$route);
        let createType = 'BASIC';
        if (routeName === 'tt_helpdesk_create') {
            createType = 'CUSTOM';
            this.reportCreateType = 'create_from_custom';
            this.customFormId = parseInt(this.$route.params.id, 10);
        } else if (routeQuery && (routeQuery.cid || routeQuery.category)) {
            createType = 'URL';
            this.reportCreateType = 'create_from_url';
        }
        if (this.spaceDomain !== 'ticket') this.reportCreateType = 'create_from_space';
        if (this.loginType === 'PASSPORT') this.reportCreateType = 'create_from_passport';
        return createType;
    }

    get hasContent () {
        return this.hasDescContent && this.hasCtiContent;
    }

    get isTicket () {
        const { guideType, guideCreateLink } = this.promptUserInfo;
        if (guideType === 'force') {
            window.open(guideCreateLink, '_self');
        }
        return (guideType && guideType === 'soft') && this.spaceDomain === 'ticket';
    }
    get isMiniCreate () {
        return this.$route.name === 'tt_mini_create';
    }

    // 校验URL匹配的cti
    async getCtiFromUrl () {
        const query = this.$route.query || {};
        const defaultCti = query.cid ? {
            cid: query.cid,
            tid: query.tid,
            iid: query.iid
        } : query.category ? {
            category: query.category,
            type: query.type,
            item: query.item
        } : null;
        if (defaultCti) {
            const res: Ajax.AxiosResponse = await api.ctiApi.getNewCtiFromUrl(true, defaultCti);
            const ctiRes = res.data;
            let newCti = JSON.stringify(ctiRes) === '{}' ? defaultCti : {
                categoryId: ctiRes.cid,
                categoryName: ctiRes.category,
                typeId: ctiRes.tid,
                typeName: ctiRes.type,
                itemId: ctiRes.iid,
                itemName: ctiRes.item,
                rgId: ctiRes.rgId
            };
            if (newCti.categoryId && newCti.typeId && newCti.itemId) {
                // 三级目录发起时，查询用户是否有该目录的发起权限，没有则不填充目录
                try {
                    const authRes: Ajax.AxiosResponse = await api.ctiApi.getPermissionURL({
                        cid: newCti.categoryId,
                        tid: newCti.typeId,
                        iid: newCti.itemId
                    });
                    const { data, code } = authRes;
                    if (code === 200 && data.authPermitted) {
                        this.defaultCti = newCti;
                        this.setAssigned('', '');
                    }
                } catch (error) {
                    console.log('error', error);
                }
            } else {
                this.defaultCti = newCti;
            }
        }
    }

    async created () {
        // 旧版发起页tab切换逻辑
        eventBus.$emit('changeTab', this.inside ? '' : 'outsideAsk');
        const res: Ajax.AxiosResponse = await api.ctiApi.getUserInfo();
        this.promptUserInfo = res?.data || {};
        this.getCtiFromUrl();
        this.isPrivateSpace = this.$route.params.space === 'ticket' ? false : true;
        if (this.createType === 'CUSTOM') {
            this.getCustomFields();
        } else {
            this.customFormId = 0;
            // this.customConfig = NameDescConfig;
            if (this.createType === 'BASIC') {
                this.defaultConfig = NameDescConfig.map((field) => { return { ...field, name: field.name ? this.$getText(field.name) : '' }; });
                this.showDesc = true;
            } else {
                this.customConfig = NameDescConfig.map((field) => { return { ...field, name: field.name ? this.$getText(field.name) : '' }; });
            }
        }
        // 如果是外部账号 获取是否是外卖代理商账号 自动填写标题
        (!this.inside) && this.getWmDistrictCityTitle();
        this.setCreateViewLxData();
        // 统计用户放弃发起的数量
        window.onbeforeunload = () => {
            if (this.$route.name === 'tt_create') {
                const hasCti = (this.ctiInfo?.categoryId && !this.clearCti) ? 'fail_with_cti' : 'fail_no_cti';
                const hasContent = (this.descForm.name || this.descForm.desc || this.descForm.file?.length) ? true : false;
                lxReportClick(CREATE_CTI_RESULT[hasCti]);
                if (hasContent && (hasCti === 'fail_with_cti')) {
                    lxReportClick(CREATE_CTI_RESULT['fail_with_cti_and_content']);
                }
            }
        };
    }



    setCreateViewLxData () {
        lxReportView(CREATE_METHODS_VIEW[this.reportCreateType]);
    }
    setCreateClickLxData () {
        lxReportClick(CREATE_METHODS_CLICK[this.reportCreateType]);
    }

    mounted () {
        eventBus.$on('recommendCti', this.getRecommendCti);
        eventBus.$on('getAssignedList', this.setAssigned);
        if (this.isMiniCreate) this.hideTTStyle();

        this.$i18nClient.on('languageChanged', (lng) => {
            if (this.createType === 'BASIC') {
                this.defaultConfig = NameDescConfig.map((field) => { return { ...field, name: field.name ? this.$getText(field.name) : '' }; });
            }
        });
    }

    unmounted () {
        this.$i18nClient.off('languageChanged');
    }

    hideTTStyle () {
        let html = document.getElementsByTagName('html')[0];
        let body = document.getElementsByTagName('body')[0];
        html.style.minWidth = '0px';
        body.style.minWidth = '0px';
    }
    beforeDestroy () {
        eventBus.$off('recommendCti', this.getRecommendCti);
        eventBus.$off('getAssignedList', this.setAssigned);
    }
    async setAssigned (res, mis) {
        const query = this.$route.query || {};
        if (res && Array.isArray(res) && query.assigned) {
            if (mis) {
                if (mis !== query.assigned) {
                    this.$set(this.defaultCti, 'assigned', '');
                    this.$set(this.defaultCti, 'displayName', '');
                    this.defaultCti = Object.assign({}, this.defaultCti);
                } else {
                    this.checkUserInRg(query.iid, query.assigned);
                }
            } else {
                this.checkUserInRg(query.iid, query.assigned);
                if (this.defaultCti.assigned) {
                    res.forEach((item) => {
                        if (item?.identify === query.assigned) {
                            this.$set(this.defaultCti, 'assigned', query.assigned);
                            this.$set(this.defaultCti, 'displayName', item.displayName);
                            this.defaultCti = Object.assign({}, this.defaultCti);
                            eventBus.$emit('updateAssigned', item);
                        }
                    });
                }
            }
        } else {
            this.checkUserInRg(query.iid, query.assigned);
        }
    }
    async checkUserInRg (iid, mis) {
        if (iid && mis) {
            let params = { itemId: iid, misList: [mis] };
            const res: Ajax.AxiosResponse = await api.ctiApi.userInRg(params);
            let { code, data } = res;
            if (code === 200 && data && data[mis]) {
                if (data[mis].inRg) {
                    this.$set(this.defaultCti, 'assigned', mis);
                    this.$set(this.defaultCti, 'displayName', data[mis].displayName);
                    this.defaultCti = Object.assign({}, this.defaultCti);
                } else {
                    this.$set(this.defaultCti, 'assigned', '');
                    this.$set(this.defaultCti, 'displayName', '');
                    this.defaultCti = Object.assign({}, this.defaultCti);
                }
            }
        }
    }
    // 外卖代理商标题
    async getWmDistrictCityTitle () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getWmDistrictCityTitle(this.promptUserInfo.username);
        let { code, data } = res;
        if (code === 200 && data.prefix) {
            if (this.createType === 'BASIC') {
                this.$set(this.staticConfig, 'name', data?.prefix || '');
                this.staticConfig = Object.assign({}, this.staticConfig);
            } else {
                this.$set(this.defaultContent, 'name', data?.prefix || '');
                this.defaultContent = Object.assign({}, this.defaultContent);
            }
        }
    }
    async getRecommendCti (val) {
        if (!val || this.recommendCti) return;
        const res: Ajax.AxiosResponse = await api.ctiApi.getRecommendCti({
            desc: val
        });
        let { code, data } = res;
        if (code === 200) {
            this.recommendList = data.items;
            this.showRecommend = true;
        }
    }
    // 获取自定义表单配置
    async getCustomFields (customFormId?: number) {
        const params = {
            customFormId: customFormId || parseInt(this.$route.params.id, 10)
        };
        const res: Ajax.AxiosResponse = await api.ticketApi.getSystemAndCustomFields(params);
        let { code, data } = res;
        if (code === 200) {
            const fields = data.customFieldContents;
            this.customConfig = fields;
            if (this.createType === 'BASIC' && this.selectNoCatalog) this.customIndex = 3;
            this.rgId = data.rgId;
        }
    }
    async ctiChange (cti) {
        this.ctiInfo = cti;
        this.rgId = this.ctiInfo.rgId || 0;
        if (!cti.itemId) return;
        this.clearCti = false;
        let newTemplate = await this.getTemplateByItem(cti.itemId);
        // 如果切换后目录绑定的自定义模板和当前自定义模板相同，不更新
        if (!newTemplate) return;
        if (newTemplate.id === this.customFormId) return;
        this.customConfig = [];
        if (this.createType === 'BASIC') {
            this.staticConfig = Object.assign({}, this.defaultContent);
        } else {
            this.$set(this.defaultContent, 'desc', '');
            this.$set(this.defaultContent, 'name', '');
            (!this.inside) && this.getWmDistrictCityTitle();
        }
        if (newTemplate.type === 'CUSTOM') {
            // 绑定了自定义表单
            this.formType = 'custom';
            if (newTemplate.id !== this.customFormId) {
                // 新获取的表单和当前表单不同
                this.customFormId = newTemplate.id;
                this.getCustomFields(this.customFormId);
            }
            if (this.createType === 'BASIC') {
                // 官网发起时选择绑定自定义表单的目录
                if (!this.selectNoCatalog) {
                    this.showDesc = false;
                    this.customIndex = 2;
                    this.defaultContent = Object.assign({}, this.defaultContent);
                } else {
                    // 选择了推荐的自定义表单目录
                    this.defaultContent = Object.assign({}, this.defaultContent);
                }
            }
        } else if (newTemplate.type === 'NORMAL') {
            // 绑定了普通表单
            this.formType = 'normal';
            if (this.createType === 'BASIC') {
                // 官网发起：向02问题描述传表单默认值
                this.showDesc = true;
                // if (this.selectNoCatalog) {
                // console.log('static', this.staticConfig);
                const newDesc = (this.defaultContent.desc ? this.defaultContent.desc : '') + newTemplate.content;
                const newName = (this.defaultContent.name ? this.defaultContent.name : '') + newTemplate.name;
                this.$set(this.staticConfig, 'desc', newDesc);
                this.$set(this.staticConfig, 'name', newName);
                this.staticConfig = Object.assign({}, this.staticConfig);
                // } else {
                //     this.$set(this.staticConfig, 'desc', newTemplate.content);
                //     this.$set(this.staticConfig, 'name', newTemplate.name);
                //     this.staticConfig = Object.assign({}, this.staticConfig);
                // }
            } else {
                // 其他发起：向02绑定表单传表单默认值
                this.customConfig = NameDescConfig.map((field) => { return { ...field, name: field.name ? this.$getText(field.name) : '' }; });
                this.$set(this.defaultContent, 'desc', newTemplate.content);
                this.$set(this.defaultContent, 'name', newTemplate.name);
                this.defaultContent = Object.assign({}, this.defaultContent);
            }
            this.customFormId = 0;
        } else if (!newTemplate.type) {
            // 未绑定自定义表单
            // 官网发起：不展示03绑定表单部分
            this.formType = 'basic';
            this.customFormId = 0;
            if (this.createType !== 'BASIC') {
                // 自定义表单发起&三级目录发起：将03部分更新为NameDescConfig
                this.customConfig = NameDescConfig.map((field) => { return { ...field, name: field.name ? this.$getText(field.name) : '' }; });
                this.staticConfig = Object.assign({}, this.staticConfig);
            } else {
                this.showDesc = true;
                this.defaultContent = Object.assign({}, this.defaultContent);
            }
        }
    }
    async getTemplateByItem (itemId: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getTemplateByItem(itemId);
            let { code, data } = res;
            if (code === 200) return data;
        } catch (e) {
            console.log(e);
        }
    }
    descChange (form) {
        this.descForm = form;
        if (this.formType === 'basic' && this.createType === 'BASIC') {
            if (!this.customConfig.length) {
                this.defaultContent.desc = form.desc;
                this.defaultContent.name = form.name;
            }
            this.staticConfig.desc = form.desc;
            this.staticConfig.name = form.name;
        }
        if (!this.customConfig.length) {
            this.hasDescContent = form.desc ? true : false;
        }
        // console.log('static config',this.staticConfig, this.defaultContent);
    }
    bindFieldsChange (formData) {
        // console.log('bind form',formData);
        Object.keys(formData).map(key => {
            if (formData[key] === undefined) {
                formData[key] = '';
            }
        });
        this.hasDescContent = formData.desc ? true : false;
        if (this.customFormId) {
            this.customFormData = formData;
        } else {
            this.ordinaryFormData = Object.assign(this.ordinaryFormData, formData);
        }
    }
    moreFieldsChange (formData) {
        this.ordinaryFormData = Object.assign(this.ordinaryFormData, formData);
        // console.log(this.ordinaryFormData);
        // this.ordinaryFormData = formData;
    }
    // 埋点函数
    lxSubmit (eventName) {
        lxReportClick(CREATE_TT_MAP[eventName]);
    }
    preSubmit () {
        this.customFormId ? this.customPreSubmit() : this.ordinaryPreSubmit();
    }
    backToLastPage () {
        if (this.isMiniCreate) {
            window.parent.postMessage('cancel', '*');
        } else {
            this.$router.go(-1);
        }
    }
    addMosesReport () {
        const createEntranceQuery: any = sessionStorage['createEntranceQuery'];
        let source: string = 'ticket';
        if (this.$route.query?.source) {
            source = this.$route.query.source as string;
        } else if (createEntranceQuery) {
            source = JSON.parse(createEntranceQuery).source || 'ticket';
        }
        let associatedField: string = '';
        if (this.$route.query?.associatedField) {
            associatedField = JSON.stringify(JSON.parse(this.$route.query.associatedField as string));
        } else if (createEntranceQuery) {
            associatedField = JSON.parse(createEntranceQuery as string)['associatedField'] || '';
        }
        return { source, associatedField };
    }
    async ordinaryPreSubmit () {
        // console.log('oridinary submit', this.hasDescContent, this.hasCtiContent);
        const sla = this.ordinaryFormData.sla;
        let info: any;
        if (this.createType === 'BASIC') {
            try {
                info = await this.$refs.defaultCustom.validateForm();
            } catch (err) {
                console.log('err', err);
            }
        } else {
            try {
                info = await this.$refs.customFields.validateForm();
            } catch (err) {
                console.log('err', err);
            }
        }
        if (!this.hasCtiContent || !(info && info.valid)) {
            // 推荐状态选择未绑定目录或未填写问题描述
            this.showCtiCheck = this.hasCtiContent ? false : true;
        } else if (Object.values(this.ctiInfo).includes(undefined)) {
            this.$mtd.message.error(this.$getText('ticket_create_new_error_select_category', '请选择完整的问题分类！'));
        } else if (['S1', 'S2'].includes(sla)) {
            this.$mtd.confirm({
                title: sla === 'S1' ? this.$getText('ticket_create_new_tip_select_s1', '选择非常紧急会抄送您的上级') : this.$getText('ticket_create_new_tip_select_level', '确定使用该等级？'),
                message: this.$getText(SLA_RULE_DESC[sla]),
                width: '460px',
                type: 'warning',
                okButtonText: this.$getText('ticket_create_new_btn_confirm', '确定'),
                onOk: this.ordinarySubmit,
                cancelButtonText: this.$getText('ticket_create_new_btn_cancel', '取消'),
                showCancelButton: true
            }).catch(e => e);
        } else {
            this.ordinarySubmit();
        }
    }
    async ordinarySubmit () {
        const { source, associatedField } = this.addMosesReport();
        const form = {
            ...this.ctiInfo,
            ...this.ordinaryFormData,
            ...this.descForm,
            appointAssigned: !!this.ctiInfo.assigned,
            recommendCti: this.recommendCti,
            source,
            associatedField
        };
        if (!form.name) {
            // 标题为空时，取描述，去除描述中所有HTML标签
            form.name = form.desc?.replace(/<[^>]+>/g,'');
        }
        if (form.labels) {
            form.labelNames = form.labels;
            delete form.labels;
        }
        if (!this.inside) form.permission = 'private';
        // console.log('submit form:', form, this.ordinaryFormData, this.descForm);
        this.submitText = this.$getText('ticket_create_new_submitting', '正在提交');
        this.btnLoading = true;
        this.lxSubmit('create_submit');
        // this.setCreateClickLxData();
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.createTicket(form);
            let { code, data } = res;
            if (code === 200) {
                this.lxSubmit('create_success');
                if (this.recommendCti) lxReportClick(CREATE_CTI_CHOOSE['cti_recommend_create']);
                if (this.isMiniCreate) window.parent.postMessage('submit', '*');
                this.ticketId = data.id;
                if (form.file.length > 0) {
                    eventBus.$emit('customFileUpload', this.ticketId);
                    return;
                }
                this.successRedirect();
            }
        } catch (e) {
            this.btnLoading = false;
            this.submitText = this.$getText('ticket_create_new_submit_text', '提交');
            if (typeof(e) === 'object' && e.code === 400) {
                if (e.data?.errorCode !== 10010) {
                    // 10101为“工单创建失败”，其余情况均视作创建成功
                    this.lxSubmit('create_success');
                }
            }
            console.log(e);
        }
        if (typeof sessionStorage === 'object') {
            try {
                sessionStorage.removeItem('createEntranceQuery');
            } catch (error) {
                console.log(error);
            }
        }
    }
    async customPreSubmit () {
        // console.log('333', this.customFormId, this.customFormData);
        let baseInfo: any;
        let customFieldValueList = [];
        let ticketForm = {};
        try {
            baseInfo = await this.$refs.customFields.validateForm();
        } catch (err) {
            console.log('err', err);
        }
        for (let key in this.customFormData) {
            const obj = this.customFormData[key];
            if (obj.customFieldId) {
                customFieldValueList.push(obj);
            } else {
                ticketForm[key] = obj;
            }
        }
        if (!ticketForm.name) {
            ticketForm.name = ticketForm.desc?.replace(/<[^>]+>/g,'');
        }
        if (ticketForm.labels) {
            ticketForm.labelNames = ticketForm.labels;
            delete ticketForm.labels;
        }
        if (ticketForm.permission && !this.inside) {
            ticketForm.permission = 'private';
        }
        const { source, associatedField } = this.addMosesReport();
        if (baseInfo && baseInfo.valid) {
            const ticket = {
                source,
                associatedField,
                customFormId: this.customFormId,
                itemId: this.ctiInfo.itemId,
                appointAssigned: (!!this.ctiInfo.assigned || !!ticketForm.assigned),
                recommendCti: this.recommendCti,
                // entranceSource: this.entranceSource,
                ...ticketForm,
                assigned: this.ctiInfo.assigned || ticketForm.assigned || ''
            };
            this.submitCustomForm = {
                ticket,
                customFieldValueList
            };
            // console.log(ticket, this.ctiInfo, ticketForm, this.customFormData);
            const sla = this.customFormData.sla;
            if (!this.hasCtiContent) {
                this.showCtiCheck = this.hasCtiContent ? false : true;
            } else if (['S1', 'S2'].includes(sla)) {
                this.$mtd.confirm({
                    title: sla === 'S1' ? this.$getText('ticket_create_new_tip_select_s1', '选择非常紧急会抄送您的上级') : this.$getText('ticket_create_new_tip_select_level', '确定使用该等级？'),
                    message: this.$getText(SLA_RULE_DESC[sla]),
                    width: '460px',
                    type: 'warning',
                    okButtonText: this.$getText('ticket_create_new_btn_confirm', '确定'),
                    onOk: this.customSubmit,
                    cancelButtonText: this.$getText('ticket_create_new_btn_cancel', '取消'),
                    showCancelButton: true
                }).catch(e => e);
            } else {
                this.customSubmit();
            }
        }
    }
    async customSubmit () {
        this.submitText = this.$getText('ticket_create_new_submitting', '正在提交');
        this.btnLoading = true;
        this.lxSubmit('create_submit');
        // this.setCreateClickLxData();
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.createTicketByTemplate(this.submitCustomForm);
            let { code, data } = res;
            if (code === 200) {
                this.lxSubmit('create_success');
                if (this.recommendCti) lxReportClick(CREATE_CTI_CHOOSE['cti_recommend_create']);
                window.parent.postMessage('submit', '*');
                this.ticketId = data.id;
                const files = this.submitCustomForm.ticket.file;
                const associateTicket = this.submitCustomForm.ticket.associateTicket;
                if (associateTicket?.length) {
                    await this.ticketAssociateSave(associateTicket);
                }
                if (files?.length || (this.selectNoCatalog && this.descForm?.file?.length)) {
                    eventBus.$emit('customFileUpload', this.ticketId);
                    return;
                }
                this.successRedirect();
            }
        } catch (e) {
            this.btnLoading = false;
            this.submitText = this.$getText('ticket_create_new_submit_text', '提交');
            if (typeof(e) === 'object' && e.code === 400) {
                if (e.data.errorCode !== 10010) {
                    // 10101为“工单创建失败”，其余情况均视作创建成功
                    this.lxSubmit('create_success');
                }
            }
            console.log(e);
        }
        if (typeof sessionStorage === 'object') {
            try {
                sessionStorage.removeItem('createEntranceQuery');
            } catch (error) {
                console.log(error);
            }
        }
    }
    async ticketAssociateSave (associateTicket) {
        try {
            let params = associateTicket.map(item => {
                return {
                    destination: this.ticketId,
                    linkType: 'TT',
                    source: item
                };
            });
            await api.ticketApi.connectTT(params);
        } catch (e) {
            console.log(e);
        }
    }
    successRedirect () {
        this.btnLoading = false;
        this.$router.push({
            name: 'tt_handle',
            params: {
                space: this.spaceDomain
            },
            query: {
                filter: 'createdBy',
                id: this.ticketId
            }
        }).catch(e => e);
    }
    handleCti (val) {
        this.hasCtiContent = val;
        if (this.hasCtiContent) {
            this.showCtiCheck = false;
        }
    }
    clearValue (val) {
        this.clearCti = val;
    }
    getAssignedCti (cti) {
        // console.log('getAssignedCti', cti);
        this.categoryList = cti;
    }
    getDefaultCti (cti) {
        this.categoryList = [cti];
        this.defaultCti = cti;
        this.setAssigned('', '');
    }
    handleNoCatalog (val) {
        this.selectNoCatalog = val;
        this.recommendCti = false;
        if (this.selectNoCatalog && this.hasDescContent) {
            this.$nextTick(() => {
                eventBus.$emit('recommendCti', this.defaultContent.desc);
            });
            if (this.showRecommend) this.clearSelectedCti = true;
        }
    }
    handleRecommendChange (cti) {
        this.defaultCti = Object.assign({}, cti ? cti : NoCatalog);
        if (!cti) {
            // 取消已选目录
            this.customFormId = 0;
            this.customConfig = [];
            this.recommendCti = false;
        } else {
            this.recommendCti = true;
        }
        this.$mtd.message({
            message: this.$getText('ticket_create_new_tip_success', '已成功更改服务目录！'),
            type: 'success'
        });
        this.clearSelectedCti = false;
    }
    finishDescUpload () {
        this.descFinish = true;
    }
    finishCustomUpload () {
        this.customFinish = true;
    }
}
</script>
<style lang="scss" scoped>
#ticket-create-container {
    padding: 12px 0;
    background-color: #f2f2f2;
    height: 100%;
    overflow: auto;
    scroll-behavior: smooth;
}
.mini-create-container {
    padding: 0 !important;
    background-color: #fff !important;
    .ticket-create-center-wrapper {
        width: 100%;
        max-width: 864px;
        .create-content-wrapper,
        .create-more-fields {
            box-shadow: none;
        }
    }
}
.ticket-create-center-wrapper {
    margin: 0 auto;
    width: 800px;
}
/deep/ h1 {
    margin-bottom: 16px;
    font-family: PingFang SC;
    font-size: 18px;
    color: rgba(0, 0, 0, 0.84);
    letter-spacing: 0;
    line-height: 32px;
    font-weight: 600;
}
.create-content-wrapper {
    margin-bottom: 12px;
    padding: 16px 20px 20px 20px;
    background-color: #fff;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    border-radius: 4px;
}
.create-submit-wrapper {
    padding-top: 8px;
    /deep/.mtd-btn {
        width: 140px;
        span {
            font-family: PingFangSC-Medium;
        }
    }
    .cancel-btn {
        &:hover {
            background-color: #f5f5f5;
            border: 1px solid rgba(0, 0, 0, 0.12);
        }
    }
    .btn-not-trigger {
        // background-color: ;
        opacity: 0.45;
    }
}
</style>
