<template>
    <div class="dx-ticket-create">
        <div class="create-content">
            <mtd-form
                :model="form"
                ref="form"
                class="create-form"
                :rules="ruleCustom"
                :label-width="60">
                <mtd-form-item
                    class="form-name"
                    prop="name"
                    label="标题:">
                    <mtd-input
                        class="input-wrapper"
                        v-model.trim="form.name"
                        placeholder="请输入标题"
                        type="text" />
                </mtd-form-item>
                <div class="vertical-line-container">
                    <mtd-form-item
                        class="require"
                        prop="ticketType"
                        label="类型:">
                        <mtd-select v-model="form.ticketType" @change="lxSubmit('select_type')">
                            <mtd-option
                                v-for="(item, index) in ticketType"
                                :key="index"
                                :label="$getText(item.key)"
                                :value="item.value" />
                        </mtd-select>
                    </mtd-form-item>
                    <mtd-form-item
                        class="form-sla"
                        prop="sla"
                        label="等级:">
                        <mtd-select
                            :class="form.sla"
                            v-model="form.sla"
                            @change="lxSubmit('select_sla')">
                            <mtd-option
                                v-for="(value, index) in ticketSla"
                                :key="index"
                                :label="$getText(sla2CN[value])"
                                :value="value" />
                        </mtd-select>
                    </mtd-form-item>
                </div>
                <div v-if="form.sla" :class="'pc-level-tip level-tip tip-' + form.sla">
                    <div class="triangle" /><div class="tip-wrapper">{{ $getText(levelTips[form.sla]) }}</div>
                </div>
                <mtd-form-item
                    class="form-catalog mtd-form-item-required"
                    label="指派:"
                    prop="itemName"
                    :show-assigned="false">
                    <div class="set-default-catalog">
                        <div>
                            <mtd-tag
                                v-if="isGroupCatalog"
                                type="pure"
                                theme="gray">{{ this.chatType === 'groupchat' ? '群' : '单聊' }}默认目录</mtd-tag>
                            <mtd-button
                                size="small"
                                @click="cancelGroupCatalogConfirm"
                                v-if="isGroupCatalog">
                                取消设置
                            </mtd-button>
                            <mtd-button
                                v-if="!isGroupCatalog && form.itemId"
                                size="small"
                                type="warning"
                                ghost
                                @click="setGroupCatalogConfirm">
                                设为默认目录
                            </mtd-button>
                        </div>
                    </div>
                    <category-assigned-search
                        :catagory-info="categoryInfo"
                        :is-work-hour="isWorkHour"
                        @template-change="handleTemplateChange"
                        @change="updateCategoryAssigned"
                        @changeWorkHour="updateWorkHourState"
                        v-if="resetFlag && renderCti" />
                </mtd-form-item>
                <mtd-form-item prop="cc" label="抄送:">
                    <change-cc
                        class="tag-item"
                        @change="ccChange"
                        :cc-list="form.cc" />
                </mtd-form-item>
                <mtd-form-item
                    class="mtd-form-item-required"
                    prop="description"
                    label="描述:">
                    <div class="comment-input">
                        <editor
                            ref="editor"
                            :is-comment="false"
                            @input="handleDescChange"
                            @imgUpload="handleImgUpload"
                            :value="form.description"
                            :action="`/api/tt/1.0/file/upload/desc?area=desc`"
                            placeholder="请输入问题描述，可以使用 Command+V 粘贴截图" />
                    </div>
                </mtd-form-item>
                <mtd-form-item prop="labels" label="标签:">
                    <change-tag
                        v-if="resetFlag"
                        class="tag-item"
                        :rg-id="form.rgId"
                        @change="tagChange" />
                </mtd-form-item>
                <div class="vertical-line-container">
                    <mtd-form-item
                        v-if="attachment.length"
                        label="附件:"
                        class="upload-form-item">
                        <el-upload
                            class="upload-attachment"
                            :action="`/api/tt/1.0/file/upload?ticketId=${ticketId}&area=attach`"
                            :on-exceed="handleExceed"
                            :before-upload="beforeUpload"
                            :on-remove="handelFileRemove"
                            :on-change="handelFileChange"
                            :on-success="handelFileSuccess"
                            :auto-upload="false"
                            :file-list="attachment"
                            ref="upload"
                            :limit="10">
                            <span class="text-button upload-button" style="display: none;"><i class="mtdicon mtdicon-export-o" /> 上传附件</span>
                        </el-upload>
                    </mtd-form-item>
                    <mtd-form-item prop="permission" label="权限:">
                        <mtd-checkbox
                            v-model="form.permission"
                            size="small"
                            :disabled="rgSetPermission"
                            @input="lxSubmit('switch_permission')">设为保密</mtd-checkbox>
                        <mtd-tooltip
                            content="只允许创建人、发起人、处理组、抄送人查看和编辑"
                            trigger="hover"
                            theme="dark"
                            placement="right"
                            size="small">
                            <i class="mtdicon mtdicon-question-circle-o" />
                        </mtd-tooltip>
                    </mtd-form-item>
                    <mtd-form-item prop="reporter" label="发起人:">
                        <change-reporter :reporter="form.reporter" @change="reporterChange" />
                    </mtd-form-item>
                </div>
            </mtd-form>
        </div>
        <div class="create-footer">
            <div class="footer-center-container">
                <!-- reload api有问题，暂时注释，等待大象侧修复 -->
                <!-- <mtd-tooltip
                    content="刷新页面"
                    size="small"
                    placement="top">
                    <mtd-icon-button
                        @click="onReloadPanel"
                        icon="mtdicon mtdicon-refresh-o"
                        class="close-btn" />
                </mtd-tooltip> -->
                <mtd-button @click="cancel" class="close-btn">取消</mtd-button>
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
import * as api from '@/api';
import CategoryAssignedSearch from '@/components/category-assigned-search.vue';
import ChangeReporter from '@/components/change-reporter.vue';
import ChangeCc from '@/components/change-cc.vue';
import ChangeTag from '@/components/change-tag.vue';
import Editor from '@/components/quill-editor.vue';
import { Getter } from 'vuex-class';
import { TicketSla, TicketType, LevelTips, Sla2CN, SLA_RULE_DESC } from '@/config/map.conf';
import { CREATE_LX_MAP } from '@/config/lx_map.conf';
import axios from 'axios';

import Client from '@xm/post-message-im/dist/client';
import pick from 'lodash.pick';
import store from '@/store';

/**
 * 创建Ticket
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
const validateName: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('标题不能为空'));
    }
    if (value.length > 60) {
        return callback(new Error('标题不能超过60个字'));
    }
    return callback();
};
const validateDesc: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('问题描述不能为空'));
    }
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
        CategoryAssignedSearch,
        ChangeReporter,
        ChangeCc,
        ChangeTag,
        Editor
    },
    data () {
        return {
            form: {
                name: '',
                description: '',
                ticketType: '事件',
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
                sla: 'S4',
                permission: false,
                labels: [],
                sourceId: 0
            }
        };
    }
})
export default class DxCreate extends Vue {
    @Getter env;

    form: CommonTypes.CreateTicketItem;
    ticketSla: string[] = TicketSla;
    ticketType: {key: string, value: string}[] = TicketType;
    levelTips: CommonTypes.userLoading = LevelTips;
    userLoading: Boolean = false;
    btnLoading: Boolean = false;
    ticketId: number = 0;
    attachment: any[] = [];
    RgUserList: CommonTypes.RgUserItem[] = [];
    RgWithCategory: any = [];
    timer: number = 0;
    submitText: string = '提交';
    sla2CN: CommonTypes.mapObject = Sla2CN;
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
    categoryInfo: any = {};
    groupCatalog: any = {};
    categorySearchType: string = 'category';

    defaultCcList: string[] = [];
    rgSetPermission: boolean = false;

    XMClient: any = null;
    messageList: any = [];
    messageUsers: string[] = [];

    resetFlag: boolean = true;
    username: string = '';

    renderCti: boolean = true;
    // 会话对应的uid
    groupId: number = 0;

    isWorkHour: boolean = true;
    // 群聊groupchat 单聊chat
    chatType: string = '';

    ruleCustom = {
        name: [
            { validator: validateName, trigger: 'blur' }
        ],
        description: [
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
    // 暂时无法判断是否是Admin
    get isGroupAdmin () {
        return true;
    }

    get hasGroupCatalog () {
        return !!this.groupCatalog.itemId;
    }

    get isGroupCatalog () {
        return this.hasGroupCatalog && this.groupCatalog.itemId === this.form.itemId;
    }

    mounted () {
        this.RgList = [this.constEmpty];
        this.getUserInfo();
        this.getCtiVersion();
        this.handleDxStyle();
        this.clientPostMessage();
    }
    // 获取rg的默认设置
    @Watch('form.rgId', { immediate: true })
    getRgSetting (val) {
        if (val) {
            this.getDefaultSetting();
        } else {
            this.defaultCcList = [];
            this.form.permission = false;
        }
    }
    @Watch('username', { immediate: true })
    getUserName (name) {
        this.form.reporter = name;
    }
    async getUserInfo () {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getUserInfo();
            let name = res.data.username;
            this.username = name || '';
        } catch (e) {
            console.log(e);
        }
    }
    async getDefaultSetting () {
        this.defaultCcList = [];
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getRgSetting(this.form.rgId);
            let { code, data } = res;
            if (code === 200) {
                if (data.ccSwitch === 'on') {
                    let ccArr = this.formatToArr(data.userMap);
                    this.defaultCcList = ccArr;
                    this.form.cc = this.totalCcUsers;
                } else {
                    this.defaultCcList = [];
                    this.form.cc = this.totalCcUsers;
                }
                this.form.permission = (data.auth === 'private');
                this.rgSetPermission = this.form.permission;
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    formatToArr (obj) {
        let result = [];
        for (let key in obj) {
            result.push(key);
        }
        return result;
    }
    updateCategoryAssigned (result, categorySearchType, isRecommendAssigned?) {
        for (let key in result) {
            this.form[key] = result[key];
        }
        this.categorySearchType = categorySearchType || 'category';
        this.form.sourceId = isRecommendAssigned ? 1 : 0;
        this.$refs.form && this.$refs.form.validateField('itemName');
    }
    async handleTemplateChange () {
        if (!this.form.itemId) {
            return ;
        }
        let newTemplate = await this.getTemplateByItem(this.form.itemId);
        if (!this.form.description) {
            this.form.description = newTemplate?.content;
            this.currentTemplate = newTemplate?.id;
        }
        // if (this.form.description && newTemplate.id && (this.currentTemplate !== newTemplate.id)) {
        //     this.changeTemplate(newTemplate);
        // }
    }
    changeTemplate (newTemplate) {
        this.$mtd.confirm({
            title: '服务目录已切换，是否清空当前问题描述内容，切换到新的模板？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                this.form.description = newTemplate.content;
                this.currentTemplate = newTemplate.id;
            }
        }).catch(e => { console.log(e); });
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
                    return callback(new Error('请选择三级目录'));
                } else {
                    return callback(new Error('请选择处理人'));
                }
            }
            return callback();
        });
    }
    handleExceed () {
        this.$mtd.message.error('仅允许上传10个附件');
    }
    handelFileRemove (file, files) {
        this.attachment = files;
        this.judgeFileList(file, files);
    }
    handelFileChange (file, files) {
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
        this.successRedirect();
    }
    handleDescChange (value) {
        this.form.description = value;
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
    cancel () {
        this.lxSubmit('click_cancelsave');
        this.hideDxFrame();
    }
    successRedirect () {
        this.btnLoading = false;
        this.$router.push({
            name: 'tt_detail',
            query: {
                id: this.ticketId
            }
        }).catch(e => e);
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    reporterChange (val) {
        this.form.reporter = val;
    }
    ccChange (val) {
        this.lxSubmit('click_cc');
        this.form.cc = val;
        this.messageUsers = val;
    }
    tagChange (val) {
        // this.lxSubmit('click_cc');
        this.form.labels = val;
    }
    // 埋点函数
    lxSubmit (eventName) {
        window.LXAnalytics && window.LXAnalytics('moduleClick', CREATE_LX_MAP[eventName], { custom: { mis: this.username } });
    }
    preSubmit () {
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
        this.$refs['form'].validate(async (valid) => {
            if (valid && this.fileSizeOk) {
                this.submitText = '正在提交';
                this.btnLoading = true;
                try {
                    const res: Ajax.AxiosResponse = await api.ticketApi.createTicket({
                        name: this.form.name,
                        desc: this.form.description,
                        ticketType: this.form.ticketType,
                        categoryName: this.form.categoryName,
                        categoryId: this.form.categoryId,
                        typeName: this.form.typeName,
                        typeId: this.form.typeId,
                        itemName: this.form.itemName,
                        itemId: this.form.itemId,
                        assigned: this.form.assigned,
                        cc: this.form.cc.length ? this.form.cc : [],
                        reporter: this.form.reporter,
                        rgId: this.form.rgId,
                        sla: this.form.sla,
                        permission: this.form.permission ? 'private' : 'public',
                        labels: this.form.labels || [],
                        sourceId: this.form.sourceId || 0,
                        source: 'ticket.DX', // 大象创建来源标示
                        appointAssigned: this.categorySearchType === 'assigned'
                    });
                    let { code, data } = res;
                    if (code === 200) {
                        this.ticketId = data.id;
                        // if (this.attachment.length === 0) {
                        // 不允许上传附件
                        this.completeCreateTT();
                        // } else {
                        //     // 等待ticketId返回，上传到创建后的ticket上
                        //     setTimeout(() => {
                        //         this.messageList.length && this.getFileMessage(this.messageList);
                        //         this.btnLoading = false;
                        //         this.hideDxFrame();
                        //     }, 0);
                        // }
                    }
                    this.btnLoading = false;
                    this.submitText = '提交';
                } catch (e) {
                    this.btnLoading = false;
                    this.submitText = '提交';
                    console.log(e);
                }
            }
        }).catch(err => console.log(`validate msg: `, err));
    }
    // 大象中发起页面的宽度处理
    handleDxStyle () {
        let html = document.getElementsByTagName('html')[0];
        let body = document.getElementsByTagName('body')[0];
        html.style.minWidth = '0px';
        body.style.minWidth = '0px';
    }
    // test 101579
    // 本地 eiqS8MK_NzsE95H
    // 线下 OMs0eNFHl_puU7l
    clientPostMessage () {
        this.XMClient = new Client({
            id: this.env === 'test' ? '101581' : '101723'
            // id: 'eiqS8MK_NzsE95H'
        });
        this.XMClient && this.messageContextTT();
        this.XMClient && this.selectedMessageContextTT();
        this.XMClient && this.onHidePanel();
        this.XMClient && this.onShowPanel();
        // 为防止sso跳转，历史消息在跳转前被拉取、清空，在这里加一个延时
        setTimeout(() => {
            this.XMClient.request({
                type: 'offline',
                callback: (err, res) => {
                    console.log('offline', err, res);
                    this.XMClient.distribute(res);
                }
            });
        }, 500);
    }
    // 单选消息 大象不开放
    messageContextTT () {
        this.XMClient.on({
            type: 'messageContext',
            callback: (err, res) => {
                console.log('messageContext', err);
                let message = res.data.message;
                if (message.type === 1) {
                    this.form.description = this.escapeHtml(`${message.fromName}：${message.body.text}` || '');
                } else if (message.type === 4) {
                    this.getImgMessage([message]);
                }
                this.form.name = this.sliceMaxText(message.body.text || '');
            }
        });
    }
    // 多选消息
    selectedMessageContextTT () {
        this.XMClient.on({
            type: 'selectedMessageContext',
            callback: (err, res) => {
                console.log('selectedMessageContext', res, err);
                // 群聊groupchat & 单聊chat
                this.chatType = res.data.sessionInfo.type;
                let message = res.data.forwardMsgs;
                let messageList = [];
                for (let msg in message) {
                    messageList.push(message[msg]);
                }
                messageList.sort((a, b) => a.svrTime - b.svrTime);
                this.messageList = messageList;
                this.addGroupInfoToDesc(messageList);
                // this.showFileList(messageList);
                this.getTextMessage(messageList);
                this.getImgMessage(messageList);
                this.getFromUsers(messageList);
            }
        });
    }
    onHidePanel () {
        this.XMClient.on({
            type: 'hide',
            callback: (err, res) => {
                console.log('hide', res, err);
                this.resetForm();
            }
        });
    }
    onReloadPanel () {
        this.XMClient && this.XMClient.request({
            type: 'reload',
            callback: (err, res) => {
                console.log('reload', res, err);
            }
        });
    }

    onShowPanel () {
        // show api偶现调用失败的情况，先注释renderCti相关逻辑，根据用户反馈进一步调整
        // this.renderCti = false;
        console.log('show panel');
        this.XMClient.on({
            type: 'show',
            callback: async (err, res) => {
                console.log('show', res, err);
                // this.renderCti = true;
                this.XMClient && this.initSessionInfo();
            }
        });
    }
    async getCtiVersion () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getCtiVersion();
        let { code, data } = res;
        if (code === 200) {
            let version = data.version;
            store.commit('SET_CTI_VERSION', version);
        }
    }
    initSessionInfo () {
        this.XMClient.request({
            type: 'getSessionInfo',
            callback: (err, { rescode, data }) => {
                console.log('getSessionInfo:', data, err, rescode);
                if (data.sessionInfo) {
                    this.groupId = data.sessionInfo.uid;
                    this.getDefaultGroupCatalog();
                }
            }
        });
    }
    async getFromUsers (message) {
        let users = message.map((msg) => {
            return msg.from;
        });
        const res: Ajax.AxiosResponse = await api.ticketApi.getMisByUid(users.join(','));
        let { code, data } = res;
        if (code === 200) {
            for (let uid in data) {
                this.messageUsers.push(data[uid]);
                this.form.cc = this.totalCcUsers;
            }
        }
    }
    // 获取制定类型的消息列表
    getTargetTypeMsg (message, msgType) {
        return message.filter((msg) => {
            return msg.type === msg['STATIC'][msgType];
        }) || [];
    }
    // 添加消息群来源
    addGroupInfoToDesc (message) {
        const isGroup = this.chatType === 'groupchat';
        const groupName = isGroup ? `群【${message[0] && message[0]['groupName']}】` : '大象';
        // 单聊的情况下，to会根据发送人变化，需要使用belongTo
        const groupId = isGroup ? (message[0] && message[0]['to']) : (message[0] && message[0]['belongTo']);
        const chatUrl = this.env === 'prod' ? `https://x.sankuai.com/chat/${groupId}?type=${this.chatType}` : `http://xm-web.it.test.sankuai.com/chat/${groupId}?type=${this.chatType}`;
        this.form.description = this.escapeHtml(`来自${groupName}：${chatUrl}`) + '</br>';
    }
    // 转义HTML
    escapeHtml (html) {
        return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    // 处理文字消息
    getTextMessage (message) {
        let textList = this.getTargetTypeMsg(message, 'MSG_TYPE_TEXT');
        this.form.name = textList.length && this.sliceMaxText(textList[0]['body']['text']) || '';
        this.form.description += textList.map((msg) => {
            return this.escapeHtml(`${msg.fromName}：${msg.body.text}`);
        }).join('</br>');
    }
    // 处理图片消息
    async getImgMessage (message) {
        let imgList = this.getTargetTypeMsg(message, 'MSG_TYPE_IMAGE');
        console.log('message', message);
        console.log('imgList', imgList);
        let imgTextArr = await Promise.all(imgList.map(async (msg) => {
            return this.downLoadDxImg(msg.fromName, msg.body.original);
        }));
        this.form.description += imgTextArr.join('</br>');
    }
    // 处理文件消息 大象暂时不允许处理
    getFileMessage (message) {
        let fileList = this.getTargetTypeMsg(message, 'MSG_TYPE_FILE');
        fileList.length && this.addDxAttachment(fileList);
    }
    // 待上传列表展示
    showFileList (message) {
        let fileList = this.getTargetTypeMsg(message, 'MSG_TYPE_FILE');
        this.attachment = fileList.map((file) => {
            return {
                name: file.body.name
            };
        });
    }
    // 将图片消息上传至tt文本
    async downLoadDxImg (fromName, imageUrl) {
        let clientId = this.env === 'prod' ? '9504f696cb' : 'cc7fabacff';
        let reg = `/(?:(?:^|.*;\s*)tt_ssoid\s*\=\s*([^;]*).*$)|^.*$/`;
        try {
            const requestBody = await axios(imageUrl, {
                method: 'get',
                withCredentials: true,
                responseType: 'arraybuffer',
                headers: {
                    'access-token': document.cookie.replace(reg, '$1'),
                    'client-id': clientId
                }
            });
            console.log('requestBody', requestBody);
            const contentType = requestBody['headers'] && requestBody['headers']['content-type'];
            if (!contentType) {
                return ;
            }
            const contentData = requestBody['data'];
            let formData = new FormData();
            formData.append('file', new Blob([contentData], { type: contentType }));
            // 上传
            const uploadResult = await axios(`/api/tt/1.0/file/upload/desc?area=desc`, {
                method: 'post',
                withCredentials: true,
                data: formData
            });
            return `${fromName}：<img src='` + uploadResult.data.data.url + `' />`;
        } catch (error) {
            console.log('图片问题', error);
        }
    }
    // 将文件消息上传至tt附件
    async addDxAttachment (fileList) {
        await Promise.all(fileList.map(async (file) => {
            await this.downLoadDxFile(file.body);
        }));
    }
    async downLoadDxFile (file) {
        let clientId = this.env === 'prod' ? '9504f696cb' : 'cc7fabacff';
        let reg = `/(?:(?:^|.*;\s*)tt_ssoid\s*\=\s*([^;]*).*$)|^.*$/`;
        const requestBody = await axios(file.url, {
            method: 'get',
            withCredentials: true,
            responseType: 'arraybuffer',
            headers: {
                'access-token': document.cookie.replace(reg, '$1'),
                'client-id': clientId
            }
        });
        const contentType = requestBody['headers'] && requestBody['headers']['content-type'];
        if (!contentType) {
            return ;
        }
        const contentData = requestBody['data'];
        const blob = new Blob([contentData]);
        let formData = new FormData();
        formData.append('file', new File([blob], file.name, { type: contentType }));
        const uploadResult = await axios(`/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=attach`, {
            method: 'post',
            withCredentials: true,
            data: formData
        });
    }
    completeCreateTT () {
        this.XMClient && this.XMClient.request({
            type: 'toast',
            params: {
                type: 'success',
                content: 'TT创建成功',
                duration: 2
            },
            callback: (err, res) => {
                console.log('toast panel', err, res);
                this.hideDxFrame();
            }
        });
    }
    // 收起面板
    hideDxFrame () {
        this.XMClient && this.XMClient.request({
            type: 'hide',
            callback: (err, res) => {
                this.resetForm();
                console.log('hide panel', res, err);
            }
        });
    }

    resetForm () {
        this.form = {
            name: '',
            description: '',
            ticketType: '事件',
            categoryName: '',
            categoryId: 0,
            typeName: '',
            typeId: 0,
            itemName: '',
            itemId: 0,
            assigned: '',
            rgId: 0,
            cc: [],
            reporter: this.username,
            sla: 'S4',
            permission: false,
            labels: [],
            sourceId: 0
        };
        this.categoryInfo = {
            categoryName: '',
            categoryId: 0,
            typeName: '',
            typeId: 0,
            itemName: '',
            itemId: 0,
            rgId: 0
        };
        this.attachment = [];
        this.defaultCcList = [];
        this.messageUsers = [];
        this.rgSetPermission = false;
        this.resetFlag = false;
        this.chatType = '';
        this.$nextTick(() => {
            this.resetFlag = true;
        });
    }
    sliceMaxText (name) {
        return name.slice(0, 60);
    }
    get totalCcUsers () {
        let total = this.defaultCcList.concat(this.messageUsers);
        let reportPos = total.indexOf(this.form.reporter);
        if (reportPos >= 0) {
            total.splice(reportPos, 1);
        }
        return Array.from(new Set(total));
    }
    setGroupCatalogConfirm () {
        const isGroup = this.chatType === 'groupchat';
        this.$mtd.confirm({
            title: `确定要设为${isGroup ? '群聊' : '单聊'}的默认服务目录吗？`,
            message: `${isGroup ? '群聊' : '单聊'}默认服务目录设置成功后，${isGroup ? '将对<span style="color: red">本群所有成员</span>立即生效' : '后续<span style="color: red">单聊对话信息转TT</span>默认展示设置的目录'}`,
            dangerouslyUseHTMLString: true,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                this.setDefaultGroupCatalog();
            }
        }).catch(e => e);
    }
    cancelGroupCatalogConfirm () {
        const isGroup = this.chatType === 'groupchat';
        this.$mtd.confirm({
            title: `确定要取消${isGroup ? '群聊' : '单聊'}的默认服务目录吗？`,
            message: `${isGroup ? '群聊' : '单聊'}默认服务目录取消成功后，${isGroup ? '将对<span style="color: red">本群所有成员</span>立即生效' : '后续<span style="color: red">单聊对话信息转TT</span>不展示默认目录，需手动选择'}`,
            dangerouslyUseHTMLString: true,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: () => {
                this.cancelGroupCatalogSetting();
            }
        }).catch(e => e);
    }
    async setDefaultGroupCatalog () {
        const isGroup = this.chatType === 'groupchat';
        const res: Ajax.AxiosResponse = await api.ctiApi.setExternalDefaultCti({
            externalId: isGroup ? this.groupId.toString() : this.username,
            externalType: isGroup ? 'CHATROOM' : 'USERNAME',
            categoryId: this.form.categoryId,
            typeId: this.form.typeId,
            itemId: this.form.itemId
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success(`${isGroup ? '群' : '单聊'}默认目录设置成功`);
            this.groupCatalog = {
                categoryId: this.form.categoryId,
                typeId: this.form.typeId,
                itemId: this.form.itemId,
                categoryName: this.form.categoryName,
                typeName: this.form.typeName,
                itemName: this.form.itemName
            };
        }
    }
    async getDefaultGroupCatalog () {
        const isGroup = this.chatType === 'groupchat';
        const res: Ajax.AxiosResponse = await api.ctiApi.getExternalDefaultCti({
            externalId: isGroup ? this.groupId.toString() : this.username,
            externalType: isGroup ? 'CHATROOM' : 'USERNAME'
        });
        let { code, data } = res;
        if (code === 200) {
            this.groupCatalog = pick(data, ['categoryName', 'typeName', 'itemName', 'categoryId', 'typeId', 'itemId']);
            this.categoryInfo = this.groupCatalog;
        }
    }
    async cancelGroupCatalogSetting () {
        const isGroup = this.chatType === 'groupchat';
        const res: Ajax.AxiosResponse = await api.ctiApi.setExternalDefaultCti({
            externalId: isGroup ? this.groupId.toString() : this.username,
            externalType: isGroup ? 'CHATROOM' : 'USERNAME',
            categoryId: 0,
            typeId: 0,
            itemId: 0
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success(`${isGroup ? '群' : '单聊'}默认目录取消成功`);
            this.groupCatalog = {};
        }
    }
    updateWorkHourState (val) {
        this.isWorkHour = val;
    }
}
</script>

<style lang="scss">
.dx-ticket-create {
    background-color: #fff;
    height: 100%;
    .create-form {
        .form-name {
            .input-wrapper {
                width: 100%;
            }
        }
        .mtd-select {
            width: 100%;
        }
        .mtd-form-item {
            margin-bottom: 15px;
            &.form-catalog {
                margin-bottom: 16px;
                .mtd-form-item-error-tip {
                    position: absolute;
                    margin-top: 0;
                    line-height: 16px;
                }
                .catagory-tree {
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
        .upload-attachment {
            display: inline-block;
            .el-upload-list__item a:hover {
                text-decoration: none;
            }
            .el-upload-list__item .el-icon-close {
                display: none;
            }
        }
        .catalog-item {
            &:not(:last-child) {
                margin-right: 1.5%;
            }
        }
        .level-tip {
            display: inline-block;
            vertical-align: top;
            position: relative;
            top: 48px;
            .triangle {
                display: inline-block;
                width: 0;
                height: 0;
                border: 5px solid transparent;
                border-right: 5px solid #eef6ff;
                vertical-align: middle;
            }
            .tip-wrapper {
                display: inline-block;
                max-width: 285px;
                padding: 4px 8px;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.38);
                line-height: 18px;
                background: #f7f8fa;
                border-radius: 2px;
                vertical-align: middle;
            }
            &.tip-S1 {
                top: 8px;
                .triangle {
                    border-right-color: #ffe9e6;
                }
                .tip-wrapper {
                    background: #ffe9e6;
                }
            }
            &.tip-S2 {
                top: 26px;
                .triangle {
                    border-right-color: #fff2e2;
                }
                .tip-wrapper {
                    background: #fff2e2;
                }
            }
            &.tip-S3 {
                .triangle {
                    border-right-color: #fff9e2;
                }
                .tip-wrapper {
                    background: #fff9e2;
                }
            }
            &.tip-S4 {
                top: 40px;
                .triangle {
                    border-right-color: #eef5ff;
                }
                .tip-wrapper {
                    background: #eef5ff;
                }
            }
            &.tip-S5 {
                .triangle {
                    border-right-color: #ededed;
                }
                .tip-wrapper {
                    background: #ededed;
                }
            }
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
    .ticket-create-title {
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: #333;
        line-height: 22px;
    }
    .create-header {
        position: fixed;
        top: 0;
        width: 100%;
        padding: 20px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.07);
        background: #fff;
        z-index: 5;
    }
    .ticket-reporter {
        float: right;
    }
    .create-content {
        // width: 660px;
        padding: 20px 30px;
        height: calc(100% - 60px);
        overflow: auto;
    }
    .create-footer {
        position: fixed;
        width: 100%;
        bottom: 0;
        padding: 14px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.07);
        background: #fff;
        z-index: 5;
        .footer-center-container {
            margin: 0 auto;
            text-align: right;
            .close-btn {
                margin-right: 8px;
            }
        }
    }
    .comment-input .ql-container {
        height: auto;
        min-height: 200px;
        max-height: 600px;
        overflow: auto;
        .ql-editor.ql-blank {
            height: 200px;
        }
        .ql-editor {
            line-height: 2;
        }
    }
    .text-button {
        display: inline-block;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #1c6cdc;
        cursor: pointer;
    }
    .mtdicon-export-o {
        font-size: 15px;
    }
    .mtdicon-question-circle-o {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.24);
    }
    .upload-form-item.mtd-form-item {
        margin-bottom: 0;
        .mtd-tooltip-rel {
            vertical-align: top;
        }
    }
    .category-assigned-search-container .category-form-item {
        width: 100%;
    }
    // .create-form .level-tip {
    //     top: 40px;
    //     &.tip-S3 {
    //         top: 54px;
    //     }
    //     .tip-wrapper {
    //         max-width: 285px;
    //     }
    // }
    .set-default-catalog {
        float: right;
    }
    .tag-item {
        margin-top: 3px;
    }
}
.assigned-popper {
    z-index: 10000 !important;
}
.assigned-popper .el-cascader-menu {
    max-height: 302px;
    padding: 4px 0;
    border-right: none;
    height: auto;
    .el-cascader-menu__item {
        color: #6f6f6f;
        padding: 9px 15px;
        &:hover {
            background-color: #edf0f7;
        }
        .el-cascader-menu__item__keyword {
            color: #fea92d;
        }
    }
    .el-cascader-menu__item--extensible::after {
        right: 3px;
    }
}
</style>
