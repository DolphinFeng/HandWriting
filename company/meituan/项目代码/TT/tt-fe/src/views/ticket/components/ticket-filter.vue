<template>
    <div class="ticket-filter">
        <div class="filter-title-wrapper">
            <div class="filter-title-inside" v-if="inside || isList">
                <span :class="['filter-title', {'filter-title-ishandle': isHandle}]" v-html="title" />
                <mtd-tooltip
                    :content="hide ? $getText('ticket_filter_expand_filter', '展开筛选') : $getText('ticket_filter_fold_filter', '收起筛选')"
                    size="small"
                    placement="right">
                    <div
                        @click="showHide"
                        class="hide-btn"
                        v-lxay
                        lxay-act="moduleClick"
                        :lxay-bid="hide ? 'b_onecloud_1ppm5pqu_mc' : 'b_onecloud_cknnhpzo_mc'">
                        <div class="empty-line" />
                        <i :class="[!hide ? 'icon-up' : 'icon-down', 'iconfont']" />
                    </div>
                </mtd-tooltip>
                <mtd-button
                    v-if="$route.query.filter === 'all'"
                    class="save-filter"
                    type="primary"
                    size="small"
                    :loading="saveBtnLoading"
                    @click="saveFilter">{{ $getText('ticket_filter_save_filter', '保存过滤器') }}</mtd-button>
                <mtd-button
                    class="reset-filter"
                    v-lxay
                    lxay-act="moduleClick"
                    lxay-bid="b_onecloud_4orogdgw_mc"
                    size="small"
                    @click="reset">{{ $getText('ticket_filter_reset', '重置') }}</mtd-button>
            </div>
            <div class="right">
                <mtd-input
                    prefix-icon="mtdicon mtdicon-search"
                    class="title-search-input"
                    v-model="form.name"
                    :placeholder="$getText('ticket_filter_placeholder_search', '在当前列表中搜索标题')"
                    :disabled="loading"
                    @keyup.enter.native="v => submit('filter_content')" />
                <mtd-button
                    class="download-btn"
                    icon="mtdicon-download-o"
                    type="text"
                    v-if="canDownload && inside"
                    :loading="exportLoading"
                    @click="download">{{ $getText('ticket_filter_export_data', '导出数据') }}</mtd-button>
                <i
                    v-if="canDownload && inside"
                    class="mtdicon mtdicon-setting"
                    @click="exportDataDialogController = true" />
            </div>
        </div>
        <mtd-form
            :model="form"
            :inline="true"
            :label-width="0"
            v-show="!hide"
            ref="form"
            class="filter-form">
            <div>
                <mtd-form-item class="inline-item inline-wider">
                    <filter-category-tree
                        :default-val="form.ctiNameList"
                        :list-loading="loading"
                        @categoryChange="categoryChange"
                        ref="filterCategoryTree" />
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item">
                    <mtd-select
                        :placeholder="$getText('ticket_filter_placeholder_select_type', '请选择TT类型')"
                        :disabled="loading"
                        v-model="form.ticketType"
                        multiple
                        clearable
                        @change="v => submit('filter-type')"
                        ref="filter-type"
                        lxay-bid="b_onecloud_lwn1s3z1_mc"
                        icon="mtdicon-down mtdicon"
                        class="overflow-filter custom-select-no-tag">
                        <mtd-option
                            v-for="(item, index) in ticketType"
                            :key="index"
                            :label="$getText(item.key)"
                            :value="item.value" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item">
                    <mtd-select
                        @change="v => submit('filter-sla')"
                        ref="filter-sla"
                        lxay-bid="b_onecloud_ryab5o11_mc"
                        :placeholder="$getText('ticket_filter_placeholder_select_level', '请选择TT等级')"
                        multiple
                        clearable
                        v-model="form.sla"
                        icon="mtdicon-down mtdicon "
                        class="custom-select-no-tag"
                        :disabled="loading">
                        <mtd-option
                            v-for="(value, index) in ticketSla"
                            :key="index"
                            :label="$getText(sla2CN[value])"
                            :value="value" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item">
                    <mtd-select
                        @change="v => submit('filter-state')"
                        ref="filter-state"
                        lxay-bid="b_onecloud_jv4627j4_mc"
                        v-model="form.ticketState"
                        :disabled="loading || disabledMap['ticketState']"
                        :placeholder="$getText('ticket_filter_placeholder_select_status', '请选择TT状态')"
                        multiple
                        clearable
                        icon="mtdicon-down mtdicon "
                        class="overflow-filter custom-select-no-tag">
                        <mtd-option
                            v-for="(item, index) in ticketStatus"
                            :key="index"
                            :label="$getText(item.key)"
                            :value="item.value"
                            :disabled="isStateDisabledinTodo(item.value)" />
                    </mtd-select>
                </mtd-form-item>
            </div>
            <div>
                <mtd-form-item class="inline-item inline-wider">
                    
                    <mtd-date-picker
                        v-if="language === 'zh'"
                        @change="v => submit('filter-time')"
                        ref="filter-time"
                        lxay-bid="b_onecloud_4cnrtnid_mc"
                        clearable
                        type="datetimerange"
                        :default-time="['00:00:00', '23:59:59']"
                        v-model="form.timePeriod"
                        :disabled="loading"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="请选择创建时间" />
                    <filter-category-date-picker
                        v-else
                        :default-val="form.timePeriod"
                        :list-loading="loading"
                        @filterTimeChange="filterTimeChange"
                        ref="filter-time" />
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item">
                    <mtd-select
                        clearable
                        :multiple="true"
                        v-model="form.assigned"
                        @change="v => submit('filter-handler')"
                        ref="filter-handler"
                        lxay-bid="b_onecloud_xvpz5aq2_mc"
                        :placeholder="$getText('ticket_filter_placeholder_select_processor', '请输入处理人MIS') "
                        :disabled="loading || disabledMap['assigned']"
                        :loading="userLoading"
                        :filterable="true"
                        :debounce="500"
                        auto-clear-query
                        icon="mtdicon-down mtdicon"
                        :loading-text="$getText('cti_search_result_searching', '搜索中')"
                        :no-match-text="$getText('category_select_tip_no_result', '暂无搜索结果')"
                        :remote="true"
                        :remote-method="remoteMethod">
                        <mtd-option
                            v-for="(item, index) in userList"
                            :key="index"
                            :label="$getText('ticket_filter_processor_label', {user: item.username })"
                            :value="item.username">
                            <span>{{ item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : item.username) }}</span>
                        </mtd-option>
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item" v-show="inside">
                    <mtd-select
                        clearable
                        :multiple="true"
                        v-model="form.createdBy"
                        @change="v => submit('filter_assaigner')"
                        ref="filter_assaigner"
                        lxay-bid="b_onecloud_3myzo485_mc"
                        :placeholder="$getText('ticket_filter_placeholder_select_init', '请输入发起人 MIS')"
                        :disabled="loading || disabledMap['createdBy']"
                        :loading="userLoading"
                        :filterable="true"
                        :debounce="500"
                        auto-clear-query
                        icon="mtdicon-down mtdicon"
                        :loading-text="$getText('cti_search_result_searching', '搜索中')"
                        :no-match-text="$getText('category_select_tip_no_result', '暂无搜索结果')"
                        :remote="true"
                        :remote-method="remoteMethod">
                        <mtd-option
                            v-for="(item, index) in userList"
                            :key="index"
                            :label="$getText('ticket_filter_init_label', { user: item.username })"
                            :value="item.username">
                            <span>{{ item.i18nDisplayName ? `${item.i18nDisplayName}/${item.username}` : (item.displayName ? `${item.displayName}/${item.username}` : item.username) }}</span>
                        </mtd-option>
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item class="inline-item">
                    <FilterMultiTag 
                        :labels-show="form.labels"
                        :labels-relation-show="form.labelsRelation"
                        @filterChangedHander="filterChangedHander" />
                </mtd-form-item>
            </div>
            <div>
                <mtd-form-item class="inline-item inline-wider mtd-item"  v-show="inside">
                    <mtd-select
                        v-model="form.reporterOrgIds"
                        :loading="loading"
                        :disabled="loading"
                        filterable
                        remote
                        multiple
                        auto-clear-query
                        clearable
                        :debounce="500"
                        :formatter="formatOrg"
                        icon="mtdicon-down mtdicon"
                        :remote-method="searchOrg"
                        :placeholder="$getText('ticket_filter_placeholder_search_dept', '请搜索发起人所在部门')"
                        value-key="orgId"
                        ref="filter_org"
                        lxay-bid="b_techportal_olmig7wh_mc"
                        :no-match-text="$getText('category_select_tip_no_result', '暂无搜索结果')"
                        @input="v => submit('filter_org')">
                        <mtd-option
                            v-for="org in orgList"
                            :key="org.orgId"
                            :label="org.orgPath"
                            :value="org" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item">
                    <mtd-select
                        :placeholder="$getText('ticket_filter_placeholder_select_system', '请选择TT转入的下游系统')"
                        :disabled="loading"
                        v-model="form.associateSystem"
                        multiple
                        clearable
                        @change="v => submit('filter_system')"
                        ref="filter_system"
                        icon="mtdicon-down mtdicon "
                        class="overflow-filter custom-select-no-tag">
                        <mtd-option
                            v-for="(item, index) in associateSystem"
                            :key="index"
                            :label="$getText(item.key)"
                            :value="item.value" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item">
                    <mtd-select
                        :placeholder="$getText('ticket_filter_placeholder_valid_time', '工单处理时效')"
                        :disabled="loading"
                        v-model="form.timeoutSituation"
                        multiple
                        clearable
                        @change="v => submit('filter_timeout')"
                        ref="filter_timeout"
                        icon="mtdicon-down mtdicon "
                        class="overflow-filter custom-select-no-tag">
                        <mtd-option
                            v-for="(item, index) in timeoutSituation"
                            :key="index"
                            :label="$getText(item.key)"
                            :value="item.value" />
                    </mtd-select>
                </mtd-form-item>
                <mtd-form-item class="inline-item mtd-item" v-show="isRgOrSpace">
                    <mtd-select
                        :placeholder="$getText('ticket_filter_placeholder_type', '工单种类')"
                        :disabled="loading"
                        v-model="form.ticketHandleType"
                        multiple
                        @change="handleTypeChange"
                        ref="filter_handle"
                        :closable="false"
                        icon="mtdicon-down mtdicon "
                        class="overflow-filter custom-select-no-tag">
                        <mtd-option
                            v-for="(item, index) in ticketHandleType"
                            :key="index"
                            :label="$getText(item.label)"
                            :disabled="item.disabled"
                            :value="item.value" />
                    </mtd-select>
                </mtd-form-item>
            </div>
        </mtd-form>
        <export-confirm-dialog
            v-if="exportDataDialogController"
            @close="exportDataDialogController = false" />
    </div>
</template>
 
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import { TicketStatus, TicketSla, TicketType, AssociateSystem, Sla2CN, TimeoutSituation, TicketRGHandleType, TicketSpaceHandleType } from '@/config/map.conf';
import { submitLXInfo, FILTER_LX_MAP } from '@/config/lx_map.conf';

import FilterCategoryTree from '@/components/filter-category-tree.vue';
import FilterCategoryDatePicker from '@/components/filter-category-date-picker.vue';

import FilterMultiTag from '@/components/filter-multi-tag.vue';
import * as api from '@/api';
import eventBus from '@/utils/event-bus';
import { lxReportClick } from '@/utils/directive/lxanaly';
import ExportConfirmDialog from '../components/export-confirm-dialog.vue';

/**
 * ticket筛选器
 *
 * @author xiaokunyu
 * @date 01/22/2019
 */
@Component({
    components: {
        FilterCategoryTree,
        FilterCategoryDatePicker,
        FilterMultiTag,
        ExportConfirmDialog
    }
})
export default class TicketFilter extends Vue {
    @Getter inside;

    @Getter language;

    @Prop({ default: {
        name: '',
        ticketState: [],
        sla: [],
        ticketType: [],
        timePeriod: [],
        category: '',
        type: '',
        item: '',
        createdBy: [],
        assigned: [],
        cc: '',
        rgIds: 0,
        labels: [],
        ctiNameList: [],
        reporterOrgIds: [],
        associateSystem: [],
        timeoutSituation: [],
        ticketHandleType: []
    } })
    form: CommonTypes.TicketFilterItem;
    @Prop({ default: false })
    loading: Boolean;
    @Prop({ default: true })
    fold: Boolean;
    @Prop({ default: [] })
    disabledItems: string[];

    @State(state => state.tt.title) title;
    @Getter misX;
    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    ticketStatus: {key: string, value: string}[] = TicketStatus;
    ticketSla: string[] = TicketSla;
    ticketType: {key: string, value: string}[] = TicketType;
    associateSystem: {key: string, value: string}[] = AssociateSystem;
    timeoutSituation: {key: string, value: string}[] = TimeoutSituation;
    userLoading: Boolean = false;
    tagLoading: Boolean = false;
    hide: Boolean = true;
    exportLoading: boolean = false;
    saveBtnLoading: boolean = false;
    userList: CommonTypes.UserInfoItem[] = [];
    tagLists: any = [];
    orgList: CommonTypes.OrgItem[] = [];
    orgLoading: boolean = false;
    sla2CN: CommonTypes.mapObject = Sla2CN;
    exportDataDialogController: boolean = false;
    exportVal: CommonTypes.mapObject = {};

    @Watch('hide', { immediate: true })
    handleHide (hide) {
        this.$emit('foldChange', hide);
    }
    @Watch('form.ticketHandleType', { immediate: true })
    watchTypeChange (v) {
        v && this.isRgOrSpace && this.ticketHandleType.forEach(e => {
            e.disabled = (v.length === 1 && e.value === v[0]) ? true : false;
            return e;
        });
    }

    get isHandle () {
        return this.$route.name === 'tt_handle';
    }

    get isList () {
        return this.$route.name === 'tt_list';
    }
    get isRgOrSpace () {
        // 选中我所在RG或空间/特定RG或空间
        return this.queryType === 'rg' || this.queryType === 'space';
    }
    get queryType () {
        const query = this.$route.query.filter;
        const isFromRg = query && (query === 'rg' || !isNaN(query));
        const isFromSpace = query && (query === 'space' || query.split('space-').length > 1);
        return isFromRg ? 'rg' : (isFromSpace ? 'space' : '');
    }
    get ticketHandleType () {
        return this.queryType === 'rg' ? TicketRGHandleType : TicketSpaceHandleType;
    }
    get canDownload (): boolean {
        // “查询TT”路由下，都可展示导出按钮（全部TT下只有管理员展示）
        const queryFilter = this.$route.query.filter;
        const hideCase = this.isHandle || (queryFilter === 'all' && !this.userInfo.sysAdmin);
        return !hideCase;
    }
    get disabledMap () {
        let obj = {};
        this.disabledItems.forEach(item => {
            obj[item] = true;
        });
        return obj;
    }
    get isJoinBy () {
        const queryFilter = this.$route.query.filter;
        return queryFilter && queryFilter === 'joinBy';
    }
    mounted () {
        const lastChoice = localStorage.getItem('hide-filter');
        this.hide = (this.fold && lastChoice) ? lastChoice === 'true' : this.fold;
        eventBus.$emit('ticketFilterShow', this.hide);
        this.filterOrgIdsInit();
    }
    handleTypeChange (v) {
        v && this.ticketHandleType.forEach(e => {
            e.disabled = (v.length === 1 && e.value === v[0]) ? true : false;
            return e;
        });
        this.submit();
    }

    filterOrgIdsInit () {
        const orgIds = this.$route.query.reporterOrgIds;
        let orgArr = orgIds ? orgIds.split(';') : [];
        this.orgList = orgArr.map(org => {
            return JSON.parse(org);
        });
    }

    filterChangedHander (val) {
        const [labelsRelation, labels] = val;
        this.form.labels = labels;
        this.form.labelsRelation = labelsRelation;
        // console.log('labelsRelation', labelsRelation);
        this.submit();
    }

    enableExportLoading () {
        this.exportLoading = false;
    }

    download () {
        this.exportLoading = true;
        this.$emit('exportData', this.form, this.enableExportLoading);
    }

    filterTimeChange (val) {
        this.form.timePeriod = val;
        this.submit('filter-time', val);
    }

    categoryChange (val) {
        this.form.ctiNameList = val;
        submitLXInfo(FILTER_LX_MAP['filter_category'], this.misX);
        this.submit();
    }
    // select远程搜索
    async remoteMethod (query?) {
        this.userLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({
                keyword: query || '',
                includeVirtual: true,
                includeOffJob: true,
                includeExternal: true
            });
            this.userList = res.data.items;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
        this.userLoading = false;
    }
    // 重置筛选器
    reset () {
        this.form.name = '';
        this.form.ticketState = [];
        this.form.sla = [];
        this.form.ticketType = [];
        this.form.timePeriod = [];
        this.form.category = '';
        this.form.type = '';
        this.form.item = '';
        this.form.createdBy = [];
        this.form.assigned = [];
        this.form.labels = [];
        this.form.reporterOrgIds = [];
        this.form.ctiNameList = [];
        this.form.associateSystem = [];
        this.form.timeoutSituation = [];
        this.form.ticketHandleType = ['assigned'];
        this.$refs['filterCategoryTree'] && this.$refs['filterCategoryTree'].reset();
        if (this.$route.query.filter === 'all') {
            this.delFilter();
        } else {
            this.$emit('handleReset');
        }
    }
    async saveFilter () {
        this.saveBtnLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.saveFilter({
                ...this.form
            });
            lxReportClick(FILTER_LX_MAP['save_filter']);
            if (res.code === 200) {
                this.$mtd.message.success(this.$getText('ticket_filter_save_success', '保存筛选项成功'));
            } else {
                this.$mtd.message.error(this.$getText('ticket_filter_save_fail', '保存筛选项失败'));
            }
            this.saveBtnLoading = false;
        } catch (error) {
            this.saveBtnLoading = false;
            console.log(error);
        }
    }
    async delFilter () {
        const res: Ajax.AxiosResponse = await api.ticketApi.delFilter();
        if (res.code === 200) {
            this.$mtd.message.success(this.$getText('ticket_filter_reset_success', '重置筛选项成功'));
        } else {
            this.$mtd.message.error(this.$getText('ticket_filter_reset_fail', '重置筛选项失败'));
        }
        this.$emit('handleReset');
    }
    async searchOrg (query) {
        this.orgList = [];
        const generalArr = ['集团', '美团', 'IPH'];
        if (query.length < 2 || generalArr.includes(query)) {
            return;
        }
        this.orgLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchOrg(query);
            this.orgList = res.data.items;
        } catch (e) {
            this.orgList = [];
            console.log(e);
        }
        this.orgLoading = false;
    }
    formatOrg (org) {
        let orgArr = org.label && org.label.split('-') || [];
        if (orgArr[0] === 'IPH') {
            orgArr.shift();
        }
        return orgArr.join('/');
    }
    showHide () {
        this.hide = !this.hide;
        // 处理TT - 保存用户选择
        if (typeof localStorage === 'object') {
            try {
                this.fold && localStorage.setItem('hide-filter', this.hide ? 'true' : 'false');
            } catch (error) {
                console.log(error);
            }
        }
        eventBus.$emit('ticketFilterShow', this.hide);
    }
    submit (ref?) {
        if (ref) {
            const bid: string = this.$refs[ref] && this.$refs[ref].$attrs['lxay-bid'];
            if (bid) {
                submitLXInfo(bid, this.misX);
            }
        }
        this.$emit('submit');
    }
    exportDialogShow (val) {
        this.exportVal = val;
        this.exportDataDialogController = true;
    }
    // 我的待处理状态筛选不允许选择已解决已关闭
    isStateDisabledinTodo (state) {
        const toFilter = this.$route.query.filter || 'todo';
        if (toFilter === 'todo') {
            const disabledOptions = ['已解决', '已关闭'];
            return disabledOptions.includes(state);
        }
        return false;
    }
}
</script>

<style lang="scss">
.ticket-filter {
    margin-bottom: 12px;
    background: #f5f5f5;
    border-radius: 3px;
    .filter-title-wrapper {
        display: flex;
        width: 100%;
        line-height: 32px;
        .filter-title-inside {
            flex: 1;
        }
        .empty-line {
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
            border-right: 1px solid rgba(0, 0, 0, 0.07);
            height: 16px;
            width: 12px;
        }
        .hide-btn {
            display: inline-block;
            -moz-user-select: none;
            -webkit-user-select: none;
            i {
                vertical-align: middle;
                color: rgba(0, 0, 0, 0.84);
                background: rgba(0, 0, 0, 0.06);
                padding: 2px;
                border-radius: 4px;
                cursor: pointer;
            }
        }
        .right {
            // flex: 1;
            justify-content: flex-end;
            color: rgba(0, 0, 0, 0.84);
            font-size: 14px;
            position: relative;
        }
    }
    .filter-title {
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: rgba(0, 0, 0, 0.84);
        vertical-align: middle;
        span {
            display: none;
            font-family: PingFangSC-Regular;
            color: rgba(0, 0, 0, 0.6);
        }
        &.filter-title-ishandle span {
            display: inline;
        }
    }
    .download-btn {
        margin-left: 10px;
        .mtdicon-download-o {
            line-height: 32px;
            vertical-align: top;
        }
    }
    .mtdicon-setting {
        padding-right: 5px;
        cursor: pointer;
        color: #ffc300;
        line-height: 32px;
        vertical-align: top;
    }
    .filter-form {
        margin-top: 12px;
        font-size: 0;
        background: #fff;
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        padding: 12px 12px 3px 12px;
        .inline-item {
            width: 20%;
            margin-right: 1.5%;
            &:last-child {
                margin-right: 0;
            }
            .el-date-editor,
            .mtd-select,
            .mtd-date-picker {
                width: 100%;
            }
            &.inline-wider {
                width: 35%;
            }
            &.ticket-type {
                margin-bottom: 8px;
                width: 26.3%;
            }
            .mtd-select.mtd-select-multiple {
                font-size: 14px;
                .mtd-select-search-field {
                    margin: 0 0 0 4px;
                    color: rgba(0, 0, 0, 0.87);
                }
            }
            .mtd-date-picker {
                .mtdicon {
                    margin-right: 2px;
                }
            }
        }
        .mtd-item {
            .mtdicon {
                font-size: 14px;
                line-height: 30px;
                width: 30px;
                margin-right: 2px;
            }
        }
        .mtd-form-item {
            margin-bottom: 12px;
            .mtd-form-item-content {
                line-height: 1;
            }
        }
        .overflow-filter {
            .mtd-select-tags {
                overflow: hidden;
            }
        }
        .tt-select-tags {
            .mtd-select-choice {
                max-width: calc(100% - 80px);
            }
        }
    }
    .operate {
        float: right;
        .reset-btn {
            margin-right: 12px;
        }
    }
    .title-search-input {
        float: right;
        width: 240px;
    }
    .save-filter {
        margin-left: 12px;
        border: none;
    }
    .reset-filter {
        margin-left: 12px;
        border: none;
        background: rgba(0, 0, 0, 0.06);
    }
}
</style>