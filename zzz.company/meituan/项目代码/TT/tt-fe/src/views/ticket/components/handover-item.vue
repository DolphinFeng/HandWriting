<template>
    <div :class="{'display-status': !dataItem.editStatus}">
        <mtd-loading
            :loading="dataItem.loading"
            class="handover-loading"
            :message="$getText('handover_item_loading_message', '正在交接中...')">
            <div class="handover-item-title">
                {{ dataItem.rgName }}
                <span v-if="!dataItem.permission" class="permission-hint">{{ $getText('handover_item_permission_hint', '您没有管理员权限，如需修改请联系') + dataItem.rgOwner }}</span>
                <mtd-button
                    type="primary"
                    v-show="dataItem.editStatus"
                    @click="submit">{{ $getText('handover_item_submit_button', '提交') }}</mtd-button>
                <mtd-button @click="editItem" :disabled="!dataItem.permission">{{ dataItem.editStatus ? $getText('handover_item_cancel_button', '取消') : $getText('handover_item_edit_button', '编辑') }}</mtd-button>
            </div>
            <div
                class="handover-item-select"
                v-if="dataItem.owner"
                :class="{'unfinish-item': !dataItem.validateOwner}">
                <span class="select-title">{{ $getText('handover_item_owner_title', '负责人权限') }}</span>
                <span v-if="!dataItem.editStatus" class="select-placeholder">{{ $getText('handover_item_select_placeholder', '请选择交接人') }}</span>
                <pm-select
                    v-else
                    type="dropdown"
                    :disabled-select="!dataItem.permission"
                    remote
                    :remote-method="searchUser"
                    class="component-label"
                    :show-avatar="true"
                    :formatter="formatterOption"
                    profile-key="avatar"
                    @change="ownerChange"
                    :placeholder="$getText('handover_item_select_placeholder', '请选择交接人')"
                    :input-placeholder="$getText('handover_item_search_placeholder', '搜索交接人')">
                    <pm-select-option
                        v-for="item in dataItem.rgUsers"
                        :profile="item.avatar"
                        :show-avatar="true"
                        :key="item.username"
                        :value="item"
                        :label="item.label" />
                </pm-select>
                <div v-if="dataItem.editStatus && !dataItem.validateOwner" class="error-tip">{{ $getText('handover_item_owner_error_tip', '请完成该工作的交接') }}</div>
            </div>
            <div
                class="handover-item-select"
                v-if="dataItem.oncall"
                :class="{'unfinish-item': !dataItem.validateOncall}">
                <span class="select-title">{{ $getText('handover_item_oncall_title', '值班工作') }}</span>
                <span v-if="!dataItem.editStatus" class="select-placeholder">{{ $getText('handover_item_select_placeholder', '请选择交接人') }}</span>
                <pm-select
                    v-else
                    type="dropdown"
                    :disabled-select="!dataItem.permission"
                    remote
                    :remote-method="searchUser"
                    class="component-label"
                    :show-avatar="true"
                    :formatter="formatterOption"
                    profile-key="avatar"
                    @change="oncallChange"
                    :placeholder="$getText('handover_item_select_placeholder', '请选择交接人')"
                    :input-placeholder="$getText('handover_item_search_placeholder', '搜索交接人')">
                    <pm-select-option
                        v-for="item in dataItem.rgUsers"
                        :profile="item.avatar"
                        :show-avatar="true"
                        :key="item.username"
                        :value="item"
                        :label="item.label" />
                </pm-select>
                <div v-if="dataItem.editStatus && !dataItem.validateOncall" class="error-tip">{{ $getText('handover_item_owner_error_tip', '请完成该工作的交接') }}</div>
            </div>
            <div
                class="handover-item-select"
                v-if="dataItem.ticket"
                :class="{'unfinish-item': !dataItem.validateTicket}">
                <span class="select-title">{{ $getText('handover_item_ticket_title', '待处理工单') }}</span>
                <span v-if="!dataItem.editStatus" class="select-placeholder">{{ $getText('handover_item_select_placeholder', '请选择交接人') }}</span>
                <pm-select
                    v-else
                    type="dropdown"
                    :disabled-select="!dataItem.permission"
                    remote
                    :remote-method="searchUser"
                    class="component-label"
                    :show-avatar="true"
                    profile-key="avatar"
                    :formatter="formatterOption"
                    @change="ticketChange"
                    :placeholder="$getText('handover_item_select_placeholder', '请选择交接人')"
                    :input-placeholder="$getText('handover_item_search_placeholder', '搜索交接人')">
                    <pm-select-option
                        v-for="item in dataItem.rgUsers"
                        :profile="item.avatar"
                        :show-avatar="true"
                        :key="item.username"
                        :value="item"
                        :label="item.label" />
                </pm-select>
                <div v-if="dataItem.editStatus && !dataItem.validateTicket" class="error-tip">{{ $getText('handover_item_owner_error_tip', '请完成该工作的交接') }}</div>
                <span class="select-ticket" @click="handleTicketFold">
                    <i
                        :class="`mtdicon ${dataItem.showTicket ? 'mtdicon-visibility-off-o' : 'mtdicon-visibility-on-o'}`" />
                    <span>{{ $getText('handover_item_ticket_button', '查看工单') }}</span>
                </span>
            </div>
            <mtd-table v-if="dataItem.showTicket" :data="dataItem.ticketList">
                <mtd-table-column
                    prop="name"
                    :label="$getText('handover_item_ticket_table_title', '标题')"
                    show-overflow-tooltip
                    width="340">
                    <template slot-scope="scope">
                        <a :href="scope.row.link" target="_blank">{{ scope.row.name }}</a>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    prop="cti"
                    :label="$getText('handover_item_ticket_table_category', '所属目录')"
                    show-overflow-tooltip
                    width="420" />
            </mtd-table>
            <mtd-pagination
                v-if="dataItem.showTicket"
                :total="dataItem.totalTicket"
                show-size-changer
                show-total
                size="small"
                :current-page.sync="currentPage"
                :page-size.sync="limit"
                @change="handleChange" />
        </mtd-loading>
        <mtd-modal
            v-model="modalVisible"
            class="double-check-modal"
            mask-closable
            :closable="false"
            :width="400">
            <div slot="title" class="check-modal-title">
                <mtd-icon name="warning-circle" />
                <span>{{ $getText('handover_item_modal_title', '添加RG组成员') }}</span>
            </div>
            <div class="check-modal-body">
                {{ nonRgUserName.join('、') + $getText('handover_item_modal_content', '不属于RG组成员，是否添加为RG组成员') }}
            </div>
            <div slot="footer">
                <mtd-button @click="modalVisible = false">{{ $getText('handover_item_modal_cancel_button', '取消') }}</mtd-button>
                <mtd-button
                    type="primary"
                    :loading="loading"
                    @click="addNonRgUser">{{ $getText('handover_item_modal_confirm_button', '确认添加') }}</mtd-button>
            </div>
        </mtd-modal>
    </div>
</template>
<script lang="ts">
import { Component, Watch, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { PaginationMixin } from '@/utils/mixin';
import * as api from '@/api';
import { uniqueObject } from '@/utils/tools/index.ts';

@Component({
    components: {}
})
export default class HandoverItem extends PaginationMixin {
    @Prop() rgItem: any;
    @Prop() user: string;
    @Prop() isLastItem: boolean;
    @Getter env;
    limit: number = 10;
    modalVisible: boolean = false;
    loading: boolean = false;
    nonRgUserName: string[] = [];
    nonRgUserList: any[] = [];
    dataItem: any[] = [];
    userMap: any[] = [{
        username: '',
        displayName: '',
        role: 'NORMAL',
        isRgUser: false
    }];
    defaultUserList: any[] = [];

    @Watch('rgItem', { immediate: true, deep: true })
    getRgItemChanged () {
        this.dataItem = Object.assign({}, this.rgItem);
    }
    handleTicketFold () {
        if (this.dataItem.showTicket) {
            this.$set(this.dataItem, 'showTicket', false);
            return;
        }
        this.searchTicket();
    }
    editItem () {
        if (!this.dataItem.editStatus) this.getRgUsers();
        this.$set(this.dataItem, 'editStatus', !this.dataItem.editStatus);
    }
    formatterOption (val: any) {
        const { label } = val;
        return label && label.split('/')[0];
    }
    ownerChange (val) {
        this.dataItem.validateOwner = !!val;
        this.dataItem.ownerMis = val.username;
    }
    oncallChange (val) {
        this.dataItem.validateOncall = !!val;
        this.dataItem.oncallMis = val.username;
    }
    ticketChange (val) {
        this.dataItem.validateTicket = !!val;
        this.dataItem.ticketMis = val.username;
    }
    async addNonRgUser () {
        // 将非RG组成员根据其交接项添加到RG，并提交表单
        // 先根据role对成员分类，至多请求两次接口
        this.loading = true;
        let adminUser = '';
        const normalUserList = [];
        this.nonRgUserList.map(e => {
            if (e.role === 'NORMAL') {
                normalUserList.push(e.username);
            } else {
                adminUser = e.username;
            }
        });
        await Promise.all([this.addRgUser([adminUser], 'RGADMIN'), this.addRgUser(normalUserList, 'NORMAL')]).then(res => {
            this.loading = false;
            this.modalVisible = false;
            this.submitHandover();
        }).catch(err => {
            this.loading = false;
            console.log('err', err);
        });
    }
    submit () {
        // 校验是否完成所有交接
        // validate有false则不能提交
        // validate TRUE mis 有值 =》 第一次选中，没有清空 TRUE
        // validate TRUE mis 为空 =》 没有选择过 FALSE
        // validate FALSE => FALSE
        const unfinishOwner = this.dataItem.owner && !(this.dataItem.ownerMis && this.dataItem.validateOwner);
        const unfinishOncall = this.dataItem.oncall && !(this.dataItem.oncallMis && this.dataItem.validateOncall);
        const unfinishTicket = this.dataItem.ticket && !(this.dataItem.ticketMis && this.dataItem.validateTicket);
        if (unfinishOwner || unfinishOncall || unfinishTicket) {
            if (unfinishOwner) this.$set(this.dataItem, 'validateOwner', false);
            if (unfinishOncall) this.$set(this.dataItem, 'validateOncall', false);
            if (unfinishTicket) this.$set(this.dataItem, 'validateTicket', false);
            return;
        }
        // 对交接人进行预处理，并校验选择的交接人是否在RG组内，获得非Rg组内成员mis
        this.userMap = [].concat({
            username: this.dataItem.ownerMis,
            displayName: '',
            role: 'RGADMIN',
            isRgUser: false
        }, {
            username: this.dataItem.oncallMis,
            displayName: '',
            role: 'NORMAL',
            isRgUser: false
        }, {
            username: this.dataItem.ticketMis,
            displayName: '',
            role: 'NORMAL',
            isRgUser: false
        });
        let userList = this.userMap.filter(ele => ele.username).map(ele => ele.username).filter((ele, index, self) => {
            return self.indexOf(ele) === index;
        });
        this.hasRgUser(userList);
    }
    async submitHandover () {
        // 格式化请求参数
        let submitParams: any = {};
        if (this.dataItem.owner) submitParams.owner = this.dataItem.ownerMis;
        if (this.dataItem.oncall) submitParams.oncall = this.dataItem.oncallMis;
        if (this.dataItem.ticket) submitParams.ticket = this.dataItem.ticketMis;
        const res = await api.ctiApi.sumbitHandoverRG({
            mis: this.user,
            rgId: this.dataItem.rgId,
            ...submitParams,
            handoverCompleted: this.isLastItem
        });
        if (res.code === 200) {
            // 完成了值班人&负责人的交接，待处理工单需要调用update接口
            if (this.dataItem.ticket) {
                this.updateTicket();
            } else {
                this.$mtd.message({
                    message: this.$getText('handover_item_modal_success_msg', '交接完成'),
                    type: 'success'
                });
                this.$emit('update');
            }
        }
    }
    async updateTicket () {
        const res: Ajax.AxiosResponse = await api.ticketApi.updateBatchTicket({
            ticketUpdate: {
                assigned: this.dataItem.ticketMis,
                appointAssigned: true
            },
            ticketFilter: {
                state: ['未处理', '处理中', '重新打开', '暂停中', '挂起中'],
                assigned: [this.user],
                rgIds: [this.dataItem.rgId]
            }
        });
        const { code } = res;
        if (code === 200) {
            // 进入loading状态，等待后端通过pike告知前端结果
            this.$set(this.dataItem, 'loading', true);
        }
    }
    async searchTicket () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getTicketList(this.currentPage, this.limit, {
            rgIds: [this.dataItem.rgId],
            state: ['未处理', '处理中', '重新打开', '暂停中', '挂起中'],
            assigned: [this.user]
        });
        const { code, data } = res;
        if (code === 200 && data) {
            let item = Object.assign({}, this.dataItem);
            item['showTicket'] = true;
            item['ticketList'] = data.items || [];
            item['totalTicket'] = data.tn;
            item['ticketList'].forEach(e => {
                e.cti = `${e.categoryName}/${e.typeName}/${e.itemName}`;
                switch (this.env) {
                    case 'prod':
                        e.link = `https://tt.sankuai.com/ticket/detail?id=${e.id}`;
                        break;
                    case 'staging':
                        e.link = `http://tt.fetc.st.sankuai.com/ticket/detail?id=${e.id}`;
                        break;
                    case 'test':
                    default:
                        e.link = `http://tt.cloud.test.sankuai.com/ticket/detail?id=${e.id}`;
                        break;
                }
            });
            this.dataItem = Object.assign({}, item);
        }
    }
    async getRgUsers () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgRecommendUser(this.dataItem?.rgId);
        const { code, data } = res;
        if (code === 200 && data) {
            const userList = (data.items || []).map(e => {
                e.label = e.displayName + '/' + e.username;
                return e;
            });
            this.$set(this.dataItem, 'rgUsers', userList);
            this.defaultUserList = Object.assign({}, userList);
        }
    }
    async searchUser (query: string) {
        if (query.trim().length < 1) {
            this.$set(this.dataItem, 'rgUsers', this.defaultUserList);
            return;
        }
        const res: Ajax.AxiosResponse = await api.ctiApi.searchUser({
            keyword: query,
            includeVirtual: true,
            includeExternal: true
        });
        const { code, data } = res;
        if (code === 200 && data) {
            this.$set(this.dataItem, 'rgUsers', (data.items || []).map(e => {
                e.label = e.displayName + '/' + e.username;
                return e;
            }));
        }
    }
    async addRgUser (misList: string[], role: string) {
        if (!misList.length || !misList[0]) return;
        await api.ctiApi.addRgUser({
            rgUsers: misList,
            rgId: this.dataItem.rgId,
            type: 'MISID',
            role: role,
            handover: true
        });
    }
    async hasRgUser (list: string[]) {
        const res: Ajax.AxiosResponse = await api.ctiApi.isRgUser({
            misList: list,
            rgId: this.dataItem.rgId
        });
        const { code, data } = res;
        if (code === 200 && data) {
            // 将中文名和isRgUser填入userMap
            this.userMap.forEach(ele => {
                if (ele.username) {
                    ele.displayName = data[ele.username].displayName;
                    ele.isRgUser = data[ele.username].inRg;
                    if (!ele.isRgUser) {
                        this.nonRgUserName.push(ele.displayName);
                        this.nonRgUserList.push(ele);
                    }
                }
                return ele;
            });
            this.nonRgUserName = this.nonRgUserName.filter((ele, index, self) => {
                return self.indexOf(ele) === index;
            });
            this.nonRgUserList = uniqueObject(this.nonRgUserList, 'username');
            if (this.nonRgUserName.length) {
                // 存在非RG成员，展示弹框
                this.modalVisible = true;
            } else {
                // 不存在非RG成员，提交
                this.submitHandover();
            }
        }
    }
    handleChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.searchTicket();
    }
}
</script>
<style lang="scss">
.handover-loading {
    .mtd-loading-container.mtd-loading-blur {
        opacity: 0.2;
    }
}
.handover-item {
    &:last-child {
        border: none;
        padding-bottom: 10px;
    }

    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    padding: 16px 0;
    .handover-item-title {
        font-weight: 500;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 24px;
        position: relative;
        .permission-hint {
            font-weight: 400;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: #626262;
            line-height: 22px;
            margin-left: 8px;
        }
        .mtd-btn {
            width: 80px;
            position: absolute;
            right: 0;
        }
        .mtd-btn-primary {
            right: 92px;
        }
    }
    .handover-item-select {
        font-weight: 400;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        letter-spacing: 0;
        line-height: 22px;
        margin-top: 17px;
        .pm-select {
            .mtd-picker-selection {
                padding-left: 16px;
            }
        }
        &.unfinish-item {
            position: relative;
            .pm-select {
                .mtd-picker {
                    border-color: #ff5f57;
                }
            }
            .error-tip {
                font-size: 12px;
                color: #ff5f57;
                line-height: 20px;
                margin-left: 85px;
                position: absolute;
                top: 31px;
            }
        }
    }
    .select-title {
        display: inline-block;
        width: 70px;
    }
    .select-placeholder {
        font-weight: 400;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.24);
        letter-spacing: 0;
        line-height: 22px;
        margin-left: 24px;
        margin-right: 8px;
    }
    .component-label {
        display: inline-block;
        width: 208px;
        margin-left: 12px;
    }
    .select-ticket {
        margin-left: 16px;
        font-weight: 400;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: 0;
        text-align: right;
        line-height: 32px;
        cursor: pointer;
        span {
            vertical-align: middle;
        }
    }
    .mtd-table {
        margin-top: 16px;
        margin-bottom: 12px;
    }
    .mtd-pagination {
        text-align: right;
    }
}
.display-status {
    .handover-item-select {
        margin-top: 24px;
    }
}
.double-check-modal {
    .mtd-modal-header {
        padding-bottom: 8px;
        div {
            display: inline-block;
            line-height: 24px;
            height: 24px;
            font-size: 16px;
            i {
                font-size: 20px;
                line-height: 24px;
                display: inline-block;
                vertical-align: middle;
                margin-right: 8px;
                color: #f5ba31;
            }
            span {
                display: inline-block;
                height: 24px;
                line-height: 24px;
                vertical-align: middle;
                font-family: PingFangSC-Medium;
                font-weight: 500;
            }
        }
    }
    .check-modal-body {
        padding-left: 34px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
    }
}
</style>
