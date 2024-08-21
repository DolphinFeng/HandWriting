<template>
    <div class="ticket-info-container">
        <div
            class="info-main"
            ref="info"
            :style="'min-height:' + minHeight + 'px'">
            <div>
                <div class="info-content main-content">
                    <h3>{{ $getText('ticket_info_initiator', '发起人') }}</h3>
                    <div class="import-info">
                        <div class="import-info-header">
                            <mtd-tooltip
                                style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden; display: inline-block;"
                                placement="top"
                                theme="dark"
                                size="small"
                                :disabled="!(inside && info.org)">
                                <div
                                    slot="content"
                                    v-html="reporterInfo" />
                                <span>
                                    <img
                                        class="header-img-container"
                                        :src="reporterDetail && reporterDetail['avatar'] || defaultAvatar"
                                        :alt="$getText('ticket_info_avatar', '头像')"
                                        v-if="inside">
                                    <span
                                        class="img-text"
                                        v-clipboard="copyText(info.reporter || '')"
                                        @success="handleCopySuccess">
                                        {{ reporterDetail.i18nDisplayName ? (inside ? `${reporterDetail.i18nDisplayName}/${reporterDetail.mis}` : reporterDetail.i18nDisplayName) : (reporterDetail.displayName ? `${reporterDetail.displayName}/${reporterDetail.mis}` : reporterDetail.mis) }} 
                                        <span class="quit-tag" v-if="reporterDetail.jobStatus === 16">{{ $getText('ticket_info_resigned', '离职') }}</span>
                                        <span class="out-tag" v-if="Object.keys(reporterDetail).length && (reporterDetail.isExternalUser)">{{ $getText('ticket_info_outside', '外部') }}</span>
                                    </span>
                                </span>
                            </mtd-tooltip>
                            <mtd-tooltip
                                v-if="siteCodeSwitch && (reporterDetail.siteCode || reporterDetail.buildingName || reporterDetail.address)"
                                style="padding-left: 5px;"
                                popper-class="site-tooltip"
                                theme="light"
                                placement="top">
                                <template #content>
                                    <div class="info-container">
                                        <div class="info-container-item">
                                            <span class="custom-text">Site Code：</span>
                                            <span class="fixed-width-text">
                                                {{ reporterDetail.siteCode }}
                                                <mtd-tooltip 
                                                    :content="$getText('copy_copy', '复制')"
                                                    placement="top">
                                                    <span class="copy-container">
                                                        <img
                                                            src="@/assets/img/copy.png"
                                                            class="copy-o"
                                                            v-clipboard="copyText(reporterDetail.siteCode || '')"
                                                            @success="handleCopySuccess">
                                                    </span>
                                                </mtd-tooltip>
                                            </span>
                                        </div>
                                        <div class="info-container-item">
                                            <span class="label">{{ $getText('office_building_name', '办公楼名') }}：</span>
                                            <span class="fixed-width-text">
                                                {{ reporterDetail.buildingName }}
                                                <mtd-tooltip 
                                                    :content="$getText('copy_copy', '复制')"
                                                    placement="top">
                                                    <span class="copy-container">
                                                        <img
                                                            src="@/assets/img/copy.png"
                                                            class="copy-o"
                                                            v-clipboard="copyText(reporterDetail.buildingName || '')"
                                                            @success="handleCopySuccess">
                                                    </span>
                                                </mtd-tooltip>
                                            </span>
                                        </div>
                                        <div class="info-container-item">
                                            <span class="label">{{ $getText('office_address', '办公地址') }}：</span>
                                            <span class="fixed-width-text">
                                                {{ reporterDetail.address }}
                                                <mtd-tooltip 
                                                    :content="$getText('copy_copy', '复制')"
                                                    placement="top">
                                                    <span class="copy-container">
                                                        <img
                                                            src="@/assets/img/copy.png"
                                                            class="copy-o"
                                                            v-clipboard="copyText(reporterDetail.address || '')"
                                                            @success="handleCopySuccess">
                                                    </span>
                                                </mtd-tooltip>
                                            </span>
                                        </div>
                                    </div>
                                </template>
                                <span style="margin-right: 10px; cursor: pointer; vertical-align: middle;">
                                    <img
                                        src="@/assets/img/home.png"
                                        class="home-icon">
                                </span>
                            </mtd-tooltip>
                        </div>
                        <div class="org-info" v-if="inside && info.org">{{ formatOrg(this.info.org, false) }}</div>
                    </div>
                    <h3>{{ $getText('ticket_info_assigned', '处理人') }}</h3>
                    <div 
                        class="import-info">
                        <!-- <user-avatar
                            :username="`${assignedDetail.i18nDisplayName}/${assignedDetail.mis}`"
                            :display-name="assignedDetail.i18nDisplayName"
                            :avatar="assignedDetail.avatar" /> -->                  
                        <mtd-tooltip
                            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; width: 235px;"
                            placement="top"
                            popper-class="user-header-popper"
                            :content="assignedDetail.i18nDisplayName ? `${assignedDetail.i18nDisplayName}/${assignedDetail.mis}` : (assignedDetail.displayName ? `${assignedDetail.displayName}/${assignedDetail.mis}` : assignedDetail.mis)"
                            :disabled="!inside">
                            <span>
                                <img
                                    class="header-img-container"
                                    :src="assignedDetail.avatar|| defaultAvatar"
                                    alt="头像"
                                    v-if="inside">
                                <span class="img-text">{{ assignedDetail.i18nDisplayName ? assignedDetail.i18nDisplayName : (assignedDetail.displayName ? assignedDetail.displayName : assignedDetail.mis) }}</span>
                            </span>
                        </mtd-tooltip>
                        <div class="org-info" style="vertical-align: middle;">{{ formCustom.rgName }}</div>
                    </div>
                    <h3>
                        <span style="vertical-align: middle;">{{ $getText('ticket_info_cti', '服务目录') }}</span>
                        <mtd-button
                            type="primary"
                            icon="mtdicon mtdicon-file-import"
                            size="small"
                            style="margin-left:6px;"
                            @click="handleBtnClick"
                            v-if="itemPermission('circulation').editable">{{ $getText('ticket_info_transfer_btn', '流转') }}</mtd-button>
                        <mtd-button
                            size="small"
                            style="margin-left:2px; vertical-align: middle;"
                            @click="assignToMe"
                            v-if="itemPermission('assignToMe').visible"
                            class="assign-to-me">{{ $getText('ticket_info_assign_to_me_btn', '分配给我') }}</mtd-button>
                    </h3>
                    <div class="import-info">
                        <div>{{ `${$getText('ticket_info_cti_category', '一级目录')}：${formCustom.categoryName}` }}</div>
                        <div>{{ `${$getText('ticket_info_cti_type', '二级目录')}：${formCustom.typeName}` }}</div>
                        <div>{{ `${$getText('ticket_info_cti_item', '三级目录')}：${formCustom.itemName}` }}</div>
                    </div>
                    <h3 style="margin-bottom: 12px;">
                        <hover-field style="display: block;">
                            <ticket-file-select
                                size="small"
                                :info="info"
                                @change="archiveChange"
                                :width="175"
                                :show-recommend="false"
                                class="detail-file-select">
                                <template v-slot:label>
                                    <span>{{ $getText('ticket_info_archive', '问题归档') }}</span>
                                </template>
                            </ticket-file-select>
                        </hover-field>
                    </h3>
                </div>
                <div class="info-content transfer-buttons">   
                    <ticket-system-detail
                        v-show="isShowSystemDetail"
                        @update="emitUpdate"
                        :info="info" />
                </div>
                <div class="info-content">
                    <TicketCompleteTime />
                </div>
                <div class="info-content">
                    <div class="info-item" v-if="inside">
                        <span class="info-label important-title">{{ $getText('ticket_info_cc', '抄送人') }}：</span>
                        <change-cc
                            class="tag-item"
                            :cc-list="formCustom.cc"
                            :ticket-id="ticketId"
                            @change="ccChange"
                            @getCCresult="setCCresult" />
                    </div>
                    <div class="info-item">
                        <span class="info-label important-title">{{ $getText('ticket_info_tag', '标签') }}：</span>
                        <change-tag
                            class="tag-item"
                            :tag-list="formCustom.labels"
                            :is-detail="true"
                            :rg-id="formCustom.rgId"
                            @change="tagChange" />
                    </div>
                </div>
            </div>
            <div v-show="infoFold">
                <div class="info-content more-info">
                    <h5>{{ $getText('ticket_info_more_info', '更多信息') }}</h5>
                    <div class="info-item" v-if="itemPermission('ticketType').visible">
                        <span class="info-label">{{ $getText('ticket_info_type', '类型') }}：</span>
                        <span class="info-text">
                            <hover-field>
                                <mtd-select
                                    v-model="formCustom.ticketType"
                                    class="origin-place-edit"
                                    placeholder="-"
                                    style="width: 140px;"
                                    @change="submit('ticketType', formCustom.ticketType)"
                                    size="small"
                                    :disabled="!itemPermission('ticketType').editable">
                                    <mtd-option
                                        v-for="(item, index) in TicketTypes"
                                        :key="index"
                                        :label="$getText(item.key)"
                                        :value="item.value"
                                        size="small" />
                                </mtd-select>
                            </hover-field>
                        </span>
                    </div>
                    <div class="info-item" v-if="itemPermission('permission').visible">
                        <span class="info-label">{{ $getText('ticket_info_credential', '保密') }}：</span>
                        <span class="info-text">
                            <mtd-switch
                                v-model="formCustom.permission"
                                @change="changePermission"
                                :disabled="!itemPermission('permission').editable"
                                size="small"
                                style="vertical-align: middle;" />
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">{{ $getText('ticket_info_code', '编号') }}：</span>
                        <span class="info-text">{{ ticketId }}</span>
                    </div>
                </div>
                <div class="info-content" v-if="inside">
                    <ticket-about ref="ticketAbout" @update="emitUpdate" />
                </div>
            </div>
            <expand-button :fold.sync="infoFold" size="small" />
        </div>
        <ticket-circulation-dialog
            v-if="dialogController.circulation"
            @update="circulationUpdate"
            :assigned-detail="assignedDetail"
            :catagory-info="formCustom"
            :ticket-id="ticketId"
            :is-work-hour="isWorkHour"
            :is-ticket="isTicket"
            @changeWorkHour="updateWorkHourState"
            @close="dialogController.circulation = false" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { itemPermission } from '@/utils/tools';

import createOnesDialog from './create-ones-dialog.vue';
import TicketCirculationDialog from './ticket-circulation-dialog.vue';
import TicketAbout from './ticket-about.vue';
import TicketCompleteTime from './ticket-complete-time.vue';
import TicketFileSelect from './ticket-file-select.vue';
import TicketSystemDetail from './ticket-system-detail.vue';

import ChangeCc from '@/components/change-cc.vue';
import ChangeTag from '@/components/change-tag.vue';

import expandButton from '@/components/expand-button.vue';
import userAvatar from '@/components/user-avatar.vue';

import { State, Getter, Mutation } from 'vuex-class';
import { TicketType, Sla2CN, DEFAULT_AVATAR } from '@/config/map.conf';

import VueClipboards from 'vue-clipboards';
Vue.use(VueClipboards);

import * as api from '@/api';

interface Form {
    categoryName: string;
    categoryId: number;
    typeName: string;
    typeId: number;
    itemName: string;
    itemId: number;
    sla: string;
    assigned: string;
    rgId: number;
    rgName: string;
}
/**
 * Ticket信息
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component({
    components: {
        createOnesDialog,
        TicketAbout,
        TicketCirculationDialog,
        ChangeCc,
        ChangeTag,
        expandButton,
        userAvatar,
        TicketFileSelect,
        TicketCompleteTime,
        TicketSystemDetail
    }
})
export default class TicketInfo extends Vue {
    @Prop({ default: () => {
        return {};
    } })
    info: any;
    @Prop() isTicket: boolean;

    @State(state => state.tt.timeData)
    timeData: CommonTypes.mapObject;

    @State(state => state.tt.ticketAbout)
    ticketAbout: any;

    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    @Getter inside;
    @Getter misX;
    @Getter env;
    @Getter spaceDomain;

    @Mutation setRgPermissionMap;

    formCustom: Form = {
        categoryName: '',
        categoryId: 0,
        typeName: '',
        typeId: 0,
        itemName: '',
        itemId: 0,
        rgId: 0,
        sla: '',
        assigned: '',
        cc: [],
        ticketType: '',
        labels: [],
        rgName: '',
        appointAssigned: true
    };
    createOnesInfo: any = {
        projectId: null,
        assigned: '',
        name: '',
        expectClose: '',
        cc: [],
        ccResult: [],
        reporter: '',
        attachment: [],
        desc: ''
    };

    infoFold: boolean = false;
    ticketId: number = 0;
    ccInfo: string[] = [];
    RgList: any = [];
    Sla2CN: CommonTypes.mapObject = Sla2CN;
    TicketTypes: {key: string, value: string}[] = TicketType;
    userList: string[] = [];
    userLoading: Boolean = false;
    minHeight: number = 0;
    withOnes: string = '';
    onesIssueId: number = 0;
    onesState: string = '';
    itsmUrl: string = '';
    isWorkHour: boolean = true;
    siteCodeSwitch: boolean = false;
    dialogController: any = {
        createOnes: false,
        circulation: false
    };
    ruleCustom: any = {
        itemName: [
            { validator: this.validateCatalog, trigger: 'change' }
        ],
        assigned: [
            { validator: this.validateAssigned, trigger: 'change' }
        ]
    };

    constDefault: any = {
        label: this.$getText('ticket_info_tip_cti_not_found', '暂无对应的服务目录'),
        value: '',
        disabled: true
    };
    constEmpty: any = {
        label: this.$getText('ticket_info_tip_mis_required', '请输入MIS'),
        value: '',
        disabled: true
    };
    defaultAvatar: string = DEFAULT_AVATAR;
    itemPermission: any = itemPermission;

    get reporterInfo () {
        const displayName = this.reporterDetail.i18nDisplayName || this.reporterDetail.displayName || '';
        const mis = this.reporterDetail.mis;
        let reporterInfo = `<div>${displayName ? `${displayName}/${mis}` : mis}</div>`;
        if (this.info.city) {
            reporterInfo += `<div><span class="label">${this.$getText('ticket_info_city', '城市')}：</span>${this.info.city}</div>`;
        }
        return reporterInfo;
    }

    get assignedDetail () {
        return this.info.assignedDetail && this.info.assignedDetail.mis ? this.info.assignedDetail : {
            mis: this.info.assigned,
            displayName: this.info.assigned,
            avatar: ''
        };
    }
    get reporterDetail () {
        return this.info.reporterDetail && this.info.reporterDetail.mis ? this.info.reporterDetail : {
            mis: this.info.reporter,
            displayName: this.info.reporter,
            avatar: ''
        };
    }
    get isShowSystemDetail () {
        return itemPermission('createOnes').editable || itemPermission('createCase').editable || itemPermission('createItsm').editable;
    }

    @Watch('ticketAbout', { immediate: true })
    getAboutOnes (ticketAbout) {
        this.infoFold = ticketAbout.tt && ticketAbout.tt.length || ticketAbout.coe;
    }

    mounted () {
        // this.ticketId = parseInt(this.$route.query.id, 10);
        this.$nextTick(() => {
            let all = document.body.clientHeight;
            let offset = this.$refs.info && this.$refs.info.getBoundingClientRect().top || 0;
            this.minHeight = all - offset - 20;
        });
    }
    // 初始化 有info时触发
    @Watch('info', { deep: true })
    async onWatchInfo (info) {
        if (info.assigned) {
            this.ticketId = info.id;
            // 初始化表单数据
            for (let key in info) {
                this.formCustom[key] = info[key];
            }
            this.formCustom.permission = info.permission === 'private';

            // 初始化ones信息
            this.createOnesInfo.name = info.name;
            this.createOnesInfo.cc = info.cc || [];
            this.createOnesInfo.reporter = info.reporter;
            this.createOnesInfo.attachment = info.attachment;

            let ttUrl = this.env === 'prod' ? `https://tt.sankuai.com/ticket/detail?id=${info.id}` : `http://tt.cloud.test.sankuai.com/ticket/detail?id=${info.id}`;
            this.createOnesInfo.desc = `<p>${this.$getText('ticket_info_transfer_ones_desc', '转自TT')}：${ttUrl}</p>` + info.desc;
        }
    }
    @Watch('info.rgId')
    async rgIdChange (rgId) {
        rgId && this.getDetailOperatePermission(rgId);
        this.getShowSiteCode();
    }
    formatOrg (org, isBrief?) {
        let orgArr = org && org.split('-') || [];
        if (orgArr[0] === 'IPH') {
            orgArr.shift();
        }
        if (isBrief) {
            return `${orgArr[0] || '-'}/.../${orgArr[orgArr.length - 1] || '-'}`;
        } else {
            return orgArr.join('/');
        }
    }
    ccChange (val) {
        this.formCustom.cc = val;
        this.submit('cc', this.formCustom.cc);
    }
    tagChange (val) {
        this.formCustom.labels = val;
        this.submit('labels', this.formCustom.labels);
    }
    archiveChange (val) {
        const { id, fullName } = val;
        this.formCustom.archiveId = id;
        this.formCustom.archiveFullName = fullName;
        this.submit('archiveId', id);
    }
    setCCresult (val) {
        this.createOnesInfo.ccResult = val;
    }
    validateCatalog (_rule, value, callback) {
        this.$nextTick(function () {
            if (!this.formCustom.itemName) {
                return callback(new Error(this.$getText('ticket_info_tip_no_cti', '请选择/搜索服务目录')));
            }
            return callback();
        });
    }
    validateAssigned (_rule, value, callback) {
        this.$nextTick(function () {
            if (!this.formCustom.assigned) {
                return callback(new Error(this.$getText('ticket_info_tip_no_assigned', '请选择处理人')));
            }
            return callback();
        });
    }
    async submit (param, result, hideTip?) {
        try {
            let obj = {};
            obj[param] = result;
            await api.ticketApi.updateTicket(this.ticketId, obj);
            this.formCustom[param] = result;
            if (!hideTip) {
                this.$mtd.message({
                    message: this.$getText('ticket_info_tip_edit_success', '编辑成功'),
                    type: 'success'
                });
            }
            // if (param !== 'labels') {
            this.emitUpdate();
            // }
        } catch (e) {
            console.log(e);
        }
    }
    circulationUpdate (val) {
        for (let key in val) {
            this.formCustom[key] = val[key];
        }
        // this.getTicketTime();
        this.emitUpdate();
    }
    emitUpdate () {
        this.$emit('update');
    }
    formatToArr (obj) {
        let result = [];
        for (let key in obj) {
            result.push(key);
        }
        return result;
    }
    // 判断string[]是否完全相等
    judgeArrEqual (arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return false;
        } else {
            let result = true;
            for (let i = 0; i < arrA.length; i++) {
                if (arrB.indexOf(arrA[i]) < 0) {
                    result = false;
                    break;
                }
            }
            return result;
        }
    }

    changePermission (isPrivate: boolean) {
        window.LXAnalytics && window.LXAnalytics('moduleClick', 'b_onecloud_d0o0ued6_mc', { custom: { mis: this.misX } });
        let title = this.$getText(isPrivate ? 'ticket_info_tip_private_confirm' : 'ticket_info_tip_public_confirm', '确认将该TT设为保密？') ;
        let message = this.$getText(isPrivate ? 'ticket_info_tip_private_desc' : 'ticket_info_tip_public_desc', '修改后，只允许创建人、发起人、处理组、抄送人查看和编辑TT') ;
        this.$mtd.confirm({
            title: title,
            message: message,
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: this.$getText('ticket_info_permission_confirm_btn', '确定'),
            cancelButtonText: this.$getText('ticket_info_permission_cancel_btn', '取消'),
            onOk: () => {
                this.submit('permission', isPrivate ? 'private' : 'public');
            }
        }).catch(e => { console.log(e); });
    }
    async assignToMe () {
        // if (this.misX === this.info.assigned) {
        //     return;
        // }
        const res: Ajax.AxiosResponse = await api.ticketApi.updateTicket(this.ticketId, {
            categoryId: this.info.categoryId,
            categoryName: this.info.categoryName,
            typeId: this.info.typeId,
            typeName: this.info.typeName,
            itemId: this.info.itemId,
            itemName: this.info.itemName,
            rgId: this.info.rgId,
            assigned: this.misX,
            appointAssigned: true
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message({
                message: this.$getText('ticket_info_tip_assign_to_me_success', '操作成功'),
                type: 'success'
            });
            this.emitUpdate();
        }
    }
    copyText (text: string) {
        return text;
    }
    handleCopySuccess () {
        this.$mtd.message({
            message: this.$getText('ticket_info_tip_copy_success', '复制成功'),
            type: 'success'
        });
    }
    async getDetailOperatePermission (rgId) {
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.getDetailOperatePermission({
                rgId: rgId
            });
            let { code, data } = res;
            if (code === 200) {
                this.setRgPermissionMap(data);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async getShowSiteCode () {
        if (!this.ticketId || isNaN(Number(this.ticketId))) {
            return;
        }
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.ticketDetailPermissions(this.ticketId);
            let { code, data } = res;
            if (code === 200) {
                this.siteCodeSwitch = data?.detailOperate?.siteCode === 'visible';
                console.log('quanxian', data);
            }
        } catch (e) {
            console.log(e);
        }
    }
    cloneTicket () {
        let routeData = this.$router.resolve({
            name: 'tt_clone',
            params: {
                space: this.spaceDomain
            },
            query: {
                id: this.ticketId
            }
        });
        window.open(routeData.href, '_blank');
    }
    handleBtnClick () {
        this.dialogController.circulation = true;
        this.getNonWorkingSetting();
    }
    // 获取RG的非工作时间状态
    async getNonWorkingSetting () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getNonWorkingSetting({
            rgId: this.formCustom.rgId,
            includeTimeState: true
        });
        let { data, code } = res;
        if (code === 200) {
            this.isWorkHour = data.active ? data.isWorkHour : true;
        }
    }
    updateWorkHourState (val) {
        this.isWorkHour = val;
    }
}

</script>

<style lang="scss">
.ticket-info-container {
    h3 {
        margin-bottom: 6px;
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: 0;
        line-height: 22px;
        .mtd-btn {
            .mtdicon {
                line-height: 22px;
                vertical-align: top;
            }
        }
    }
    h5 {
        font-family: PingFangSC-Medium;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 20px;
    }
    .mtd-dropdown {
        width: 100%;
    }
    .permission-tip {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.38);
        line-height: 18px;
    }
    .text-button {
        padding-left: 10px;
        display: inline-block;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #1c6cdc;
        cursor: pointer;
    }
    .info-item {
        line-height: 20px;
        font-size: 12px;
        .info-label {
            display: inline-block;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.84);
            &.important-title {
                font-family: PingFangSC-Medium;
            }
        }
        .info-text {
            font-family: PingFangSC-Regular;
            color: rgba(0, 0, 0, 0.84);
            .mtd-select-small {
                width: 80px;
                vertical-align: baseline;
            }
        }
        &:not(:last-child) {
            margin-bottom: 8px;
        }
        .tag-item {
            display: inline-block;
            vertical-align: 2px;
        }
    }
    .import-info {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 26px;
        &:not(:last-child) {
            margin-bottom: 12px;
        }
        .user-name {
            font-family: PingFangSC-Medium;
        }
        .org-info {
            color: rgba(0, 0, 0, 0.6);
            line-height: 20px;
            margin-left: 24px;
            margin-top: -10px;
        }
        .import-info-header {
            display: flex;
            height: 36px;
        }
    }
    .info-content {
        padding: 16px 0 16px 0;
        &:not(:last-child) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
        }
        &.more-info {
            border-top: 1px solid rgba(0, 0, 0, 0.07);
        }
        &.main-content {
            padding-bottom: 0;
        }
        h3 {
            font-size: 12px;
        }
        &.transfer-buttons {
            padding: 12px 0;
        }
    }
    .tt-hover-field {
        display: inline-block;
    }
    .header-img-container {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        vertical-align: middle;
    }
    .img-text {
        font-family: PingFangSC-Medium;
        vertical-align: middle;
        cursor: pointer;
    }
    .assigned-cascader {
        width: 100%;
        height: 34px;
        line-height: 34px;
        .el-input input {
            width: 100%;
            height: 34px;
            padding-left: 0;
            border-color: #d3d8e4;
            border-radius: 1px;
        }
        .el-input__icon {
            line-height: 34px;
        }
        .el-cascader__label {
            color: #464646;
            padding-left: 0;
        }
    }
    .info-main {
        padding: 0 16px 12px 12px;
    }
    .quit-tag {
        font-size: 12px;
        color: #999;
    }
    .out-tag {
        display: inline-block;
        font-size: 12px;
        line-height: 16px;
        padding: 0 3px;
        color: #fff;
        background: #999;
        border-radius: 4px;
    }
    .assign-to-me {
        background: rgba(0, 0, 0, 0.06);
        border: none;
        font-family: PingFangSC-Medium;
        color: rgba(0, 0, 0, 0.84);
    }
    .detail-file-select {
        display: inline-block;
    }
}
.reporter-info-wrapper {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    line-height: 20px;
    max-width: 330px;
    .org {
        width: calc(100% - 40px);
        vertical-align: top;
        display: inline-block;
    }
}
.info-container {
    display: flex;
    flex-direction: column;
    max-height: 200px !important;
    overflow-y: auto !important;
}
.info-container-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
}
.custom-text,
.label {
    width: 75px;
    flex-shrink: 0;
    font-family: PingFangSC;
    font-size: 12px;
    font-weight: normal;
    line-height: 20px;
    letter-spacing: 0;
    color: rgba(17, 25, 37, 0.65);
}
.fixed-width-text {
    width: 221px;
    word-wrap: break-word;
    word-break: break-all;
    font-family: PingFangSC;
    font-size: 12px;
    font-weight: normal;
    line-height: 20px;
    letter-spacing: 0;
    color: #111925;
    align-items: center;
    .copy-container {
        cursor: pointer;
        position: relative;
        top: -1px;
    }
}
.site-tooltip {
    padding: 12px 12px 2px 12px;
    max-width: 320px;
}
.home-icon {
    width: 12px;
    height: 12px;
    vertical-align: middle;
}
.copy-o {
    width: 12px;
    height: 12px;
    vertical-align: middle;
    cursor: pointer;
}
</style>