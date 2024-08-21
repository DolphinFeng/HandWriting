<template>
    <mtd-modal
        :title="title"
        class="edit-group-robot-modal common-modal"
        width="600px"
        @close="close"
        v-model="showModal">
        <mtd-form
            :model="settingDetail"
            :rules="ruleCustom"
            class="group-setting-form"
            ref="robotSettingForm"
            :label-width="100">
            <div class="subtitle">TT生成触发条件</div>
            <mtd-form-item
                required
                label="选择大象群"
                prop="dxGroupId">
                <mtd-select
                    filterable
                    remote
                    @change="onGroupChanged"
                    :remote-method="searchMyXmGroupList"
                    v-model="settingDetail.dxGroupId"
                    popper-class="xm-group-select-options"
                    placeholder="请选择你想借助TT机器人生成TT的大象群"
                    style="width: 100%;">
                    <mtd-option
                        class="xm-group-item"
                        v-for="item in xmGroupOptions"
                        :key="item.xmGroupId"
                        :value="item.xmGroupId"
                        :label="item.name">
                        <div class="group-with-avatar">
                            <img
                                class="group-avatar"
                                :src="item.avatarUrl"
                                alt="群聊">
                            <div class="group-info">
                                <p class="group-name">{{ item.name }}</p>
                                <p class="secondary-text">{{ item.xmGroupDesc || item.name }}</p>
                            </div>
                        </div>
                    </mtd-option>
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                required
                label="关键词"
                prop="keywords"
                helper="当所选大象群内用户所发消息包含触发关键词，TT机器人将自动生成TT">
                <mtd-select
                    multiple
                    @change="onKeywordchanged"
                    :filterable="true"
                    :allow-create="true"
                    v-model="settingDetail.keywords"
                    style="width: 100%;">
                    <mtd-option
                        v-for="item in keywordList"
                        :key="item.value"
                        :value="item.value"
                        :disabled="item.disabled"
                        :label="item.label" />
                    <template v-slot:tag="scope">
                        <mtd-tooltip :content="scope.option.label">
                            <mtd-tag
                                theme=""
                                :closable="scope.closable"
                                @close="scope.onClose">{{ scope.option.label }}</mtd-tag>
                        </mtd-tooltip>
                    </template>
                </mtd-select>
            </mtd-form-item>
            <div class="subtitle">TT生成规则设置</div>
            <mtd-form-item
                label="TT关联目录"
                prop="relatedItemId"
                required>
                <mtd-select
                    :filterable="true"
                    v-model="settingDetail.relatedItemId"
                    style="width: 100%;">
                    <mtd-option
                        v-for="item in catalogList"
                        :key="item.itemId"
                        :value="item.itemId"
                        :label="`${item.categoryName}/${item.typeName}/${item.itemName}`" />
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item
                label="TT生成范围"
                required
                prop="listenerRangeType">
                <mtd-radio-group v-model="settingDetail.listenerRangeType">
                    <mtd-radio value="single">单条大象消息<mtd-tooltip
                        size="small"
                        placement="top"
                        content="仅将包含关键词的这一条会话生成TT">
                        <i class="mtdicon mtdicon-question-circle-o" />
                    </mtd-tooltip></mtd-radio>
                    <mtd-radio value="multiPre">多条大象消息<mtd-tooltip
                        placement="top"
                        size="small"
                        content="将包含关键词的会话及之前的内容生成TT">
                        <i class="mtdicon mtdicon-question-circle-o" />
                    </mtd-tooltip></mtd-radio>
                </mtd-radio-group>
                <div class="scope-input-wrapper" v-if="settingDetail.listenerRangeType === 'multiPre'">前序<mtd-input-number
                    v-model="settingDetail.minute"
                    :min="1"
                    :max="10"
                    :precision="0"
                    size="small" />分钟会话生成TT<mtd-tooltip
                        placement="top"
                        size="small"
                        content="后续会话将统一更新至描述，直至第一次关键词发送时间超过设定时间">
                        <i class="mtdicon mtdicon-question-circle-o" />
                    </mtd-tooltip></div>
            </mtd-form-item>
            <div class="subtitle">大象群生成TT消息通知<mtd-switch
                class="group-message-switch"
                v-model="settingDetail.enableGroupReply"
                size="small" /></div>
            <mtd-form-item
                v-if="settingDetail.enableGroupReply"
                label="消息描述"
                prop="groupReplyContent"
                required>
                <mtd-textarea
                    v-model="settingDetail.groupReplyContent"
                    rows="3"
                    style="width: 450px;" />
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="close">取消</mtd-button>
            <mtd-button
                class="tt-pure-btn"
                :loading="btnLoading"
                type="primary"
                @click="submit">确认</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { cloneDeep } from 'lodash';
const validateGroup: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择大象群'));
    }
    return callback();
};
const validateCti: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请选择TT关联目录'));
    }
    return callback();
};
const validateMessage: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error('请输入消息描述'));
    }
    return callback();
};
@Component({
    components: {}
})
export default class EditGroupRobotModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop()
    data: CommonTypes.mapObject;

    showModal: boolean = false;
    btnLoading: boolean = false;
    isGroupChanged: boolean = false;
    defaultKeyword: string = '@TT';
    catalogList: CommonTypes.RgUserItem[] = [];
    relatedCtiList: CommonTypes.mapObject[] = [];
    keywordList: CommonTypes.mapObject[] = [];
    settingDetail: CommonTypes.mapObject = {};
    xmGroupOptions: Array<CommonTypes.XmGroup> = [];
    recentXmGroupOptions: Array<CommonTypes.XmGroup> = [];
    ruleCustom = {
        dxGroupId: [
            { validator: validateGroup, trigger: 'blur', required: true }
        ],
        relatedItemId: [
            { validator: validateCti, trigger: 'blur', required: true }
        ],
        groupReplyContent: [
            { validator: validateMessage, trigger: 'blur', required: true }
        ]
    };
    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    @Watch('data', { immediate: true, deep: true })
    onDataChanged () {
        if (this.data.id) {
            this.settingDetail = cloneDeep(this.data);
            this.formatKeywordList(this.settingDetail.keywords);
        } else {
            this.settingDetail = {
                keywords: [this.defaultKeyword],
                minute: 1,
                groupReplyContent: 'TT创建成功！请耐心等待值班同学解答您的问题~',
                enableGroupReply: true,
                listenerRangeType: 'single'
            };
            this.keywordList = [{
                label: this.defaultKeyword,
                value: this.defaultKeyword,
                closable: false,
                disabled: true
            }];
        }
    }
    created () {
        this.getRecentXmGroupList();
        this.getCtiByRgUnfold();
    }
    formatKeywordList (value) {
        this.keywordList = value.map(item => {
            return {
                label: item,
                value: item,
                closable: item !== this.defaultKeyword,
                disabled: item === this.defaultKeyword
            };
        });
    }
    onKeywordchanged (value) {
        this.formatKeywordList(value);
    }
    onGroupChanged () {
        this.isGroupChanged = true;
    }
    close () {
        this.$emit('update:visible', false);
    }

    submit () {
        (this.$refs.robotSettingForm as any).validate(async (valid) => {
            if (valid) {
                this.editGroup();
            }
        });
    }
    async searchMyXmGroupList (query: string) {
        if (!query) {
            return;
        }
        const res = await api.rgApi.searchXmGroupByKeyword(query);
        const { code, data } = res;
        if (code === 200 && Array.isArray(data.items)) {
            const dxGroupId = [
                ...this.checkedXmGroupOptions.map(item => item.xmGroupId),
                ...data.items.map(item => item.xmGroupId)
            ];
            const computedOptions = [
                ...this.checkedXmGroupOptions,
                ...data.items
            ].filter((item, index) => {
                return dxGroupId.indexOf(item.xmGroupId) === index;
            });
            this.xmGroupOptions = computedOptions;
        }
    }
    async getRecentXmGroupList () {
        const res = await api.rgApi.getRecentXmGroupList();
        if (res.code === 200) {
            // NOTE: 合并已选中的群聊 和 最近群聊，去重后展示出来
            const dxGroupId = [...this.checkedXmGroupOptions.map(item => item.xmGroupId), ...res.data.items.map(item => item.xmGroupId)];
            this.recentXmGroupOptions = res.data.items;
            this.xmGroupOptions = [...this.checkedXmGroupOptions, ...res.data.items].filter((item, index) => {
                return dxGroupId.indexOf(item.xmGroupId) === index;
            });
        }
    }
    async getCtiByRgUnfold () {
        // 直接展示所有数据，不考虑分页
        try {
            const res = await api.rgApi.getCtiByRgUnfold({
                cn: 1,
                sn: 999,
                rgId: this.rgId
            });
            const { code, data } = res;
            if (code === 200) {
                this.catalogList = data.items || [];
            }
        } catch (e) {
            console.log(e);
        }
    }
    async editGroup () {
        this.btnLoading = true;
        const apiName = this.settingDetail.id ? 'update' : 'create';
        try {
            const res = await api.rgApi[`${apiName}DxGroupListener`]({
                id: apiName === 'update' ? this.settingDetail.id : null,
                dxGroupId: this.settingDetail.dxGroupId,
                keywords: this.settingDetail.keywords,
                listenerRangeType: this.settingDetail.listenerRangeType,
                enableGroupReply: this.settingDetail.enableGroupReply,
                groupReplyContent: this.settingDetail.groupReplyContent,
                relatedItemId: this.settingDetail.relatedItemId,
                settingStatus: this.settingDetail.id ? this.settingDetail.settingStatus : 1,
                rgId: this.rgId,
                features: {
                    multiPre: this.settingDetail.minute.toString()
                }
            });
            const { code } = res;
            if (code === 200) {
                this.btnLoading = false;
                const idEdit = !!this.settingDetail.id;
                this.$emit('success', this.settingDetail.dxGroupId, idEdit ? this.isGroupChanged : true);
                this.$mtd.message.success(this.data.dxGroupId ? '编辑成功！' : '创建成功！');
            }
        } catch (error) {
            this.btnLoading = false;
        }
    }
    get checkedXmGroupOptions () {
        return this.xmGroupOptions.filter(item => this.settingDetail.dxGroupId === item.xmGroupId);
    }
    get title () {
        return this.data.dxGroupId ? '编辑群配置' : '新增群配置';
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>
<style lang="postcss" scoped>
.edit-group-robot-modal {
    /deep/.mtd-modal-header {
        border: none;
    }
    .group-setting-form {
        .subtitle {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 22px;
            .group-message-switch {
                position: absolute;
                right: 24px;
            }
        }
        .scope-input-wrapper {
            line-height: 22px;
            margin-top: 6px;
            .mtd-input-number-wrapper {
                height: 22px;
                width: 75px;
                margin: 0 4px;
            }
        }
        .mtdicon-question-circle-o {
            color: rgba(0, 0, 0, 0.36);
            margin-left: 2px;
        }
    }
}
</style>
