<template>
    <mtd-tabs v-model="activeName">
        <mtd-tab-pane label="工单属性设置" value="ticket_setting">
            <div class="setting-container">
                <mtd-form
                    :model="formCustom"
                    :label-width="165"
                    ref="formCustom"
                    :rules="rules"
                    class="setting-form">
                    <h3>工单暂停设置</h3>
                    <mtd-form-item label="是否启用暂停时间" prop="pendingTimeSwitch">
                        <mtd-switch
                            v-model="formCustom.pendingTimeSwitch"
                            @change="pendingTimeSwitchChange"
                            size="small" />
                    </mtd-form-item>
                    <mtd-form-item
                        v-if="formCustom.pendingTimeSwitch"
                        label="暂停原因："
                        prop="pendingReasons">
                        <div class="tag-container">
                            <mtd-tooltip
                                v-for="tag in formCustom.pendingReasons.slice(0, 10)"
                                :key="tag"
                                :content="tag"
                                placement="top">
                                <mtd-tag
                                    :key="tag"
                                    theme="gray"
                                    type="pure">{{ tag }}
                                </mtd-tag>
                            </mtd-tooltip>
                            <mtd-button
                                style="padding: 0;"
                                icon="mtdicon mtdicon-file-add-o"
                                type="text"
                                @click="navToReplyFiled">配置</mtd-button>
                        </div>
                    </mtd-form-item>
                    <h3>抄送人设置</h3>
                    <mtd-form-item label="是否设置TT默认抄送人" prop="defaultCc">
                        <mtd-switch
                            v-model="formCustom.defaultCc"
                            @change="ccSwitchChange"
                            size="small" />
                        <div class="open-tip" v-if="formCustom.defaultCc"><div class="triangle" /><div class="tip-wrapper">指向该RG下的TT默认抄送给以下人员</div></div>
                    </mtd-form-item>
                    <mtd-form-item
                        v-if="formCustom.defaultCc"
                        label="默认抄送人"
                        prop="defaultCcList">
                        <mtd-tag
                            v-for="(user, index) in formCustom.defaultCcList"
                            :key="user.username"
                            theme="gray"
                            type="unbordered"
                            closeable
                            @close="removeTag(index)">{{ `${user.displayName}(${user.username})` }}
                        </mtd-tag>
                        <div class="add-button" @click="addDialog"><i class="iconfont icon-add" /> 添加</div>
                    </mtd-form-item>
                    <h3>保密设置</h3>
                    <mtd-form-item label="是否设置TT默认保密" prop="defaultPrivate">
                        <mtd-switch
                            v-model="formCustom.defaultPrivate"
                            @change="authSwitchChange"
                            size="small" />
                        <div class="open-tip" v-if="formCustom.defaultPrivate"><div class="triangle" /><div class="tip-wrapper">开启后，发送到当前RG组绑定目录下的TT会自动变为保密状态</div></div>
                    </mtd-form-item>
                    <mtd-form-item label="仅允许管理员查看RG组非本人处理的保密工单" prop="defaultAdminOnly">
                        <mtd-switch
                            v-model="formCustom.defaultAdminOnly"
                            @change="adminSwitchChange"
                            size="small" />
                    </mtd-form-item>
                    <h3>邮件转TT设置</h3>
                    <mtd-form-item label="是否设置邮件转TT" prop="mailSwitch">
                        <mtd-switch
                            v-model="formCustom.mailSwitch"
                            @change="mailSwitchChange"
                            size="small" />
                        <div class="open-tip" v-if="formCustom.mailSwitch"><div class="triangle" /><div class="tip-wrapper">发送至该邮箱的新邮件将自动转入TT</div></div>
                    </mtd-form-item>
                    <div v-if="formCustom.mailSwitch">
                        <mtd-form-item label="邮箱" prop="mailAddress">
                            <mtd-input
                                style="width: 300px;"
                                v-model="formCustom.mailAddress"
                                placeholder="请输入邮箱地址"
                                @blur="submitMailInfo" />
                        </mtd-form-item>
                        <div class="mail-tip">这里的邮箱需要是一个邮件组，并将 it_tt.prod@meituan.com 添加至该邮件组中</div>
                        <mtd-form-item label="三级目录id" prop="mailItemId">
                            <mtd-input
                                style="width: 100px;"
                                v-model="formCustom.mailItemId"
                                placeholder="请输入三级目录id"
                                @blur="submitMailInfo" />
                        </mtd-form-item>
                        <div class="mail-tip">设定TT将被发送至指定的目录</div>
                    </div>
                    <h3>重新打开分单设置</h3>
                    <mtd-form-item label="工单重新打开后是否重新分配给当前值班人员" prop="reopenAssignToOnCallSwitch">
                        <mtd-switch
                            v-model="formCustom.reopenAssignToOnCallSwitch"
                            @change="reopenSwitchChange"
                            size="small" />
                    </mtd-form-item>
                    <h3>工单流转设置</h3>
                    <mtd-form-item label="流转给相同RG组下的目录时，是否设置默认处理人为当前处理人" prop="keepAssignedIfInRgTransfer">
                        <mtd-switch
                            v-model="formCustom.keepAssignedIfInRgTransfer"
                            @change="(val) => submitSettingChange({ keepAssignedIfInRgTransfer: val ? true : false })"
                            size="small" />
                    </mtd-form-item>
                    <div v-if="showCustomStatus">
                        <h3>自定义状态设置</h3>
                        <mtd-form-item label="是否开启自定义状态" prop="defaultCustomStatusSwitch">
                            <mtd-switch
                                v-model="formCustom.defaultCustomStatusSwitch"
                                @change="stateSwitchChange"
                                size="small" />
                            <div class="open-tip" v-if="formCustom.defaultCustomStatusSwitch"><div class="triangle" /></div>
                        </mtd-form-item>
                        <div v-if="formCustom.defaultCustomStatusSwitch">
                            <div :class="['reply-field-edit-container', { 'common-reply-container': isReply }]">
                                <Container @drop="onDropEvent" drag-handle-selector=".icon-handle">
                                    <Draggable v-for="(replyItem, index) in relayContentList" :key="index">
                                        <div class="reply-item-wrapper">
                                            <i class="iconfont icon-handle" />
                                            {{ replyItem && replyItem.content }}
                                            <div class="edit-buttons">
                                                <i class="mtdicon mtdicon-edit-o" @click="editContent(replyItem)" />
                                                <i class="mtdicon mtdicon-delete-o" @click="deleteContent(replyItem)" />
                                            </div>
                                        </div>
                                    </Draggable>
                                </Container>
                                <div>
                                    <mtd-button
                                        icon="mtdicon mtdicon-file-add-o"
                                        type="text"
                                        :disabled="relayContentList.length >= 5"
                                        @click="addReplyItem">添加</mtd-button>
                                    <span>{{ '最多可设置5个' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3>发起人所在地址信息设置</h3>
                    <mtd-form-item label="是否显示发起人地址" prop="defaultSiteCodeSwitch">
                        <mtd-switch
                            v-model="formCustom.defaultSiteCodeSwitch"
                            @change="siteCodeChange"
                            size="small" />
                    </mtd-form-item>
                </mtd-form>
            </div>
        </mtd-tab-pane>
        <mtd-tab-pane label="权限设置" value="permission_setting">
            <div class="setting-container">
                <h3>RG组绑定目录美团员工发起授权：
                    <edit-save
                        :editable.sync="insideEditable"
                        @save="save('inside')"
                        @cancel="cancel('inside')" />
                </h3>
                <div class="inside-auth">
                    <mtd-radio-group v-model="permissionForm.authActive" :disabled="!insideEditable">
                        <mtd-radio :value="false">无限制</mtd-radio>
                        <mtd-radio :value="true">指定部门</mtd-radio>
                    </mtd-radio-group>
                    <div class="auth-content" v-show="permissionForm.authActive && insideEditable">
                        <mtd-select
                            v-model="permissionForm.authOrgInfoList"
                            :loading="searchLoading"
                            filterable
                            remote
                            auto-clear-query
                            multiple
                            :debounce="200"
                            :remote-method="searchOrg"
                            value-key="orgId"
                            placeholder="可从大象个人名片中查找完整部门链，部门链至少三级(如：美团/基础研发平台/研发质量及效率部)"
                            :formatter="formatter"
                            style="width: 280px;">
                            <mtd-option-group
                                style="width: 380px;"
                                class="auth-org-option">
                                <mtd-option
                                    v-for="org in orgDetailList"
                                    :key="org.orgId"
                                    :label="org.orgPath"
                                    :value="org"
                                    :disabled="org.disabled" />
                            </mtd-option-group>
                        </mtd-select>
                    </div>
                    <div class="auth-list" v-show="permissionForm.authActive && !insideEditable && permissionForm.authOrgInfoList && permissionForm.authOrgInfoList.length > 0">
                        <span
                            v-for="item of permissionForm.authOrgInfoList"
                            :key="item.orgId">{{ item.orgName }}</span>
                    </div>
                </div>
                <h3>操作流转时可见RG组绑定目录的美团员工范围：<mtd-tooltip
                    content="配置完成后，仅选中组织架构的用户在操作流转时可以看到当前RG组绑定的目录，建议指定部门范围包含发起时的部门"
                    placement="top">
                    <i class="mtdicon mtdicon-question-circle-o" />
                </mtd-tooltip>
                    <edit-save
                        :editable.sync="transferEditable"
                        @save="save('transfer')"
                        @cancel="cancel('transfer')" />
                </h3>
                <div class="inside-auth">
                    <mtd-radio-group v-model="permissionForm.transferAuthActive" :disabled="!transferEditable">
                        <mtd-radio :value="false">无限制</mtd-radio>
                        <mtd-radio :value="true">指定部门</mtd-radio>
                    </mtd-radio-group>
                    <div class="auth-content" v-show="permissionForm.transferAuthActive && transferEditable">
                        <mtd-select
                            v-model="permissionForm.transferAuthOrgInfoList"
                            :loading="searchLoading"
                            filterable
                            remote
                            auto-clear-query
                            multiple
                            :debounce="200"
                            :remote-method="searchOrg"
                            value-key="orgId"
                            placeholder="可从大象个人名片中查找完整部门链，部门链至少三级(如：美团/基础研发平台/研发质量及效率部)"
                            :formatter="formatter"
                            style="width: 280px;">
                            <mtd-option-group
                                style="width: 380px;"
                                class="auth-org-option">
                                <mtd-option
                                    v-for="org in orgDetailList"
                                    :key="org.orgId"
                                    :label="org.orgPath"
                                    :value="org"
                                    :disabled="org.disabled" />
                            </mtd-option-group>
                        </mtd-select>
                    </div>
                    <div class="auth-list" v-show="permissionForm.transferAuthActive && !transferEditable && permissionForm.transferAuthOrgInfoList && permissionForm.transferAuthOrgInfoList.length > 0">
                        <span
                            v-for="item of permissionForm.transferAuthOrgInfoList"
                            :key="item.orgId">{{ item.orgName }}</span>
                    </div>
                </div>
                <h3>RG组绑定目录外部账号发起&流转授权：
                    <edit-save
                        :editable.sync="editable"
                        @cancel="agentCancel"
                        @save="agentSave" />
                </h3>
                <div class="tenant-permission">
                    <p
                        class="tenant"
                        :key="index"
                        v-for="(tenant, index) in tenantList">
                        <span class="tenant-name">{{ tenant }}: </span>
                        <span v-if="editable && agentUsersMap.length">
                            <mtd-checkbox
                                v-for="(account, accountIndex) in agentUsersMap[index]['list']"
                                :key="accountIndex"
                                v-model="account.active">
                                {{ account.tenantName }}
                            </mtd-checkbox>
                        </span>
                        <span v-if="!editable && agentUsersMap.length">
                            {{ filterActiveAccount(agentUsersMap[index]['list']) }}
                        </span>
                    </p>
                </div>
                <h3 v-if="showDetailEditor" class="detail-auth-panel">详情页面按钮配置（RG成员中暂不包含协作成员）
                    <edit-save
                        class="detail-auth-edit"
                        :editable.sync="detailAuthEditable"
                        @cancel="detailAuthCancel"
                        @save="detailAuthSave" />
                </h3>
                <mtd-table
                    :data="detailAuthData"
                    v-if="showDetailEditor"
                    class="detail-auth-select">
                    <mtd-table-column
                        v-for="(item, index) in detailAuthColumnData"
                        :key="index"
                        :prop="item.prop"
                        :label="item.label"
                        align="center"
                        width="180">
                        <template slot-scope="scope">
                            <span v-if="index === 0">{{ scope.row.module }}</span>
                            <mtd-radio
                                v-if="index !== 0"
                                :checked="scope.row[item.prop]"
                                :disabled="!detailAuthEditable"
                                @input="detailAuthchanged(scope.$index, item.prop,)" />
                        </template>
                    </mtd-table-column>
                </mtd-table>
                <add-default-cc
                    v-if="addDefaultVisible"
                    @close="addDefaultVisible = false"
                    @success="getDefaultSetting"
                    :default-cc-list="formCustom.defaultCcList" />
            </div>
        </mtd-tab-pane>
    </mtd-tabs>

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Form } from '@ss/mtd-vue';
import AddDefaultCc from './components/add-default-cc.vue';
import EditSave from './components/edit-save.vue';
import * as api from '@/api';
import { State } from 'vuex-class';
import { TenantList } from '@/config/map.conf';
import { cloneDeep, parseInt } from 'lodash';
import { Container, Draggable } from 'vue-smooth-dnd';
import { applyDrag } from '@/utils/helpers';
import eventBus from '@/utils/event-bus';
const defaultOption = [
    {
        orgId: 0,
        orgPath: '可从大象个人名片中查找完整部门链，部门链至少三级(如：美团/基础研发平台/研发质量及效率部)',
        disabled: true,
        orgName: ''
    }
];
/**
 * rg模板列表
 *
 * @author liyuyao
 * @date 07/22/2019
 */
@Component({
    components: {
        AddDefaultCc,
        EditSave,
        Container,
        Draggable
    }
})

export default class RgSetting extends Vue {
    @Prop({ default: 'PENDING_REASON' })
    type: string;
    @Prop({ default: false })
    isReply: boolean;

    showCustomStatus: boolean;
    relayContentList: CommonTypes.replyItem[] = [];

    @State(state => state.cti.permission.rg_setting)
    permission: boolean;

    @State(state => state.cti.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    @Watch('permissionForm.authOrgInfoList')
    authOrgInfoListHandler (val) {
        this.orgDetailList = val;
    }
    activeName: string = 'ticket_setting';
    SETTING_ENUMS = {
        name: '标题',
        desc: '描述',
        createOnes: '转Ones',
        createItsm: '转千寻',
        createChatRoom: '创建大象群',
        circulation: '流转',
        createCase: '转Case',
        sla: '工单等级',
        cloneTicket: '克隆TT',
        ticketType: '类型'
    };

    detailAuthColumnData: any = [{
        prop: 'module',
        label: ''
    }, {
        prop: 'all',
        label: '全员可操作'
    }, {
        prop: 'rg_and_cc',
        label: '仅RG成员+抄送人可操作'
    }, {
        prop: 'rg',
        label: '仅RG成员可操作'
    }, {
        prop: 'none',
        label: '任何人不可操作'
    }];

    detailAuthData: any = [
        {
            module: '标题',
            value: 'name',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '描述',
            value: 'desc',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '工单等级',
            value: 'sla',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '创建大象群',
            value: 'createChatRoom',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '流转',
            value: 'circulation',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '转Ones',
            value: 'createOnes',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '转千寻',
            value: 'createItsm',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '转Case',
            value: 'createCase',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '克隆TT',
            value: 'cloneTicket',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '类型',
            value: 'ticketType',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '重新打开',
            value: 'reopen',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '关闭TT',
            value: 'closeTicket',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '处理完成',
            value: 'doneTicket',
            all: true,
            rg_and_cc: false,
            rg: false,
            none: false
        }, {
            module: '修改解决方案',
            value: 'resolution',
            all: false,
            rg_and_cc: false,
            rg: false,
            none: true
        }, {
            module: '修改关闭原因',
            value: 'closedReason',
            all: false,
            rg_and_cc: false,
            rg: false,
            none: true
        }
    ];
    formCustom: any = {
        defaultCc: false,
        defaultCcList: [],
        defaultPrivate: false,
        defaultAdminOnly: false,
        mailSwitch: false,
        mailAddress: '',
        mailItemId: 0,
        reopenAssignToOnCallSwitch: false,
        keepAssignedIfInRgTransfer: false,
        defaultCustomStatusSwitch: false,
        pendingTimeSwitch: false,
        pendingReasons: [],
        defaultSiteCodeSwitch: false
    };
    permissionForm: any = {
        authActive: true,
        authOrgIds: [],
        authOrgInfoList: [],
        transferAuthActive: true,
        transferOrgIds: [],
        transferAuthOrgInfoList: [],
    };
    oldPermissionForm: any = {};
    originInfo: any = {};
    originAgent: any = {};
    originDetailAuth: any = JSON.parse(JSON.stringify(this.detailAuthData));

    addDefaultVisible: boolean = false;
    showDetailEditor: boolean = true;
    originCcList: any = [];

    agentUsersMap: CommonTypes.mapObject = [];
    tenantList: string[] = TenantList;

    editable: boolean = false;
    insideEditable: boolean = false;
    transferEditable: boolean = false;
    detailAuthEditable: boolean = false;
    searchLoading: boolean = false;
    orgDetailList: any = defaultOption;
    $refs: { formCustom: Form };

    rules = {
        mailAddress: [{
            validator: (_rule, value, cb) => {
                const reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
                if (!value) {
                    // FIXME: 触发 callback(literal) 报错
                    // see: https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-callback-literal.md
                    return cb(new Error('请输入邮箱地址'));
                } else if (!reg.test(value)) {
                    return cb(new Error('请输入合法的邮箱地址'));
                } else {
                    return cb();
                }
            },
            trigger: 'blur, hange'
        }],
        mailItemId: [{
            validator: (_rule, value, cb) => {
                if (!value) {
                    return cb(new Error('请输入三级目录id'));
                } else if (isNaN(value)) {
                    return cb(new Error('请输入合法的三级目录id'));
                } else {
                    return cb();
                }
            },
            trigger: 'blur, change'
        }]
    };
    mounted () {
        this.getDefaultSetting();
        this.getTenantAgent();
        this.getPermissionSetting();
        this.getRgReplyField();
    }

    get limitText () {
        return this.isReply ? 500 : 10;
    }

    get apiName () {
        return this.isReply ? 'Text' : 'Field';
    }

    async getRgReplyField () {
        const res = await api.rgApi[`getRgReply${this.apiName}`]({
            type: 'CUSTOM_STATUS',
            rgId: this.rgId
        });
        this.relayContentList = res.data.items;
    }

    onDropEvent (dropResult) {
        this.relayContentList = applyDrag(this.relayContentList, dropResult);
        const ids = this.relayContentList.map(item => item.id);
        this.sortContent(ids);
    }

    async sortContent (ids) {
        const res = await api.rgApi.sortFields({
            orderIds: ids,
            rgId: this.rgId,
            type: 'CUSTOM_STATUS'
        });
        const { code } = res;
        if (code === 200) {
            this.$mtd.message('操作成功！');
            this.getRgReplyField();
        }
    }

    deleteContent (replyItem) {
        const { id } = replyItem;
        // if (!this.isReply && this.relayContentList.length <= 1) {
        //     this.$mtd.message.error('至少要保留一个字段');
        //     return;
        // }
        this.$mtd.confirm({
            title: '删除选项',
            showCancelButton: true,
            type: 'error',
            message: `确定要删除选项“${replyItem.content}”吗？`,
            onOk: async () => {
                const res = await api.rgApi[`deleteReply${this.apiName}`](id, {
                    rgId: this.rgId
                });
                const { code } = res;
                if (code === 200) {
                    this.relayContentList = this.relayContentList.filter(item => item.id !== id); // 手动移除删除的项
                    this.getRgReplyField();
                    this.$mtd.message.success('操作成功');
                }
            }
        }).catch(e => e);
    }

    addReplyItem () {
        this.$mtd.confirm({
            title: '添加选项',
            message: this.isReply ? '<textarea id="reply-edit-item" class="mtd-textarea" />' : '<input id="reply-edit-item" class="mtd-input" />',
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            onOk: async () => {
                const content = (document.getElementById('reply-edit-item') as HTMLInputElement).value;
                if (content.length && content.length <= this.limitText) {
                    const res = await api.rgApi[`addReply${this.apiName}`]({
                        content: content,
                        rgId: this.rgId,
                        type: 'CUSTOM_STATUS'
                    });
                    const { code } = res;
                    if (code === 200) {
                        this.$mtd.message.success('操作成功');
                        this.getRgReplyField();
                    }
                } else {
                    this.$mtd.message.error(`选项内容限${this.limitText}字`);
                }
            }
        }).catch(e => e);
    }

    editContent (replyItem) {
        const { id } = replyItem;
        this.$mtd.confirm({
            title: '编辑选项',
            message: this.isReply ? `<textarea id="reply-edit-item" class="mtd-textarea">${replyItem.content}</textarea>` : `<input id="reply-edit-item" class="mtd-input" value="${replyItem.content}" />`,
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            onOk: async () => {
                const textareaElement = document.getElementById('reply-edit-item') as HTMLTextAreaElement;
                const content = textareaElement.value;
                if (content.length && content.length <= this.limitText) {
                    const res = await api.rgApi[`editReply${this.apiName}`]({
                        id: id,
                        content: content,
                        type: 'CUSTOM_STATUS',
                        rgId: this.rgId
                    });
                    const { code } = res;
                    if (code === 200) {
                        this.getRgReplyField();
                        this.$mtd.message.success('操作成功');
                    }
                } else {
                    this.$mtd.message.error(`选项内容限${this.limitText}字`);
                }
            }
        }).catch(e => e);
    }

    addDialog () {
        this.addDefaultVisible = true;
    }
    cancel (param: string) {
        if (param === 'inside') {
            this.permissionForm.authOrgInfoList = this.oldPermissionForm.authOrgInfoList;
            this.permissionForm.authActive = this.oldPermissionForm.authActive;
            this.insideEditable = false;
        } else if (param === 'transfer') {
            this.permissionForm.transferAuthOrgInfoList = this.oldPermissionForm.transferAuthOrgInfoList;
            this.permissionForm.transferAuthActive = this.oldPermissionForm.transferAuthActive;
            this.transferEditable = false;
        }
    }
    save (param: string) {
        this.editPermissionSetting(param);
        if (param === 'inside') {
            this.insideEditable = false;
        } else if (param === 'transfer') {
            this.transferEditable = false;
        }
    }
    async getDefaultSetting () {
        const res = await api.rgApi.getRgSetting(this.rgId);
        const detailRes = await api.rgApi.getDetailEditAuth(this.rgId);

        const { code, data } = res;

        if (code === 200) {
            this.originInfo = data;
            this.formCustom.defaultCcList = this.formatToArr(data.userMap);
            this.formCustom.defaultPrivate = data.auth === 'private';
            this.formCustom.defaultCc = data.ccSwitch === 'on';
            this.formCustom.mailSwitch = data.mailSwitch === 'on';
            this.formCustom.reopenAssignToOnCallSwitch = data.reopenAssignToOnCallSwitch === 'on';
            this.formCustom.mailAddress = data.mailAddress || '';
            this.formCustom.mailItemId = data.mailItemId || 0;
            this.formCustom.defaultAdminOnly = !!data.adminOnly;
            this.formCustom.keepAssignedIfInRgTransfer = !!data.keepAssignedIfInRgTransfer;
            this.showCustomStatus = data.customStatusSwitch !== 'null';
            this.formCustom.pendingTimeSwitch = data.pendingTimeSwitch || false;
            this.formCustom.pendingReasons = data.pendingReasons || [];
            this.formCustom.defaultSiteCodeSwitch = data.siteCodeSwitch === 'on';
            if (this.showCustomStatus) {
                this.formCustom.defaultCustomStatusSwitch = data.customStatusSwitch === 'on';
            }
        }

        const { code: detailCode, data: { settingMap } = {} } = detailRes;
        if (detailCode === 200 && settingMap) {
            const newData = this.detailAuthData.map(data => {
                const authKey = (settingMap[data.value] || 'ALL').toLowerCase();
                data[authKey] = true;
                ['all', 'rg_and_cc', 'rg', 'none'].filter(item => authKey !== item).forEach(item => data[item] = false);
                return data;
            });
            this.detailAuthData = newData;
            this.originDetailAuth = JSON.parse(JSON.stringify(newData));
        }
        // 如果是超级管理员，则不判断管理员，否则会 toast 无权限
        if (this.userInfo.sysAdmin) {
            this.showDetailEditor = true;
            return;
        }
        const rgRole = await api.rgApi.getRgRole(this.rgId);
        const { code: rgCode, data: { role } = {} } = rgRole;
        if (rgCode === 200 && role === 'RGADMIN') {
            this.showDetailEditor = true;
        }
    }
    formatToArr (obj) {
        const result = [];
        for (const key in obj) {
            result.push({
                username: key,
                displayName: obj[key]
            });
        }
        return result;
    }
    removeTag (index) {
        this.formCustom.defaultCcList.splice(index, 1);
        this.submitSettingChange({
            users: this.formCustom.defaultCcList.map((user) => {
                return user.username;
            })
        });
    }
    pendingTimeSwitchChange (val) {
        this.submitSettingChange({ pendingTimeSwitch: val });
    }
    ccSwitchChange (val) {
        this.submitSettingChange({ ccSwitch: val ? 'on' : 'off' });
    }
    authSwitchChange (auth) {
        this.submitSettingChange({ auth: auth ? 'private' : 'public' });
    }
    adminSwitchChange (val) {
        this.submitSettingChange({ adminOnly: val });
    }
    mailSwitchChange (val) {
        if (!val) {
            this.submitSettingChange({ mailSwitch: 'off' });
        } else {
            this.submitMailInfo();
        }
    }
    stateSwitchChange (val) {
        this.submitSettingChange({ customStatusSwitch: val ? 'on' : 'off' });
    }
    submitMailInfo () {
        this.$refs.formCustom.validate((valid) => {
            if (valid && this.formCustom.mailAddress && this.formCustom.mailItemId && ((this.formCustom.mailAddress !== this.originInfo.mailAddress) || (this.formCustom.mailSwitch !== (this.originInfo.mailSwitch === 'on')) || (this.formCustom.mailItemId !== this.originInfo.mailItemId))) {
                this.submitSettingChange({
                    mailSwitch: this.formCustom.mailSwitch ? 'on' : 'off',
                    mailAddress: this.formCustom.mailAddress,
                    mailItemId: this.formCustom.mailItemId
                });
            }
        }).catch(e => e);
    }
    reopenSwitchChange (val) {
        this.submitSettingChange({ reopenAssignToOnCallSwitch: val ? 'on' : 'off' });
    }
    siteCodeChange (val) {
        this.submitSettingChange({ siteCodeSwitch: val ? 'on' : 'off' });
    }

    async submitSettingChange (params) {
        params.rgId = this.rgId;
        try {
            const res = await api.rgApi.sendRgSetting(params);
            const { code, data } = res;
            if (code === 200) {
                this.$mtd.message.success('修改成功');
                this.originInfo = data;
                if (this.originInfo.pendingReasons) {
                    this.formCustom.pendingReasons = this.originInfo.pendingReasons;
                }
            }
        } catch (e) {
            this.$mtd.message.error(`修改失败，原因：${e}`);
        }
    }
    async getTenantAgent () {
        const res = await api.rgApi.getTenantAgent(this.rgId);
        const { code, data } = res;
        if (code === 200) {
            this.agentUsersMap = TenantList.map((tenant: string) => {
                return {
                    tenant: tenant,
                    list: data.items.filter((account) => {
                        return account.tenantType === tenant;
                    })
                };
            });
            this.originAgent = JSON.parse(JSON.stringify(this.agentUsersMap));
        }
    }
    agentSave () {
        this.$mtd.confirm({
            title: '注意',
            message: '确定要授权该服务组对应的所有服务目录对该类账号可见吗？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: async () => {
                const params = this.formatAgentParams();
                const res = await api.rgApi.tenantModify(params);
                const { code } = res;
                if (code === 200) {
                    this.$mtd.message.success('修改成功');
                }
                this.editable = false;
            }
        }).catch(e => e);
    }
    detailAuthchanged (index, authProp) {
        const oldData = this.detailAuthData;
        oldData[index][authProp] = true;
        ['all', 'rg_and_cc', 'rg', 'none'].filter(item => authProp !== item).forEach(item => oldData[index][item] = false);
        this.detailAuthData = oldData;
    }
    async detailAuthSave () {
        const newData = this.detailAuthData;
        const oldData = this.originDetailAuth;
        const changeData = newData.map((item, index) => {
            let value = 'all';
            const hasChanged = ['all', 'rg_and_cc', 'rg', 'none'].filter(key => item[key]).some(key => {
                value = key;
                return !oldData[index][key];
            });
            return hasChanged ? {
                rgId: this.rgId,
                type: newData[index].value,
                value: value.toUpperCase()
            } : false;
        }).filter(Boolean);
        Promise.all(changeData.map(api.rgApi.sendDetailEditAuth)).then(resultArray => {
            const isOK = resultArray.every((res: any) => res.code === 200);
            if (isOK) {
                this.$mtd.message.success('修改成功');
            } else {
                this.$mtd.message.error('修改失败');
            }
            this.detailAuthEditable = false;
            this.originDetailAuth = JSON.parse(JSON.stringify(newData));
        }).catch(e => {
            this.$mtd.message.error(`修改失败，原因：${e}`);
            this.detailAuthEditable = false;
        });
    }
    formatAgentParams () {
        let result = [];
        this.agentUsersMap.forEach((agent) => {
            const accounts = agent.list.map((account) => {
                return {
                    action: account.active ? 'ADD' : 'DELETE',
                    rgId: this.rgId,
                    tenant: account.tenant
                };
            });
            result = result.concat(accounts);
        });
        return result;
    }
    filterActiveAccount (list) {
        const result = [];
        list.forEach((account) => {
            if (account.active === true) {
                result.push(account.tenantName);
            }
        });
        return result.length ? result.join('，') : '无';
    }
    agentCancel () {
        this.agentUsersMap = JSON.parse(JSON.stringify(this.originAgent));
    }
    detailAuthCancel () {
        this.detailAuthData = JSON.parse(JSON.stringify(this.originDetailAuth));
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
    formatter (val) {
        if (val.value) {
            return `${val.value.orgName}`;
        }
    }
    async searchOrg (query) {
        if (query.length < 1) {
            this.orgDetailList = defaultOption;
            return;
        }
        this.searchLoading = true;
        try {
            const res = await api.ctiApi.orgDetailByPath(encodeURIComponent(query));
            const { data } = res;
            if (data) {
                this.orgDetailList = [data];
            } else {
                this.orgDetailList = [];
            }
        } catch (e) {
            console.log(e);
        }
        this.searchLoading = false;
    }
    async getPermissionSetting () {
        try {
            const res = await api.rgApi.getRgCtiPermission(this.rgId);
            const { code, data } = res;
            if (code === 200) {
                this.permissionForm = { ...data };
                this.oldPermissionForm = cloneDeep(this.permissionForm);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async editPermissionSetting (param: string) {
        let requestParam: any = {};
        if (param === 'inside') {
            if (this.permissionForm.authActive) {
                if (this.permissionForm.authOrgInfoList.length > 0) {
                    this.permissionForm.authOrgIds = this.permissionForm.authOrgInfoList.map(item => {
                        return item.orgId;
                    });
                } else {
                    this.permissionForm.authActive = false;
                }
            } else {
                this.permissionForm.authOrgInfoList = [];
            }
            requestParam = {
                rgId: this.rgId,
                authActive: this.permissionForm.authActive,
                authOrgInfoList: this.permissionForm.authOrgInfoList
            };
        } else if (param === 'transfer') {
            if (this.permissionForm.transferAuthActive) {
                if (this.permissionForm.transferAuthOrgInfoList.length > 0) {
                    this.permissionForm.authOrgIds = this.permissionForm.transferAuthOrgInfoList.map(item => {
                        return item.orgId;
                    });
                } else {
                    this.permissionForm.transferAuthActive = false;
                }
            } else {
                this.permissionForm.transferAuthOrgInfoList = [];
            }
            requestParam = {
                rgId: this.rgId,
                transferAuthActive: this.permissionForm.transferAuthActive,
                transferAuthOrgInfoList: this.permissionForm.transferAuthOrgInfoList
            };
        }
        try {
            const res = await api.rgApi.editRgCtiPermission(this.rgId, requestParam);
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success('保存成功');
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 点击配置跳转到常用回复页
     * 通过eventBus改变tab的active
    */
    navToReplyFiled () {
        this.$router.push({
            name: 'rg_reply',
            query: {
                rgId: this.rgId
            }
        }).then(() => {
            eventBus.$emit('changeTabActive', 'rg_reply');
        }).catch(e => e);
    }
}
</script>

<style lang="postcss">
.setting-container {
    position: relative;
    margin-top: 8px;
    max-width: 1200px;
    padding-left: 15px;
    .setting-form {
        .mtd-form-item {
            margin-bottom: 8px;
        }
        .mtd-switch-small {
            vertical-align: middle;
        }
        .add-button {
            display: inline-block;
            color: #FF8800;
            cursor: pointer;
            .icon-add {
                font-size: 12px;
            }
        }
        .mtd-tag {
            margin-right: 8px;
            color: rgba(0, 0, 0, 0.87);
            border-color: #F7F7F7;
            background-color: #F7F7F7;
            margin-left: 0;
            .mtd-tag-close {
                color: rgba(147, 157, 178, 0.5);
            }
            .mtd-tag-content {
                font-size: 13px;
                color: rgba(0, 0, 0, 0.87);
            }
        }
    }
    .open-tip {
        display: inline-block;
        .triangle {
            display: inline-block;
            width: 0;
            height: 0;
            border: 5px solid transparent;
            border-right: 5px solid #EEF6FF;
            vertical-align: middle;
            border-right-color: #EEF6FF;
        }
        .tip-wrapper {
            padding: 0 6px;
            display: inline-block;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.38);
            line-height: 28px;
            background: #EEF6FF;
        }
    }
    .mail-tip {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.38);
        line-height: 1;
        margin-left: 165px;
        margin-bottom: 15px;
    }
    h3 {
        font-family: PingFangSC-Semibold;
        margin-bottom: 5px;
        .mtd-btn {
            float: right;
        }
        .mtd-tooltip-rel {
            vertical-align: middle;
        }
    }
    .tenant-permission {
        margin-left: 10px;
        p {
            line-height: 32px;
            color: rgba(0, 0, 0, 0.6);
        }
        .tenant-name {
            display: inline-block;
            width: 100px;
        }
    }
    .inside-auth {
        margin-left: 10px;
        margin-bottom: 10px;
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
        .auth-content {
            margin-top: 5px;
        }
    }
    .detail-auth-panel {
        margin-top: 14px;
    }
    .detail-auth-edit {
        display: inline-block;
        vertical-align: bottom;
        margin-left: 28px;
        float: right;
    }
}
</style>
