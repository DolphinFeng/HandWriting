<template>
    <div class="ticket-custom-create">
        <div class="create-content">
            <div class="create-header">
                <h1 class="ticket-create-title">{{ ticketName }}</h1>
            </div>
            <FormIndex
                ref="formIndex"
                :field-schema="fieldConfig"
                @change-data="formDataChange"
                @templateChange="templateChange"
                @assignedChange="debounceAssignedChange" />
        </div>
        <div class="create-footer">
            <div class="footer-center-container">
                <mtd-button @click="cancel" class="close-btn">{{ $getText('ticket_helpdesk_create_cancel_btn', '取消') }}</mtd-button>
                <mtd-button
                    :loading="btnLoading"
                    :disabled="btnLoading || imgUploadStatus"
                    type="primary"
                    @click="preSubmit">{{ submitText }}</mtd-button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import FormIndex from './components/form/formIndex.vue';
import { State, Getter, Mutation } from 'vuex-class';
import * as api from '@/api';
import { SLA_RULE_DESC, CreateEntranceMap } from '@/config/map.conf';
import { FieldToDataType } from '@/config/custom.conf.ts';
import { getSimpleText } from '@/utils/tools';
import debounce from 'lodash.debounce';
import { CREATE_METHODS_VIEW, CREATE_METHODS_CLICK, entranceSourceMap, ENTRANCE_SUCCESS, ENTRANCE_FAIL_WITH_CTI, ENTRANCE_FAIL_WITHOUT_CTI, ENTRANCE_FAIL_WITH_CTI_AND_FIELD, CREATE_RES_MAP } from '@/config/lx_map.conf';
import { lxReportView, lxReportClick } from '@/utils/directive/lxanaly';

@Component({
    components: {
        FormIndex
    }
})
export default class TicketHelpDeskCreate extends Vue {
    @Mutation setUploadTicketId;
    @Mutation uploadFile;
    @Getter imgUploadStatus;
    @Getter misX;
    @Getter inside;
    @Getter spaceDomain;
    @Getter isPrivateSpace;
    @Getter loginType;
    @Getter createEntrance;
    @Getter createReferrer;

    @State(state => state.tt.uploadFileSuccess) uploadFileSuccess;
    @State(state => state.tt.uploadFileFail) uploadFileFail;

    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @Mutation setCreateEntrance;
    @Mutation setCreateReferrer;

    fieldConfig: any = [];
    ticketName: string = '';
    submitText: string = this.$getText('ticket_helpdesk_create_submit_text', '提交');
    btnLoading: boolean = false;
    ticketId: number = 0;
    currentForm: any = {};
    currentFile: any = {};
    currentAssociateTicket: any = [];

    lastItemId: number = 0;
    baseRgDefaultCc: string[] = [];
    entranceSource: number = 0;

    formData: any = {};

    debounceAssignedChange: Function = debounce(this.assignedChange, 300);


    @Watch('uploadFileSuccess')
    onUploadFileSuccessChange () {
        this.successRedirect();
    }

    @Watch('uploadFileFail')
    onUploadFileFailChange () {
        if (this.uploadFileFail) {
            this.btnLoading = false;
            this.submitText = this.$getText('ticket_helpdesk_create_submit_text', '提交');
        }
    }

    @Watch('misX', { immediate: true })
    onGetMis () {
        !this.inside && this.getWmDistrictCityTitle();
    }
    // 是否用户选择的指派人
    get appointAssigned () {
        let assignedConfig = this.fieldConfig.find(item => item.identify === 'assigned');
        return assignedConfig && assignedConfig.extraSettings && !assignedConfig.extraSettings.isAssignedHidden && assignedConfig.extraSettings.specificAssigned || false;
    }
    // 初始化默认值
    initDefaultValue (field) {
        let defaultVal: any = '';
        if (field.identify === 'cc') {
            if (field.defaultValue) {
                if (!field.defaultValue || field.defaultValue.length === 0) {
                    return [];
                } else if (field.defaultValue.length === 1) {
                    return [field.defaultValue[0]];
                } else {
                    return field.defaultValue.split(',');
                }
            }
        } else if (field.identify === 'labels') {
            let tags = field.defaultValue ? field.defaultValue.split(',') : [];
            // let idList = [];
            // if (tags && tags.length) {
            //     idList = await this.getLabelIdsByNames(tags) || [];
            //     idList.map(item => item.id);
            // }
            // console.log('idList', idList);
            return tags;
        }

        if (field.defaultValue) {
            defaultVal = field.defaultValue;
        } else if (field.options && field.options.length > 0) {
            let defaultOptions: any[] = [];
            field.options.forEach((option) => {
                if (option.isDefault) {
                    defaultOptions.push(option.value);
                }
            });
            // 如果是多选 默认值是数组
            if (field.inputType === 'MULTI_DROP_DOWN') {
                defaultVal = defaultOptions.join(',');
            } else {
                defaultVal = defaultOptions[0] || '';
            }
        }
        return defaultVal;
    }
    async getLabelIdsByNames (tags) {
        const res: Ajax.AxiosResponse = await api.ticketApi.getLabelIdsByNames({
            labels: tags,
            mode: 'NAME_TO_ID'
        });
        return res.data.items;
    }
    async preSubmit () {
        let baseInfo: any;
        try {
            baseInfo = await this.$refs.formIndex.validate().catch(err => console.log(`validate msg: `, err));
        } catch (err) {
            console.log('err', err);
        }
        if (baseInfo && baseInfo.valid) {
            const customField: any[] = [];
            const systemFields: any[] = [];
            this.fieldConfig.forEach((elem) => {
                // 自定义字段
                if (elem.type === 2) {
                    customField.push(elem);
                } else {
                    systemFields.push(elem);
                }
            });
            const customFieldValueList: any[] = [];
            customField.forEach((elem) => {
                let payloadElem = baseInfo.payload[`'${elem.id}'`] || '';
                let valueData = '';
                // 是数组的话，需要转换成字符串
                if (Array.isArray(payloadElem)) {
                    if (payloadElem.length) {
                        valueData = payloadElem.join(',');
                    }
                } else {
                    valueData = payloadElem;
                }
                let obj = {
                    customFieldId: elem.id,
                    value: valueData,
                    dataType: FieldToDataType[elem.inputType]
                };
                customFieldValueList.push(obj);
            });
            this.setCreateClickLxData();
            const createEntranceQuery: any = sessionStorage['createEntranceQuery'];
            let source: string = 'ticket';
            if (this.$route.query?.source) {
                source = this.$route.query.source as string;
            } else if (createEntranceQuery) {
                source = JSON.parse(createEntranceQuery)?.source || 'ticket';
            }
            let associatedField: string = '';
            if (this.$route.query?.associatedField) {
                associatedField = JSON.stringify(JSON.parse(this.$route.query.associatedField as string));
            } else if (createEntranceQuery) {
                associatedField = JSON.parse(createEntranceQuery as string)['associatedField'] || '';
            }
            const ticket = {
                source,
                associatedField,
                customFormId: parseInt(this.$route.params.id, 10),
                appointAssigned: this.appointAssigned,
                entranceSource: this.entranceSource,
                entranceSystem: this.createReferrer,
                entrancePage: CreateEntranceMap[this.createEntrance]
            };
            systemFields.forEach((elem) => {
                Object.keys(baseInfo.payload).forEach((payloadElem) => {
                    if (elem.isHidden) {
                        ticket[elem.identify] = this.initDefaultValue(elem);
                        if (elem.identify === 'name') {
                            ticket['name'] = this.splitDescToName(ticket.name, ticket.desc);
                        }
                    }
                    if (`'${elem.id}'` === payloadElem) {
                        if (elem.identify === 'assigned') {
                            Object.keys(baseInfo.payload[payloadElem]).forEach(key => {
                                ticket[key] = baseInfo.payload[payloadElem][key];
                            });
                        } else if (elem.identify === 'associateTicket') {
                            this.currentAssociateTicket = baseInfo.payload[payloadElem];
                        } else if (elem.identify !== 'file') {
                            ticket[elem.identify] = baseInfo.payload[payloadElem];
                        } else if (elem.identify === 'file') {
                            this.currentFile = baseInfo.payload[payloadElem];
                        }
                    }
                });
            });
            ticket.cc = Array.isArray(ticket.cc) ? ticket.cc : [];
            if (!ticket.name) {
                ticket['name'] = this.splitDescToName(ticket.name, ticket.desc);
            }
            if (ticket.labels) {
                ticket.labelNames = ticket.labels;
                delete ticket.labels;
            } else {
                ticket.labels = [];
            }
            this.currentForm = {
                ticket,
                customFieldValueList
            };
            if (['S1', 'S2'].includes(ticket.sla)) {
                this.$mtd.confirm({
                    title: ticket.sla === 'S1' ? this.$getText('ticket_sla_change_modal_urgent_confirm', '选择非常紧急会抄送您的上级') : this.$getText('ticket_sla_change_modal_confirm_title', '确定使用该等级？'),
                    message: this.$getText(SLA_RULE_DESC[ticket.sla]),
                    width: '460px',
                    type: 'warning',
                    okButtonText: this.$getText('ticket_sla_change_modal_confirm_btn', '确定'),
                    onOk: this.submit,
                    cancelButtonText: this.$getText('ticket_sla_change_modal_cancel_btn', '取消'),
                    showCancelButton: true
                }).catch(e => { console.log(e); });
            } else {
                this.submit();
            }
        }
    }
    async submit () {
        const file = this.currentFile;
        const form = this.currentForm;
        const associateTicket = this.currentAssociateTicket;
        if (file && file.attachment && !file.fileSizeOk) {
            this.$mtd.message.error(this.$getText('create_attachment_upload_size_tip', '上传附件大小需控制在50M以内'));
            return ;
        }
        this.submitText = this.$getText('ticket_helpdesk_create_submitting_text', '正在提交');
        this.btnLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.createTicketByTemplate(form);
            let { code, data } = res;
            if (code === 200) {
                this.ticketId = data.id;
                if (!(file.attachment && file.attachment.length)) {
                    if (associateTicket.length) {
                        await this.ticketAssociateSave(this.ticketId);
                    }
                    this.successRedirect();
                }
                setTimeout(() => {
                    if (file && file.attachment && file.attachment.length) {
                        this.setUploadTicketId(this.ticketId);
                        this.uploadFile(true);
                    }
                }, 0);
            }
        } catch (e) {
            this.btnLoading = false;
            this.submitText = this.$getText('ticket_helpdesk_create_submit_text', '提交');
            console.log(e);
        }
        sessionStorage.removeItem('createEntranceQuery');
    }
    splitDescToName (name: string, desc: string) {
        if (name && name.length) {
            return name;
        } else {
            let text = getSimpleText(desc);
            return text ? text.slice(0, 60) : this.$getText('ticket_helpdesk_create_question', '问题反馈');
        }
    }
    async ticketAssociateSave (ticketId) {
        try {
            let params = this.currentAssociateTicket.map(item => {
                return {
                    destination: ticketId,
                    linkType: 'TT',
                    source: item.destination
                };
            });
            await api.ticketApi.connectTT(params);
        } catch (e) {
            console.log(e);
        }
    }
    // 取消创建需提示用户
    cancel () {
        this.$mtd.confirm({
            message: this.$getText('ticket_helpdesk_create_message_if_save', '确定要离开吗？系统可能不会保存您所做的更改'),
            width: '463px',
            showCancelButton: true,
            type: 'warning',
            className: 'confirm-modal-no-titile',
            okButtonText: this.$getText('ticket_helpdesk_create_btn_confirm', '确定'),
            cancelButtonText: this.$getText('ticket_clone_custom_btn_cancel', '取消'),
            onOk: () => {
                this.successRedirect();
            }
        }).catch(e => { console.log(e); });
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
    // 获取系统字段
    async getSystemFields (customFormId?: number) {
        const params = {
            customFormId: customFormId || parseInt(this.$route.params.id, 10)
        };
        const res: Ajax.AxiosResponse = await api.ticketApi.getSystemAndCustomFields(params);
        let { code, data } = res;
        if (code === 200) {
            this.ticketName = data.name;
            this.fieldConfig = data.customFieldContents;
        }
    }
    formatToArr (obj) {
        let result = [];
        for (let key in obj) {
            result.push(key);
        }
        return result;
    }
    get defaultParams () {
        return this.$route.params || {};
    }
    async mounted () {
        await this.getSystemFields();
        this.setCreateViewLxData();
        // 统计用户放弃发起的数量
        window.onbeforeunload = () => {
            if (this.$route.name === 'tt_custom_create') {
                this.reportTicketCreateResult();
            }
        };
    }
    // 外卖代理商标题
    async getWmDistrictCityTitle () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getWmDistrictCityTitle(this.misX);
        let { code, data } = res;
        if (code === 200 && data.prefix) {
            const prefix = data.prefix;
            for (let i = 0; i < this.fieldConfig.length; i++) {
                let identify = this.fieldConfig[i]['identify'];
                if (identify && identify === 'name') {
                    this.fieldConfig[i]['defaultValue'] = prefix;
                    break;
                }
            }
        }
    }
    // 后期改造为只拉配置不刷新页面，目前有回显问题
    async templateChange (info, itemId) {
        if (info.type === 'NORMAL') {
            if (this.lastItemId !== itemId) {
                this.lastItemId = itemId;
                let temp = {};
                let i = 0;
                this.fieldConfig.forEach((item, index) => {
                    if (item.identify === 'desc') {
                        temp = { ...item, defaultValue: info.content };
                        i = index;
                    }
                });
                Vue.set(this.fieldConfig, i, temp);
            }
        }
    }
    async assignedChange (val) {
        const { rgId } = val;
        if (rgId === parseInt(this.defaultParams.rgId, 10)) return;
    }
    setCreateViewLxData () {
        const createType = this.getCreateType();
        lxReportView(CREATE_METHODS_VIEW[createType]);
    }
    setCreateClickLxData () {
        const createType = this.getCreateType();
        this.entranceSource = entranceSourceMap[createType];
        lxReportClick(CREATE_METHODS_CLICK[createType]);
    }
    getCreateType () {
        const routeQuery = this.$route.query;
        let createType = 'create_from_custom';
        if (routeQuery && routeQuery.categoryInfo) {
            createType = 'create_from_basic';
        }
        if (this.isPrivateSpace) {
            createType = 'create_from_space';
        }
        if (this.loginType === 'PASSPORT') {
            createType = 'create_from_passport';
        }
        return createType;
    }
    formDataChange (form) {
        this.formData = form;
    }
    reportTicketCreateResult () {
        if (!this.createEntrance) return ;
        const hasCti = !!this.formData.categoryId;
        const hasContent = !!this.formData.name || !!this.formData.desc;
        const otherParams = {
            jobFamilyName: this.userInfo.jobFamilyName || '',
            // 链接类型
            link_type: this.createEntrance,
            // 外部系统类型
            source: this.createReferrer
        };
        if (this.ticketId) {
            lxReportClick(ENTRANCE_SUCCESS[this.createEntrance]);
            lxReportClick(CREATE_RES_MAP['success'], otherParams);
            this.setCreateReferrer('');
            this.setCreateEntrance('');
            sessionStorage.removeItem('createEntranceQuery');
        } else {
            if (hasCti) {
                lxReportClick(ENTRANCE_FAIL_WITH_CTI[this.createEntrance]);
                lxReportClick(CREATE_RES_MAP['fail_with_cti'], otherParams);
                if (hasContent) {
                    lxReportClick(ENTRANCE_FAIL_WITH_CTI_AND_FIELD[this.createEntrance]);
                    lxReportClick(CREATE_RES_MAP['fail_with_cti_and_field'], otherParams);
                }
            } else {
                lxReportClick(ENTRANCE_FAIL_WITHOUT_CTI[this.createEntrance]);
                lxReportClick(CREATE_RES_MAP['fail_without_cti'], otherParams);
            }
        }
    }
    beforeDestroy () {
        const { name } = this.$route; // toName
        if (['tt_create', 'tt_helpdesk_create'].includes(name)) {
            return ;
        } else {
            this.reportTicketCreateResult();
        }
    }
}
</script>
<style lang="scss">
.ticket-custom-create {
    background-color: #fff;
    .ticket-create-title {
        display: inline-block;
        padding-bottom: 16px;
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: #333;
        line-height: 22px;
    }
    .create-content {
        width: 750px;
        margin: 0 auto;
        padding: 24px 0 66px;
    }
    .create-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        padding: 14px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.07);
        background: #fff;
        z-index: 5;
        .footer-center-container {
            margin: 0 auto;
            width: 750px;
            text-align: right;
            .close-btn {
                margin-right: 8px;
            }
        }
    }
    .ql-container.ql-snow {
        overflow: auto;
    }
}
</style>
