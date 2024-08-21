<template>
    <div class="cti-statistic-individual">
        <div class="individual-table-container">
            <div class="individual-table-title">
                <span class="main-title" slot="title">{{ $getText('cti_statistic_individual_main_title', { diffDays: diffDays }) }}</span>
            </div>

            <mtd-table
                class="individual-table-list"
                :data="individualStatsList"
                height="270">
                <mtd-table-column prop="assigned" :label="$getText('cti_statistic_individual_assigned', '处理人')" />
                <mtd-table-column prop="averageResolvedTime" :label="$getText('cti_statistic_individual_average_resolved_time', '平均解决时间(小时）')" />
                <mtd-table-column prop="averageResponseTime" :label="$getText('cti_statistic_individual_average_response_time', '平均响应时间(分钟)')" />
                <mtd-table-column prop="closedNumber" :label="$getText('cti_statistic_individual_closed_number', '关闭量')" />
                <mtd-table-column prop="closedRate" :label="$getText('cti_statistic_individual_closed_rate', '关闭率')" />
                <mtd-table-column prop="dissatisfiedNumber" :label="$getText('cti_statistic_individual_dissatisfied_number', '不满意量')" />
                <mtd-table-column prop="resolvedNumber" :label="$getText('cti_statistic_individual_resolved_number', '解决量')" />
                <mtd-table-column prop="resolvedRate" :label="$getText('cti_statistic_individual_resolved_rate', '解决率')" />
                <mtd-table-column prop="satisfiedNumber" :label="$getText('cti_statistic_individual_satisfied_number', '满意量')" />
                <mtd-table-column prop="satisfiedRate" :label="$getText('cti_statistic_individual_satisfied_rate', '满意率')" />
                <mtd-table-column prop="totalEvaluateNumber" :label="$getText('cti_statistic_individual_total_evaluate_number', '总评价量')" />
                <mtd-table-column prop="totalNumber" :label="$getText('cti_statistic_individual_total_number', '总量')" />
            </mtd-table>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import dayjs from 'dayjs';
import { DAY_TIME_STAMP } from '@/config/const.conf';

interface IndividualStats {
    assigned: string;

    // 平均解决时间
    averageResolvedTime: number;

    // 平均响应时间
    averageResponseTime: number;

    // 关闭量
    closedNumber: number;

    // 关闭率
    closedRate: number;

    // 不满意量
    dissatisfiedNumber: number;

    // 解决量
    resolvedNumber: number;

    // 解决率
    resolvedRate: number;

    // 满意量
    satisfiedNumber: number;

    // 满意率
    satisfiedRate: number;

    totalEvaluateNumber: number;

    // 总量
    totalNumber: number;
}

@Component({ name: 'cti-statistic-individual' })
export default class CtiStatisticIndividual extends Vue {
    @Prop({ default: 0 })
    categoryId: number;
    @Prop({ default: 0 })
    typeId: number;
    @Prop({ default: 0 })
    itemId: number;

    @Prop()
    period: string[];

    individualStatsList: Array<IndividualStats> = [];

    get diffDays () {
        return dayjs(this.period[1]).diff(dayjs(this.period[0]), 'day') + 1;
    }

    created () {
        this.refreshChart();
    }

    @Watch('period')
    onPeriodChange (val: string[], oldVal: string[]) {
        if (!val || !val[0] || !val[1]) {
            return;
        }
        if (val[0] === oldVal[0] && val[1] === oldVal[1]) {
            return;
        }
        this.refreshChart();
        // TODO: 新增日期范围变更的埋点上报
    }

    // 根据 CTI ID 和时间范围查询数据
    async getIndividualStatsByCti () {
        try {
            const res = await api.ticketApi.getIndividualStatsByCti({
                categoryId: this.categoryId,
                typeId: this.typeId,
                itemId: this.itemId,
                dateStartAt: dayjs(this.period[0]).valueOf(),
                dateEndAt: dayjs(this.period[1]).valueOf() + DAY_TIME_STAMP
            });

            this.individualStatsList = res.data.items;

        } catch (e) {
            this.individualStatsList = [];
            console.log(e);
        }
    }

    refreshChart () {
        return this.getIndividualStatsByCti();
    }
}
</script>
<style lang="scss">
.cti-statistic-individual {
    padding-bottom: 12px;
    .individual-table-container {
        height: 100%;
        margin: 12px 20px;
        background: #fff;
        .individual-table-title {
            padding: 16px 0 10px 16px;
            .main-title {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #464646;
            }
        }
        .individual-table-list {
            border: none;
            padding: 10px;
        }
    }
}
</style>