<template>
    <div class="pie-table-chart-container">
        <div class="pie-table-chart-title">
            <slot name="title" />
            <mtd-radio-group
                v-model="displayType"
                class="type-switch-radio-button">
                <mtd-radio-button value="chart">{{ $getText('ticket_pie_table_chart_type_chart', '图表') }}</mtd-radio-button>
                <mtd-radio-button value="table">{{ $getText('ticket_pie_table_chart_type_table', '表格') }}</mtd-radio-button>
            </mtd-radio-group>
        </div>
        <slot name="back" />
        <slot name="chart" />
        <slot name="table" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import TicketPieChart from './ticket-pie-chart.vue';
/**
 * rg数量统计
 *
 * @author rencheng
 * @date 03/08/2021
 */
@Component({
    components: {
        TicketPieChart
    }
})
export default class TicketPieTableChart extends Vue {

    // 标签总数
    displayType: string = 'chart';
    @Watch('displayType')
    onDispalyTypeChanged (value) {
        this.$emit('type-changed', value);
    }
}
</script>

<style lang="scss">
    .type-switch-radio-button {
        float: right;
        margin-right: 24px;
    }
    .pie-table-chart-container {
        background: #fff;
        float: left;
        width: 49%;
        margin-right: 12px;
        margin-top: 12px;
        border: 1px solid #edf0f7;
        border-radius: 3px;
        line-height: 32px;
        .mtd-table {
            width: initial;
        }
        .pie-table-chart-title {
            padding: 16px 0 10px 16px;
            .main-title {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #464646;
            }
        }
        .pie-chart-container {
            width: 100%;
            border: none;
            margin: 0;
            padding: 10px;
        }
    }
    .count-table-list {
        border: none;
        padding: 10px;
    }
</style>
