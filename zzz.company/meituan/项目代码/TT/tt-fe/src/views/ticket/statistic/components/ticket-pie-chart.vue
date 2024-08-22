<template>
    <div class="pie-chart-container">
        <div class="pie-chart-title">
            <slot name="title" />
        </div>
        <div v-show="!isEmpty" :id="name" />
        <div v-show="isEmpty" class="no-data-chart">
            <div v-if="showloading && !hasInit" class="chart-loading-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/chart-loading.png"
                    :alt="$getText('ticket_pie_chart_chart_loading_alt', '数据加载中')">
            </div>
            <div v-else class="chart-empty-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/empty-pie-chart.png"
                    :alt="$getText('ticket_pie_chart_empty_pie_chart_alt', '暂无数据')">
                <p class="chart-empty-text">{{ $getText('ticket_pie_chart_empty_pie_chart_text', '对不起，暂时没有数据') }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
// 引入sv素材
import { Base, Themes, MaterialForG2 } from '@ss/sv-materials';
const { Tooltip, Legend } = MaterialForG2;
// 图表高度
const HEIGHT = 272;
// 饼图外径
const RADIUS = 0.80;
// 饼图内径
const INNER_RADIUS = 0.58;
// 注册主题
G2.Global.registerTheme('g2-light', Themes['g2-light']);
// 注入主题
G2.Global.setTheme('g2-light');
/**
 * ticket环形饼图
 *
 * @author xiaokunyu
 * @date 02/26/2019
 */
@Component
export default class TicketPieChart extends Vue {
     // 数据信息
    @Prop()
    info: any[];
    // 饼图id
    @Prop({ default: '' })
    name: string;
    // 平均值
    @Prop({ required: false, default: 0 })
    avg: number;

    // 标签总数
    @Prop({ required: false, default: 0 })
    sum: number;

    // 饼图是否展示
    @Prop({ default: true })
    isVisible: Boolean;

    chart: any = {};
    // 总ticket数量
    totalTicketNumber: number = 0;
    // 图表是否已初始化
    hasInit: Boolean = false;
    showloading: Boolean = true;
    // 监听数据，进行初始化饼图或更新饼图
    @Watch('info')
    onInfoChanged (val: any[]) {
        this.getTotalTicket(val);
        this.$nextTick(() => {
            if (!val || !val.length) {
                this.showloading = false;
                return;
            }
            if (this.hasInit) {
                this.chart.changeData(val);
            } else {
                this.initChart(val);
            }
        });
    }
    // 监听 v-show 发生变化后，重新调用
    @Watch('isVisible')
    onPieVisibleChanged (val: boolean) {
        const info = this.info;
        if (val === true && info && (info.length > 0)) {
            this.chart.changeData(info);
        }
    }
    get isEmpty () {
        return !this.info || !this.info.length;
    }
    // 初始化图表
    initChart (data: any[]) {
        this.chart = new G2.Chart({
            container: this.name,
            padding: [0, '50%' , 0, 0],
            height: HEIGHT,
            forceFit: true,
            theme: 'g2-light'
        });
        this.chart.source(data);
        this.chart.coord('theta', {
            radius: RADIUS,
            innerRadius: INNER_RADIUS
        });
        this.chart.on('click', (event) => {
            const id = event.target._id;
            if (!id) return;
            const index = this.info.findIndex(item => new RegExp(item.name + '$').test(id));
            this.$emit('pie-click', index);
        });
        this.chart.tooltip(Tooltip['@light/default']);
        this.chart.tooltip({
            showTitle: false
        });
        this.setChartGuide();
        // 自定义图例结构和样式，部分样式只能内联覆盖
        this.chart.legend({
            useHtml: true,
            position: 'right',
            clickable: false,
            containerTpl: '<div style="top: 0px; bottom: 0px; padding-left: 30px;" class="g2-legend"><div class="g2-legend-list"></div></div>',
            itemTpl: (value, color, checked, index) => {
                let markerDom = '<span class="g2-legend-marker" style="background-color:' + color + '"></span>';
                let nameDom = '<span class="legend-item-name">' + this.info[index].name + '</span>';
                let percentDom = '<span class="legend-item-percent">' + (this.info[index].percent * 100).toFixed(2) + '%' + '</span>';
                let valueDom = '<span class="legend-item-value">' + this.info[index].number + this.$getText('ticket_pie_chart_center_text_unit', '个') + '</span>';
                return '<div class="g2-legend-list-item" data-value="' + value + '">' + markerDom + nameDom + percentDom + valueDom + '</div>';
            }
        });
        this.chart.intervalStack().position('number').color('name')
        .tooltip('name*number*percent', (name, value, percent) => {
            return {
                name: name,
                value: (percent * 100).toFixed(2) + '%'
            };
        });
        this.chart.render();
        this.hasInit = true;
    }
    // 获取ticket总数
    getTotalTicket (val: any[]) {
        this.totalTicketNumber = 0;
        val && val.forEach((item: any) => {
            this.totalTicketNumber += item.number;
        });
        this.hasInit && this.setChartGuide();
    }
    // 自定义饼图环内结构和样式
    setChartGuide () {
        let centerHtml = this.avg ? `<div class="center-text-container">${ this.$getText('ticket_pie_chart_center_text_avg', '平均分') }<br>
                <span class="center-text-number">${this.avg}</span>
        </div>` : this.sum ? `<div class="center-text-container">${ this.$getText('ticket_pie_chart_center_text_sum', '标签总数') }<br>
                <span class="center-text-number">${this.sum}</span>
        </div>` : `<div class="center-text-container">${ this.$getText('ticket_pie_chart_center_text_total', 'TT 总量') }<br>
                <span class="center-text-number">${this.totalTicketNumber}</span>
                <span class="center-text-unit">${ this.$getText('ticket_pie_chart_center_text_unit', '个') }</span>
        </div>`;
        this.chart.guide().clear();
        this.chart.guide().html({
            position: ['50%', '50%'],
            html: centerHtml,
            alignX: 'middle',
            alignY: 'middle'
        });
    }
}
</script>

<style lang="scss">
    .pie-chart-container {
        float: left;
        width: 49%;
        margin-right: 12px;
        margin-top: 12px;
        border: 1px solid #edf0f7;
        background: #fff;
        border-radius: 4px;
        .g2-legend {
            display: flex;
            justify-content: center;
            flex-direction: column;
            width: auto;
            height: 100%;
            .g2-legend-list {
                height: 100%;
                .g2-legend-list-item {
                    width: 100%;
                }
            }
        }
        .legend-item-name,
        .legend-item-percent,
        .legend-item-value {
            display: inline-block;
            max-width: 84px;
            margin-right: 14px;
            vertical-align: middle;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
            color: #6f6f6f;
        }
        .center-text-container {
            text-align: center;
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: #666;
            .center-text-number {
                font-family: PingFangSC-Semibold;
                font-size: 20px;
            }
            .center-text-unit {
                font-family: PingFangSC-Regular;
                font-size: 12px;
            }
        }
        .pie-chart-title {
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
            height: 272px;
            text-align: center;
            .chart-empty-content,
            .chart-loading-content {
                display: inline-block;
                margin-top: 68px;
                .chart-empty-img {
                    width: 50%;
                }
                .chart-empty-text {
                    color: #939db2;
                }
            }
        }
    }
</style>
