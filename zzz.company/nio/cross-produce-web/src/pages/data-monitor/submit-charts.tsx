import * as echarts from 'echarts';
export const initChart = (Data: any, yData: any) => {
  let element = document.getElementById('chart1');

  let initChart = echarts.init(element);
  initChart.clear();
  let option;
  option = {
    title: {
      text: '',
    },
    label: {
      show: true,
      position: 'right',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category',
      data: yData,
    },
    series: [
      {
        type: 'bar',
        data: Data,
      },
    ],
  };

  option && initChart.setOption(option);

  return initChart;
};

export const lineChart = () => {
  let element = document.getElementById('linechart');
  let lineChart = echarts.init(element);
  lineChart.clear();
  let option;
  option = {
    title: {
      text: '众包路口建图进度趋势',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['任务下发', '资料采集', '点云建图', '点云质检', '模型建图', '推理', '数据融合', '数据检查', '数据发布'],
      selected: {
        任务下发: false,
        资料采集: false,
      },
    },
    grid: {
      left: '3%',
      right: '1%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '任务下发',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: '资料采集',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: '点云建图',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410],
      },
      {
        name: '点云质检',
        type: 'line',
        data: [320, 332, 301, 334, 390, 330, 320],
      },
      {
        name: '模型建图',
        type: 'line',
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },

      {
        name: '推理',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: '数据融合',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410],
      },
      {
        name: '数据检查',
        type: 'line',
        data: [320, 332, 301, 334, 390, 330, 320],
      },
      {
        name: '数据发布',
        type: 'line',
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },
    ],
  };

  option && lineChart.setOption(option);
};

export const barChart = (createData: any, mergeData: any, yData: any) => {
  let element = document.getElementById('barchart');
  let barChart = echarts.init(element);
  barChart.clear();

  let option;
  option = {
    label: {
      show: true,
      position: 'right', //在上方显示
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any) {
        var result = '';
        let num;
        if (params[0].data != 0 && params[0].data) {
          num = params[1].data / params[0].data;
          num = Math.round(num * 100) / 100;
        } else {
          num = '-';
        }

        result +=
          params[0].axisValue +
          '</br>' +
          '任务量: ' +
          params[0].data +
          '</br>' +
          ' 交付量: ' +
          params[1].data +
          '</br>' +
          ' 交付占比: ' +
          num;
        return result;
      },
    },

    // 滚动条设置
    dataZoom: [
      {
        type: 'slider',
        realtime: true, // 拖动时，是否实时更新系列的视图
        start: 100,
        end: 88,
        width: 10,
        height: '90%',
        top: '5%',
        right: '5%',
        yAxisIndex: 0, // 控制y轴滚动对象
        handleSize: 0, // 两边手柄尺寸
        showDataShadow: false, //是否显示数据阴影 默认auto
        showDetail: false, // 拖拽时是否展示滚动条两侧的文字
        zoomLock: true,
        moveHandleStyle: {
          opacity: 0,
        },
      },
      {
        type: 'inside',
        yAxisIndex: [0],
        zoomOnMouseWheel: false, // 关闭滚轮缩放
        moveOnMouseWheel: true, // 开启滚轮平移
        moveOnMouseMove: true, // 鼠标移动能触发数据窗口平移
      },
    ],

    legend: {},
    grid: {
      left: '7%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.1],
    },
    yAxis: {
      type: 'category',
      data: yData,
    },
    series: [
      {
        name: '任务量',
        type: 'bar',
        data: createData,
        barMinWidth: 12,
        barGap: '3%',
        barCategoryGap: '40%',
      },
      {
        name: '交付量',
        type: 'bar',
        data: mergeData,
        barMinWidth: 12,
        barCategoryGap: '40%',
        barGap: '3%',

        itemStyle: {
          // 显示数值
          normal: {
            label: {
              show: true, //开启显示
              formatter: function (params: any) {
                let num;
                if (createData[params.dataIndex] != 0 && createData[params.dataIndex]) {
                  num = mergeData[params.dataIndex] / createData[params.dataIndex];
                  num = Math.round(num * 100);
                } else {
                  num = '-';
                }

                let num1 = mergeData[params.dataIndex];
                // num(百分比) num1(数值)
                return num1 + '  (' + num + '%)';
              },
            },
          },
        },
      },
    ],
  };

  option && barChart.setOption(option);
};

export const barChart2 = (createData: any, mergeData: any, yData: any) => {
  let element = document.getElementById('barchart2');
  let barChart2 = echarts.init(element);
  barChart2.clear();
  let option;
  option = {
    label: {
      show: true,
      position: 'right', //在上方显示
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any) {
        var result = '';
        let num;
        if (params[0].data != 0 && params[0].data) {
          num = params[1].data / params[0].data;
          num = Math.round(num * 100) / 100;
        } else {
          num = '-';
        }
        result +=
          params[0].axisValue +
          '</br>' +
          '任务量: ' +
          params[0].data +
          '</br>' +
          ' 交付量: ' +
          params[1].data +
          '</br>' +
          ' 交付占比: ' +
          num;
        return result;
      },
    },
    legend: {},
    dataZoom: [
      {
        type: 'slider',
        realtime: true, // 拖动时，是否实时更新系列的视图
        start: 100,
        end: 75,
        width: 10,
        height: '90%',
        top: '5%',
        right: '5%',
        yAxisIndex: 0, // 控制y轴滚动对象
        handleSize: 0, // 两边手柄尺寸
        showDataShadow: false, //是否显示数据阴影 默认auto
        showDetail: false, // 拖拽时是否展示滚动条两侧的文字
        zoomLock: true,
        moveHandleStyle: {
          opacity: 0,
        },
      },
      {
        type: 'inside',
        yAxisIndex: [0],
        zoomOnMouseWheel: false, // 关闭滚轮缩放
        moveOnMouseWheel: true, // 开启滚轮平移
        moveOnMouseMove: true, // 鼠标移动能触发数据窗口平移
      },
    ],
    grid: {
      left: '1%',
      right: '5%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.1],
    },
    yAxis: {
      type: 'category',
      data: yData,
    },
    series: [
      {
        name: '任务量',
        type: 'bar',
        data: createData,
        barMinWidth: 10,
        barGap: '3%',
        barCategoryGap: '40%',
      },
      {
        name: '交付量',
        type: 'bar',
        data: mergeData,
        barMinWidth: 10,
        barGap: '3%',
        barCategoryGap: '40%',
        itemStyle: {
          // 显示数值
          normal: {
            label: {
              show: true, //开启显示
              formatter: function (params: any) {
                let num;
                if (createData[params.dataIndex] != 0 && createData[params.dataIndex]) {
                  num = mergeData[params.dataIndex] / createData[params.dataIndex];
                  num = Math.round(num * 100);
                } else {
                  num = '-';
                }

                let num1 = mergeData[params.dataIndex];
                // num(百分比) num1(数值)
                return num1 + '  (' + num + '%)';
              },
            },
          },
        },
      },
    ],
  };

  option && barChart2.setOption(option);
};
export const createPieChart = (data: any) => {
  let element = document.getElementById('createPieChart');
  let createPieChart = echarts.init(element);
  createPieChart.clear();
  let option;
  option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      // left: 'center',
      // top: '5%',
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '45%'],
        center: ['50%', '45%'],
        data: data,
        labelLine: {
          length: '2%',
          length2: 60,
        },
        label: {
          position: 'outside',
          formatter: (fp: {data: {name: any; value: any}; percent: any}) => {
            return `{name|${fp.data.name}}\n\n{num|${fp.data.value}}个 {zb|${fp.percent}}%`;
          },
          rich: {
            num: {
              fontSize: 12,
            },
            zb: {
              fontSize: 12,
            },
          },
        },
      },
    ],
  };

  option && createPieChart.setOption(option);
};

export const submitPieChart = (data: any) => {
  let element = document.getElementById('submitPieChart');
  let submitPieChart = echarts.init(element);
  submitPieChart.clear();
  let option;
  option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {},
    series: [
      {
        type: 'pie',
        radius: ['30%', '45%'],
        center: ['50%', '45%'],
        data: data,
        labelLine: {
          length: '2%',
          length2: 60,
        },
        label: {
          position: 'outside',
          formatter: (fp: {data: {name: any; value: any}; percent: any}) => {
            return `{name|${fp.data.name}}\n\n{num|${fp.data.value}}个  {zb|${fp.percent}}%`;
          },
          rich: {
            num: {
              fontSize: 12,
            },
            zb: {
              fontSize: 12,
            },
          },
        },
      },
    ],
  };

  option && submitPieChart.setOption(option);
};

export const wishPieChart = (data: any) => {
  let element = document.getElementById('wishPieChart');
  let wishPieChart = echarts.init(element);
  wishPieChart.clear();
  let option;
  option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {},
    series: [
      {
        type: 'pie',
        radius: ['30%', '45%'],
        center: ['50%', '45%'],
        data: data,
        labelLine: {
          length: '2%',
          length2: 60,
        },
        label: {
          position: 'outside',
          formatter: (fp: {data: {name: any; value: any}; percent: any}) => {
            return `{name|${fp.data.name}}\n\n{num|${fp.data.value}}个 {zb|${fp.percent}}%`;
          },
          rich: {
            num: {
              fontSize: 12,
            },
            zb: {
              fontSize: 12,
            },
          },
        },
      },
    ],
  };

  option && wishPieChart.setOption(option);
};

export const wishSubmitPieChart = (data: any) => {
  let element = document.getElementById('wishSubmitPieChart');
  let wishSubmitPieChart = echarts.init(element);
  wishSubmitPieChart.clear();
  let option;
  option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {},
    series: [
      {
        type: 'pie',
        radius: ['30%', '45%'],
        center: ['50%', '45%'],
        data: data,
        labelLine: {
          length: '2%',
          length2: 60,
        },
        label: {
          position: 'outside',
          formatter: (fp: {data: {name: any; value: any}; percent: any}) => {
            return `{name|${fp.data.name}}\n\n{num|${fp.data.value}}个 {zb|${fp.percent}}%`;
          },
          rich: {
            num: {
              fontSize: 12,
            },
            zb: {
              fontSize: 12,
            },
          },
        },
      },
    ],
  };

  option && wishSubmitPieChart.setOption(option);
};
