<template>
    <div class="rg-oncall-by-person">
        <div class="operate-line">
            <span class="current-rule">
                <span class="duty-type">{{ dutyModeDisplay }}</span>
            </span>

            <div class="operate-button">
                <mtd-button
                    icon="iconfont icon-oncall-"
                    class="set-oncall-rule"
                    @click="setOncallVisible = true"
                    :disabled="!permission">值班设置</mtd-button>
                <mtd-button
                    type="primary"
                    icon="iconfont icon-sousuo-"
                    class="add-onduty-people"
                    @click="showOndutyModal"
                    :disabled="!permission">添加值班人员</mtd-button>
            </div>
        </div>
        <mtd-table
            :data="oncallList"
            :cell-class="computeCellClass"
            :row-class="computeRowClass">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                prop="name"
                label="成员"
                min-width="20%">
                <template slot-scope="scope">
                    <span>{{ scope.row.displayName }} ({{ scope.row.identify }}) <span class="quit-tag" v-if="!scope.row.active">离职</span></span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                prop="bgName"
                label="部门"
                min-width="30%">
                <template slot-scope="scope">
                    <span>{{ formatDept(scope.row.bgName, scope.row.buName, scope.row.orgName) }}</span>
                </template>
            </mtd-table-column>

            <mtd-table-column
                v-if="isOncallByPerson"
                prop="isOncall"
                label="状态"
                width="100">
                <template slot-scope="scope">
                    <span :class="{ isOncall: scope.row.isOncall }">{{ scope.row.isOncall ? '在线' : '休息中' }}</span>
                </template>
            </mtd-table-column>

            <mtd-table-column
                prop="createdAt"
                min-width="20%"
                label="值班时间"
                v-if="isOncallByPerson && oncallList[0] && oncallList[0].startDate">
                <template slot-scope="scope">
                    <span>{{ scope.row.startDate | formatOncallTime }} - {{ scope.row.endDate | formatOncallTime }}</span>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="10%"
                label="操作">
                <template slot-scope="scope">
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        :disabled="!permission"
                        @click="setLine(scope.row.rgId, scope.row.identify, 'online')"
                        v-if="isOncallByPerson && !scope.row.isOncall">
                        上线
                    </mtd-button>
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        :disabled="!permission"
                        @click="setLine(scope.row.rgId, scope.row.identify, 'offline')"
                        v-if="dutyMode === 'MULTI_ONLINE' && scope.row.isOncall">
                        下线
                    </mtd-button>
                    <mtd-button
                        type="text-primary"
                        class="table-link"
                        :disabled="!permission"
                        @click="handleDelete(scope.row.rgId, scope.row.identify)">删除</mtd-button>
                </template>
            </mtd-table-column>
        </mtd-table>
        <mtd-modal
            :mask-closable="false"
            class="form-dialog"
            title="添加值班人员"
            v-model="isAddPeople">
            <div>
                <mtd-form
                    :model="modalForm"
                    :rules="rules"
                    ref="modalForm">
                    <mtd-form-item
                        label="姓名"
                        prop="name"
                        :label-width="70">
                        <mtd-select
                            v-model="modalForm.name"
                            :loading="loading"
                            multiple
                            placeholder="请输入添加成员的mis号"
                            :filterable="true"
                            :debounce="200"
                            :remote="true"
                            style="width: 300px;"
                            :remote-method="remoteMethod">
                            <mtd-option
                                v-for="item in userOptions"
                                :key="item.identify"
                                :label="`${item.displayName}(${item.identify})`"
                                :value="item.identify" />
                        </mtd-select>
                    </mtd-form-item>
                </mtd-form>
            </div>
            <div slot="footer" class="demo-modal-footer">
                <mtd-button @click="isAddPeople = false">取消</mtd-button>
                <mtd-button type="primary" @click="addOndutyPeople">确定</mtd-button>
            </div>
        </mtd-modal>
        <set-oncall-rule
            v-if="setOncallVisible"
            :rule-cycle="ruleCycle"
            :rule-start="ruleStart"
            :duty="dutyMode"
            @sort-success="sortSuccess"
            @rule-success="ruleSuccess"
            @close="setOncallVisible = false" />
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { PaginationMixin } from '@/utils/mixin';
import { WeekDays } from '@/config/map.conf';
import * as api from '@/api';
import SetOncallRule from '../set-oncall-rule.vue';

import { Form } from '@ss/mtd-vue';

type DutyMode = 'SINGLE_TURN' | 'MULTI_ONLINE';

@Component({ name: 'oncall-by-person', components: { SetOncallRule } })
export default class OncallByPerson extends PaginationMixin {
    @State(state => state.cti.permission.rg_onCall)
    permission: boolean;

    oncallList: any = [];
    isAddPeople: boolean = false;
    oncallUser: any = [];
    userOptions: any = [];

    @Prop({ default: null })
    rgId: number | null;

    loading: boolean = false;
    modalForm: any = {
        name: []
    };
    setOncallVisible: boolean = false;
    rules: any = {
        name: [{
            validator: (_rule, value, callback) => {
                if (value.length === 0) {
                    callback(new Error('请输入申请人mis号'));
                } else {
                    callback();
                }
            },
            trigger: 'blur, change'
        }]
    };
    weekDays: string[] = WeekDays;
    ruleCycle: string = '';
    ruleStart: number = 0;
    dutyMode: DutyMode | '' = '';

    mounted () {
        this.getOncallUserList();
        this.getOncallRule();
    }
    sortSuccess () {
        this.currentPage = 1;
        // this.getOncallUserList();
    }
    ruleSuccess () {
        this.getOncallRule();
        this.getOncallUserList();

        this.$emit('mode-change', this.dutyMode);
    }
    get dutyModeDisplay () {
        let display = '';
        if (this.dutyMode === 'SINGLE_TURN') {
            display = '值班模式: ';
            if (this.ruleCycle === 'day') {
                display += `按天轮值 每天${this.ruleStart - 1}点`;
            }
            if (this.ruleCycle === 'day_skip') {
                display += `按天轮值（跳过节假日） 每天${this.ruleStart - 1}点`;
            }
            if (this.ruleCycle === 'week') {
                display += `按周轮值 每周${this.weekDays[this.ruleStart - 1]}0点`;
            }
        } else if (this.dutyMode === 'MULTI_ONLINE') {
            display = '值班模式：默认模式';
        } else if (this.dutyMode as string === 'GROUP_TURN' || this.dutyMode as string === 'GROUP_TIME_TURN') {
            display = '当前值班设置为按组值班，如需查看当前值班设置，请切换到 "按组值班" 标签页';
        }
        return display;
    }
    async getOncallRule () {
        const res = await api.rgApi.getOncallRule(this.rgId);
        const { code, data } = res;
        if (code === 200) {
            this.dutyMode = data.mode as DutyMode;
            this.ruleCycle = data.ruleCycle;
            this.ruleStart = this.handleRuleStart(data.ruleStart);
        } else {
            console.error(code, res.message);
        }
    }
    handleRuleStart (str) {
        const ruleArr = str.split('-');
        let timePoint = 0;
        if (ruleArr.length > 1) {
            timePoint = this.ruleCycle === 'week' ? parseInt(ruleArr[0], 10) : parseInt(ruleArr[1], 10) + 1;
        }
        return timePoint;
    }
    // 获取oncall用户列表
    async getOncallUserList () {
        try {
            const params = {
                rgId: this.rgId,
                cn: 1, // 值班列表特殊逻辑：不分页
                sn: 10000 // 值班列表特殊逻辑：不分页
            };
            const res = await api.rgApi.getOncallUserList(params);
            const { code, data } = res;
            if (code === 200) {
                this.oncallList = data.items;
            }
        } catch (e) {
            this.oncallList = [];
            console.log(e);
        }
    }
    // 上线、下线
    async setLine (rgId: number, userName: string, action: 'online' | 'offline' = 'online') {
        try {
            const params = {
                rgId: rgId,
                username: userName,
                action
            };
            const res: any = await api.rgApi.setUserOnlineStatus(params);
            if (res && res.code === 200) {
                this.$mtd.message({
                    message: `${action === 'offline' ? '下线' : '上线'}成功`,
                    type: 'success'
                });
            }
            this.getOncallUserList();
        } catch (e) {
            console.log(e);
        }
    }
    showOndutyModal () {
        this.modalForm.name = [];
        (this.$refs.modalForm as Form).resetFields();
        this.remoteMethod();
        this.isAddPeople = true;
    }
    // 增加值班人员
    async addOndutyPeople () {
        const modalForm = this.$refs.modalForm as Form;
        modalForm.validate(async (valid) => {
            if (valid) {
                try {
                    const params = {
                        rgId: this.rgId,
                        identifys: this.modalForm.name
                    };
                    const res = await api.rgApi.addOncallUser(params);
                    if (res && res.code === 200) {
                        this.$mtd.message({
                            message: '添加成功',
                            type: 'success'
                        });
                        this.getOncallUserList();
                        this.isAddPeople = false;
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.error('Fail!');
            }
        }).catch(e => e);
    }
    // 删除确认弹窗
    handleDelete (rgId: number, identity: string) {
        // let _this = this;
        this.$mtd.confirm({
            message: '是否要删除该值班人员？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '删除',
            okButtonProps: {
                type: 'danger'
            },
            onOk: async () => {
                try {
                    const params = {
                        rgId: rgId,
                        identifys: [identity]
                    };
                    const res = await api.rgApi.moveOncallUser(params);
                    if (res && res.code === 200) {
                        this.$mtd.message({
                            message: '删除成功',
                            type: 'success'
                        });
                    }
                    await this.getOncallUserList();
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch(e => e);
    }
    // 远程搜索用户
    async remoteMethod (query?: any) {
        const params = {
            rgId: this.rgId,
            identify: query || '',
            includeOncall: false
        };
        const res = await api.rgApi.getRgUser(params);
        if (res && res.code === 200) {
            this.userOptions = res.data.items;
            this.loading = false;
        }
    }
    formatDept (bg: string, bu: string, org: string) {
        let dept: string = '';
        if (bg) {
            dept += `${bg}/`;
        }
        if (bu) {
            dept += `${bu}/`;
        }
        if (org) {
            dept += `${org}`;
        }
        return dept;
    }
    computeCellClass ({ columnIndex }) {
        if (columnIndex === 0) {
            return 'cell-text-bold';
        }
        return '';
    }

    computeRowClass ({ row }) {
        if (this.isOncallByPerson && row.isOncall === false) {
            return 'offline';
        }
        return '';
    }
    get isSingleDuty () {
        return this.dutyMode === 'SINGLE_TURN';
    }
    get isOncallByPerson () {
        return this.dutyMode === 'SINGLE_TURN' || this.dutyMode === 'MULTI_ONLINE';
    }
}
</script>
<style lang="postcss">
.rg-oncall-by-person {
    position: relative;
}
</style>
