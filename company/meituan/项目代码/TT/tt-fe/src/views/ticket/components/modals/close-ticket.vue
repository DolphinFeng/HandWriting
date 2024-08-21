<template>
    <mtd-modal
        :title="$getText('close_ticket_dialog_title', '关闭原因')"
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
                class="require"
                prop="closedReason"
                required
                :label="$getText('close_ticket_dialog_closed_reason_label', '关闭原因')">
                <mtd-select
                    v-model="formCustom.closedReason"
                    style="width: 100%;"
                    :loading="reasonLoading"
                    :filterable="true"
                    :remote="true"
                    :remote-method="remoteMethod"
                    :debounce="500"
                    :placeholder="$getText('please_enter_the_reason_for_closure', '请输入关闭原因')">
                    <mtd-dropdown-menu
                        v-if="closeReason && closeReason.length > 0"
                        style="max-height: 224px;"
                        v-infinite-scroll="loadMoreCloseReasons"
                        :infinite-scroll-disabled="noMoreReasons"
                        :infinite-scroll-delay="500"
                        :infinite-scroll-distance="10"
                        :infinite-scroll-immediate="false">
                        <mtd-option
                            v-for="(item, index) in closeReason"
                            :key="index"
                            :label="item.label"
                            :value="item.value">
                            <text-highlight :queries="[query]">{{ item.label }}</text-highlight>
                        </mtd-option>
                    </mtd-dropdown-menu>
                </mtd-select>
            </mtd-form-item>
            <mtd-form-item prop="desc" :label="$getText('close_ticket_dialog_desc_label', '描述')">
                <editor
                    ref="editor"
                    v-if="replyReady"
                    :value="formCustom.desc"
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
                    class="overflow">{{ $getText('close_ticket_dialog_desc_overflow', '输入内容过长') }}</div>
            </mtd-form-item>
            <mtd-form-item
                class="archive-item"
                :class="{ 'mtd-form-item-required' : rgPermissionMap.archiveRequire }"
                :label="$getText('close_ticket_dialog_archive_label', '问题归档')"
                prop="archiveId">
                <ticket-file-select
                    :info="info"
                    @change="archiveChange"
                    :width="332" />
            </mtd-form-item>
            <mtd-form-item
                v-if="itemPermission('moseKnowledgeStore').editable && isShowResolution"
                prop="desc"
                :label="$getText('close_ticket_dialog_mose_knowledge_store_label', '沉淀摩西知识库')"
                :label-width="120">
                <linkage-dropdown
                    :rg-id="info.rgId"
                    ref="linkage"
                    @selectChange= "linkageChange" />
            </mtd-form-item>
            <mtd-form-item
                :class="{ 'mtd-form-item-required' : rgPermissionMap.labelRequired }"
                prop="labels"
                :label="$getText('close_ticket_dialog_labels_label', '标签')">
                <change-tag
                    :tag-list="info.labels"
                    :is-detail="true"
                    :rg-id="info.rgId"
                    @change="tagChange"
                    style="display: inline-block; margin-top: 2px;" />
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button @click="close">{{ $getText('close_ticket_dialog_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                :loading="btnLoading"
                :disabled="imgUploadStatus || descOverflow"
                type="primary"
                @click="submit">{{ $getText('close_ticket_dialog_confirm_btn', '确定') }}</mtd-button>
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
import { InfiniteScroll } from 'element-ui';
import TextHighlight from 'vue-text-highlight';

Vue.use(InfiniteScroll);

interface Form {
    desc: string;
    closedReason: string;
    archiveId: number;
    labels: [];
}
const validateReason: Function = (_rule, value, callback) => {
    if (!value) {
        return callback(new Error(Vue.prototype.$getText('error_close_reason_not_empty', '关闭原因不能为空')));
    }
    return callback();
};
/**
 * 关闭TT
 *
 * @author xiaokunyu
 * @date 01/22/2010
 */
@Component({
    components: {
        editor,
        TicketFileSelect,
        ChangeTag,
        LinkageDropdown,
        TextHighlight
    }
})
export default class CloseTicket extends Vue {
    @Getter loginType;
    @Getter misX;
    @Getter rgPermissionMap;

    @Prop({ default: '' })
    id: string;
    @Prop({ default: () => {
        return {};
    } })
    info: any;
    @Prop({ default: false }) editContent: boolean;

    replyList: string[] = [];
    replyReady: boolean = false;
    reasonLoading: Boolean = false;
    currentQuery: string = '';

    show: Boolean = true;

    ruleCustom = {
        closedReason: [
            { validator: validateReason, trigger: 'blur, change' }
        ],
        archiveId: [
            { validator: this.validateArchiveId, trigger: 'blur, change' }
        ],
        labels: [
            { validator: this.validateLabel, trigger: 'blur, change' }
        ]
    };
    formCustom: Form = {
        desc: '',
        closedReason: '',
        archiveId: 0,
        labels: []
    };
    btnLoading: Boolean = false;
    closeReason: {value: string, label: string}[] = [];
    $refs: any;

    imgUploadStatus: boolean = false;

    itemPermission: Function = itemPermission;
    isShowResolution: Boolean = false;
    linkageValue: Object = {
        domain: '',
        intention: '',
        linkageInvalid: false
    };

    // Infinite Scroll Variables
    pageNum: number = 1;
    pageSize: number = 20;
    totalReasons: number = 0;
    noMoreReasons: boolean = false;
    query: string = '';

    @Watch('info.rgId', { immediate: true })
    rgIdChange (rgId: number) {
        if (rgId) {
            this.formCustom.desc = this.editContent ? this.info.closedDesc : '';
            this.formCustom.closedReason = this.editContent ? this.info.closedReason : '';
            this.replyReady = false;
            // this.initCloseReason(rgId);
            this.getRgReplyText(rgId);
            this.loadMoreCloseReasons();
            this.resetLoadState();
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

    @Watch('formCustom.closedReason')
    onReasonChanged (val) {
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_cgywh7eq_mc', { custom: { reasion: val, mis: this.misX } });
    }

    async getLabelIdsByNames (tags) {
        const res: Ajax.AxiosResponse = await api.ticketApi.getLabelIdsByNames({
            labels: tags,
            mode: 'NAME_TO_ID'
        });
        return res.data.items;
    }
    replyQuick (value: string) {
        this.$set(this.formCustom, 'desc', value);
        this.handleChange(value);
    }

    @Watch('show')
    onShowChanged (val) {
        if (val) {
            this.resetLoadState();
        }
    }

    resetLoadState () {
        this.pageNum = 1;
        this.noMoreReasons = false;
        this.closeReason = [];
    }
    close () {
        this.show = false;
        this.$emit('close');
        // 重置分页和状态变量
        this.resetLoadState();
    }
    tagChange (val) {
        this.formCustom.labels = val;
    }
    archiveChange (val) {
        const { id } = val;
        this.formCustom.archiveId = id;
    }
    // async initCloseReason (rgId) {
    //     try {
    //         const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyField({
    //             rgId: rgId,
    //             type: 'CLOSED_REASON'
    //         });
    //         let { code, data } = res;
    //         if (code === 200) {
    //             this.closeReason = data.items.map(item => {
    //                 return {
    //                     value: item.content,
    //                     label: item.displayName || item.content
    //                 };
    //             });
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    async submit () {
        if (this.btnLoading) {
            return;
        }
        this.$refs['formCustom'].validate(async (valid) => {
            if (valid && !this.linkageValue.linkageInvalid) {
                this.btnLoading = true;
                let resObj = {
                    closedReason: this.formCustom.closedReason,
                    closedDesc: this.formCustom.desc,
                    labels: this.formCustom.labels
                };
                if (!this.editContent) resObj.state = '已关闭';
                if (this.formCustom.archiveId || (this.editContent && !this.formCustom.archiveId)) {
                    resObj = Object.assign(resObj, {
                        archiveId: this.formCustom.archiveId
                    });
                }
                try {
                    await api.ticketApi.updateTicket(this.id, resObj);
                    this.$mtd.message({
                        message: this.$getText('close_ticket_dialog_tip_closed', '此条问题已关闭'),
                        type: 'info'
                    });
                    this.$emit('success');
                    if (this.linkageValue.domain !== '' && this.linkageValue.intention !== '') {
                        this.$refs.linkage.addAnswerAndGrammar(this.formCustom.desc);
                    }
                    this.close();
                } catch (e) {
                    console.log(e);
                }
                this.btnLoading = false;
            }
        }).catch(err => console.log(`validate msg: `, err));
    }
    handleImgUpload (val) {
        this.imgUploadStatus = val;
    }
    handleChange (value) {
        this.formCustom.desc = value;
    }
    async getRgReplyText (rgId) {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyText({
            rgId: rgId,
            type: 'CLOSED_DESC'
        });
        let { code, data } = res;
        if (code === 200) {
            this.replyList = data.items.map(item => item.content);
            this.replyReady = true;
        }
    }
    validateArchiveId (_rule, value, callback) {
        if (this.rgPermissionMap.archiveRequire && !value) {
            return callback(new Error(this.$getText('close_ticket_dialog_tip_no_archive', '问题归档不能为空')));
        }
        return callback();
    }
    validateLabel (_rule, value, callback) {
        if (this.rgPermissionMap.labelRequired && (!value || !value.length)) {
            return callback(new Error(this.$getText('close_ticket_dialog_no_tag', '标签不能为空')));
        }
        return callback();
    }
    get descOverflow () {
        return this.formCustom.desc?.length > 5000;
    }
    get uploadApi () {
        return this.loginType === 'PASSPORT' ? `/api/passport/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment` : `/api/tt/1.0/file/upload?ticketId=${this.ticketId}&area=comment`;
    }
    get ticketId () {
        return this.$route.query.id;
    }
    created () {
        console.log('1', this.noMoreReasons);
    }

    mounted () {
        this.getMosesSetting();
        this.$nextTick(() => {
            this.loadMoreCloseReasons();
            // this.getRgReplyText(this.info.rgId);
            console.log('Next tick, show:', this.show);
        });
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

    // select远程搜索
    async remoteMethod (query) {
        this.reasonLoading = true;
        this.pageNum = 1;
        this.noMoreReasons = false;
        this.closeReason = [];
        this.currentQuery = query || '';
        await this.searchCloseReasons(this.currentQuery);
        this.reasonLoading = false;
    }

    // 滚动加载
    async loadMoreCloseReasons () {
        if (this.noMoreReasons) return;
        await this.searchCloseReasons(this.currentQuery);
    }

    // 查询关闭原因
    async searchCloseReasons (query) {
        this.query = query;
        try {
            const res = await api.ctiApi.getCloseReasonList({
                rgId: this.info.rgId,
                type: 'CLOSED_REASON',
                content: query,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            });

            const { items, tn } = res.data;
            const mappedItems = items.map(item => ({
                value: item.content,
                label: item.displayName || item.content
            }));

            this.closeReason = [...this.closeReason, ...mappedItems];
            this.totalReasons = tn;
            this.pageNum += 1;

            if (this.closeReason.length >= tn) {
                this.noMoreReasons = true;
            }
        } catch (error) {
            console.error('Failed to load close reasons:', error);
        }
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