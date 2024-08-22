<template>
    <div>
        <mtd-tooltip trigger="hover" class="transfer-btn-container">
            <template slot="content">
                CASE是面向公司内部员工（主要是产品经理）使用的产品case收集、记录、分析工具。详情请点击 <a target="_blank" href="https://km.sankuai.com/page/413903874">CASE帮助文档</a>
            </template>
            <mtd-button
                size="small"
                @click="openTransferForm"
                class="ticket-case-button">
                <span class="ticket-about-btn-content">
                    <img
                        src="@/assets/img/case-logo.png"
                        class="case-logo">
                    <span class="btn-label">{{ $getText('associate_system_case', '转入CASE') }}</span>                
                </span>
            </mtd-button>
        </mtd-tooltip>
        <mtd-modal
            class="transfer-to-case-modal"
            v-if="initModal"
            v-model="showTransferForm"
            title="转入依据池">
            <mtd-form
                ref="transferForm"
                :model="formData"
                :rules="validateRules">
                <mtd-form-item
                    class="two-column"
                    label="业务线"
                    required
                    prop="productLine">
                    <mtd-select
                        v-model="formData.productLine"
                        placeholder="搜索CASE业务线名称"
                        value-key="id"
                        :debounce="500"
                        filterable
                        remote
                        clearable
                        auto-clear-query
                        :loading="searchingProductLine"
                        :remote-method="searchProductLine">
                        <mtd-option
                            v-for="item in productLineOptions"
                            :key="item.id"
                            :value="item"
                            :label="item.displayName" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item
                    class="two-column"
                    label="处理人"
                    required>
                    <mtd-select
                        v-model="formData.assigned"
                        placeholder="搜索姓名或mis"
                        :debounce="500"
                        filterable
                        remote
                        clearable
                        auto-clear-query
                        :loading="searchingReporter"
                        :remote-method="searchReporter">
                        <mtd-option
                            v-for="item in reporterOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label" />
                    </mtd-select>
                </mtd-form-item>
                <!-- 标题 -->
                <mtd-form-item prop="name" label="标题">
                    <mtd-input
                        v-model="formData.name"
                        type="text"
                        style="width: 100%;" />
                </mtd-form-item>
                <!-- 描述 -->
                <mtd-form-item
                    prop="desc"
                    label="描述"
                    required>
                    <editor
                        :is-comment="false"
                        @input="handleDescChange"
                        @imgUpload="handleImgUpload"
                        :value="formData.desc"
                        :action="uploadApi" />
                </mtd-form-item>
                <!-- 附件 -->
                <mtd-form-item label="附件" prop="attachmentList">
                    <div class="attachment-wrapper" v-if="formData.attachmentList.length">
                        <div
                            class="attachment-item"
                            v-for="(item, index) in formData.attachmentList"
                            :key="index">
                            <i class="mtdicon mtdicon-file-o" />
                            <span class="item-name">{{ item.name }}</span>
                        </div>
                    </div>
                    <span v-else>无</span>
                </mtd-form-item>
                <!-- 标签 -->
                <mtd-form-item
                    prop="labelList"
                    class="two-column"
                    label="标签">
                    <component-label
                        @change="tagChange"
                        :form-value="formData.labelList" />
                </mtd-form-item>
                <!-- 发起人 -->
                <mtd-form-item
                    prop="reporter"
                    label="提报人"
                    class="two-column">
                    <mtd-select
                        v-model="formData.reporter"
                        placeholder="请输入 MIS"
                        :debounce="500"
                        filterable
                        remote
                        clearable
                        auto-clear-query
                        :loading="searchingReporter"
                        :remote-method="searchReporter">
                        <mtd-option
                            v-for="item in reporterOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label" />
                    </mtd-select>
                </mtd-form-item>
            </mtd-form>

            <div class="transfer-to-case-modal-footer">
                <mtd-button @click="closeTransferForm">取消</mtd-button>
                <mtd-button
                    type="primary"
                    @click="submitTransferForm"
                    :loading="submittingForm">确定</mtd-button>
            </div>
        </mtd-modal>
    </div>

</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import { Sla2CN } from '@/config/map.conf';
import isEmpty from 'lodash.isempty';
import Editor from '@/components/quill-editor.vue';
import { lxReportClick } from '@/utils/directive/lxanaly';
import ComponentLabel from '@/views/ticket/components/customForm/Template/System/componentLabels.vue';
// 这里导入的是 ts 的 definition 因我们要在 $refs.xx as Form 里用到自动补全能力
import { Form, FormRules } from '@ss/mtd-vue';

import * as api from '@/api';

interface TransferFormData {
    name: string;
    businessLineId?: number;
    assignedList: string[];
    reporter: string;
    sla: string;
    desc: string;
    ccUserList: string[];
    labelList: string[];
    attachmentList: any[];
    productLine?: any;
    assigned?: string;
}

const defaultFormData: TransferFormData = {
    name: '',
    businessLineId: null,
    assignedList: [],
    reporter: '',
    sla: '',
    desc: '',
    ccUserList: [],
    labelList: [],
    attachmentList: [],
    productLine: null,
    assigned: ''
};

const convertTicketInfoToFormData = (info: any): TransferFormData => {
    return {
        name: info.name,
        businessLineId: null,
        assignedList: [],
        reporter: info.reporter,
        sla: info.sla,
        desc: info.desc,
        ccUserList: info.cc || [],
        labelList: info.labels || [],
        attachmentList: info.attachment || [],
        productLine: null,
        assigned: ''
    };
};

const pickCcDetail = (info: any = {}) => {
    if (!Array.isArray(info.ccDetail)) {
        return [];
    }
    return info.ccDetail.map(item => {
        return {
            label: `${item.displayName}(${item.mis})`,
            value: item.mis
        };
    });
};


@Component({ components: {
    Editor,
    ComponentLabel
} })
export default class TicketCaseButton extends Vue {

    @Getter loginType;

    @Prop({ default: () => {
        return {};
    } })
    info: any;

    slaOptions = Object.entries(Sla2CN);

    editorImgUploadStatus: boolean = false;

    showTransferForm: boolean = false;
    // 延迟渲染 modal body, 默认为 false，当变成 true 的时候再加载 <mtd-modal>
    initModal = false;

    formData: TransferFormData = defaultFormData;
    validateRules: FormRules = {
        reporter: [
            { required: false, message: '请选择提报人' },
            {
                validator: (_, val, callback) => {
                    const originalReporterDetail = this.info && this.info.reporterDetail;
                    const originalReporter = this.info && this.info.reporter;

                    // 如果发起者是非员工账号，那么 当前 value 与初始值必须不能相等
                    if (isEmpty(originalReporterDetail) && val === originalReporter) {
                        callback('不支持虚拟账号转入Case系统，请修改发起人为员工账号');
                        return false;
                    }

                    callback();
                    return true;
                },
                trigger: 'blur'
            }
        ],
        desc: [{ required: true, message: '请输入问题描述' }],
        productLine: [{ required: true, message: '请输入业务线' }]
    };
    assignedOptions: any[] = [];
    assignedBlankText: string = '请输入';

    searchingCcUsers: boolean = false;
    ccUserOptions: any[] = [];

    searchingReporter: boolean = false;
    reporterOptions: any[] = [];
    searchingProductLine: boolean = false;
    productLineOptions: any[] = [];

    get ticketId () {
        const idParam = this.$route.query.id;
        if (typeof idParam !== 'string') return 0;
        return parseInt(idParam, 10);
    }

    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=desc` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=desc`;
    }

    editingNewTag: boolean = false;
    newTagVal: string = '';
    startEditingNewTag () {
        this.editingNewTag = true;
        this.$nextTick(() => {
            (this.$refs.newTagInput as any).focus();
        });
    }
    newTagInputBlurHandler () {
        this.editingNewTag = false;
        this.newTagVal = '';
    }

    submitNewTag () {
        this.formData.labelList.push(this.newTagVal);
        this.newTagVal = '';
        this.editingNewTag = false;
    }

    async searchCcUsers (kw?: string) {
        this.searchingCcUsers = true;
        this.ccUserOptions = [];
        kw = kw || '';
        const res = await api.ctiApi.searchUser({ keyword: kw }) as any;
        const { code, data } = res;

        this.searchingCcUsers = false;
        if (code !== 200) {
            this.ccUserOptions = [];
        } else {
            this.ccUserOptions = data.items.map(item => {
                return {
                    label: `${item.displayName}(${item.username})`,
                    value: item.username
                };
            });
        }
    }
    tagChange (tag) {
        this.formData.labelList = tag;
    }

    async searchReporter (kw?: string) {
        this.searchingReporter = true;
        kw = kw || '';
        const res = await api.ctiApi.searchUser({ keyword: kw }) as any;
        const { code, data } = res;

        this.searchingReporter = false;
        if (code === 200 && data) {
            this.reporterOptions = data.items.map(item => {
                return {
                    label: `${item.displayName}(${item.username})`,
                    value: item.username
                };
            });
        } else {
            this.reporterOptions = [];
        }
    }

    async searchProductLine (query) {
        // console.log(query);
        this.searchingProductLine = true;
        const res = await api.ticketApi.getProductLine({ keyword: query }) as any;
        // console.log(res);
        const { code, data } = res;
        this.searchingProductLine = false;
        if (code === 200) {
            this.productLineOptions = data.items;
        }
    }

    async searchCaseAssigned (kw?: string) {
        kw = kw || '';
        if (kw === '') {
            this.assignedOptions = [];
            this.assignedBlankText = '请输入';
            return;
        }
        const res = await api.ticketApi.searchCaseBusinessLine({ keyword: kw });
        const { code, data } = res;
        if (code === 200) {
            const { misList, businessLineList } = data;

            const misOptions = misList.map(item => ({
                value: `MIS:${item.misId}`,
                label: `${item.misName}(${item.misId})`,
                isLeaf: true
            }));
            const businessLineOptions = businessLineList.map(item => ({
                value: `BIZ:${item.businessLineId}`,
                label: `${item.businessLinePathName}`,
                isLeaf: true
            }));

            const options = [];
            if (businessLineOptions.length > 0) {
                options.push({ value: null, label: `业务线(共${businessLineOptions.length})`, disabled: true });
            }
            options.push(...businessLineOptions);
            if (misOptions.length > 0) {
                options.push({ value: null, label: `misId(${misOptions.length})`, disabled: true });
            }
            options.push(...misOptions);
            this.assignedOptions = options;
        } else {
            this.assignedOptions = [];
        }

        if (this.assignedOptions.length === 0) {
            this.assignedBlankText = '暂无搜索结果';
        }
    }

    handleDescChange (val) {
        this.formData.desc = val;
    }

    handleImgUpload () {
        this.editorImgUploadStatus = true;
    }

    submittingForm: boolean = false;

    submitTransferForm () {
        const formRef = this.$refs.transferForm as Form;
        formRef.validate(async (valid) => {
            if (valid) {
                try {
                    this.submittingForm = true;
                    const attachmentList = this.formData.attachmentList.map(item => item.id);

                    const { assigned, productLine } = this.formData;
                    if (!assigned && !productLine) {
                        this.$mtd.message({ message: '请选择业务线或依据跟进人', type: 'error' });
                        this.submittingForm = false;
                        return;
                    }
                    const payload: CommonTypes.CaseIssue = {
                        reporter: this.formData.reporter,
                        sla: this.formData.sla,
                        name: this.formData.name,
                        desc: this.formData.desc,
                        attachmentList,
                        labelList: this.formData.labelList,
                        ccUserList: this.formData.ccUserList,
                        ticketId: this.info.id,
                        // ...assigneeOption
                        productLineId:  (productLine && productLine.id) || '',
                        productLineDisplayName: (productLine && productLine.displayName) || '',
                        assigned: this.formData.assigned || null
                    };
                    // console.log(payload);

                    const res = await api.ticketApi.transferTicketToCase(payload);
                    const { code } = res;
                    if (code === 200) {
                        this.$mtd.message({ message: '已成功转入Case', type: 'success' });
                        this.submittingForm = false;
                        this.closeTransferForm();
                        this.$emit('update');
                    } else {
                        console.error(res.code, res.msg);
                        this.submittingForm = false;
                    }
                } catch (e) {
                    this.submittingForm = false;
                    console.error(e);
                }
            } else {
                console.log('表单校验未通过');
            }
        });
    }

    openTransferForm () {
        this.showTransferForm = true;
        this.initModal = true;
        this.getCaseIssueCache();
        lxReportClick('b_techportal_wvpl5dy6_mc');
    }

    async getCaseIssueCache () {
        const res = await api.ticketApi.getIssueCache() as any;
        // console.log('缓存' ,res);
        const { code } = res;
        if (code === 200) {
            if (res.data) {
                const { assignedDetail, productLine } = res.data;
                if (assignedDetail) {
                    this.reporterOptions = [{
                        label: `${assignedDetail.displayName}(${assignedDetail.mis})`,
                        value: assignedDetail.mis
                    }];
                    this.formData.assigned = assignedDetail.mis;
                }
                if (productLine) {
                    this.productLineOptions = [productLine];
                    this.formData.productLine = productLine;
                }
            }
        }
    }

    jumpToCase (e) {
        e.stopPropagation();
        lxReportClick('b_techportal_276sl62d_mc');
    }

    closeTransferForm () {
        this.showTransferForm = false;
    }

    @Watch('info', { immediate: true })
    setupFormData (val) {
        const transformed = convertTicketInfoToFormData(val);
        this.formData = { ...transformed };
        this.ccUserOptions = pickCcDetail(val);
        // this.reporterOptions = [{ value: this.formData.reporter, label: this.formData.reporter }];
    }
}
</script>
<style lang="scss">
.btn-label {
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
}
.mtd-btn.ticket-case-button {
    background-color: #fff !important;
    .case-btn-content {
        display: flex;
        align-items: center;
        line-height: 20px;
    }
    .icon-qianxun {
        font-size: 16px !important;
        margin-right: 4px;
    }
    .case-logo {
        width: 16px;
        height: 16px;
        margin-right: 2px;
    }
    .case-link {
        color: rgba(0, 0, 0, 0.84);
        text-decoration: none;
    }
}
.transfer-to-case-modal {
    .mtd-modal {
        width: 838px;
        .mtd-form {
            .mtd-form-item {
                &.two-column {
                    width: 48%;
                    display: inline-block;
                    .mtd-cascader,
                    .mtd-input-wrapper,
                    .mtd-select {
                        width: 100%;
                    }
                }
                textarea {
                    width: 100%;
                }
                .mtd-tag {
                    margin-left: 8px;
                    &:first-child {
                        margin-left: 0;
                    }
                }
                .new-tag-button {
                    border: none;
                    .mtdicon-file-add {
                        color: rgba(0, 0, 0, 0.6);
                    }
                }
                .new-tag-input {
                    display: inline-block;
                }
            }
            .attachment-wrapper {
                .attachment-item {
                    display: inline-block;
                    width: calc(50% - 6px);
                    min-height: 40px;
                    line-height: 38px;
                    padding: 0 10px;
                    margin: 0 12px 12px 0;
                    border-radius: 2px;
                    color: rgba(0, 0, 0, 0.87);
                    background: #f7f7f7;
                    vertical-align: top;
                    .item-name {
                        display: inline-block;
                        max-width: calc(100% - 40px);
                        vertical-align: top;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    &:nth-child(2n) {
                        margin-right: 0;
                    }
                }
            }
        }
    }
    .transfer-to-case-modal-footer {
        text-align: right;
    }
}
.transfer-to-case-assigned-popper {
    width: 280px;
    .mtd-cascader-menus,
    .mtd-cascader-menu {
        width: 100%;
    }
    .mtd-cascader-menu-item {
        .caption {
            font-family: PingFangSC-Medium;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.6);
        }
    }
}
.transfer-btn-container {
    height: 24px;
    display: flex;
    align-items: center;
}
</style>