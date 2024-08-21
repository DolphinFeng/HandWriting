<template>
    <mtd-modal
        class="create-ones-dialog form-dialog"
        :mask-closable="false"
        @close="handleClose"
        :title="$getText('create_ones_dialog_title', '转入Ones')"
        v-model="visible">
        <div slot="title">
            <mtd-tabs v-model="chooseTab" @input="tabChange">
                <mtd-tab-pane :label="$getText('create_ones_dialog_create_tab_label', '创建Ones')" value="create">
                    <DynamicComponent
                        :edc-dev="false"
                        :edc-cache="false"
                        ref="createOnesDom"
                        :default-form="formCustom"
                        :edc-use-loading="false"
                        :show-issue-select="true"
                        :form-issue-type="formIssueType"
                        :is-require-create-prompt="false"
                        :new-default-form="newFormCustom"
                        edc-id="ones-detail-create-issue"
                        @saveActionFun="(f)=>actionFun = f"
                        @setLoadingStatus="(status) => createOnesBtnLoading = status"
                        @createSuccess="createSuccess" />
                </mtd-tab-pane>
                <mtd-tab-pane :label="$getText('create_ones_dialog_bind_tab_label', '绑定已有Ones')" value="bind">
                    <div class="associate-ones-dialog-container">
                        <AssociateOnesDialog
                            :info="cloneDeep(info)"
                            ref="associateOnesDom"
                            @setLoadingStatus="(status) => btnLoading = status"
                            @success="(projectId,id)=>$emit('success', projectId, id)" />
                    </div>
                </mtd-tab-pane>
            </mtd-tabs>
        </div>
        <div slot="footer">
            <span class="global-error-message">{{ errorMsg }}</span>
            <mtd-button @click="cancelSave">{{ $getText('create_ones_dialog_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                :disabled="imgUploadStatus"
                :loading="btnLoading || createOnesBtnLoading"
                type="primary"
                @click="submit">{{ $getText('create_ones_dialog_confirm_btn', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { cloneDeep } from 'lodash';
import AssociateOnesDialog from './associate-ones-dialog.vue';
import * as api from '@/api';
import { env } from '@/env';
/**
 * 统计分析
 *
 * @author liyuyao
 * @date 04/20/2020
 */
import DynamicComponent from '@era/edc-vue';
const EDCRegistry = window.__EDC__;
let judgeSSOid = (() => {
    let ssoid = '';
    // const ONLINE_ENV: string = 'tt.sankuai.com';
    // const ONLINE_ST_ENV: string = 'tt.fetc.st.sankuai.com'
    // const ONLINE = ['tt.sankuai.com', 'tt.fetc.st.sankuai.com'];
    let cookieName = 'tt_ssoid';
    if (document.cookie) {
        let cookies = document.cookie;
        let cookieList = cookies.split('; ');
        cookieList.forEach((item) => {
            let itemName = item.split('=')[0];
            if (itemName === cookieName) {
                ssoid = item.split('=')[1];
            }
        });
    }
    if (typeof localStorage === 'object') {
        try {
            localStorage['ssoid'] = ssoid;
        } catch (error) {
            console.log(error);
        }
    }
});
judgeSSOid();
EDCRegistry.addService('Vue', Vue);
const edcEnv = () => {
    switch (env) {
        case 'local':
        case 'test':
            return 'test';
        case 'staging':
            return 'staging';
        case 'prod':
        case 'gray':
            return 'production';
        default:
            return 'production';
    }
};
let ticketUserInfo;
if (localStorage.getItem('ticketUserInfo')) {
    try {
        ticketUserInfo = JSON.parse(localStorage.getItem('ticketUserInfo'));
        EDCRegistry.userInfo = {
            username: ticketUserInfo?.username
        };
    } catch (error) {
        //
    }
}
EDCRegistry.config({
    env: edcEnv(),
    // env: env === 'prod' ? 'production' : 'dev', // 标记当前项目运行的环境，如 test, staging, production
    projectId: 'com.sankuai.tt.core.fe', // 当前项目的appkey，就是第一步中给到云图的Appkey
    ssoId: localStorage['ssoid'] || '',
    extendEnvKeys: {
        orgId: ticketUserInfo?.orgId?.toString(),
        buId: ticketUserInfo?.buId?.toString(),
        bgId: ticketUserInfo?.bgId?.toString()
    }
});

Vue.use(DynamicComponent);
/**
 * 添加RG 模板
 *
 * @author liyuyao
 * @date 03/28/2019
 */
@Component({
    components: {
        DynamicComponent,
        AssociateOnesDialog
    }
})
export default class CreateOnesDialog extends Vue {
    @Prop()
    info: any;

    @State(state => state.tt.userInfo.username)
    username: boolean;
    cloneDeep: any = cloneDeep;

    visible: Boolean = true;
    form: any = {};
    formCustom: any = {
        // projectId: null,
        // assigned: '',
        // name: '',
        // issueType: '',
        // expectClose: '',
        // cc: [],
        // reporter: '',
        // attachment: [],
        // desc: ''
    };
    newFormCustom: any = {}; // 新版插件默认参数
    btnLoading: Boolean = false;
    createOnesBtnLoading: Boolean = false;
    $refs: any;
    imgUploadStatus: Boolean = false;
    actionFun: any = null; // 保存函数
    chooseTab: string = 'create';
    errorMsg: string = '';

    get formIssueType () {
        return (localStorage.getItem('create_ones_issueType') && JSON.parse(localStorage.getItem('create_ones_issueType'))) || 'REQUIREMENT';
    }
    get id () {
        return this.$route.query.id;
    }
    get userOnesInfo () {
        const userOnes = localStorage.createOnes;
        return userOnes ? JSON.parse(userOnes) : null;
    }
    get isBindOnes () {
        return this.chooseTab === 'bind';
    }
    syncFieldVariable: string[] = ['desc', 'name', 'cc', 'assigned', 'attachment'];
    async getUserInfo (misIds: string[]) {
        const res = await api.ctiApi.searchDisplayNameList(misIds);
        let userInfo = {};
        if (res?.code === 200) {
            Object.keys(res?.data).forEach((key) => {
                const value = res?.data[key];
                userInfo[key] = {
                    displayValue: value.displayName,
                    value: key,
                    extra: {
                        avatarUrl: value.avatar
                    }
                };
            });
        }
        return userInfo;
    }
    async mounted () {
        for (let key of this.syncFieldVariable) {
            this.formCustom[key] = this.info[key];
        }
        const userInfo = await this.getUserInfo([this.info.assigned, ...this.info.cc]);
        this.newFormCustom.type = {
            displayValue: this.formIssueType,
            value: this.formIssueType
        };
        for (let key of this.syncFieldVariable) {
            switch (key) {
                case 'attachment':
                    this.newFormCustom[key] = this.info[key];
                    break;
                case 'assigned':
                    this.newFormCustom[key] = userInfo[this.info[key]];
                    break;
                case 'cc':
                    this.newFormCustom[key] = {
                        list: this.info[key].map((user) => userInfo[user] || {
                            displayValue: user,
                            value: user
                        })
                    };
                    break;
                default:
                    this.newFormCustom[key] = {
                        displayValue: this.info[key],
                        value: this.info[key]
                    };
                    break;
            }
        }
    }
    // 创建成功
    async createSuccess (res: any, postData: any) {
        this.btnLoading = true;
        const latest = res?.latest || false;
        let id;
        let projectId;
        let type;
        let desc;
        let cc;
        let attachment;
        let onesVersion = '1.0';
        // 包含 latest 字段则表示为最新版本的 EDC 插件，否则为旧版本（0.0.23 及以前版本）
        if (latest) {
            id = res?.id;
            projectId = res?.projectId;
            type = res?.type;
            desc = res?.desc;
            cc = res?.cc;
            attachment = res?.attachment;
            onesVersion = res?.onesVersion;
        } else {
            id = res?.data.id?.value;
            projectId = postData?.projectId;
            type = res?.data.type;
            desc = postData?.desc;
            cc = postData?.cc;
            attachment = postData?.attachment;
        }
        try {
            if (id && type) {
                const matchAttachment = attachment.filter(v => !v?.userDelete);
                localStorage.setItem('create_ones_issueType', JSON.stringify(type));
                const result: any = await api.ticketApi.bindOnes(id, {
                    ticketId: this.id,
                    projectId,
                    issueType: type,
                    cc,
                    desc,
                    attachment: matchAttachment,
                    latest,
                    onesVersion
                });
                if (result?.code === 200 && result?.data) {
                    this.btnLoading = false;
                    this.$mtd.message.success(this.$getText('create_ones_dialog_create_success_tip', 'Ones创建成功~'));
                    this.$emit('success', projectId, result?.data.id);
                    this.handleClose();
                }
            } else {
                this.btnLoading = false;
                this.$mtd.message.error(this.$getText('create_ones_dialog_create_fail_tip', 'Ones创建失败~'));
            }
        } catch {
            this.btnLoading = false;
        }
    }
    // 提交转入ones
    async submit () {
        if (this.chooseTab === 'create') {
            this.actionFun();
        } else if (this.chooseTab === 'bind') {
            this.$refs?.associateOnesDom && this.$refs.associateOnesDom?.submit();
        }
    }
    tabChange () {
        this.errorMsg = '';
    }
    // 取消编辑
    cancelSave () {
        this.$mtd.confirm({
            message: this.$getText('create_ones_dialog_cancel_confirm', '确定要离开吗？系统可能不会保存您所做的更改'),
            width: '463px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: this.$getText('create_ones_dialog_cancel_confirm_btn', '确定'),
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

}
</script>

<style lang="scss">
.create-ones-dialog {
    .mtd-modal {
        .mtd-modal-header {
            height: calc(100% - 60px);
            padding-bottom: 0;
            & > div {
                height: 100%;
                .mtd-tabs,
                .mtd-tab-pane {
                    height: 100%;
                }
                .mtd-tabs-content {
                    height: calc(100% - 20px);
                    padding: 0 !important;
                }
            }
        }

        width: 800px;
        min-width: 860px;
        max-width: 860px;
        height: 100%;
        .quickly-create-container {
            padding-left: 0;
        }
        .mtd-modal-title {
            font-family: PingFangSC-Semibold;
            font-size: 20px;
            color: #464646;
            line-height: 34px;
            letter-spacing: 0;
        }
        .mtd-modal-content-wrapper {
            overflow: hidden;
            padding-bottom: 0;
            .mtd-modal-content,
            .mtd-modal-content form {
                height: 100%;
            }
        }
    }
    .associate-ones-dialog-container {
        height: calc(100% - 20px);
        padding: 16px 10px 0 0;
        overflow: auto;
    }
}
</style>
