<template>
    <div class="oncall-rules-container">
        <mtd-announcement
            title="当配置的值班规则没有覆盖7*24h时，会出现没有值班人在线但收到TT时的情况，此时TT会平均分给创建时间后24h的值班人，若未来24h无值班人，则TT平均分配给所有的值班成员。"
            type="info"
            show-icon />
        <div
            v-for="table in tableList "
            :key="table.key"
            class="table-container">
            <div class="title-wrapper">
                <div>{{ table.label }}</div>
                <div class="hint">{{ table.hint }}</div>
                <mtd-button
                    class="add-btn tt-pure-btn"
                    icon="mtdicon mtdicon-add"
                    @click="onAddRule(table.key)"
                    type="primary">{{ table.label }}</mtd-button>
            </div>
            <mtd-table :data="rulesDataMap[table.key]" :loading="tableLoading">
                <mtd-table-column
                    min-width="30%"
                    show-overflow-tooltip
                    prop="name"
                    label="规则名称" />
                <mtd-table-column
                    min-width="30%"
                    label="值班模式"
                    prop="ruleType">
                    <template slot-scope="scope">
                        <span>{{ `${scope.row.ruleType === 'FIXED_RULE' ? '固定值班' : '轮流值班'} ` }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    min-width="40%"
                    label="值班成员"
                    show-overflow-tooltip
                    prop="member">
                    <template slot-scope="scope">
                        {{ getDisplayMember(scope.row) }}
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    width="220"
                    label="值班时间"
                    v-if="table.key === 'special'"
                    show-overflow-tooltip
                    prop="ruleDisplayDate" />
                <pm-table-column-operation
                    label="操作"
                    width="170"
                    prop="operations"
                    pm-type="text"
                    :pm-operations="operations" />
            </mtd-table>
        </div>
        <add-rule-modal
            @success="onSuccess"
            v-if="showModal"
            :visible.sync="showModal"
            :form-data="ruleData"
            :rule-date-type="ruleDateType"
            :type="modalType" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import * as api from '@/api';
import { OncallRulesTable } from '@/config/map.conf';
import AddRuleModal from '../components/modals/addRuleModal.vue';
@Component({
    components: {
        AddRuleModal
    }
})
export default class OncallRules extends Vue {
    tableList: CommonTypes.mapObject[] = OncallRulesTable;
    rulesDataMap: CommonTypes.mapObject = {
        normal: []
        // special: []
    };
    ruleData: CommonTypes.mapObject = {};

    tableLoading: boolean = false;
    showModal: boolean = false;
    modalType: 'add' | 'update' = 'add';
    ruleDateType: 'special' | 'normal' = 'normal';
    created () {
        this.getRules();
    }
    onAddRule (ruleDateType) {
        this.ruleData = this.formatTableData({});
        this.ruleDateType = ruleDateType;
        this.modalType = 'add';
        this.showModal = true;
    }
    async getRules (type?: 'SPECIAL' | 'NORMAL') {
        this.tableLoading = true;
        try {
            const res = await api.oncallApi.getRgRules({
                rgId: this.rgId,
                ruleDateType: type ? [type] : null
            });
            const { data, code } = res;
            if (code === 200 && data) {
                if (type) {
                    this.rulesDataMap[type.toLowerCase()] = (data[type.toLowerCase()] || []).map(item => this.formatTableData(item));
                } else {
                    // this.rulesDataMap.special = (data.special || []).map(item => this.formatTableData(item));
                    this.rulesDataMap.normal = (data.normal || []).map(item => this.formatTableData(item));
                }
                this.tableLoading = false;
            }
        } catch (e) {
            this.tableLoading = false;
            console.log(e);
        }
    }
    getDisplayMember (row) {
        return `${row.oncallType === 'BY_USERNAME'
            ? row.oncallUser?.map(item => `${item.displayName}/${item.identify}`).join('，')
            : row.oncallGroup?.map(item => item?.displayName).join('，')}`;
    }
    formatTableData (rule) {
        return {
            ...rule,
            cycleType: rule.cycleType || 'BY_DAY',
            shiftType: rule.shiftType || 'WHOLE_DAY',
            oncallType: rule.oncallType || 'BY_USERNAME',
            ruleType: rule.ruleType || 'FIXED_RULE',
            // 轮流值班默认选择全周
            dayOfWeek: rule.dayOfWeek || [1, 2, 3, 4, 5, 6, 7],
            // 轮流值班默认选择周一/1天、9:00
            cycleDay: rule.cycleType !== 'CUSTOM' ? (rule.cycleDay || 1) : 1,
            cycleTime: (typeof rule.cycleTime === 'undefined') ? 32400000 : rule.cycleTime,
            cycleDayForCustom: rule.cycleType === 'CUSTOM' ? rule.cycleDay : 1,
            ruleAtList: [rule.ruleStartAt, rule.ruleEndAt],
        };
    }
    onSuccess (ruleDateType) {
        this.getRules(ruleDateType.toUpperCase());
    }
    get operations () {
        return [{
            label: '编辑',
            action: 'edit',
            props: {
                class: 'table-link'
            },
            click: (action: string, scope: any) => {
                this.ruleData = { ...scope.row };
                this.modalType = 'update';
                this.ruleDateType = scope.row.ruleDateType.toLowerCase();
                this.showModal = true;
            }
        }, {
            label: '删除',
            action: 'delete',
            props: {
                class: 'table-link'
            },
            click: (action: string, scope: any) => {
                this.$mtd.confirm({
                    title: '是否确认删除该规则？',
                    width: '433px',
                    showCancelButton: true,
                    type: 'warning',
                    okButtonText: '删除',
                    className: 'common-modal',
                    okButtonProps: {
                        type: 'danger',
                        class: 'tt-pure-btn'
                    },
                    cancelButtonProps: {
                        class: 'tt-pure-btn'
                    },
                    onOk: async () => {
                        try {
                            const res = await api.oncallApi.deleteRgRule(scope.row.id);
                            const { code } = res;
                            if (code === 200) {
                                this.$mtd.message({
                                    message: '删除规则成功',
                                    type: 'success'
                                });
                                this.getRules(scope.row.ruleDateType);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }).catch(e => e);
            }
        }];
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.oncall-rules-container {
    padding-top: 12px;
    .table-container {
        padding-bottom: 40px;
    }
    .mtd-announcement {
        border-radius: 6px;
        margin-bottom: 24px;
        .mtd-announcement-icon {
            line-height: 20px;
        }
    }
    .title-wrapper {
        padding: 0 0 12px 0;
        text-align: left;
        font-size: 16px;
        font-weight: 600;
        position: relative;
        .add-btn {
            position: absolute;
            right: 0;
            top: 5px;
        }
        .hint {
            font-size: 12px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.35);
        }
    }
    .mtd-table {
        .mtd-btn {
            font-size: 14px;
        }
    }
}
</style>
