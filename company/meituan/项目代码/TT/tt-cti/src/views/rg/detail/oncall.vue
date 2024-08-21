<template>
    <div class="rg-oncall-container">
        <div class="plan-switch">
            <mtd-tabs v-model="planType">
                <mtd-tab-pane label="按人值班" value="PERSON" />
                <mtd-tab-pane label="按组值班" value="GROUP" />
            </mtd-tabs>
        </div>

        <oncall-by-person
            v-if="planType === 'PERSON' && rgId"
            ref="oncallByPerson"
            :oncall-mode="dutyMode"
            @mode-change="refreshMode"
            :rg-id="rgId" />
        <oncall-by-group
            v-if="planType === 'GROUP' && rgId"
            ref="oncallByGroup"
            :oncall-mode="dutyMode"
            @mode-change="refreshMode"
            :rg-id="rgId" />
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { PaginationMixin } from '@/utils/mixin';
import SetOncallRule from './components/set-oncall-rule.vue';
import OncallByPerson from './components/oncall/oncall-by-person.vue';
import OncallByGroup from './components/oncall/oncall-by-group.vue';

type PlanType = 'PERSON' | 'GROUP' | '';

const getPlanType = (mode: string): PlanType => {
    switch (mode) {
        case 'MULTI_ONLINE':
        case 'SINGLE_TURN':
            return 'PERSON';
        case 'GROUP_TURN':
        case 'GROUP_TIME_TURN':
            return 'GROUP';
        default:
            return '';
    }
};

/**
 * rg成员列表
 *
 * @author zhouchangshun
 * @date 01/11/2019
 */
@Component({
    components: {
        SetOncallRule,
        OncallByPerson,
        OncallByGroup
    }
})
export default class Oncall extends PaginationMixin {
    rgId: number | null = null;
    planType: PlanType = '';

    dutyMode: string = '';
    ruleCycle: string = '';
    ruleStart: number | null = null;

    created () {
        this.rgId = Number(this.$route.query.rgId);
        if (!this.rgId) {
            console.error('invalid rgId query string');
            return;
        }
        this.getOncallRule();
    }

    refreshMode (val) {
        this.dutyMode = val;
        this.getOncallRule();
    }

    async getOncallRule () {
        const res = await api.rgApi.getOncallRule(this.rgId);
        const { code, data } = res;
        if (code === 200) {
            this.dutyMode = data.mode;
            this.ruleCycle = data.ruleCycle;
            this.ruleStart = this.handleRuleStart(data.ruleStart || '');
        } else {
            console.error(code, res.message);
        }
    }

    setDutyMode (val) {
        this.dutyMode = val;
    }

    handleRuleStart (str) {
        const ruleArr = str.split('-');
        let timePoint = 0;
        if (ruleArr.length > 1) {
            timePoint = this.ruleCycle === 'week' ? parseInt(ruleArr[0], 10) : parseInt(ruleArr[1], 10) + 1;
        }
        return timePoint;
    }

    @Watch('dutyMode')
    setupPlanType (val) {
        this.planType = getPlanType(val);
    }

    get _planType (): PlanType {
        switch (this.dutyMode) {
            case 'MULTI_ONLINE':
            case 'SINGLE_ONLINE':
                return 'PERSON';
            case 'GROUP_TURN':
            case 'GROUP_TIME_TURN':
                return 'GROUP';
            default:
                return '';
        }
    }
}
</script>

<style lang="postcss">
.rg-oncall-container {
    .plan-switch {
        margin: 8px 0;
    }
    .operate-line {
        margin: 8px 0;
        line-height: 32px;
        text-align: right;
        /* FIXME: 临时调整样式，后续需要调整 html 结构的 */
        position: absolute;
        right: 0;
        top: -56px;
        z-index: 2;
        .operate-button {
            float: right;
        }
        .set-oncall-rule,
        .add-onduty-people {
            margin-left: 10px;
        }
        .current-rule {
            .duty-type {
                display: inline-block;
                margin-right: 24px;
                font-family: PingFangSC-Medium;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.87);
            }
            span {
                color: #6F6F6F;
            }
        }
        .set-oncall-rule {
            .icon-oncall- {
                font-size: 20px;
            }
        }
    }
    .cell-text-bold {
        font-family: PingFangSC-Medium;
        font-weight: 500;
    }
    .mtd-table-row {
        &.offline {
            color: rgba(0, 0, 0, 0.36);
        }
    }
    .isOncall,
    .isOnCall {
        position: relative;
        padding-left: 12px;
        &::before {
            position: absolute;
            content: '';
            width: 8px;
            height: 8px;
            background: #5ABB3C;
            border-radius: 50%;
            left: 0;
            top: 6px;
        }
    }
}
</style>
