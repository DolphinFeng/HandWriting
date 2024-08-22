<template>
    <mtd-modal
        :title="$getText('complete_ticket_handle_ticket_dialog_title', '完成问题处理')"
        class="handle-ticket-dialog form-dialog"
        :mask-closable="false"
        width="500px"
        @close="close"
        v-model="show">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :label-width="120"
            :rules="ruleCustom"
            v-loading="!replyReady">
            <mtd-form-item
                prop="resolution"
                required
                :label="$getText('complete_ticket_handle_ticket_dialog_resolution_label', '处理方案')">
                <editor
                    v-if="replyReady"
                    ref="editor"
                    :value="formCustom.resolution"
                    :action="uploadApi"
                    :reply-list="replyList"
                    @input="handleChange"
                    @imgUpload="handleImgUpload"
                    @reply-quick="replyQuick">
                    <div slot="toolbar">
                        <slot name="toolbar" />
                    </div>
                </editor>
                <div
                    v-if="descOverflow"
                    class="overflow">{{ $getText('complete_ticket_handle_ticket_dialog_input_overflow', '输入内容过长') }}</div>
                <mtd-checkbox
                    style="margin-top: 8px; line-height: 18px;"
                    v-if="showDisbandGroup"
                    v-model="cancelGroup">{{ $getText('complete_ticket_handle_ticket_dialog_disband_group_checkbox', '是否解散问题处理群聊') }}</mtd-checkbox>
            </mtd-form-item>
            <mtd-form-item
                class="archive-item"
                :class="{ 'mtd-form-item-required' : rgPermissionMap.archiveRequire }"
                :label="$getText('complete_ticket_handle_ticket_dialog_archive_label', '问题归档')"
                prop="archiveId">
                <ticket-file-select
                    :info="info"
                    @change="archiveChange"
                    :width="332" />
            </mtd-form-item>
            <mtd-form-item
                v-if="itemPermission('moseKnowledgeStore').editable && isShowResolution"
                prop="desc"
                :label="$getText('complete_ticket_handle_ticket_dialog_mose_knowledge_store_label', '沉淀摩西知识库')"
                :label-width="120">
                <linkage-dropdown
                    :rg-id="info.rgId"
                    ref="linkage"
                    @selectChange= "linkageChange" />
            </mtd-form-item>
            <mtd-form-item
                :class="{ 'mtd-form-item-required' : rgPermissionMap.labelRequired }"
                prop="labels"
                :label="$getText('complete_ticket_handle_ticket_dialog_labels_label', '标签')">
                <change-tag
                    :tag-list="info.labels"
                    :is-detail="true"
                    :rg-id="info.rgId"
                    @change="tagChange"
                    style="display: inline-block;" />
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close">{{ $getText('complete_ticket_handle_ticket_dialog_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                :loading="btnLoading || imgUploadStatus"
                type="primary"
                :disabled="imgUploadStatus || descOverflow"
                @click="submit">{{ $getText('complete_ticket_handle_ticket_dialog_confirm_btn', '确定') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as api from '../../../../api/index';
import editor from '@/components/quill-editor.vue';
import ChangeTag from '@/components/change-tag.vue';
import TicketFileSelect from '../ticket-file-select.vue';
import LinkageDropdown from '@/components/linkage-dropdown.vue';
import { itemPermission } from '@/utils/tools';
import eventBus from '@/utils/event-bus';

interface Form {
    resolution: string;
    archiveId: number;
    labels: [];
}
const validateResolution: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(Vue.prototype.$getText('error_solve_method_not_empty', '处理方案不能为空')));
    }
    return callback();
};
/**
 * 完成ticket
 *
 * @author xiaokunyu
 * @date 01/22/2010
 */
@Component({
    components: {
        editor,
        TicketFileSelect,
        ChangeTag,
        LinkageDropdown
    }
})
export default class CompleteTicket extends Vue {
    @Prop({ default: '' })
    id: string;

    @Prop({ default: () => {
        return {};
    } })
    info: any;
    @Prop({ default: false }) editContent: boolean;
    @Prop() isTicket: boolean;

    @Getter chatId;
    @Getter loginType;
    @Getter rgPermissionMap;

    show: Boolean = true;
    ruleCustom = {
        resolution: [
            { validator: validateResolution, trigger: 'blur, change' }
        ],
        archiveId: [
            { validator: this.validateArchiveId, trigger: 'blur, change' }
        ],
        labels: [
            { validator: this.validateLabel, trigger: 'blur, change' }
        ]
    };
    formCustom: Form = {
        resolution: '',
        archiveId: 0,
        labels: []
    };
    btnLoading: Boolean = false;
    $refs: any;

    cancelGroup: boolean = false;
    imgUploadStatus: boolean = false;
    replyList: string[] = [];
    replyReady: boolean = false;
    itemPermission: Function = itemPermission;
    isShowResolution: Boolean = false;
    linkageValue: Object = {
        domain: '',
        intention: '',
        linkageInvalid: false
    };

    @Watch('info.rgId', { immediate: true })
    rgIdChange (rgId: number) {
        if (rgId) {
            this.formCustom.resolution = this.editContent ? this.info.resolution : '';
            this.replyReady = false;
            this.getRgReplyText(rgId);
            this.showDisbandGroup && this.getDefaultDisbandSetting(rgId);
        }
    }

    @Watch('info.archiveId', { immediate: true })
    archiveIdChange (archiveId) {
        if (!archiveId || archiveId !== '0') this.formCustom.archiveId = archiveId;
    }

    @Watch('info.labels', { immediate: true })
    async labelsChange (labels) {
        if (labels) {
            this.formCustom.labels = await this.getLabelIdsByNames(labels) || [];
        }
    }

    async getLabelIdsByNames (tags) {
        const res: Ajax.AxiosResponse = await api.ticketApi.getLabelIdsByNames({
            labels: tags,
            mode: 'NAME_TO_ID'
        });
        return res.data.items;
    }

    async getRgReplyText (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyText({
            rgId: rgId,
            type: 'RESOLUTION'
        });
        let { code, data } = res;
        if (code === 200) {
            this.replyList = data.items.map(item => item.content);
            this.replyReady = true;
        }
    }
    async getDefaultDisbandSetting (rgId) {
        const res: Ajax.AxiosResponse = await api.ticketApi.getDefaultGroupDisbandSetting(rgId);
        let { code, data } = res;
        if (code === 200) {
            this.cancelGroup = !!data;
        }
    }
    close () {
        this.show = false;
        this.$emit('close');
    }
    tagChange (val) {
        this.formCustom.labels = val;
        this.$refs['formCustom'].validateField('labels');
    }
    archiveChange (val) {
        const { id } = val;
        this.formCustom.archiveId = id;
    }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.$refs['formCustom'].validate(async (valid) => {
            if (valid && !this.linkageValue.linkageInvalid) {
                this.btnLoading = true;
                let resObj = {
                    resolution: this.formCustom.resolution,
                    labels: this.formCustom.labels
                };
                if (!this.editContent) resObj.state = '已解决';
                if (this.formCustom.archiveId) {
                    resObj = Object.assign(resObj, {
                        archiveId: this.formCustom.archiveId
                    });
                }
                try {
                    await api.ticketApi.updateTicket(this.id, {
                        ...resObj,
                        disbandGroupId: this.cancelGroup ? this.chatId : null
                    });
                    this.$mtd.message({
                        message: this.$getText('complete_ticket_tip_solved', '此条问题已解决'),
                        type: 'success'
                    });
                    this.$emit('success');
                    if (this.linkageValue.domain !== '' && this.linkageValue.intention !== '') {
                        this.$refs.linkage.addAnswerAndGrammar(this.formCustom.resolution);
                    }
                    this.close();
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            }
        }).catch(err => console.log(`validate msg: `, err));
    }
    async cancalGroupChat () {
        const res = this.isTicket ? await api.ticketApi.cancelChatRoom({
            roomId: this.chatId,
            ticketId: parseInt(this.id, 10)
        }) : await api.chatApi.disbandGroup(this.chatId);
        const { data, code } = res;
        if (data && code === 200) {
            this.$mtd.message({
                type: 'success',
                message: this.$getText('complete_ticket_tip_disbanded', '当前群聊已解散！')
            });
            eventBus.$emit('groupCancel');
        } else {
            this.$mtd.message({
                type: 'error',
                message: this.$getText('complete_ticket_tip_disbanded_fail', '解散群失败')
            });
        }
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    handleChange (value) {
        this.formCustom.resolution = value;
    }
    replyQuick (value: string) {
        this.$set(this.formCustom, 'resolution', value);
        this.handleChange(value);
    }
    validateArchiveId (_rule, value, callback) {
        if (this.rgPermissionMap.archiveRequire && !value) {
            return callback(new Error(this.$getText('complete_ticket_error_no_archive', '问题归档不能为空')));
        }
        return callback();
    }
    validateLabel (_rule, value, callback) {
        if (this.rgPermissionMap.labelRequired && (!value || !value.length)) {
            return callback(new Error(this.$getText('complete_ticket_error_no_tag', '标签不能为空')));
        }
        return callback();
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment`;
    }
    get ticketId () {
        return this.$route.query.id;
    }
    get descOverflow () {
        return this.formCustom.resolution?.length > 5000;
    }
    get showDisbandGroup () {
        return itemPermission('createChatRoom').editable && (this.chatId > 0);
    }

    mounted () {
        this.getMosesSetting();
    }

    async getMosesSetting () {
        try {
            const res = await api.ctiApi.getMosesSetting(this.info.rgId);
            const { code, data } = res;
            if (code === 200) {
                if (data.active) {
                    this.isShowResolution = data.resolutionKnowledgeBaseSwitch || false;
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    linkageChange (val: Object) {
        console.log('linkage', val);
        this.linkageValue = val;
    }
}
</script>
<style lang="scss">
.handle-ticket-dialog {
    .archive-item {
        .recommend-archive-wrapper {
            margin-top: 14px;
            line-height: 18px;
        }
        .mtd-form-item-error-tip {
            position: absolute;
            top: 30px;
        }
    }
    .mtd-form-item-required.archive-item {
        margin-bottom: 16px;
    }
}
</style>