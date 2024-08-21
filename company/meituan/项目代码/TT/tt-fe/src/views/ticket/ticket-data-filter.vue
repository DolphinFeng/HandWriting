<template>
    <ticket-filter
        ref="filter"
        :form="form"
        :loading="loading"
        :disabled-items="disabledItems"
        :fold="filterFold"
        @foldChange="handleFold"
        @submit="handleSubmit"
        @handleReset="() => { updateTicket(misX) }"
        @exportData="(val, cb) => this.exportData(val, cb)" />
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Getter, Mutation, State } from 'vuex-class';
import { TicketSlaIcon, Sla2CN } from '@/config/map.conf';
import get from 'lodash.get';
import without from 'lodash.without';
import * as api from '@/api';
import TicketFilter from './components/ticket-filter.vue';
import dayjsWithTimeZone from '@/utils/tools/dayjs';
import store from '../../store';
import dayjs from 'dayjs';

// 从 url 参数中获取 archiveIds 并解析，三种结果: 空/0/非0数字
const normalizeArchiveId = (inputStr: string | string[]): number | undefined => {
    if (typeof inputStr !== 'string') {
        return undefined;
    }
    const num = parseInt(inputStr, 10);
    if (isNaN(num)) {
        return undefined;
    }
    return num;
};

/**
 * 基于ticket-filter的数据处理
 *
 * @author liyuyao
 * @date 10/26/2020
 */
@Component({
    components: {
        TicketFilter
    }
})
export default class TicketDataFilter extends Vue {
    @Getter inside;
    @Getter guard;
    @Getter misX;
    @Getter spaceDomain;
    @Getter language;
    @State(state => state.tt.downloadTasks)
    downloadTasks: string[];
    @State(state => state.tt.mySpaces)
    mySpaces: number[];
    @State(state => state.tt.myRgs)
    myRgs: number[];

    @Mutation setMySpaces;
    @Mutation setMyRgs;

    @Prop({ default: false })
    filterFold: boolean;

    @Prop({ default: 1 })
    currentPage: number;

    @Prop({ default: 0 })
    total: number;

    @Prop({ default: 20 })
    limit: number;

    @Prop({ default: null })
    archiveId: number | null;

    @Mutation setDownloadTask;

    form: CommonTypes.TicketFilterItem = {
        name: '',
        ticketState: [],
        sla: [],
        ticketType: [],
        timePeriod: [],
        ctiNameList: [],
        createdBy: [],
        assigned: [],
        cc: '',
        rgIds: [],
        spaceIds: [],
        archiveIds: null,
        labels: [],
        labelsRelation: 1,
        reporterOrgIds: [],
        associateSystem: [],
        timeoutSituation: [],
        ticketHandleType: ['assigned'],
        handlers: []
    };
    loading: Boolean = false;
    totalNumber: number = 0;
    ticketList: any = [];
    emptyText: string = this.$getText('ticket_data_filter_no_data', '暂无数据');
    sla2CN: CommonTypes.mapObject = Sla2CN;
    ticketSlaIcon: CommonTypes.mapObject = TicketSlaIcon;
    specialCondition: string[] = ['filter', 'currentPage', 'id'];
    disabledItems: string[] = [];
    ticketColumn: any;

    get filterFromQuery () {
        return {
            name: this.$route.query.name || '',
            ticketState: this.$route.query.ticketState ? this.$route.query.ticketState.split(';') : [],
            sla: this.$route.query.sla ? this.$route.query.sla.split(';') : [],
            ticketType: this.$route.query.ticketType ? this.$route.query.ticketType.split(';') : [],
            timePeriod: this.$route.query.timePeriod ? this.formatObjDate(this.$route.query.timePeriod) : [],
            ctiNameList: this.formatObjNameList(this.$route.query.ctiNameList || ''),
            createdBy: this.$route.query.createdBy ? this.$route.query.createdBy.split(';') : [],
            cc: this.$route.query.cc || '',
            assigned: this.$route.query.assigned ? this.$route.query.assigned.split(';') : [],
            rgIds: this.$route.query.rgIds ? parseInt(this.$route.query.rgIds, 10) : 0,
            spaceIds: this.$route.query.spaceIds ? parseInt(this.$route.query.spaceIds, 10) : 0,
            archiveIds: normalizeArchiveId(this.$route.query.archiveIds),
            labels: this.$route.query.labels ? this.stringArrToNumber(this.$route.query.labels) : [],
            labelsRelation: this.$route.query.labelsRelation * 1 || 1,
            reporterOrgIds: this.formatObjNameList(this.$route.query.reporterOrgIds || ''),
            associateSystem: this.$route.query.associateSystem ? this.$route.query.associateSystem.split(';') : [],
            timeoutSituation: this.$route.query.timeoutSituation ? this.$route.query.timeoutSituation.split(';') : [],
            ticketHandleType: this.$route.query.ticketHandleType ? this.$route.query.ticketHandleType.split(';') : ['assigned']
        };
    }
    get isHandleTodo () {
        const isHandle = this.$route.name === 'tt_handle';
        const isTodo = this.$route.query && this.$route.query.filter === 'todo';
        return isHandle && isTodo;
    }
    get queryType () {
        const query = this.$route.query.filter;
        const isFromRg = query && (query === 'rg' || !isNaN(query));
        const isFromSpace = query && (query === 'space' || query.split('space-').length > 1);
        return isFromRg ? 'rg' : (isFromSpace ? 'space' : '');
    }

    @Watch('language')
    handleLanguage () {
        this.getTicketListToState();
    }

    @Watch('misX')
    async getFilter () {
        if (this.$route.query.filter === 'all' && this.queryCondition()) {
            const res: Ajax.AxiosResponse = await api.ticketApi.getFilter({
                ownerName: this.misX
            });
            if (res.code === 200 && res.data) {
                res.data.labels = res.data.labels && res.data.labels.map(item => {
                    return parseInt(item, 10);
                });
                this.form = res.data ? { ...res.data } : this.form;
            }
        } else {
            this.initForm();
        }
        this.$nextTick(() => {
            this.updateTicket(this.misX);
        });
    }

    @Watch('$route')
    onRouteChanged (to, from) {
        if (this.misX && to.query.filter !== from.query.filter) {
            // 切换左侧tab时 需要重置currentPage
            this.$emit('update:currentPage', 1);
            this.$nextTick(() => {
                this.resetFrom();
                this.updateTicket(this.misX);
            });
        }
        if (Object.keys(to.query).length === 1 && to.query.filter === 'all') {
            this.getFilter();
        }
    }

    @Watch('archiveId')
    getArchiveId (id: number | null) {
        if (id == null) return;
        this.form.archiveIds = id;
        this.$emit('update:currentPage', 1);
        this.getTicketListToState();
    }

    mounted () {
        this.misX && this.getFilter();
    }

    formatObjNameList (ctiStr) {
        let ctiArr = ctiStr ? ctiStr.split(';') : [];
        return ctiArr.map((cti) => {
            return JSON.parse(cti);
        });
    }

    formatObjDate (dateArr) {
        if (dateArr && dateArr[0] !== '') {
            return dateArr.map((item => {
                return dayjsWithTimeZone(item * 1).format('YYYY-MM-DD HH:mm:ss');
            }));
        }
    }

    // 根据userinfo的内容 刷新空值提示语句 并且设置过滤器内容
    async updateTicket (mis) {
        if (!mis) return;
        let toFilter: string = this.$route.query.filter || 'todo';
        this.emptyText = this.$getText('ticket_data_filter_no_data', '暂无数据');
        this.disabledItems = [];
        switch (toFilter) {
            case 'createdBy':
                this.form.createdBy = [mis];
                this.emptyText = this.$getText('ticket_data_filter_no_created_ticket', '您还没有创建过Ticket，请去创建Ticket');
                this.disabledItems = ['createdBy'];
                break;
            case 'joinBy':
                this.form.handlers = [mis];
                this.emptyText = this.$getText('ticket_data_filter_no_transferred_ticket', '您还未流转过TT');
                break;
            case 'mine':
                this.form.assigned = [mis];
                this.emptyText = this.$getText('ticket_data_filter_no_assigned_ticket', '暂时还没有指派给您的TT');
                this.disabledItems = ['assigned'];
                break;
            case 'favor':
                this.form.cc = mis;
                this.emptyText = this.$getText('ticket_data_filter_no_favor_ticket', '您还未关注过TT');
                this.disabledItems = ['cc'];
                break;
            case 'todo':
                this.form.ticketState = ['未处理', '处理中', '重新打开', '暂停'];
                this.form.assigned = [mis];
                this.emptyText = this.$getText('ticket_data_filter_no_todo_ticket', '您还没有待处理的Ticket');
                this.disabledItems = ['assigned'];
                break;
            case 'rg':
                this.form.rgIds = this.myRgs;
                this.emptyText = this.$getText('ticket_data_filter_no_rg_ticket', '您所属的RG下，暂时没有TT');
                break;
            case 'space':
                this.form.spaceIds = this.mySpaces;
                this.emptyText = this.$getText('ticket_data_filter_no_space_ticket', '您所属的空间下，暂时没有TT');
                break;
            default:
                if (toFilter.indexOf('space-') > -1) {
                    const spaceId = toFilter.split('-')[1];
                    this.form.spaceIds = parseInt(spaceId, 10);
                } else if (parseInt(toFilter, 10)) {
                    this.form.rgIds = parseInt(toFilter, 10);
                    this.emptyText = this.$getText('ticket_data_filter_no_rg_ticket', '您所属的RG下，暂时没有TT');
                }
                this.disabledItems = [];
        }
        this.getTicketListToState();
    }

    async fetchTicketList (field?: string, order?: string) {
        if (!this.misX) {
            return ;
        }
        this.loading = true;
        const param: any = this.formatRequestParam();

        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketList(this.currentPage, this.limit, param, field || '', order || '');
            this.loading = false;
            return res;
        } catch (e) {
            this.ticketList = [];
            console.warn(e);
        }
        this.loading = false;
    }
    // 拿列表数据
    async getTicketListToState (field?: string , order?: string) {
        const res = await this.fetchTicketList(field, order);
        this.totalNumber = get(res, ['data', 'tn']);
        this.ticketList = get(res, ['data', 'items'], []);
        this.ticketColumn = get(res, ['data', 'columns'], []);
        const total = get(res, ['data', 'tn'], 0);
        this.$emit('update:total', total);
        this.$emit('data-change', this.ticketList);
        this.$emit('column-change', this.ticketColumn);
    }
    // 获取我流转的TT
    async getJoinTicketList () {
        this.loading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getJoinTicketList({
                cn: this.currentPage,
                sn: this.limit
            });
            this.totalNumber = get(res, ['data', 'tn']);
            this.loading = false;
            this.ticketList = res.data.items;
            this.$emit('update:total', res.data.tn);
        } catch (e) {
            this.ticketList = [];
            console.warn(e);
        }
        this.loading = false;
        this.$emit('data-change', this.ticketList);
    }
    stringArrToNumber (originStr) {
        let stringArr = originStr.split(';') || [];
        let numArr = stringArr.map((str) => {
            return parseInt(str, 10);
        });
        return numArr || [];
    }
    handleFormQuery (form) {
        let queryForm = JSON.parse(JSON.stringify(form));
        queryForm.timePeriod = queryForm.timePeriod?.map(item => item ? dayjsWithTimeZone(item).valueOf() : '') || [];
        queryForm.sla = queryForm.sla.join(';');
        queryForm.labels = queryForm.labels.join(';');
        queryForm.ticketState = queryForm.ticketState.join(';');
        queryForm.ticketType = queryForm.ticketType.join(';');
        queryForm.assigned = queryForm.assigned.join(';');
        queryForm.createdBy = queryForm.createdBy.join(';');
        queryForm.ctiNameList = this.formatListString(queryForm.ctiNameList || []);
        queryForm.reporterOrgIds = this.formatListString(queryForm.reporterOrgIds || []);
        queryForm.associateSystem = queryForm.associateSystem.join(';');
        queryForm.timeoutSituation = queryForm.timeoutSituation.join(';');
        queryForm.ticketHandleType = queryForm.ticketHandleType?.join(';');
        return queryForm;
    }
    formatListString (ctiList) {
        let ctiStrArr = ctiList.map(cti => {
            return JSON.stringify(cti);
        });
        return ctiStrArr.join(';');
    }
    handleChange (current: number, size: number) {
        this.$emit('update:currentPage', current);
        this.$emit('update:limit', size);
        let queryForm = this.handleFormQuery(this.form);

        // 翻页的时候也需要在url里记录
        this.$router.push({
            name: this.$route.name,
            params: {
                space: this.spaceDomain
            },
            query: {
                ...queryForm,
                filter: this.$route.query.filter,
                limit: size,
                currentPage: current
            }
        }).catch(e => e);
        this.$nextTick(() => {
            this.getTicketListToState();
        });
    }
    handleScrollLoad () {
        this.$emit('update:currentPage', this.currentPage + 1);
        this.$nextTick(() => {
            this.concatTicketList();
        });
    }

    handleFold (hide) {
        this.$emit('foldChange', hide);
    }

    async concatJoinTicketList () {
        this.loading = true;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getJoinTicketList({
                cn: this.currentPage,
                sn: this.limit
            });
            this.loading = false;
            const resList = get(res, ['data', 'items'], []);
            this.totalNumber = get(res, ['data', 'tn']);
            this.ticketList = this.ticketList.concat(resList);
            this.$emit('update:total', res.data.tn);
            this.$emit('data-change', this.ticketList);
        } catch (e) {
            this.ticketList = [];
            console.warn(e);
        }
        this.loading = false;
    }
    async concatTicketList () {
        const res = await this.fetchTicketList();
        const resList = get(res, ['data', 'items'], []);
        this.totalNumber = get(res, ['data', 'tn']);
        this.ticketList = this.ticketList.concat(resList);
        const total = get(res, ['data', 'tn'], 0);
        this.$emit('update:total', total);
        this.$emit('data-change', this.ticketList);
    }
    handleSubmit () {
        this.$emit('update:currentPage', 1);
        this.$nextTick(() => {
            this.emptyText = this.$getText('ticket_data_filter_no_ticket_found', '对不起，没有找到你要查找的内容，请重新搜索');
            let queryForm = this.handleFormQuery(this.form);


            // 提交查询时需要在url里记录筛选信息
            this.$router.push({
                name: this.$route.name,
                params: {
                    space: this.spaceDomain
                },
                query: {
                    ...queryForm,
                    filter: this.$route.query.filter,
                    limit: this.limit,
                    currentPage: this.currentPage
                }
            }).catch(e => e);
            this.getTicketListToState();
        });
    }
    // 重置表单内容
    resetFrom () {
        this.form.name = '';
        this.form.ticketState = [];
        this.form.sla = [];
        this.form.ticketType = [];
        this.form.timePeriod = [];
        this.form.labels = [];
        this.form.ctiNameList = [];
        this.form.createdBy = [];
        this.form.rgIds = 0;
        this.form.spaceIds = 0;
        this.form.cc = '';
        this.form.assigned = [];
        this.form.archiveIds = null;
        this.form.reporterOrgIds = [];
        this.form.associateSystem = [];
        this.form.timeoutSituation = [];
        this.form.ticketHandleType = ['assigned'];
        this.form.handlers = [];
        this.$emit('update:limit', 20);
        this.$emit('update:currentPage', 1);
        this.$refs['filter'] && this.$refs['filter'].$refs['filterCategoryTree'].reset();
    }
    // 初始化表单内容，从query中获取
    initForm () {
        this.form = {
            ...this.filterFromQuery
        };
        const limit = this.$route.query.limit ? parseInt(this.$route.query.limit, 10) : 20;
        const currentPage = this.$route.query.currentPage ? parseInt(this.$route.query.currentPage, 10) : 1;
        this.$emit('update:limit', limit);
        this.$emit('update:currentPage', currentPage);
    }

    // 判断query里是否只有三个特殊的条件
    queryCondition () {
        let keys = Object.keys(this.$route.query);
        let res = Array.from(new Set(this.specialCondition.concat(keys)));
        return res.length === this.specialCondition.length;
    }
    // 按照query接口格式要求处理form
    formatRequestParam () {
        let state = get(this, 'form.ticketState', []);
        // 将暂停翻译为后端的两个状态
        if (state.includes('暂停')) {
            state = without(state, '暂停');
            state = state.concat(['暂停中', '挂起中']);
        }
        const handleTypeParam = {
            assigned: [],
            transferred: []
        };
        const ids = this.queryType === 'rg'
            ? Array.isArray(this.form.rgIds) ? this.form.rgIds : [this.form.rgIds]
            : Array.isArray(this.form.spaceIds) ? this.form.spaceIds : [this.form.spaceIds];
        ['rg', 'space'].includes(this.queryType) && this.form.ticketHandleType.forEach(e => {
            if (e === 'assigned') {
                handleTypeParam.assigned = ids;
            } else if (e === 'transferred') {
                handleTypeParam.transferred = ids;
            }
        });
        const param = {
            state,
            name: this.form.name,
            sla: this.form.sla || [],
            ticketType: this.form.ticketType || [],
            createdAtStart: this.form.timePeriod && this.form.timePeriod[0] && dayjsWithTimeZone(this.form.timePeriod[0]).valueOf() || '',
            createdAtEnd: this.form.timePeriod && this.form.timePeriod[1] && dayjsWithTimeZone(this.form.timePeriod[1]).valueOf() || '',
            ctiNameList: this.form.ctiNameList || [],
            assigned: this.form.assigned || [],
            //  只要不是 null 就作为参数传给后端
            archiveIds: this.form.archiveIds != null ? [this.form.archiveIds] : [],
            cc: this.form.cc ? [this.form.cc] : [],
            createdBy: this.form.createdBy || [],
            labels: this.form.labels || [],
            labelsRelation: this.form.labelsRelation || 1,
            reporterOrgIds: this.form.reporterOrgIds && this.form.reporterOrgIds.map(item => parseInt(item.orgId, 10)) || [],
            newMessageSwitch: this.isHandleTodo,
            associateSystem: this.form.associateSystem,
            timeoutSituation: this.form.timeoutSituation,
            associatedRGs: this.queryType === 'rg' ? handleTypeParam : {},
            associatedSpaces: this.queryType === 'space' ? handleTypeParam : {},
            handlers: this.form.handlers || []
        };
        console.log(param, '查询参数', this.form.timePeriod);
        return param;
    }
    async exportData (val, cb) {
        // 点击导出按钮后，根据当前筛选器的条件请求接口
        const param = this.formatRequestParam();
        let res = null;
        if (this.totalNumber < 10000) {
            res = await this.dataExport(param, cb);
        } else {
            this.$mtd.confirm({
                message: this.$getText('ticket_data_filter_export_data_warning', '当前数据量较大无法完成下载，请您将工单量控制在10000条以内'),
                width: '433px',
                type: 'error',
                okButtonText: this.$getText('ticket_data_filter_confirm', '确定')
            }).catch(e => e);
        }
        cb();
        return res;
    }

    async dataExport (val, cb) {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.createDataExportTask(val);
            const { code, data } = res;
            if (code === 200) {
                const downloadTasks = this.downloadTasks;
                this.setDownloadTask(downloadTasks.concat([data.id]));
            }
        } catch (error) {
            cb();
        }
    }
}
</script>
