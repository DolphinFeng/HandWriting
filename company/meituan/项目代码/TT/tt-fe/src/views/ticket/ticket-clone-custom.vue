<template>
    <div class="ticket-custom-create">
        <div class="create-content">
            <div class="create-header">
                <h1 class="ticket-create-title">{{ ticketName }}</h1>
            </div>
            <FormIndex
                :default-cc-list="defaultCcList"
                :rg-set-permission="rgSetPermission"
                ref="formIndex"
                :field-schema="customFieldValues"
                :data="cloneData"
                @templateChange="templateChange"
                @assignedChange="debounceAssignedChange" />
        </div>
        <div class="create-footer">
            <div class="footer-center-container">
                <mtd-button @click="cancel" class="close-btn">{{ $getText('ticket_clone_custom_btn_cancel', '取消') }}</mtd-button>
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
import { SLA_RULE_DESC } from '@/config/map.conf';
import { FieldToDataType } from '@/config/custom.conf.ts';
import { getSimpleText } from '@/utils/tools';
import debounce from 'lodash.debounce';
import pick from 'lodash.pick';

@Component({
    components: {
        FormIndex
    }
})
export default class TicketCloneCustom extends Vue {
    @Mutation setUploadTicketId;
    @Mutation uploadFile;
    @Getter imgUploadStatus;
    @Getter misX;
    @Getter inside;
    @Getter spaceDomain;
    @State(state => state.tt.uploadFileSuccess) uploadFileSuccess;
    @State(state => state.tt.uploadFileFail) uploadFileFail;

    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;
    fieldConfig: any = [];
    customFieldValues: any[] = [];
    ticketName: string = '';
    submitText: string = this.$getText('ticket_clone_custom_submit_text', '提交');
    btnLoading: boolean = false;
    ticketId: number = 0;
    defaultCcList: string[] = [];
    rgSetPermission: boolean = false;
    currentForm: any = {};
    currentFile: any = {};
    currentAssociateTicket: any = [];

    lastItemId: number = 0;
    baseRgDefaultCc: string[] = [];

    cloneDefaultData: any = {};
    cloneFileExist: boolean = false;

    get cloneData () {
        let formatSys = {};
        // 处理系统字段
        if (this.fieldConfig.length) {
            this.fieldConfig.forEach(item => {
                const identify = item.identify;
                const prop = item.id;
                if (identify && prop && this.cloneDefaultData[identify]) {
                    formatSys[`'${prop}'`] = this.cloneDefaultData[identify];
                }
            });
        }
        return Object.assign(formatSys, this.cloneDefaultData);
    }

    debounceAssignedChange: Function = debounce(this.assignedChange, 300);

    @Watch('uploadFileSuccess')
    onUploadFileSuccessChange () {
        this.successRedirect();
    }

    @Watch('uploadFileFail')
    onUploadFileFailChange () {
        if (this.uploadFileFail) {
            this.btnLoading = false;
            this.submitText = this.$getText('ticket_clone_custom_submit_text', '提交');
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
    get cloneId () {
        return this.$route.query.id;
    }
    get customFormId () {
        return parseInt(this.$route.query.custom, 10);
    }
    get mountCti () {
        return !!this.$route.query.mountCti;
    }
    async getTicketDetail () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketDetail(this.cloneId);
            let { code, data } = res;
            if (code === 200) {
                let defaultForm = pick(data, ['name', 'desc', 'ticketType', 'sla', 'cc', 'permission', 'labels', 'file']);
                if (this.mountCti) {
                    defaultForm.assigned = {
                        categoryId: data.categoryId,
                        typeId: data.typeId,
                        itemId: data.itemId,
                        assigned: data.assigned,
                        categoryName: data.categoryName,
                        typeName: data.typeName,
                        itemName: data.itemName,
                        rgId: data.rgId,
                        rgName: data.rgName
                    };
                }
                defaultForm.file = data.attachment;
                this.cloneFileExist = data.attachment && data.attachment.length > 0;
                this.cloneDefaultData = defaultForm;
                // 对自定义字段进行处理
                if (data.customFormId && data.customFieldValues) {
                    let customFieldValues: any[] = [];
                    let recordMatchItems: number[] = [];
                    // 如果克隆前后是同一个表单
                    if (data.customFormId === this.customFormId) {
                        this.fieldConfig.forEach(elem => {
                            if (data.customFieldValues && data.customFieldValues.length) {
                                data.customFieldValues.forEach(customElem => {
                                    if (elem.id === customElem.customFieldId) {
                                        elem.defaultValue = customElem.value;
                                        elem.customFieldId = customElem.id;
                                        if (elem.options && elem.options.length > 0) {
                                            elem.defaultValue = '';
                                            elem.multiDropDownValue = customElem.value;
                                            elem.options = this.getOptions(elem);
                                        }
                                        customFieldValues.push(elem);
                                        recordMatchItems.push(elem.id);
                                    }
                                });
                            }
                            // 如果是系统字段
                            if (elem.identify) {
                                // elem.defaultValue = defaultForm[elem.identify];
                                customFieldValues.push(elem);
                            }
                        });
                        // 如果有自定义字段因更改过没匹配上
                        if (data.customFieldValues.length !== recordMatchItems.length) {
                            const dataIds = data.customFieldValues.map(item => item.id);
                            let diffIds = recordMatchItems.concat(dataIds).filter(v => !recordMatchItems.includes(v));
                            if (diffIds.length) {
                                let content = '<p><br></p>';
                                diffIds.forEach(id => {
                                    let matchElem = data.customFieldValues.find(field => field.id === id);
                                    content += `<p>${matchElem.name}：${matchElem.value}</p>`;
                                });
                                defaultForm.desc += content;
                            }
                        }
                    } else {
                        customFieldValues = this.fieldConfig;
                        let content = '<p><br></p>';
                        data.customFieldValues.forEach(field => {
                            content += `<p>${field.name}：${field.value}</p>`;
                        });
                        defaultForm.desc += content;
                    }
                    // 获取详情
                    this.customFieldValues = customFieldValues;
                } else {
                    this.customFieldValues = this.fieldConfig;
                    let content = '<p><br></p>';
                    data.customFieldValues && data.customFieldValues.forEach(field => {
                        content += `<p>${field.name}：${field.value}</p>`;
                    });
                    defaultForm.desc += content;
                }
                // 初始化关联TT
                this.currentAssociateTicket = [{
                    content: data.name,
                    destination: parseInt(this.cloneId, 10)
                }];
            }
        } catch (e) {
            console.log(e);
        }
    }
    getOptions (elem) {
        elem.options.forEach((option) => {
            option.isDefault = false;
        });
        // 如果是多选 默认值是数组
        if (elem.inputType === 'MULTI_DROP_DOWN' && elem.multiDropDownValue.indexOf(',')) {
            const multiDropDownValue = elem.multiDropDownValue.split(',');
            elem.options.forEach((option) => {
                multiDropDownValue.forEach((multiDrop) => {
                    if (option.value === multiDrop) {
                        option.isDefault = true;
                    }
                });
            });
        } else if (elem.inputType === 'SINGLE_DROP_DOWN'
        || (elem.inputType === 'MULTI_DROP_DOWN' && elem.multiDropDownValue.indexOf(',') === -1)) {
            elem.options.forEach((option) => {
                if (option.value === elem.multiDropDownValue) {
                    option.isDefault = true;
                }
            });
        }
        return elem.options;
    }
    // 初始化默认值
    initDefaultValue (field) {
        let defaultVal: any = '';
        const cloneFieldData = this.cloneData[field.identify];
        if (field.identify === 'cc') {
            // let rgDefault = this.defaultCcList;
            if (field.defaultValue) {
                if (!field.defaultValue || field.defaultValue.length === 0) {
                    defaultVal = [];
                } else if (field.defaultValue.length === 1) {
                    defaultVal = [field.defaultValue[0]];
                } else {
                    defaultVal = field.defaultValue.split(',');
                }
            }
        } else if (field.identify === 'labels') {
            if (!field.defaultValue || field.defaultValue.length === 0) {
                defaultVal = [];
            } else if (field.defaultValue.length === 1) {
                defaultVal = [parseInt(field.defaultValue[0], 10)];
            } else {
                let defaultValue: number[] = [];
                field.defaultValue.split(',').forEach((elem) => {
                    defaultValue.push(parseInt(elem, 10));
                });
                defaultVal = defaultValue;
            }
        } else {
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
        }
        if (cloneFieldData) {
            // sla ticketType等枚举值 需替换 不叠加
            if (['sla', 'ticketType', 'permission', 'name'].includes(field.identify)) {
                if (field.identify === 'permission') { // 权限设置特殊处理
                    defaultVal = (cloneFieldData === 'private' || defaultVal === 'private') ? 'private' : 'public';
                } else {
                    defaultVal = cloneFieldData;
                }
            } else {
                // 如为描述，需换行
                if (field.identify === 'desc') {
                    defaultVal += `<br>`;
                }
                defaultVal = defaultVal.concat(cloneFieldData);
            }
        }
        return defaultVal;
    }
    async preSubmit () {
        let baseInfo: any;
        baseInfo = await this.$refs.formIndex.validate();
        // try {
        //     baseInfo = await this.$refs.formIndex.validate().catch(err => console.log(`validate msg: `, err));
        // } catch (err) {
        //     console.log('err', err);
        // }
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
            const ticket = {
                source: 'ticket',
                customFormId: this.customFormId,
                appointAssigned: this.appointAssigned
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
                            if (baseInfo.payload[payloadElem]) {
                                this.currentAssociateTicket = this.currentAssociateTicket.concat(baseInfo.payload[payloadElem]);
                            }
                        } else if (elem.identify !== 'file') {
                            ticket[elem.identify] = baseInfo.payload[payloadElem];
                        } else if (elem.identify === 'file') {
                            this.currentFile = baseInfo.payload[payloadElem];
                        }
                    }
                });
            });
            ticket.cc = Array.isArray(ticket.cc) ? Array.from(new Set([...this.defaultCcList, ...ticket.cc])) : Array.from(new Set([...this.defaultCcList]));
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
                    title: this.$getText('ticket_clone_custom_confirm_title', '确定使用该等级？'),
                    message: this.$getText(SLA_RULE_DESC[ticket.sla]),
                    width: '460px',
                    type: 'warning',
                    okButtonText: this.$getText('ticket_clone_custom_btn_confirm', '确定'),
                    onOk: this.submit,
                    cancelButtonText: this.$getText('ticket_clone_custom_btn_cancel', '取消'),
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
            this.$mtd.message.error(this.$getText('ticket_clone_custom_msg_file_size', '上传附件大小需控制在50M以内'));
            return ;
        }
        this.submitText = this.$getText('ticket_clone_custom_tip_submitting', '正在提交');
        this.btnLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.createTicketByTemplate(form);
            let { code, data } = res;
            if (code === 200) {
                this.ticketId = data.id;
                console.log('this.cloneFileExist', this.cloneFileExist);
                if (this.cloneFileExist) await this.associateAttachment(this.ticketId, this.cloneId);
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
            this.submitText = this.$getText('ticket_clone_custom_submit_text', '提交');
            console.log(e);
        }
    }
    splitDescToName (name: string, desc: string) {
        if (name && name.length) {
            return name;
        } else {
            let text = getSimpleText(desc);
            return text ? text.slice(0, 60) : this.$getText('ticket_clone_custom_tip_response', '问题反馈');
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
            message: this.$getText('ticket_clone_custom_tip_left', '确定要离开吗？系统可能不会保存您所做的更改'),
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: this.$getText('ticket_clone_custom_btn_confirm', '确定'),
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
                id: this.ticketId,
                onlyMy: 'true'
            }
        }).catch(e => e);
    }
    // 获取系统字段
    async getSystemFields () {
        const params = {
            customFormId: this.customFormId
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
    async getDefaultSetting (rgId: number) {
        if (!rgId) return;
        let defaultCc = [];
        // this.defaultCcList = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgSetting(rgId);
            let { code, data } = res;
            if (code === 200) {
                if (data.ccSwitch === 'on') {
                    defaultCc = this.formatToArr(data.userMap);
                } else {
                    defaultCc = [];
                }
                this.rgSetPermission = (data.auth === 'private');
            }
        } catch (error) {
            console.log('error', error);
        }
        return defaultCc;
    }
    async mounted () {
        await this.getSystemFields();
        this.getTicketDetail();
        // this.baseRgDefaultCc = await this.getDefaultSetting();
        // this.defaultCcList = this.defaultCcList.concat(this.baseRgDefaultCc);
        // await this.getDefaultSetting();
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
        // if (rgId === parseInt(this.defaultParams.rgId, 10)) return;
        let currentRgCc = await this.getDefaultSetting(rgId);
        this.defaultCcList = this.defaultCcList.concat(currentRgCc);
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
