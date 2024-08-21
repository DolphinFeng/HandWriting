<template>
    <div class="interval-chart-container">
        <div class="interval-chart-title">
            <slot name="title" />
            <slot name="subTitle" />
        </div>
        <div v-show="!isEmpty" :id="name" />
        <div v-show="isEmpty" class="no-data-chart">
            <div v-if="showloading && !hasInit" class="chart-loading-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/chart-loading.png"
                    :alt="$getText('ticket_interval_chart_chart_loading_alt', '数据加载中')">
            </div>
            <div v-else class="chart-empty-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/empty-line-chart.png"
                    :alt="$getText('ticket_interval_chart_empty_chart_alt', '暂无数据')">
                <p class="chart-empty-text">{{ $getText('ticket_interval_chart_empty_chart_text', '对不起，暂时没有数据') }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { DataSet } from '@antv/data-set';
// 引入sv素材
import { Themes, MaterialForG2 } from '@ss/sv-materials';
const { Tooltip, Axis, Legend } = MaterialForG2;
// 图表高度
const HEIGHT = 320;
// 注册主题
G2.Global.registerTheme('g2-light', Themes['g2-light']);
// 注入主题
G2.Global.setTheme('g2-light');
/**
 * ticket柱状图
 *
 * @author liyuyao
 * @date 10/21/2019
 */
@Component
export default class TicketIntervalChart extends Vue {
     // 图表数据信息
    @Prop({ default: () => {
        return [];
    } })
    info: any[];
    // 坐标轴中英文映射
    @Prop({ default: () => {
        return {};
    } })
    aliasMap: any;
    @Prop({ default: () => {
        return {};
    } })
    xAliasMap: any;

    @Prop({ default: '' })
    name: string;
    // 单独处理图表的回调
    @Prop()
    handleChart: Function;

    @Prop({ default: false })
    isCompare: boolean;

    chart: any = {};
    // 图表是否已初始化
    hasInit: Boolean = false;
    showloading: Boolean = true;
    // 监听数据，进行初始化饼图或更新饼图
    @Watch('info')
    onInfoChanged (val: any[]) {
        this.$nextTick(() => {
            if (!val || !Object.keys(val).length) {
                this.showloading = false;
                return;
            }
            if (this.hasInit) {
                this.chart.changeData(this.transformDataSet(val));
            } else {
                this.initChart(val);
            }
        });
    }
    get isEmpty () {
        return !this.info || !this.info.length;
    }
    // 初始化图表
    initChart (data: any) {
        this.chart = new G2.Chart({
            container: this.name,
            forceFit: true,
            theme: 'g2-light',
            padding: { top: 6, right: 50, bottom: 80, left: 50 },
            height: HEIGHT
        });
        this.chart.source(this.transformDataSet(data));
        this.chart.axis('day', {
            title: null
        });
        this.chart.axis('type', {
            title: null
        });
        this.chart.axis('count', {
            title: null
        });
        this.chart.tooltip(Tooltip['@light/default']);
        this.chart.legend(Legend['@light/default']);
        let chartChain: any = this.isCompare ? this.chart.interval().position('type*count').color('rgName').adjust([{
            type: 'dodge',
            marginRatio: 1 / 32
        }]) : this.chart.interval().position('day*count').color('day').label('count');
        // 父组件可对图表组件单独处理
        if (typeof this.handleChart === 'function') {
            this.handleChart(chartChain);
        }
        this.chart.render();
        this.hasInit = true;
    }
    // 使用DateSet进行数据维度变换
    transformDataSet (data: any) {
        let dv = new DataSet.View().source(data);
        this.isCompare && dv.transform({
            type: 'rename',
            map: this.aliasMap
        }).transform({
            type: 'fold',
            fields: Object.keys(this.aliasMap).map(item => {
                return this.aliasMap[item];
            }),
            key: 'rgName',
            value: 'count'
        });
        return dv;
    }
    beforeDestroy () {
        this.chart.destroy && this.chart.destroy();
    }
}
</script>

<style lang="scss">
    .interval-chart-container {
        margin-top: 24px;
        .interval-chart-title {
            margin-bottom: 28px;
            .main-title {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #464646;
            }
            .sub-title {
                font-size: 12px;
                color: #6f6f6f;
            }
        }
        .no-data-chart {
            height: 414px;
            text-align: center;
            .chart-empty-content,
            .chart-loading-content {
                display: inline-block;
                margin-top: 112px;
                .chart-empty-img {
                    width: 50%;
                }
                .chart-empty-text {
                    color: #333;
                }
            }
        }
    }
</style>
