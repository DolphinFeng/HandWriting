<template>
    <div class="line-chart-container">
        <div class="line-chart-title">
            <slot name="title" />
            <slot name="subTitle" />
            <slot name="tab" />
        </div>
        <div v-show="!isEmpty" :id="name" />
        <div v-show="isEmpty" class="no-data-chart">
            <div v-if="showloading && !hasInit" class="chart-loading-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/chart-loading.png"
                    :alt="$getText('ticket_line_chart_data_loading', '数据加载中')">
            </div>
            <div v-else class="chart-empty-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/empty-line-chart.png"
                    :alt="$getText('ticket_line_chart_no_data', '暂无数据')">
                <p class="chart-empty-text">{{ $getText('ticket_line_chart_no_data_text', '对不起，暂时没有数据') }}</p>
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
 * ticket折线图
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component
export default class TicketLineChart extends Vue {
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
    @Prop({ default: '' })
    name: string;
    // 单独处理图表的回调
    @Prop()
    handleChart: Function;
    chart: any = {};
    // 图表是否已初始化
    hasInit: Boolean = false;
    showloading: Boolean = true;
    // 监听数据，进行初始化折线图或更新折线图
    @Watch('info')
    onInfoChanged (val: any[]) {
        this.$nextTick(() => {
            if (!val || !val.length) {
                this.showloading = false;
                return;
            }
            if (this.hasInit) {
                const transformed = this.transformDataSet(val);
                const rows = transformed.rows;
                this.drawAvgLine(this.chart, rows);
                this.chart.changeData(transformed);
            } else {
                this.initChart(val);
            }
        });
    }
    get isEmpty () {
        return !this.info || !this.info.length;
    }
    drawAvgLine (chart: G2.Chart, dataSource) {
        const sum = dataSource.reduce((sum, item) => sum + item.count, 0);
        const avg = sum / dataSource.length;

        chart.guide().clear();

        if (window.isNaN(avg)) {
            return chart;
        }

        const fixedAvg = avg.toFixed(2);
        chart.guide().line({
            start: ['min', fixedAvg],
            end: ['max', fixedAvg],
            lineStyle: {
                stroke: '#595959',
                lineWidth: 1,
                lineDash: [ 3, 3 ]
            },
            text: {
                position: 'start',
                style: {
                    fill: '#8c8c8c',
                    fontSize: 15,
                    fontWeight: 'normal'
                },
                content: this.$getText('ticket_line_chart_avg', {average: fixedAvg}),
                offsetY: -10,
                offsetX: 100
            }
        });

        return chart;
    }
    // 初始化图表
    initChart (data: any) {
        this.chart = new window.G2.Chart({
            container: this.name,
            forceFit: true,
            theme: 'g2-light',
            padding: { top: 6, right: 50, bottom: 80, left: 50 },
            height: HEIGHT
        });
        const transformed = this.transformDataSet(data);
        this.chart.source(transformed, {
            dateTime: {
                tickCount: 10 // 横轴最多展示10个点
            }
        });
        this.chart.axis('dateTime', {
            title: null
        });
        this.chart.axis('count', {
            title: null
        });
        this.chart.tooltip(Tooltip['@light/default']);
        this.chart.legend(Legend['@light/default']);
        this.chart.line().position('dateTime*count').color('type').size(2);

        const rows = transformed.rows;

        this.drawAvgLine(this.chart, rows);

        // 父组件可对图表组件单独处理
        if (typeof this.handleChart === 'function') {
            this.handleChart(this.chart);
        }
        this.chart.render();
        this.hasInit = true;
    }
    // 使用DateSet进行数据维度变换
    transformDataSet (data: any) {
        let dv = new DataSet.View().source(data);
        dv.transform({
            type: 'rename',
            map: this.aliasMap
        }).transform({
            type: 'fold',
            fields: Object.keys(this.aliasMap).map(item => {
                return this.aliasMap[item];
            }),
            key: 'type',
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
    .line-chart-container {
        margin-bottom: 12px;
        margin-right: 12px;
        background: #fff;
        border-radius: 4px;
        .line-chart-title {
            padding: 16px 0 10px 16px;
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
