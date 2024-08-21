<template>
    <div style="background: #f6f6f6;">
        <div
            v-if="isPermission"
            class="dxmp-detail-container"
            :class="{'without-bottom': showBottomBtn}">
            <div class="header-wrapper" :class="`header-${ticketDetail.sla}`">
                <ticket-sla-change
                    :info="ticketDetail"
                    class="dxmp-sla"
                    @update="getTicketTime" />
                <span class="dxmp-state-text">{{ ticketDetail.state && ticketDetail.state.name | ticketStateFilter }}</span>
                <span class="light-text dxmp-sla-text" :class="{'non-working': !isWorkHour}">{{ slaContent }}</span>
            </div>
            <div class="title-wrapper">
                <span class="title-content" v-show="!isEdit"> {{ currentName }} </span>
                <mtd-icon-button
                    class="edit"
                    type="secondary"
                    size="small"
                    v-show="!isEdit && itemPermission('name').editable"
                    @click="enterEdit"
                    icon="mtdicon mtdicon-edit-o" />
                <mtd-textarea
                    autosize
                    v-model="currentName"
                    v-show="isEdit"
                    id="titleInput"
                    :disabled="!itemPermission('name').editable"
                    @blur="titleSave"
                    @keydown.enter="preventCheckEnter" />
                <mtd-tooltip
                    :content="categoryContent"
                    :disabled="categoryContent.length < 20"
                    size="small"
                    placement="top">
                    <div class="lighter-text category">{{ $getText('dxmp_handle_question_directory', '问题目录：') + categoryContent }}</div>
                </mtd-tooltip>
            </div>
            <div class="desc-wrapper">
                <div class="header-style">{{ $getText('dxmp_handle_description', '描述') }}</div>
                <div
                    class="desc-content"
                    :class="['desc-content', isExpand ? 'expand' : 'close']"
                    v-html="ticketDetail.desc"
                    ref="dxmpDesc"
                    @click="handleImgClick" />
                <mtd-button
                    type="text"
                    v-if="needShowExpand"
                    @click="handleExpand">
                    <span class="lighter-text">{{ isExpand ? $getText('dxmp_handle_collapse', '收起') : $getText('dxmp_handle_more', '更多') }}</span>
                    <i class="mtdicon" :class="isExpand ? 'mtdicon mtdicon-up-thick' : 'mtdicon mtdicon-down-thick'" />
                </mtd-button>
            </div>
            <div v-if="this.ticketDetail.customFormId">
                <div class="header-style relative-people">{{ $getText('dxmp_handle_custom_fields', '自定义字段') }}</div>
                <FormIndex
                    :is-origin-edit="false"
                    v-if="customFieldValues.length"
                    ref="dxmpFormIndex"
                    :field-schema="customFieldValues"
                    text-align="left"
                    :no-hidden="true"
                    label-position="top"
                    class="custom-form"
                    @blur-change="blurChangeSubmit" />
            </div>
            <div class="header-style relative-people">{{ $getText('dxmp_handle_related_personnel', '相关人员') }}</div>
            <div>
                <span class="light-text" style="font-size:14px;">{{ $getText('dxmp_handle_initiator', '发起人：') }}</span>
                <user-avatar
                    :username="reporterDetail.mis"
                    :display-name="reporterDetail.displayName"
                    :avatar="reporterDetail.avatar" />
            </div>
            <div>
                <span class="light-text" style="font-size:14px;">{{ $getText('dxmp_handle_handler', '处理人：') }}</span>
                <user-avatar
                    :username="assignedDetail.mis"
                    :display-name="assignedDetail.displayName"
                    :avatar="assignedDetail.avatar" />
            </div>
            <a
                target="_blank"
                :href="detailLink"
                class="jump-detail-link">
                <span class="icon-wrapper"><i class="mtdicon mtdicon-link-o" /></span>
                {{ $getText('dxmp_handle_open_from_web', '从网页打开查看更多详情') }}
            </a>
            <div
                v-if="showBottomBtn"
                class="bottom-btn">
                <div class="oridinary-btn-group" v-if="filterNextState && filterNextState.length">
                    <mtd-button
                        v-for="(item, index) in filterNextState"
                        :key="index"
                        :type="ticketStateMap[item].type"
                        @click="handleOperate(ticketStateMap[item].cb)">{{ $getText(ticketStateMap[item].text) }}</mtd-button>
                </div>
                <mtd-button
                    v-if="primaryButton && itemPermission(`${ticketStateMap[primaryButton].cb}Ticket`).editable"
                    :type="ticketStateMap[primaryButton].type"
                    :loading="btnLoading"
                    class="main-btn"
                    @click="handleOperate(ticketStateMap[primaryButton].cb)">{{ $getText(ticketStateMap[primaryButton].text) }}</mtd-button>
            </div>
        </div>
        <ticket-blank v-else />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter, Mutation } from 'vuex-class';
import * as api from '@/api';
import Client from '@xm/dxopen-client';
import { markHyperLink, itemPermission } from '@/utils/tools';
import TicketSlaChange from '../ticket/components/ticket-sla-change.vue';
import TicketHeadTime from '../ticket/components/ticket-head-time.vue';
import StateIcon from '@/components/state-icon.vue';
import { DEFAULT_AVATAR, TicketStateMap } from '@/config/map.conf';
import dayjs from 'dayjs';
import FormIndex from '@/views/ticket/components/form/formIndex.vue';
import { FieldToDataType } from '@/config/custom.conf';
import userAvatar from '@/components/user-avatar.vue';
import TicketBlank from '@/views/ticket/components/ticket-blank.vue';
@Component({
    components: {
        TicketSlaChange,
        TicketHeadTime,
        TicketBlank,
        StateIcon,
        FormIndex,
        userAvatar
    }
})
export default class DxmpDetail extends Vue {
    @Getter env;
    @Getter nonWorking;
    @Mutation setDetailPermission;
    // 侧边栏SDK相关
    dxmp: CommonTypes.mapObject = {};
    client: CommonTypes.mapObject = {};

    isPermission: boolean = true;
    ticketDetail: CommonTypes.mapObject = {};
    isExpand: boolean = false;
    needShowExpand: boolean = false;
    categoryContent: string = '';
    currentName: string = '';
    timeData: CommonTypes.mapObject = {};
    isWorkHour: boolean = true;
    isEdit: boolean = false;
    slaContent: string = '';
    itemPermission: Function = itemPermission;
    defaultAvatar: string = DEFAULT_AVATAR;
    imgArr: CommonTypes.mapObject = {};
    lastArr: string[] = [];
    isCustom: boolean = false;
    fieldConfig: CommonTypes.mapObject[] = [];
    customFieldValueList: CommonTypes.mapObject[] = [];
    customFormId: number = 0;
    customFieldValues: CommonTypes.mapObject[] = [];
    ticketStateMap: CommonTypes.mapObject = TicketStateMap;
    btnLoading: boolean = false;
    // 判断是否为大象iOS或andriod
    get currentContainer () {
        const ua = navigator.userAgent;
        const isIos = ua.indexOf('com.meituan.xm') !== -1 || ua.indexOf('com.meituan.message') !== -1;
        const isAndriod = ua.indexOf('com.sankuai.xmpp') !== -1;
        return isIos ? 'ios' : (isAndriod ? 'andriod' : 'web');
    }
    get ticketId () {
        return this.$route.query.id;
    }
    get detailLink () {
        return this.env === 'prod' ? `https://tt.sankuai.com/ticket/detail?id=${this.ticketId}` : `http://tt.cloud.test.sankuai.com/ticket/detail?id=${this.ticketId}`;
    }
    // 计算可展示的普通按钮
    get filterNextState () {
        if (!this.ticketDetail.nextStates) return [];
        const nextStateList = this.ticketDetail.nextStates.slice(1).filter((item) => {
            return itemPermission(`${this.ticketStateMap[item.name].cb}Ticket`).editable;
        }).map(item => item.name);
        return nextStateList || [];
    }
    // 计算可展示的primary按钮
    get primaryButton () {
        const primaryState = this.ticketDetail?.nextStates && this.ticketDetail?.nextStates[0]?.name;
        return primaryState;
    }
    get showBottomBtn () {
        return (this.primaryButton && itemPermission(`${this.ticketStateMap[this.primaryButton].cb}Ticket`).editable) || this.filterNextState?.length;
    }
    get assignedDetail () {
        return this.ticketDetail.assignedDetail && this.ticketDetail.assignedDetail.mis ? this.ticketDetail.assignedDetail : {
            mis: this.ticketDetail.assigned,
            displayName: this.ticketDetail.assigned,
            avatar: ''
        };
    }
    get reporterDetail () {
        return this.ticketDetail.reporterDetail && this.ticketDetail.reporterDetail.mis ? this.ticketDetail.reporterDetail : {
            mis: this.ticketDetail.reporter,
            displayName: this.ticketDetail.reporter,
            avatar: ''
        };
    }
    @Watch('currentContainer', { immediate: true })
    getUaChanged (ua) {
        // iOS通过重定向方式跳转到MRN详情页、andriod通过http2mrn的方式跳转到MRN详情页
        if (ua === 'ios') {
            const url = encodeURIComponent(this.detailLink);
            window.location.replace(`mtdaxiang://www.meituan.com/mrn?mrn_biz=bfe&mrn_entry=tt&mrn_component=ttdetail&originURL=${url}`);
        }
    }
    @Watch('ticketId', { immediate: true })
    async getRouteId (ticketId) {
        if (ticketId) {
            await this.getTicketDetail();
        }
    }
    @Watch('isWorkHour', { immediate: true })
    async getWorkingState (isWorkHour: boolean) {
        const showNonWorking = itemPermission('nonWorkingWarn').visible;
        if (!isWorkHour && showNonWorking) {
            const hint = await this.getNonWorkingHint();
            this.$mtd.confirm({
                title: this.$getText('dxmp_handle_success', '发起成功'),
                type: 'success',
                message: `<div class="ql-editor">${hint}</div>`,
                className: 'nonworking-warning-wrapper',
                dangerouslyUseHTMLString: true
            }).catch(e => e);
        }
    }
    async getNonWorkingHint () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getNonWorkingSetting({ rgId: this.ticketDetail.rgId });
        let { data, code } = res;
        if (code === 200) {
            return data.hint || this.$getText('dxmp_handle_wait', '您好，您的问题已收到，我们将在工作时间立刻为您处理，请您耐心等待');
        }
    }
    handleOperate (cb: string) {
        this[cb]();
    }
    async doing () {
        this.btnLoading = true;
        await this.updateTicket('state', '处理中');
        this.getTicketDetail();
    }
    pause () {
        this.$router.push({
            name: 'dxmp-handle',
            query: {
                id: this.ticketId,
                type: 'pause'
            }
        }).catch(e => e);
    }
    done () {
        this.$router.push({
            name: 'dxmp-handle',
            query: {
                id: this.ticketId,
                type: 'done'
            }
        }).catch(e => e);
    }
    close () {
        this.$router.push({
            name: 'dxmp-handle',
            query: {
                id: this.ticketId,
                type: 'close'
            }
        }).catch(e => e);
    }
    retry () {
        const isReopen = itemPermission(`reopen`).visible;
        if (!isReopen) {
            this.$mtd.confirm({
                title: this.$getText('dxmp_handle_reopen', '请重新发起工单'),
                message: this.$getText('dxmp_handle_reask', '你好，当前处理组不支持重新打开工单，请重新提问。'),
                width: '300px',
                showCancelButton: true,
                type: 'warning',
                cancelButtonText: this.$getText('dxmp_handle_reask_button', '重新提问'),
                okButtonText: this.$getText('dxmp_handle_cancel', '取消')
            }).catch(async (e) => {
                console.log(e);
                const { action } = e;
                const { categoryId, typeId, itemId } = this.ticketDetail;
                const createQuery = {
                    cid: categoryId || '',
                    tid: typeId || '',
                    iid: itemId || ''
                };
                if (action === 'cancel') {
                    let routeData = this.$router.resolve({
                        path: '/ticket/create',
                        query: createQuery
                    });
                    window.open(routeData.href, '_blank');
                }
            });
        } else {
            this.$router.push({
                name: 'dxmp-handle',
                query: {
                    id: this.ticketId,
                    type: 'retry'
                }
            }).catch(e => e);
        }
    }
    // 获取响应时长
    async getTicketTime () {
        if (!+this.ticketId) return;
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketTime(this.ticketId);
            let { code, data } = res;
            if (code === 200 && data) {
                this.timeData = data;
                this.getSlaContent();
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getNonWorkingSetting () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getNonWorkingSetting({
            rgId: this.ticketDetail.rgId,
            includeTimeState: true
        });
        let { data, code } = res;
        if (code === 200) {
            this.isWorkHour = data.active ? data.isWorkHour : true;
            if (!this.isWorkHour) this.getSlaContent();
        }
    }
    async getCustomFields () {
        if (this.ticketDetail.customFormId) {
            if (this.ticketDetail.customFieldContents) {
                this.fieldConfig = this.ticketDetail.customFieldContents;
            } else {
                await this.getSystemAndCustomFields(this.ticketDetail.customFormId);
            }
            const customFieldValues: any[] = [];
            this.fieldConfig.forEach(elem => {
                if (this.ticketDetail.customFieldValues && this.ticketDetail.customFieldValues.length) {
                    this.ticketDetail.customFieldValues.map(customElem => {
                        if (elem.id === customElem.customFieldId) {
                            elem.defaultValue = customElem.value;
                            elem.customFieldId = customElem.id;
                            if (elem.options && elem.options.length > 0) {
                                elem.defaultValue = '';
                                elem.multiDropDownValue = customElem.value;
                                elem.options = this.getOptions(elem);
                            }
                            customFieldValues.push(elem);
                        }
                    });
                }
            });
            // 获取详情
            this.customFieldValues = customFieldValues;
        }
    }
    // 获取系统字段
    async getSystemAndCustomFields (customId: number) {
        try {
            const params = {
                customFormId: customId,
                forceGet: true
            };
            const res: Ajax.AxiosResponse = await api.ticketApi.getSystemAndCustomFields(params);
            let { code, data } = res;
            if (code === 200) {
                this.fieldConfig = data.customFieldContents;
            }
        } catch (e) {
            console.log(e);
        }
    }
    getOptions (elem) {
        elem.options.forEach((option) => {
            option.isDefault = false;
        });
        // 如果是多选 默认值是数组
        if (elem.inputType === 'MULTI_DROP_DOWN' && elem.multiDropDownValue.indexOf(',')) {
            const multiDropDownValue = elem.multiDropDownValue.split(',');
            elem.options.forEach((option) => {
                multiDropDownValue.forEach((multiDrop) => {
                    if (option.value === multiDrop) {
                        option.isDefault = true;
                    }
                });
            });
        } else if (elem.inputType === 'SINGLE_DROP_DOWN'
        || (elem.inputType === 'MULTI_DROP_DOWN' && elem.multiDropDownValue.indexOf(',') === -1)) {
            elem.options.forEach((option) => {
                if (option.value === elem.multiDropDownValue) {
                    option.isDefault = true;
                }
            });
        }
        return elem.options;
    }
    enterEdit () {
        this.isEdit = true;
        const ele = document.getElementById('titleInput');
        this.$nextTick(() => {
            ele.focus();
        });
    }
    handleImgClick (e) {
        if (e.target.nodeName === 'IMG') {
            this.previewImg(e.target.src);
        }
    }
    getImgWidth (str: string) {
        // 从描述中匹配到所有img标签和对应src
        const imgReg = /<img.*?(?:>|\/>)/gi;
        const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        // 保存除img标签以外的字符串数组
        const arr = str.match(imgReg);
        this.lastArr = str.split(imgReg);
        if (!arr) {
            // 描述中无图片时，计算描述高度，判断是否需要折叠
            this.calculateDescHeight();
            return;
        }
        // 描述中有图片时，进行缩放
        arr.forEach((e: string, index: number) => {
            this.imgArr[index] = e;
            const res = e.match(srcReg);
            if (res) {
                // 计算合适的宽高
                const image = new Image();
                image.src = res[1];
                // 存储图片的宽高
                let tempW;
                let tempH;
                image.onload = () => {
                    if (image.width > 290) {
                        tempW = 290;
                        tempH = (image.height * 290) / image.width;
                    } else {
                        tempW = image.width;
                        tempH = image.height;
                    }
                    // 给对应img标签增加宽高属性，在'src'前插入'width="xxx" '
                    const start = e.substr(0, 4);
                    const end = e.substr(4, e.length);
                    e = start + ` width=${tempW}px height=${tempH}px ` + `id=img-${index}` + end;
                    // 替换旧的img标签
                    this.changeDescImg(e, index);
                };
            }
        });
    }
    changeDescImg (img: string, index: number) {
        // 将index位置的img标签字符串进行替换
        this.lastArr[index] = this.lastArr[index] + img;
        this.ticketDetail.desc = this.lastArr.join('');
        // 更新后再计算新的描述高度
        this.calculateDescHeight();
    }
    handleExpand () {
        this.isExpand = !this.isExpand;
    }
    getSlaContent () {
        if (!this.isWorkHour) {
            this.slaContent = this.$getText('non_working_time', '当前为非工作时间，请您耐心等待');
            return;
        }
        switch (this.ticketDetail.state.name) {
            case '未处理':
                this.slaContent = this.$getText('dxmp_handle_tip_solved_before', { time: dayjs(this.timeData.responseExpiration).format('YY-MM-DD HH:mm') });
                break;
            case '处理中':
            case '暂停中':
            case '挂起中':
            case '重新打开':
                this.slaContent = this.$getText('dxmp_handle_tip_solved_before', { time: dayjs(this.timeData.resolveExpiration).format('YY-MM-DD HH:mm') });
                break;
            default:
                this.slaContent = '';
                break;
        }
    }
    titleSave () {
        if (this.currentName.length > 60) {
            this.$mtd.message.warning(this.$getText('dxmp_handle_title_exceeds', '标题不能超过60个字'));
            this.currentName = this.ticketDetail.name;
            return ;
        }
        if (this.currentName.length === 0) {
            this.$mtd.message.warning(this.$getText('dxmp_handle_title_cannot_be_empty', '标题不能为空'));
            this.currentName = this.ticketDetail.name;
            return ;
        }
        // 更新工单 & 退出编辑状态
        this.isEdit = false;
        this.updateTicket('name', this.currentName);
    }
    async updateTicket (param, result) {
        try {
            let obj = {};
            obj[param] = result;
            const res: Ajax.AxiosResponse = await api.ticketApi.updateTicket(Number(this.ticketId), obj);
            let { code } = res;
            if (code === 200) {
                this.btnLoading = false;
                this.$mtd.message({
                    message: this.$getText('dxmp_handle_edit_success', '编辑成功'),
                    type: 'success'
                });
            }
        } catch (e) {
            this.btnLoading = false;
            console.log(e);
        }
    }
    async preSubmit () {
        let baseInfo: any;
        try {
            baseInfo = await this.$refs.dxmpFormIndex.validate().catch(err => console.log(`validate msg: `, err));
        } catch (err) {
            console.log('err', err);
        }
        if (baseInfo && baseInfo.valid) {
            this.customFieldValueList = [];
            this.customFieldValues.forEach((elem) => {
                Object.keys(baseInfo.payload).forEach((payloadElem) => {
                    let valueData = '';
                    if (`'${elem.id}'` === payloadElem) {
                        // 是数组的话，需要转换成字符串
                        if (Array.isArray(baseInfo.payload[payloadElem])) {
                            valueData = '';
                            if (baseInfo.payload[payloadElem].length) {
                                valueData = baseInfo.payload[payloadElem].join(',');
                            }
                        } else {
                            valueData = baseInfo.payload[payloadElem];
                        }
                        let obj = {
                            id: elem.customFieldId,
                            value: valueData,
                            dataType: FieldToDataType[elem.inputType]
                        };
                        this.customFieldValueList.push(obj);
                        return;
                    }
                });
            });
        }
    }
    async updateCustomFields () {
        await this.preSubmit();
        let params = {
            customFieldValueList: this.customFieldValueList
        };
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.updateCustomTicket(Number(this.ticketId), params);
            let { code } = res;
            if (code === 200) {
                this.$mtd.message({
                    message: this.$getText('dxmp_handle_edit_failed', '编辑成功'),
                    type: 'success'
                });
                this.$emit('success');
            }
        } catch (e) {
            console.log('e', e);
            this.$mtd.message.error(this.$getText('dxmp_handle_edit_failed', { error: e }));
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
    async getTicketDetail () {
        try {
            const res: Ajax.AxiosResponse = await api.ticketApi.getTicketDetail(Number(this.ticketId));
            let { data } = res;
            if (data.errorCode && data.errorCode === 401) {
                this.isPermission = false;
            } else {
                this.ticketDetailPermissions();
                this.getTicketTime();
                this.ticketDetail = {
                    ...data,
                    desc: markHyperLink(data.desc || '')
                };
                this.getNonWorkingSetting();
                // 将desc中的img标签提取，加入width、height属性，加入onclick事件，点击时调桥预览
                this.getImgWidth(this.ticketDetail.desc);
                console.log('detail', data, this.ticketDetail.reporterDetail.displayName);
                this.currentName = this.ticketDetail.name;
                this.categoryContent = `${this.ticketDetail.categoryName}/${this.ticketDetail.typeName}/${this.ticketDetail.itemName}`;
                this.ticketDetail.customFormId && this.getCustomFields();
            }
        } catch (e) {
            console.log(e);
        }
    }
    preventCheckEnter (e) {
        if (e.preventDefault) e.preventDefault();
        return false;
    }
    previewImg (src: string) {
        try {
            this.client.use('previewImage', {
                args: {
                    src
                }
            });
        } catch (error) {
            this.$mtd.message({
                message: this.$getText('dxmp_handle_preview_failed', '调用图片预览失败'),
                type: 'error'
            });
        }
    }
    mounted () {
        this.handleDxStyle();
    }
    created () {
        this.clientPostMessage();
    }
    blurChangeSubmit () {
        this.updateCustomFields();
    }
    calculateDescHeight () {
        this.$nextTick(() => {
            if (this.$refs.dxmpDesc.offsetHeight > 200) {
                this.isExpand = false;
                this.needShowExpand = true;
            } else {
                this.isExpand = true;
            }
        });
    }
    // 大象中发起页面的宽度处理
    handleDxStyle () {
        let html = document.getElementsByTagName('html')[0];
        let body = document.getElementsByTagName('body')[0];
        html.style.minWidth = '0px';
        body.style.minWidth = '0px';
    }
    clientPostMessage () {
        try {
            this.client = new Client({
                id: 'OPEN_PLATFORM_trouble_tracker'
            });
            this.dxmp = this.client.mp;
            // 唤起devtools
            // this.dxmp.openDevTools();
            this.dxmp?.setNavButtons({
                config: [
                    {
                        entry: 'forward',
                        enable: true
                    }
                ]
            });
            this.dxmp?.setTitle({
                text: this.$getText('dxmp_handle_tt_detail', 'TT详情')
            });
            console.log('dx', this.dxmp, this.client);
        } catch (error) {
            console.log(error);
        }
    }
}
</script>

<style lang="scss">
.light-text {
    font-weight: 400;
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.5);
    line-height: 28px;
}
.lighter-text {
    font-weight: 400;
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.35);
    line-height: 28px;
}
.header-style {
    font-weight: 500;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.9);
    line-height: 22px;
}
.regular-text {
    font-weight: 400;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.9);
    letter-spacing: 0;
    line-height: 22px;
}
.ticket-blank-container {
    width: 100%;
    height: 100%;
    position: static;
    padding-top: 72px;
    border-radius: 12px;
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
.dxmp-detail-container {
    width: auto;
    padding: 24px 24px 0 24px;
    overflow-y: auto;
    overflow-y: overlay;
    border-radius: 12px 12px 0 0;
    background: #fff;
    &.without-bottom {
        padding-bottom: 56px;
    }
    .header-wrapper {
        padding: 8px 12px;
        width: 100%;
        border-radius: 9px;
        height: 45px;
        // line-height: 45px;
        position: relative;
        display: flex;
        &.header-S1,
        &.header-S2 {
            background: #ffe5e2;
        }
        &.header-S3 {
            background: #ffefcd;
        }
        &.header-S4 {
            background: #ecf6fd;
        }
        &.header-S5 {
            background: #efefef;
        }
        .dxmp-sla {
            .sla-type-S1 {
                .mtd-picker-selection {
                    width: 96px;
                }
            }
            .mtd-picker-selection {
                height: 28px;
                width: 68px;
                .mtd-picker-icon {
                    .mtdicon {
                        line-height: 24px;
                    }
                }
            }
        }
        .dxmp-state-text {
            font-weight: 500;
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.7);
            line-height: 28px;
            display: inline-block;
            margin-left: 4px;
            flex: 0 0 auto;
        }
        &.header-S1 {
            .dxmp-sla-text {
                text-align: right;
                line-height: 18px;
                width: 106px;
                top: 5px;
            }
        }
        .dxmp-sla-text {
            font-weight: 400;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
            line-height: 28px;
            vertical-align: middle;
            position: absolute;
            right: 12px;
            word-wrap: break-word;
            flex: 1 1 auto;
            display: inline-block;
            text-align: right;
            &.non-working {
                text-align: right;
                line-height: 18px;
                width: 110px;
                top: 5px;
            }
        }
    }
    .title-wrapper {
        margin-top: 24px;
        .mtd-tooltip-rel {
            display: block;
        }
        .mtd-textarea {
            height: 28px;
            font-weight: 500;
            opacity: 0.9;
            font-family: PingFangSC-Medium;
            font-size: 20px;
            color: #000;
            line-height: 28px;
            width: 300px;
        }
        .title-content {
            display: inline-block;
            max-width: 270px;
            font-weight: 500;
            opacity: 0.9;
            font-family: PingFangSC-Medium;
            font-size: 20px;
            color: #000;
            line-height: 28px;
        }
        .mtdicon-edit-o {
            vertical-align: top;
        }
        .category {
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    .desc-wrapper {
        .desc-content {
            margin-top: 12px;
            text-align: justify;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 22px;
        }
        .expand {
            overflow: auto;
            height: auto;
        }
        .close {
            max-height: 220px;
        }
        .mtd-btn {
            padding: 0;
            color: rgba(0, 0, 0, 0.35);
            .mtdicon {
                font-size: 14px;
                margin-left: -4px;
            }
            &:hover {
                color: rgba(0, 0, 0, 0.35);
            }
        }
    }
    .relative-people {
        margin-top: 32px;
        margin-bottom: 13px;
    }
    .user-wrapper {
        .header-img-container {
            width: 16px;
            height: 16px;
        }
        .user-name {
            font-weight: 400;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.9);
            letter-spacing: 0;
            line-height: 22px;
        }
    }
    .avatar {
        width: 16px;
        height: 16px;
        vertical-align: middle;
        border-radius: 3px;
        overflow: hidden;
        display: inline-block;
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
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
        .oridinary-btn-group {
            flex: 1 1 50%;
            display: flex;
            .mtd-btn {
                flex: 1 1 50%;
            }
        }
        .mtd-btn {
            font-weight: 500;
            font-family: PingFangSC-Medium;
            border-radius: 6px;
            border: none;
            background: rgba(0, 0, 0, 0.06);
            color: rgba(0, 0, 0, 0.84);
            margin: 0 4px;
            &.main-btn {
                flex: 1 1 50%;
                &.mtd-btn-primary {
                    background: #ffc300;
                }
            }
        }
    }
    .jump-detail-link {
        margin: 32px 0;
        display: inline-block;
        span {
            line-height: 22px;
        }
        .icon-wrapper {
            vertical-align: text-bottom;
        }
    }
    .custom-form {
        .mtd-form-item {
            margin-bottom: 12px;
            .component-textarea {
                min-height: 72px;
            }
        }
        .mtd-input-suffix-inner {
            width: 32px;
            line-height: 32px;
            font-size: 16px;
        }
        .mtd-select-search-field {
            margin-left: 4px;
        }
        .component-select,
        .component-select-multiple,
        .component-date,
        .mtd-input-wrapper {
            width: 100%;
            border-radius: 6px;
        }
        .mtd-select-multiple-focus {
            border-color: #ffc300;
        }
        .mtd-form-item-label {
            font-weight: 400;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.5);
            letter-spacing: 0;
            line-height: 22px;
            margin-bottom: 4px;
        }
    }
}
.mtd-dropdown-menu {
    max-height: 188px;
}
.mtd-modal {
    min-width: 310px;
    width: 315px;
    .mtd-confirm-title {
        font-family: PingFangSC-Medium;
    }
}
</style>
