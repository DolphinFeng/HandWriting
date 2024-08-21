<template>
    <div class="count-table-container">
        <div class="count-table-title">
            <slot name="title" />
        </div>
        <mtd-table 
            :data="list" 
            height="270"
            class="count-table-list">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">{{ $getText('count_table_no_data', '暂无数据') }}</p>
            </div>
            <mtd-table-column prop="dateTime" :label="$getText('count_table_date', '日期')" />
            <mtd-table-column prop="totalNumber" :label="$getText('count_table_total_number', '总工单量')" />
            <mtd-table-column prop="resolvedNumber" :label="$getText('count_table_resolved_number', '解决工单量')" />
            <mtd-table-column prop="closedNumber" :label="$getText('count_table_closed_number', '关闭工单量')" />
            <mtd-table-column prop="handleNumber" :label="$getText('count_table_handle_number', '处理中工单量')" />
            <mtd-table-column prop="pausedNumber" :label="$getText('count_table_paused_number', '暂停工单量')" />
            <mtd-table-column prop="unhandleNumber" :label="$getText('count_table_unhandle_number', '未处理工单量')" />
            <mtd-table-column prop="transferNumber" :label="$getText('count_table_transfer_number', '已流转工单量')" />
            <mtd-table-column prop="reopenNumber" :label="$getText('count_table_reopen_number', '重新打开工单量')" />
        </mtd-table>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
/**
 * Ticket数量图表
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component
export default class CountTable extends Vue {
    @Prop({ default: () => {
        return [];
    } })
    list: CommonTypes.CountListItem[];
}
</script>

<style lang="scss">
.count-table-container {
    height: 100%;
    margin: 0 12px 0 0;
    background: #fff;
    .count-table-title {
        padding: 16px 0 10px 16px;
        .main-title {
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: #464646;
        }
    }
    .count-table-list {
        border: none;
        padding: 0 10px 10px 10px;
    }
}
</style>