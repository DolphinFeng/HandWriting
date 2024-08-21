<template>
    <div class="associate-ones-dialog form-dialog">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="105"
            :rules="ruleCustom">
            <mtd-form-item
                :label="$getText('associate_ones_dialog_space_label', '归属空间')"
                prop="projectId"
                class="mtd-form-item-required">
                <mtd-select
                    v-model="projectInfo"
                    value-key="id"
                    clearable
                    filterable
                    remote
                    :remote-method="getProjectList"
                    :debounce="500"
                    :placeholder="$getText('associate_ones_dialog_select_ones', '请选择Ones项目')"
                    @change="handleProjectChange">
                    <mtd-option
                        v-for="(value, index) in projectList"
                        :key="index"
                        :label="value.name"
                        :value="value" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                :label="$getText('associate_ones_dialog_type_label', '类型')"
                prop="issueType"
                class="mtd-form-item-required">
                <mtd-select v-model="formCustom.issueType" @change="handleIssueTypes">
                    <mtd-option
                        v-for="(value, index) in OnesIssueTypes"
                        :key="index"
                        :label="$getText(OnesIssueMap[value])"
                        :value="value" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                :label="$getText('associate_ones_dialog_title_label', '标题')"
                prop="name"
                class="mtd-form-item-required"
                v-if="!isBindOnes">
                <mtd-input
                    :placeholder="$getText('associate_ones_dialog_input_ones', '请输入Ones标题')"
                    class="ones-title-input"
                    v-model="formCustom.name" />
            </mtd-form-item>
            <div v-if="isBindOnes">
                <mtd-form-item
                    :label="$getText('associate_ones_dialog_ones_label', 'Ones标题')"
                    prop="name"
                    class="mtd-form-item-required">
                    <mtd-select
                        v-model="bindOnesInfo"
                        clearable
                        filterable
                        remote
                        :disabled="!formCustom.projectId"
                        :remote-method="searchOnesIssue"
                        :debounce="500"
                        :placeholder="$getText('associate_ones_dialog_search_ones', '请搜索Ones标题')"
                        value-key="id"
                        @input="changeBindOnes">
                        <mtd-option
                            v-for="(item, index) in onesIssueList"
                            :key="index"
                            :label="item.name"
                            :value="item" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item
                    :label="$getText('associate_ones_dialog_current_status', '当前状态')">
                    {{ bindOnesInfo && bindOnesInfo.state || $getText('associate_ones_dialog_select_tip', '选择被绑定Ones后可查看状态') }}
                </mtd-form-item>
            </div>
            <mtd-form-item
                :label="$getText('associate_ones_dialog_assign_label', '指派给')"
                prop="assigned"
                class="form-item-assigned mtd-form-item-required">
                <mtd-select
                    v-model="formCustom.assigned"
                    clearable
                    filterable
                    remote
                    :remote-method="getProjectUsers"
                    :debounce="500"
                    :disabled="!formCustom.projectId || isBindOnes"
                    :placeholder="$getText('associate_ones_dialog_placeholder_search', '请输入关键字进行搜索')">
                    <mtd-option
                        v-for="(value, index) in assignedUserList"
                        :key="index"
                        :label="`${value.displayname}（${value.username}）`"
                        :value="value.username" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                :label="$getText('associate_ones_dialog_eta', '预计解决时间')"
                prop="expectClose"
                v-if="!isBindOnes">
                <mtd-date-picker
                    type="datetime"
                    v-model="formCustom.expectClose"
                    format="yyyy-MM-dd HH:mm:ss"
                    :placeholder="$getText('associate_ones_dialog_select_eta', '请选择预计解决时间')"
                    default-time="23:59:59"
                    clearable
                    :time-picker-options="{ format: 'HH:mm:ss' }" />
            </mtd-form-item>
            <mtd-form-item :label="$getText('associate_ones_dialog_cc_label', '抄送给')" prop="cc">
                <div v-if="isBindOnes && bindOnesInfo && bindOnesInfo.cc">
                    <mtd-tag
                        :key="item"
                        :closable="false"
                        theme="gray"
                        type="pure"
                        v-for="item in bindOnesInfo.cc"
                        style="margin-right: 4px;">{{ item }}</mtd-tag>
                </div>
                <mtd-select
                    v-model="formCustom.cc"
                    :placeholder="$getText('associate_ones_dialog_input_mis', '请输入 MIS')"
                    :debounce="500"
                    :loading="userLoading"
                    filterable
                    remote
                    auto-clear-query
                    :remote-method="remoteMethod"
                    multiple>
                    <mtd-option
                        v-for="item in ccUserList"
                        :key="item.username"
                        :label="`${item.displayName}(${item.username})`"
                        :value="item.username" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item :label="$getText('associate_ones_dialog_reporter_label', '关注人')" prop="reporter">
                {{ formCustom.reporter }}
                <div class="reporter-tip">{{ $getText('associate_ones_dialog_reporter_tip', 'TT 发起人为默认的 Ones 关注人，关注人有权限查看该条 Ones 内容') }}</div>
            </mtd-form-item>
            <mtd-form-item
                :label="$getText('associate_ones_dialog_desc_label', '描述')"
                class="description-content"
                :required="!isBindOnes">
                <editor
                    v-if="!isBindOnes"
                    ref="editor"
                    :is-comment="false"
                    :action="`/api/tt/1.0/file/upload/desc?area=desc`"
                    @input="handleContentChange"
                    @imgUpload="handleImgUpload"
                    :value="formCustom.desc" />
                <div
                    v-if="isBindOnes && formCustom.bindOnesId"
                    v-html="formCustom.desc"
                    class="ones-desc-wrapper ql-editor" />
            </mtd-form-item>
            <mtd-form-item :label="$getText('associate_ones_dialog_attachment_label', '附件')" prop="attachment">
                <div class="attachment-wrapper" v-if="formCustom.attachment.length">
                    <div
                        class="attachment-item"
                        v-for="(item, index) in formCustom.attachment"
                        :key="index">
                        <i class="mtdicon mtdicon-file-o" />
                        <span class="item-name">{{ item.name }}</span>
                    </div>
                </div>
                <span v-else>{{ $getText('associate_ones_dialog_no', '无') }}</span>
            </mtd-form-item>
        </mtd-form>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import Editor from '@/components/quill-editor.vue';
import { onesIssueMap, onesIssueTypes } from '@/config/map.conf';
import { markHyperLink } from '@/utils/tools';
// import * as validators from '@/utils/validator';
import * as api from '@/api';
import dayjs from 'dayjs';

/**
 * 添加RG 模板
 *
 * @author liyuyao
 * @date 03/28/2019
 */
@Component({
    components: {
        Editor
    }
})
export default class AssociateOnesDialog extends Vue {
    @Prop()
    info: any;

    @State(state => state.tt.userInfo.username)
    username: boolean;

    visible: Boolean = true;
    formCustom: any = {
        projectId: null,
        assigned: '',
        name: '',
        issueType: '',
        expectClose: '',
        cc: [],
        reporter: '',
        attachment: [],
        desc: ''
    };
    btnLoading: Boolean = false;
    userLoading: Boolean = false;
    $refs: any;

    projectInfo: any = null;

    ruleCustom = {
        projectId: [
            { validator: this.validateOnesProjectId, trigger: 'change' }
        ],
        assigned: [
            { validator: this.validateOnesAssigned, trigger: 'change' }
        ],
        name: [
            { validator: this.validateOnesName, trigger: 'change' }
        ],
        issueType: [
            { validator: this.validateOnesIssueType, trigger: 'change' }
        ]
    };
    defaultPlaceholder: string = '';
    projectList: any = [];
    ccUserList: any = [];
    assignedUserList: any = [];
    OnesIssueMap: string[] = onesIssueMap;
    OnesIssueTypes: any = onesIssueTypes;
    imgUploadStatus: Boolean = false;
    onesIssueList: any = [];

    chooseTab: string = 'bind';

    errorMsg: string = '';

    bindOnesInfo: any = {};

    get id () {
        return this.$route.query.id;
    }
    get editorLength () {
        return this.formCustom.desc.length;
    }
    get userOnesInfo () {
        const userOnes = localStorage.createOnes;
        return userOnes ? JSON.parse(userOnes) : null;
    }
    get isBindOnes () {
        return this.chooseTab === 'bind';
    }
    mounted () {
        for (let key in this.info) {
            this.formCustom[key] = this.info[key];
        }
        if (this.userOnesInfo) {
            this.formCustom = Object.assign(this.formCustom, this.userOnesInfo);
            const choosenProject = {
                name: this.userOnesInfo.projectName,
                id: this.userOnesInfo.projectId
            };
            this.projectList = [choosenProject];
            this.projectInfo = choosenProject;
        } else {
            this.getProjectList('');
        }
        if (this.formCustom.assigned) this.getProjectUsers(this.formCustom.assigned);
        this.ccUserList = this.info?.ccResult?.concat();
        this.$nextTick(() => {
            this.$refs.editor && this.$refs.editor.blur();
            let inputDiv = document.getElementsByClassName('ones-title-input')[0];
            let input = inputDiv && inputDiv.getElementsByTagName('input')[0];
            input && input.focus();
        });
    }
    handleContentChange (val) {
        this.formCustom.desc = val;
    }
    // 抄送人 远程搜索
    async remoteMethod (query) {
        this.ccUserList = [];
        if (query.trim().length < 1) {
            return;
        }
        this.userLoading = true;
        this.ccUserList = await this.searchUser(query);
        this.userLoading = false;
    }
    async searchUser (query: string) {
        let userResult = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({ keyword: query, includeVirtual: true });
            userResult = res.data.items;
        } catch (e) {
            console.log(e);
        }
        return userResult;
    }
    // 获取当前用户拥有的项目
    async getProjectList (query, projectId?) {
        try {
            let params = {
                username: this.username,
                projectName: query
            };
            if (projectId) params['projectId'] = projectId;
            const res: Ajax.AxiosResponse = await api.ticketApi.getOnesProjects(params);
            let { code, data } = res;
            if (code === 200) {
                this.projectList = data.items;
            }
        } catch (e) {
            console.log(e);
        }
    }
    async searchOnesIssue (query) {
        if (!this.formCustom.projectId) return;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.searchOnesIssue({
                projectId: this.formCustom.projectId,
                keyword: query,
                issueType: this.formCustom.issueType
            });
            let { code, data } = res;
            if (code === 200) {
                this.onesIssueList = data.items.map(item => {
                    return {
                        name: item?.name?.value,
                        state: item?.state?.value,
                        id: item?.id?.value,
                        cc: item?.cc?.value,
                        assigned: item?.assigned?.value
                    };
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
    changeBindOnes () {
        this.formCustom.bindOnesId = this.bindOnesInfo.id;
        this.formCustom.assigned = this.bindOnesInfo.assigned;
        if (this.bindOnesInfo && this.bindOnesInfo.id) this.getOnesItemDetail(this.bindOnesInfo.id);
    }
    async getOnesItemDetail (id: number) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getOnesItemDetail(id);
            let { code, data } = res;
            if (code === 200) {
                this.formCustom.desc = data.desc;
            }
        } catch (e) {
            console.log(e);
        }
    }
    handleIssueTypes (val) {
        if (this.isBindOnes) {
            this.bindOnesInfo = null;
            this.formCustom.assigned = '';
            this.formCustom.cc = [];
            this.formCustom.desc = '';
            val && this.searchOnesIssue('');
        }
    }
    handleProjectChange (val) {
        this.formCustom.projectId = val.id;
        this.formCustom.projectName = val.name;
        if (val.id) {
            this.getProjectUsers('');
        } else {
            this.assignedUserList = [];
            this.onesIssueList = [];
        }
        if (this.isBindOnes) {
            this.bindOnesInfo = null;
            this.formCustom.assigned = '';
            this.formCustom.cc = [];
            this.formCustom.desc = '';
            val.id && this.searchOnesIssue('');
        }
    }
    async getProjectUsers (query) {
        if (!this.formCustom.projectId) {
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getProjectUsers(this.formCustom.projectId, {
                username: query
            });
            let { code, data } = res;
            if (code === 200) {
                this.assignedUserList = data.items;
                console.log('this.assignedUserList', this.assignedUserList);
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 提交转入ones
    async submit () {
        this.$emit('setLoadingStatus', true);
        this.$refs['formCustom'].validate(async (valid) => {
            if (valid) {
                try {
                    const res: Ajax.AxiosResponse = this.isBindOnes ? await api.ticketApi.bindOnes(this.formCustom.bindOnesId, {
                        ticketId: this.id,
                        projectId: this.formCustom.projectId,
                        issueType: this.formCustom.issueType,
                        cc: this.bindOnesInfo.cc && this.bindOnesInfo.cc.length ? this.formCustom.cc.concat(this.bindOnesInfo.cc) : this.formCustom.cc,
                        desc: markHyperLink(this.formCustom.desc || ''),
                        attachment: this.formCustom.attachment,
                        reporter: this.formCustom.reporter
                    }) : await api.ticketApi.createOnes({
                        ticketId: this.id,
                        projectId: this.formCustom.projectId,
                        issueType: this.formCustom.issueType,
                        name: this.formCustom.name,
                        assigned: this.formCustom.assigned,
                        cc: this.formCustom.cc,
                        reporter: this.formCustom.reporter,
                        expectClose: dayjs(this.formCustom.expectClose).valueOf(),
                        desc: markHyperLink(this.formCustom.desc || ''),
                        attachment: this.formCustom.attachment
                    });
                    if (typeof localStorage === 'object') {
                        try {
                            localStorage.createOnes = JSON.stringify({
                                projectId: this.formCustom.projectId,
                                projectName: this.formCustom.projectName,
                                assigned: this.formCustom.assigned,
                                issueType: this.formCustom.issueType
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    // 保存用户选择的基本信息
                    let { data, code } = res;
                    if (code === 200) {
                        this.$emit('setLoadingStatus', false);
                        this.$mtd.message({
                            message: this.$getText('associate_ones_dialog_tip_create_success', 'Ones创建成功'),
                            type: 'success'
                        });
                        this.$emit('success', this.formCustom.projectId, data.id);
                        this.visible = false;
                        this.handleClose();
                    }
                } catch (e) {
                    this.$emit('setLoadingStatus', false);
                    console.log(e);
                }
            } else {
                this.$emit('setLoadingStatus', false);
                console.log('Fail');
            }
        }).catch(err => {
            this.$emit('setLoadingStatus', false);
            const errArr = Object.values(err);
            this.errorMsg = this.$getText('associate_ones_dialog_submit_error', { error: errArr.join('；') });
        });
    }
    tabChange () {
        this.errorMsg = '';
    }
    // 取消编辑
    cancelSave () {
        this.$mtd.confirm({
            message: this.$getText('associate_ones_dialog_tip_if_left', '确定要离开吗？系统可能不会保存您所做的更改'),
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: this.$getText('associate_ones_dialog_btn_confirm', '确定'),
            cancelButtonText: this.$getText('ticket_clone_custom_btn_cancel', '取消'),
            onOk: () => {
                this.visible = false;
                this.handleClose();
            }
        }).catch(e => { console.log(e); });
    }
    handleClose () {
        this.$emit('close');
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    validateOnesProjectId (_rule, value, callback) {
        this.$nextTick(function () {
            if (!this.formCustom.projectId) {
                return callback(new Error(this.$getText('associate_ones_dialog_error_select_project', '请选择归属项目')));
            }
            return callback();
        });
    }
    validateOnesAssigned (_rule, value, callback) {
        this.$nextTick(function () {
            if (!this.formCustom.assigned) {
                return callback(new Error(this.$getText('associate_ones_dialog_error_select_assign', '请选择指派人')));
            }
            return callback();
        });
    }
    validateOnesName (_rule, value, callback) {
        this.$nextTick(function () {
            if ((!this.isBindOnes && !this.formCustom.name) || (this.isBindOnes && !this.formCustom.bindOnesId)) {
                return callback(new Error(this.$getText('associate_ones_dialog_error_need_title', '请输入Ones标题')));
            }
            return callback();
        });
    }
    validateOnesIssueType (_rule, value, callback) {
        this.$nextTick(function () {
            if (!this.formCustom.issueType) {
                return callback(new Error(this.$getText('associate_ones_dialog_error_select_type', '请选择类型')));
            }
            return callback();
        });
    }
}
</script>

<style lang="scss" scoped>
.associate-ones-dialog {
    .description-content {
        .ql-toolbar.ql-snow {
            line-height: 20px;
        }
    }
    form {
        height: 100%;
        .mtd-form-item {
            margin-bottom: 20px;
            .mtd-date-picker,
            .mtd-select {
                width: 316px;
            }
        }
        .reporter-tip {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            line-height: 1;
            color: #999;
        }
    }
    .tt-quill-editor {
        height: 100%;
        .ql-container.ql-snow {
            height: calc(100% - 60px);
            .ql-editor {
                min-height: 240px;
            }
        }
    }
    .template-content {
        height: calc(100% - 60px);
        margin-bottom: 0;
        .mtd-form-item-content {
            height: 100%;
        }
    }
    .ones-title-input {
        width: 316px;
    }
    .global-error-message {
        float: left;
        font-size: 12px;
        color: #f5483b;
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
    .ones-desc-wrapper {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 3px;
    }
}
</style>
