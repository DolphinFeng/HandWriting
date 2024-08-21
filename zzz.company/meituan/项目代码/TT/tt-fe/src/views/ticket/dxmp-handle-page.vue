<template>
    <div style="background: #f6f6f6;">
        <div class="dxmp-handle" v-if="isPermission">
            <div v-if="showDisabledHint" class="error-hint">
                <i class="mtdicon mtdicon-error-circle" />
                <h2>{{ $getText('dxmp_handle_error_title', '操作失败') }}</h2>
                <span>{{ $getText('dxmp_handle_error_message', '对于该工单，您没有“处理完成”的操作权限。') }}</span>
            </div>
            <div v-else>
                <div class="header">{{ $getText(titleMap[type]) }}</div>
                <mtd-form
                    label-position="top"
                    :rules="ruleCustom"
                    ref="formCustom"
                    :model="formVal">
                    <mtd-form-item
                        :label="`${$getText(formSetting.select)}：`"
                        prop="select"
                        v-if="formSetting.select">
                        <mtd-select
                            v-model="formVal.select"
                            style="width: 100%;"
                            popper-class="select-popper-class">
                            <mtd-option
                                v-for="(value, index) in selectOpt"
                                :key="index"
                                :label="value"
                                :value="value" />
                        </mtd-select>
                    </mtd-form-item>
                    <mtd-form-item
                        :label="`${$getText(formSetting.text)}：`"
                        prop="text"
                        v-if="formSetting.text">
                        <mtd-textarea
                            rows="3"
                            maxlength="5000"
                            :placeholder="$getText('dxmp_handle_textarea_placeholder', '请输入')"
                            style="width: 100%;"
                            v-model="formVal.text" />
                    </mtd-form-item>
                    <mtd-form-item
                        :label="`${$getText(formSetting.archive)}：`"
                        prop="archive"
                        class="archive-item"
                        :class="{ 'mtd-form-item-required' : rgPermissionMap.archiveRequire }"
                        v-if="formSetting.archive && rgPermissionMap.archive">
                        <ticket-file-select
                            @change="archiveChange"
                            @search="handleSearch"
                            :popper-class="popperClass"
                            :info="ticketDetail" />
                    </mtd-form-item>
                    <mtd-form-item
                        :label="`${$getText(formSetting.label)}：`"
                        prop="labels"
                        class="label-item"
                        :class="{ 'mtd-form-item-required' : rgPermissionMap.labelRequired }"
                        v-if="formSetting.label">
                        <mtd-select
                            v-model="formVal.labels"
                            multiple
                            clearable
                            filterable
                            style="width: 100%;"
                            :placeholder="$getText('dxmp_handle_textarea_placeholder', '请输入')"
                            popper-class="label-popper-class"
                            icon="mtdicon"
                            :disabled="!rgPermissionMap.label"
                            :remote="true"
                            :remote-method="searchLabel">
                            <mtd-option
                                v-for="item in labelList"
                                :key="item.id"
                                :label="item.name"
                                :value="item.name" />
                        </mtd-select>
                    </mtd-form-item>
                </mtd-form>
            </div>
            <div
                class="bottom-btn">
                <mtd-button
                    v-if="!showDisabledHint"
                    @click="cancel">
                    {{ $getText('dxmp_handle_cancel_btn', '取消') }}
                </mtd-button>
                <mtd-button
                    type="primary"
                    :class="{'close-btn': showDisabledHint}"
                    :loading="btnLoading"
                    @click="submitOrClose">
                    {{ showDisabledHint ? $getText('dxmp_handle_know_btn', '知道了') : $getText('dxmp_handle_confirm_btn', '确定') }}
                </mtd-button>
            </div>
        </div>
        <ticket-blank v-else />
    </div>
</template>

<script lang='ts'>
import { Vue, Component, Watch } from 'vue-property-decorator';
import Client from '@xm/dxopen-client';
import { STATE_TITLE_MAP, STATE_FORM_ITEM } from '@/config/map.conf';
import * as api from '@/api';
import TicketFileSelect from './components/ticket-file-select.vue';
import { Mutation, Getter } from 'vuex-class';
import { itemPermission } from '@/utils/tools';
import TicketBlank from '@/views/ticket/components/ticket-blank.vue';

@Component({
    components: {
        TicketFileSelect,
        TicketBlank
    }
})
export default class DxmpHandle extends Vue {
    @Getter rgPermissionMap;
    @Mutation setRgPermissionMap;
    @Mutation setDetailPermission;
    // 侧边栏SDK相关
    dxmp: CommonTypes.mapObject = {};
    client: CommonTypes.mapObject = {};
    titleMap: CommonTypes.mapObject = STATE_TITLE_MAP;
    formVal: CommonTypes.mapObject = {};
    selectOpt: CommonTypes.mapObject = {};
    ticketDetail: CommonTypes.mapObject = {};
    isPermission: boolean = true;
    labelLoading: boolean = false;
    labelQuery: string = '';
    btnLoading: boolean = false;
    labelList: CommonTypes.mapObject[] = [];
    itemPermission: Function = itemPermission;
    popperClass: string = '';
    ruleCustom = {
        select: [
            { validator: this.validateSelect, trigger: 'blur, change', required: true }
        ],
        archive: [
            { validator: this.validateArchive, trigger: 'blur, change' }
        ],
        labels: [
            { validator: this.validateLabel, trigger: 'blur, change' }
        ],
        text: [
            { validator: this.validateText, trigger: 'blur, change' }
        ]
    };
    $refs: any;
    @Watch('ticketId', { immediate: true })
    async onTicketChanged () {
        if (this.ticketId) {
            await this.getTicketDetail();
        }
    }
    validateArchive (_rule, value, callback) {
        if (this.rgPermissionMap.archiveRequire && !value) {
            return callback(new Error(this.$getText('dxmp_handle_archive_required', '问题归档不能为空')));
        }
        return callback();
    }
    validateLabel (_rule, value, callback) {
        if (this.rgPermissionMap.labelRequired && (!value || !value.length)) {
            return callback(new Error(this.$getText('dxmp_handle_label_required', '标签不能为空')));
        }
        return callback();
    }
    validateSelect (_rule, value, callback) {
        if (this.formSetting.select && !value) {
            return callback(new Error(`${this.$getText(this.formSetting.select)}${this.$getText('dxmp_handle_tip_no_empty', '不能为空')}`));
        }
        return callback();
    }
    validateText (_rule, value, callback) {
        if (this.type === 'done' && !value) {
            return callback(new Error(this.$getText('dxmp_handle_text_required', '处理方案不能为空')));
        }
        return callback();
    }
    get ticketId () {
        return this.$route.query.id;
    }
    get type () {
        return this.$route.query.type;
    }
    get rgId () {
        return this.ticketDetail.rgId;
    }
    get formSetting () {
        return STATE_FORM_ITEM[this.type as string] || {};
    }
    get showDisabledHint () {
        return !itemPermission(`${this.type}Ticket`).editable;
    }
    checkType () {
        return this.type === 'done';
    }
    created () {
        this.clientPostMessage();
    }
    mounted () {
        this.handleDxStyle();
    }
    cancel () {
        if (window.history.length <= 1) {
            if (this.dxmp && typeof(this.dxmp.close) === 'function') this.dxmp.close();
        } else {
            this.$router.go(-1);
        }
    }
    submitOrClose () {
        if (this.showDisabledHint) {
            if (this.dxmp && typeof(this.dxmp.close) === 'function') this.dxmp.close();
        } else {
            this.submit();
        }
    }
    submit () {
        this.btnLoading = true;
        this.$refs['formCustom'].validate(async (valid) => {
            if (valid) {
                let resObj: any = {};
                switch (this.type) {
                    case 'close':
                        resObj = {
                            state: '已关闭',
                            closedReason: this.formVal.select,
                            closedDesc: this.formVal.text,
                            labelNames: this.formVal.labels
                        };
                        break;
                    case 'done':
                        resObj = {
                            state: '已解决',
                            resolution: this.formVal.text,
                            labelNames: this.formVal.labels
                        };
                        break;
                    case 'pause':
                        resObj = {
                            state: '暂停中',
                            pendingReason: this.formVal.text || this.formVal.select
                        };
                        break;
                    case 'retry':
                        resObj = {
                            state: '重新打开',
                            reopenReason: this.formVal.text
                        };
                        break;
                    default:
                        break;
                }
                if (this.formVal.archive) {
                    resObj = Object.assign(resObj, {
                        archiveId: this.formVal.archive
                    });
                }
                const res = await api.ticketApi.updateTicket(Number(this.ticketId), resObj);
                const { code, data } = res;
                if (data && code === 200) {
                    this.btnLoading = false;
                    this.$mtd.message.success(this.$getText('dxmp_handle_submit_success', '提交成功'));
                    this.$router.push({
                        name: 'dxmp-detail',
                        query: {
                            id: this.ticketId
                        }
                    }).catch(e => e);
                }
            }
        }).catch(err => {
            this.btnLoading = false;
            console.log(`validate msg: `, err);
        });
    }
    clientPostMessage () {
        try {
            this.client = new Client({
                id: 'OPEN_PLATFORM_trouble_tracker'
            });
            this.dxmp = this.client.mp;
            // this.dxmp.openDevTools();
            this.dxmp?.setNavButtons({
                config: [
                    {
                        entry: 'forward',
                        enable: true
                    }
                ]
            });
        } catch (error) {
            console.log(error);
        }
    }
    handleSearch (val) {
        this.popperClass = val ? 'search-class' : '';
    }
    async getTicketDetail () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getTicketDetail(Number(this.ticketId));
        let { data } = res;
        if (data.errorCode && data.errorCode === 401) {
            this.isPermission = false;
        } else {
            await this.ticketDetailPermissions();
            this.ticketDetail = data;
            // 关闭/暂停原因需要查询RG组设置
            if (this.type === 'close' || this.type === 'pause') {
                this.initReasons();
            } else if (this.type === 'done') {
                this.ruleCustom.text.push({ required: true });
            }
            this.getDetailOperatePermission();
            // done 和 close 时，需要回显标签和问题归档
            if (this.type === 'done' || this.type === 'close') {
                this.$set(this.formVal, 'archive', this.ticketDetail.archiveId || 0);
                this.$set(this.formVal, 'labels', this.ticketDetail.labels || []);
            }
            console.log('detail', data, this.formVal);
        }
    }
    async ticketDetailPermissions () {
        if (!this.ticketId) return;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.ticketDetailPermissions(Number(this.ticketId));
            let { code, data } = res;
            console.log('per', data);
            if (code === 200) {
                this.setDetailPermission(data);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async initReasons () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgReplyField({
            rgId: Number(this.rgId),
            type: this.type === 'close' ? 'CLOSED_REASON' : 'PENDING_REASON'
        });
        let { code, data } = res;
        if (code === 200) {
            this.selectOpt = data.items.map(item => item.content);
        }
    }
    async getDetailOperatePermission () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getDetailOperatePermission({
            rgId: this.rgId
        });
        let { code, data } = res;
        if (code === 200) {
            this.setRgPermissionMap(data);
        }
    }
    archiveChange (val) {
        const { id } = val;
        if (!id) this.popperClass = '';
        this.formVal.archive = id;
    }
    async searchLabel (query: string) {
        this.labelLoading = true;
        this.labelQuery = query;
        if (query.trim().length < 1) {
            this.labelList = [];
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.searchTicketTags({
                name: query
            });
            this.labelList = res.data.items;
        } catch (e) {
            this.labelList = [];
            console.log(e);
        }
        this.labelLoading = false;
    }
    // 大象中发起页面的宽度处理
    handleDxStyle () {
        let html = document.getElementsByTagName('html')[0];
        let body = document.getElementsByTagName('body')[0];
        html.style.minWidth = '0px';
        body.style.minWidth = '0px';
    }
}
</script>

<style lang='scss'>
.dxmp-handle {
    padding: 20px 24px 56px 24px;
    width: auto;
    background: #fff;
    border-radius: 12px 12px 0 0;
    .error-hint {
        margin-top: 72px;
        text-align: center;
        .mtdicon-error-circle {
            color: #ff4a47;
            font-size: 40px;
        }
        h2 {
            font-weight: 500;
            opacity: 0.9;
            font-family: PingFangSC-Medium;
            font-size: 20px;
            color: #000;
            text-align: center;
            line-height: 28px;
            margin-top: 12px;
            margin-bottom: 8px;
        }
        span {
            font-weight: 400;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.7);
            letter-spacing: 0;
            line-height: 22px;
        }
    }
    .header {
        font-weight: 500;
        opacity: 0.9;
        font-family: PingFangSC-Medium;
        font-size: 20px;
        color: #000;
        line-height: 28px;
        margin-bottom: 20px;
    }
    .mtd-form {
        .mtd-form-item-label {
            margin-bottom: 4px;
        }
        .mtd-form-item-label {
            position: relative;
            &::before {
                position: absolute;
                left: -10px;
            }
        }
        .label-item {
            .mtd-input-suffix-inner {
                width: 32px;
                line-height: 32px;
                font-size: 16px;
            }
            .mtd-select-search-field {
                margin-left: 4px;
            }
            .mtd-select-tags {
                max-height: 94px;
                overflow: auto;
            }
        }
        .archive-item {
            .mtd-cascader {
                width: 100%;
            }
        }
        .mtd-select-multiple-focus {
            border-color: #ffc300;
        }
    }
    .bottom-btn {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 56px;
        box-shadow: inset 0 1px 0 0 rgba(0, 0, 0, 0.06);
        background: #fff;
        padding: 12px 12px;
        display: flex;
        justify-content: space-between;
        z-index: 9;
        .mtd-btn {
            flex: 1 1 50%;
            font-weight: 500;
            margin: 0 4px;
            font-family: PingFangSC-Medium;
            border-radius: 6px;
            border: none;
            background: rgba(0, 0, 0, 0.06);
            color: rgba(0, 0, 0, 0.84);
            &.mtd-btn-primary {
                background: #ffc300;
            }
            &.close-btn {
                flex: 1 1 auto;
            }
        }
    }
}
.label-popper-class,
.select-popper-class {
    width: 300px;
}
.mtd-cascader-popper {
    max-width: 300px;
    overflow-x: scroll;
    &::-webkit-scrollbar {
        height: 6px !important;
    }
    &::-webkit-scrollbar-thumb {
        border-radius: 3px !important;
    }
    .mtd-cascader-menu {
        min-width: 100px;
        max-width: 150px;
    }
}
.search-class {
    max-width: 300px;
    overflow-x: scroll;
    .mtd-cascader-menu {
        min-width: 300px;
        max-width: none;
    }
    .mtd-cascader-menu-loading {
        width: 300px !important;
    }
}
.ticket-blank-container {
    width: 100%;
    height: 100%;
    position: static;
    padding-top: 72px;
    background: #fff;
    .info-contanier {
        text-align: center;
        position: static;
        transform: none;
        padding: 0 20px;
        img {
            width: 118px;
            height: 118px;
        }
    }
}
</style>
