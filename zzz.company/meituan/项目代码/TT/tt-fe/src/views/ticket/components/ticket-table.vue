<template>
    <div :class="['ticket-list-pc', { 'list-with-files': hasExpand }]">
        <mtd-table
            :data="ticketList"
            bordered
            show-overflow-tooltip
            @sort-change="sortChange"
            size="small">
            <div slot="empty">
                {{ $getText('ticket_table_empty_text', '暂无数据') }}
            </div>
            <mtd-table-column
                width="40px"
                v-if="hasExpand && !expand"
                label-class="expand-header-icon">
                <div slot="header" @click="expandEvent">
                    <i class="iconfont icon-open" />
                </div>
            </mtd-table-column>
            <mtd-table-column
                v-for="(col, index) in columns" 
                :key="`${col.key}/${index}`"
                :width="col.width"
                :label="$getText(col.label)"
                :prop="col.key"
                :min-width="col.minWidth"
                :resizable="col.resizable"
                :sortable="col.isSortAble && sortType"
                :v-if="inside || !col.vIf"
                :class-name="`${col.key}-component`"
                :show-overflow-tooltip="col.showOverflowTooltip">
                <template slot-scope="scope">
                    <component 
                        :is="col.renderComponent"
                        :scope="scope"
                        :item="col" />
                </template>
            </mtd-table-column>
        </mtd-table>
        <span v-if="(hasSetting && columnsList && columnsList.length > 0)">
            <mtd-tooltip :content="$getText('ticket_table_setting_tooltip', '设置表头字段')">
                <i class="mtdicon mtdicon-setting table-setting" @click="showSetting" />
            </mtd-tooltip>
        </span>
        <mtd-modal
            :title="$getText('ticket_table_setting_modal_title', '设置列表显示字段')"
            v-model="settingVisible"
            class="table-setting-modal"
            width="450px">
            <div class="table-setting-content">
                <div class="table-setting-ul">
                    <h3>{{ $getText('ticket_table_unshow_label_title', { length: unShowLableList.length }) }}</h3>
                    <span class="tips">{{ $getText('ticket_table_unshow_label_tips', '支持向右拖拽选择') }}</span>
                    <div class="options">
                        <div
                            class="option"
                            v-for="item in unShowLableList"
                            :key="item.id">
                            <span><i class="mtdicon mtdicon-handle" /></span>
                            <span>{{ item.name }}</span>
                            <span @click="addShowLable(item)"><i class="mtdicon mtdicon-add add-visible" /></span>
                        </div>
                    </div>
                </div>
                <div class="table-setting-ul">
                    <h3>{{ $getText('ticket_table_show_label_title', { length: showLableList.length }) }}</h3>
                    <span class="tips">{{ $getText('ticket_table_show_label_tips', '支持上下拖拽排序，保存后生效') }}</span>
                    <Container
                        @drop="onDropForShow"
                        class="options"
                        group-name="setting">
                        <Draggable v-for="item in showLableList" :key="item.id">
                            <div class="option">
                                <span><i class="mtdicon mtdicon-handle" /></span>
                                <span>{{ item.name }}</span>
                                <span @click="removeShowLable(item)" v-if="item.id !== 'name'"><i class="mtdicon mtdicon-close add-visible" /></span>
                            </div>
                        </Draggable>
                    </Container>
                </div>
            </div>
            <div class="table-setting-submit">
                <mtd-button @click="cancelSetting" class="table-setting-button">{{ $getText('ticket_table_cancel_button', '取消') }}</mtd-button>
                <mtd-button
                    @click="submitSetting"
                    class="table-setting-button"
                    :disabled="showLableList.length === 0"
                    type="primary">{{ $getText('ticket_table_save_button', '保存') }}</mtd-button>
            </div>
        </mtd-modal>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
import { Container, Draggable } from 'vue-smooth-dnd';
import * as api from '@/api';

import { TicketSlaIcon, Sla2CN } from '@/config/map.conf';
import SlaIcon from '@/components/sla-icon.vue';
import StateIcon from '@/components/state-icon.vue';
import UserAvatar from '@/components/user-avatar.vue';
import TicketTableSLA from './ticket-table-sla.vue';
import TicketTableState from './ticket-table-state.vue';
import TicketTableUser from './ticket-table-user.vue';
import TicketTableReporter from './ticket-table-reporter.vue';
import TicketTableName from './ticket-table-name.vue';
import TicketTableReplier from './ticket-table-replier.vue';
import VueClipboards from 'vue-clipboards';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { LIST_LX_MAP } from '@/config/lx_map.conf';
Vue.use(VueClipboards);

/**
 * Ticket表格
 *
 * @author liyuyao
 * @date 06/19/2019
 */
@Component({
    components: {
        SlaIcon,
        StateIcon,
        UserAvatar,
        Container,
        Draggable,
        TicketTableSLA,
        TicketTableState,
        TicketTableUser,
        TicketTableReporter,
        TicketTableName,
        TicketTableReplier
    }
})
export default class TicketTable extends Vue {
    @Prop({ default: [] })
    ticketList: any;

    @Prop({ default: function () {
        return ['id', 'name', 'priority', 'state', 'assignedCnName', 'ticketType', 'directory', 'createdAt', 'reporterCnName'];
    }})
    columnsList: any;

    @Prop({ default: true })
    sortable: boolean;

    @Prop({ default: false })
    hasSetting: boolean;

    @Prop({ default: false })
    expand: boolean;

    @Prop({ default: false })
    hasExpand: boolean;

    @Getter inside;
    @Getter spaceDomain;

    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    emptyText: string = this.$getText('ticket_table_empty_text', '暂无数据');
    sla2CN: CommonTypes.mapObject = Sla2CN;
    ticketSlaIcon: CommonTypes.mapObject = TicketSlaIcon;
    settingVisible: boolean = false;
    // 渲染组件
    idComponent: any = Vue.extend({
        props: ['scope'],
        methods: {
            copyTicktId (id: number) {
                return id;
            },
            handleCopySuccess () {
                lxReportClick(LIST_LX_MAP['copy_num']);
                this.$mtd.message({
                    message: this.$getText('ticket_table_tip_copy_success', 'TT编号复制成功'),
                    type: 'success'
                });
            }
        },
        template: `<div
                        class="copy-ticket-id"
                        v-clipboard="copyTicktId(scope.row.id)"
                        @success="handleCopySuccess">
                        {{ scope.row.id }}
                    </div>`
    });
    // 组件注册
    ticketTypeComponent: any = Vue.extend({
        props: ['scope'],
        template: `<span>{{ scope.row.ticketType }}</span>`
    });
    directoryComponent: any = Vue.extend({
        props: ['scope'],
        template: `<span>{{ scope.row.categoryName}}/{{scope.row.typeName}}/{{scope.row.itemName}}</span>`
    });
    createdAtComponent: any = Vue.extend({
        props: ['scope'],
        template: `<span class="time-text">{{ scope.row.createdAt | formatTimeToMin }}</span>`
    });
    reporterOrgComponent: any = Vue.extend({
        props: ['scope'],
        template: `<span>{{ scope.row.org }}</span>`
    });
    reporterCityComponent: any = Vue.extend({
        props: ['scope'],
        template: `<span>{{ scope.row.reporterCity }}</span>`
    });
    lastReplyTimeComponent: any = Vue.extend({
        props: ['scope'],
        template: `<span>{{ scope.row.lastReplyTime | formatTimeToMin }}</span>`
    });
    // 组件映射
    columnsMap: any = {
        id: {
            key: 'id',
            label: 'ticket_table_id_label',
            width: '95px',
            renderComponent: this.idComponent
        },
        name: {
            key: 'name',
            label: 'ticket_table_title_label',
            minWidth: '400px',
            resizable: true,
            renderComponent: TicketTableName
        },
        priority: {
            key: 'sla',
            width: '100px',
            label: 'ticket_table_priority_label',
            isSortAble: true,
            resizable: true,
            renderComponent: TicketTableSLA
        },
        state: {
            width: '100px',
            label: 'ticket_table_status_label',
            isSortAble: true,
            key: 'state',
            resizable: true,
            renderComponent: TicketTableState
        },
        assignedCnName: {
            key: 'assignedCnName',
            label: 'ticket_table_handler_label',
            width: '100px',
            resizable: true,
            renderComponent: TicketTableUser
        },
        ticketType: {
            key: 'ticketType',
            label: 'ticket_table_type_label',
            width: '90px',
            isSortAble: true,
            resizable: true,
            renderComponent: this.ticketTypeComponent
        },
        directory: {
            key: 'directory',
            label: 'ticket_table_directory_label',
            minWidth: '184px',
            resizable: true,
            renderComponent: this.directoryComponent
        },
        createdAt: {
            key: 'createdAt',
            label: 'ticket_table_creation_time_label',
            minWidth: '140px',
            isSortAble: true,
            resizable: true,
            renderComponent: this.createdAtComponent
        },
        reporterCnName: {
            key: 'reporterCnName',
            label: 'ticket_table_initiator_label',
            width: '100px',
            vIf: 'inside',
            resizable: true,
            showOverflowTooltip: false,
            renderComponent: TicketTableReporter
        },
        reporterOrg: {
            key: 'reporterOrg',
            label: 'ticket_table_initiator_org_structure_label',
            minWidth: '184px',
            resizable: true,
            renderComponent: this.reporterOrgComponent
        },
        reporterCity: {
            key: 'reporterCity',
            label: 'ticket_table_initiator_city_label',
            width: '120px',
            resizable: true,
            renderComponent: this.reporterCityComponent
        },
        lastReplier: {
            key: 'lastReplier',
            label: 'ticket_table_last_responder_label',
            width: '136px',
            resizable: true,
            renderComponent: TicketTableReplier
        },
        lastReplyTime: {
            key: 'lastReplyTime',
            label: 'ticket_table_last_response_time_label',
            width: '156px',
            resizable: true,
            renderComponent: this.lastReplyTimeComponent
        }
    };
    get labelList () {
        return Object.keys(this.columnsMap).map(key => {
            const columnsInfo = this.columnsMap[key];
            return {
                id: key,
                name: this.$getText(columnsInfo.label)
            };
        });
    }
    columns: any[] = [];
    unShowLableList: any[] = [];
    showLableList: any[] = [];
    _unShowLableList: any[] = [];
    _showLableList: any[] = [];
    @Watch('columnsList', { immediate: true })
    columnsListChange () {
        if (this.columnsList.length === 0) return;
        this.columns = this.columnsList.map(item => this.columnsMap[item]).filter(Boolean);
        this.unShowLableList = this.labelList.filter(item => this.columnsList.indexOf(item.id) === -1);
        this.showLableList = this.columnsList.map(key => {
            const columnsInfo = this.columnsMap[key];
            return {
                id: key,
                name: this.$getText(columnsInfo.label)
            };
        });
        this._unShowLableList = this.unShowLableList;
        this._showLableList = this.showLableList;
    }
    get sortType () {
        return this.sortable ? 'custom' : false;
    }
    // 设置组件架构信息
    setDept (bg: string, bu: string, org: string, ellipsis?: boolean) {
        let dept: string = '';
        if (bg) {
            dept += `${bg}/`;
        }
        if (bu) {
            dept += ellipsis ? '…/' : `${bu}/`;
        }
        if (org) {
            dept += `${org}`;
        }
        return dept;
    }
    sortChange (val) {
        const { prop, order } = val;
        this.$emit('sort', prop, order);
    }
    showSetting () {
        this.settingVisible = true;
    }
    copyTicktId (id: number) {
        return id;
    }
    handleCopySuccess () {
        lxReportClick(LIST_LX_MAP['copy_num']);
        this.$mtd.message({
            message: this.$getText('ticket_table_tip_copy_success', 'TT编号复制成功'),
            type: 'success'
        });
    }
    addShowLable (result) {
        this.unShowLableList = this.unShowLableList.filter(item => {
            const isKeyLable = item.id === result.id;
            if (isKeyLable) this.showLableList.push(item);
            return !isKeyLable;
        });
    }
    removeShowLable (result) {
        this.showLableList = this.showLableList.filter(item => {
            const isKeyLable = item.id === result.id;
            if (isKeyLable) this.unShowLableList.push(item);
            return !isKeyLable;
        });
    }
    onDropForShow (result) {
        const { removedIndex, addedIndex } = result;
        const lableList = this.showLableList;
        const keyLable = lableList[removedIndex];
        lableList.splice(removedIndex, 1);
        lableList.splice(addedIndex, 0, keyLable);
        this.showLableList = lableList;
    }
    cancelSetting () {
        this.showLableList = this._showLableList;
        this.unShowLableList = this._unShowLableList;
        this.settingVisible = false;
    }
    async submitSetting () {
        const settingColumnsList = this.showLableList.map(item => item.id);
        const res: Ajax.AxiosResponse = await api.ticketApi.saveTableColumns(settingColumnsList);
        let { code } = res;
        if (code === 200) {
            // 提交成功
            this.settingVisible = false;
            this.$emit('sort');
        }
    }
    expandEvent () {
        this.$emit('update:expand', true);
    }
}
</script>

<style lang="scss">
.ticket-list-pc {
    height: 100%;
    // box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.08);
    // border-radius: 4px 4px 0 0;
    &.list-with-files {
        flex: 1;
        overflow-x: auto;
    }
    .mtd-table-header-wrapper {
        border-radius: 4px 4px 0 0;
    }
    .recordEdit {
        font-family: PingFangSC-Semibold;
        color: rgba(0, 0, 0, 0.84);
        text-decoration: none;
    }
    .mtd-table-border td,
    .mtd-table-border th {
        border-right: none;
        .mtd-table-cell {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.84);
            line-height: 22px;
            font-weight: 400;
            .ticket-sla-text,
            .ticket-state-text,
            .user-name {
                font-size: 14px;
                font-family: PingFangSC-Regular;
            }
        }
    }
    .mtd-table-border {
        .mtd-table-row {
            .assignedCnName-component,
            .reporterCnName-component {
                .mtd-tooltip-rel {
                    display: inline-block;
                    width: 100%;
                    .user-wrapper {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        width: 100%;
                    }
                }
            }
        }
    }
    .mtd-table-header {
        thead {
            th {
                background-color: #fff;
                .mtd-table-cell {
                    font-family: PingFangSC-Medium;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.6);
                    line-height: 22px;
                    font-weight: 500;
                }
            }
        }
    }
    .mtd-table-border {
        border-left: none;
        border-right: none;
        border-top: none;
    }
    .mtd-table-border::after,
    .mtd-table-border::before {
        background-color: #fff;
    }
    .recordEdit {
        &:visited {
            color: #666;
            font-weight: 100;
        }
    }
    .copy-ticket-id {
        cursor: pointer;
    }
    .expand-header-icon {
        cursor: pointer;
        border-right: 1px solid #ebebeb;
    }
}
.table-setting {
    height: fit-content;
    width: 44px;
    line-height: 34px;
    text-align: center;
    position: absolute;
    top: 2px;
    bottom: 2px;
    right: 1px;
    z-index: 2;
    font-size: 20px;
    background-color: #fff;
    border-left: 1px solid #e8e8e8;
    display: inline-block;
}
.table-setting-modal {
    .mtd-modal-content-wrapper {
        padding: 0 !important;
    }
}
.table-setting-content {
    display: flex;
}
.table-setting-ul {
    border: 1px solid rgba(0, 0, 0, 0.06);
    padding: 0 24px;
    width: 50%;
    .options {
        margin-top: 20px;
        .option {
            line-height: 20px;
            padding: 8px 8px 8px 0;
            .add-visible {
                visibility: hidden;
            }
            &:hover {
                background-color: #f5f5f5;
                .add-visible {
                    visibility: visible;
                    float: right;
                    line-height: 20px;
                }
            }
        }
    }
    .tips {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.36);
        line-height: 22px;
    }
}
.table-setting-submit {
    padding: 17px;
    display: flex;
    justify-content: flex-end;
    .table-setting-button {
        margin: 0 12px;
        padding: 0 26px;
    }
}
</style>
