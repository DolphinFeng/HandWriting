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
                <p class="no-data">{{ $getText('compare_count_table_no_data', '暂无数据') }}</p>
            </div>
            <mtd-table-column
                min-width="25%"
                prop="dateTime"
                :label="$getText('compare_count_table_date', '日期')" />
            <mtd-table-column
                min-width="25%"
                v-for="state in stateCountCompare"
                :label="state.label"
                :key="state.value">
                <mtd-table-column
                    min-width="25%"
                    v-for="rg in rgArr"
                    :label="rg.label"
                    :prop="state.value + rg.label"
                    :key="rg.value" />
            </mtd-table-column>
        </mtd-table>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { StateCountCompare } from '@/config/map.conf.ts';
/**
 * Ticket数量图表
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component
export default class CompareCountTable extends Vue {
    @Prop({ default: () => {
        return [];
    } })
    list: CommonTypes.CountListItem[];

    @Prop({ default: () => {
        return {};
    } })
    rgNames: CommonTypes.DefaultObject;

    stateCountCompare: CommonTypes.DefaultObject[] = StateCountCompare;

    get rgArr () {
        let arr = [];
        for (let rgId in this.rgNames) {
            let rgObj = {
                value: rgId,
                label: this.rgNames[rgId]
            };
            arr.push(rgObj);
        }
        return arr;
    }
}
</script>

<style lang="scss">
.count-table-container {
    height: 100%;
    padding-top: 24px;
    margin-bottom: 24px;
    .count-table-title {
        margin-bottom: 28px;
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