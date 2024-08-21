<!-- Stacked bar chart 堆叠柱状图 -->
<template>
    <div class="bar-chart-container">
        <div class="bar-chart-title">
            <slot name="title" />
            <slot name="subTitle" />
            <slot name="tab" />
        </div>
        <div v-show="!isEmpty" :id="name" />
        <div v-show="isEmpty" class="no-data-chart">
            <div v-if="showloading" class="chart-loading-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/chart-loading.png"
                    alt="数据加载中">
            </div>
            <div v-else class="chart-empty-content">
                <img
                    class="chart-empty-img"
                    src="@/assets/img/empty-line-chart.png"
                    alt="暂无数据">
                <p class="chart-empty-text">对不起，暂时没有数据</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
// import { View } from '@antv/data-set';

// 把源数据转成堆叠柱状图可用的格式
interface RawDataItem {
    // 关闭
    closedNumber: number;
    // 处理
    handleNumber: number;
    // 暂停
    pausedNumber: number;
    // 重新打开
    reopenNumber: number;
    // 已解决
    resolvedNumber: number;
    // 总数
    totalNumber: number;
    // 转移
    transferNumber: number;
    // 未处理
    unhandleNumber: number;
    dateTime: string;
}

interface FlattenDataItem {
    state: string;
    count: number;
    dateTime: string;
}

// 将后端返回的原始数据加工转换为图表需要的格式
const transformRawData = (raw: Array<RawDataItem>): Array<FlattenDataItem> => {
    const flattenDataList = raw.reduce((prev, item) => {
        const newItems = [
            { state: '未处理', count: item.unhandleNumber, dateTime: item.dateTime },
            { state: '处理中', count: item.handleNumber, dateTime: item.dateTime },
            { state: '暂停中', count: item.pausedNumber, dateTime: item.dateTime },
            { state: '关闭', count: item.closedNumber, dateTime: item.dateTime },
            { state: '已解决', count: item.resolvedNumber, dateTime: item.dateTime },
            { state: '重新打开', count: item.reopenNumber, dateTime: item.dateTime },
            { state: '已流转', count: item.transferNumber, dateTime: item.dateTime }
        ];
        return prev.concat(newItems);
    }, []);
    return flattenDataList;
};

@Component({ name: 'ticket-stacked-bar-chart' })
export default class TicketBarChart extends Vue {
    // 图表数据源
    @Prop({
        default: () => {
            return [];
        }
    })
    info: any[];

    // 容器 id
    @Prop({ default: '' })
    name: string;


    chart = null;
    showloading: boolean = true;

    // 监听数据，进行初始化饼图或更新饼图
    @Watch('info')
    onInfoChanged (val: any[]) {
        this.$nextTick(() => {
            if (!val || !val.length) {
                this.showloading = false;
                return;
            }
            if (!this.chart) {
                this.initChart();
            } else {
                this.chart.changeData(transformRawData(val));
            }
        });
    }

    get isEmpty () {
        return !this.info || !this.info.length;
    }

    // 初始化图表
    initChart () {
        const chart = new window.G2.Chart({
            container: this.name,
            forceFit: true,
            theme: 'g2-light',
            padding: [6, 50, 80, 50],
            height: 320
        });

        this.chart = chart;

        /**
         * 设置 dateTime 字段的类型为 `timeCat` 可以解决 X 轴偏移的问题
         * @see https://github.com/antvis/g2/issues/702
         */
        chart.source(transformRawData(this.info), {
            dateTime: { type: 'timeCat' }
        });

        // 设置纵轴字段
        chart.scale('count', { nice: true });

        this.chart.axis('dateTime', {
            title: null
        });
        this.chart.axis('count', {
            title: null
        });

        // 设置为直方图
        chart.interval()
            .position(['dateTime', 'count'])
            .color('state')
            .adjust('stack');

        chart.on('tooltip:change', (event) => {
            const { items } = event;
            const sum = items.reduce((s, item) => s + (item.value) * 1, 0);
            const row = {
                title: '总量',
                name: '总量',
                value: sum,
                index: items.length
            };
            items.push(row);
        });

        chart.render();

    }
}
</script>
<style lang="scss">
.bar-chart-container {
    margin-bottom: 12px;
    margin-right: 12px;
    background: #fff;
    border-radius: 4px;
    .bar-chart-title {
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