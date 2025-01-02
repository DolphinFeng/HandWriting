import {useEffect, useState, useRef} from 'react';
import * as echarts from 'echarts';
import axios from 'axios';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {Button, Space, message} from 'antd';
import {useNavigate} from 'react-router-dom';

/**
 * 进度图
 */
export const ProgressChart = () => {
  const phase_count_ref = useRef<HTMLDivElement>(null);
  const [phase_count_chart, setPhaseCountChart] = useState<echarts.ECharts>();
  const query = useQuery();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const PROGRESS_FIELD_NAME = {
    taskNum: '当日创建任务数',
    addedTaskNum: '累计创建任务数',
    successTaskNum: '当日交付任务数',
    addedSuccessTaskNum: '累计交付任务数',
    failureTaskNum: '当日失败任务数',
    addedFailureTaskNum: '累计失败任务数',
  };
  useEffect(() => {
    if (phase_count_ref.current) {
      let chart = echarts.getInstanceByDom(phase_count_ref.current);
      if (chart === undefined) {
        chart = echarts.init(phase_count_ref.current);
        setPhaseCountChart(chart);
      }
    }
  }, [phase_count_ref.current]);

  useEffect(() => {
    //传入后端 获取折线图数据
    let params = {};
    query.forEach((value, key) => {
      if (['startTime', 'endTime', 'pageNo', 'pageSize', 'projectId', 'cityLevel'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value ? value : undefined;
      }
    });

    getProgressJson(params);
    //getChartJson();
  }, []);
  useEffect(() => {
    if (chartData.length === 0) {
      return;
    }
    let option;
    const targets = [
      PROGRESS_FIELD_NAME.taskNum,
      PROGRESS_FIELD_NAME.addedTaskNum,
      PROGRESS_FIELD_NAME.successTaskNum,
      PROGRESS_FIELD_NAME.addedSuccessTaskNum,
      PROGRESS_FIELD_NAME.failureTaskNum,
      PROGRESS_FIELD_NAME.addedFailureTaskNum,
    ];
    const datasetWithFilters: any[] = [];
    const seriesList: any[] = [];
    echarts.util.each(targets, function (target) {
      var datasetId = 'dataset_' + target;
      datasetWithFilters.push({
        id: datasetId,
        fromDatasetId: 'dataset_raw',
        transform: {
          type: 'filter',
          config: {
            and: [
              {dimension: 'Year', gte: 1950},
              {dimension: 'Target', '=': target},
            ],
          },
        },
      });
      seriesList.push({
        type: 'line',
        datasetId: datasetId,
        showSymbol: false,
        name: target,
        endLabel: {
          show: true,
          formatter: function (params: any) {
            return params.value[1] + ': ' + params.value[0];
          },
        },
        labelLayout: {
          moveOverlap: 'shiftY',
        },
        emphasis: {
          focus: 'series',
        },
        encode: {
          x: 'Year',
          y: 'Number',
          label: ['Target', 'Number'],
          itemName: 'Year',
          tooltip: ['Number'],
        },
      });
    });
    option = {
      legend: {
        show: true,
        orient: 'vertical',
        right: '0px', // 距离容器侧边距离
      },
      animationDuration: 400,
      dataset: [
        {
          id: 'dataset_raw',
          source: chartData,
        },
        ...datasetWithFilters,
      ],
      title: {
        text:'进度统计',
      },
      tooltip: {
        order: 'valueDesc',
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        nameLocation: 'middle',
      },
      yAxis: {
        name: '',
      },
      grid: {
        right: '25%',
      },
      series: seriesList,
    };

    if (phase_count_chart !== undefined) {
      phase_count_chart.setOption(option);
    }
  }, [chartData, phase_count_chart]);

  const getProgressJson = async (params: {}) => {
    try {
      const ret = await cpmService.retrieveProgressDetail({
        ...params,
      });

      let chartData = [];
      chartData.push(['Number', 'Target', 'Year']);

      // @ts-ignore
      let data = ret.data;
      for (let i = 0; i < data.length; i++) {
        chartData.push([data[i].taskNum, PROGRESS_FIELD_NAME.taskNum, data[i].date]);
        chartData.push([data[i].addedTaskNum, PROGRESS_FIELD_NAME.addedTaskNum, data[i].date]);
        chartData.push([data[i].successTaskNum, PROGRESS_FIELD_NAME.successTaskNum, data[i].date]);
        chartData.push([data[i].addedSuccessTaskNum, PROGRESS_FIELD_NAME.addedSuccessTaskNum, data[i].date]);
        chartData.push([data[i].failureTaskNum, PROGRESS_FIELD_NAME.failureTaskNum, data[i].date]);
        chartData.push([data[i].addedFailureTaskNum, PROGRESS_FIELD_NAME.addedFailureTaskNum, data[i].date]);
      }

      // @ts-ignore
      setChartData(chartData);

      //setList(ret.data);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };

    //返回上个页面 
  const handleReturn = () => {
    let href = window.location.href;
    let search = href.split('?');
    let searchList = search[1].split('&');
    let filteredArray = searchList.filter((item) => item.indexOf('processKey') === -1);
    if (search[1] != undefined) {
      navigate('/data-monitor/batch?' + '&' + filteredArray.join('&'));
    }
  };

  const getChartJson = async () => {
    let jsonUrl = 'http://localhost:3000/life-expectancy-table.json';

    let rawData = null;
    try {
      rawData = await axios.get(jsonUrl);
    } catch (error) {
      console.log(error);
    }

    if (rawData !== null) {
      setChartData(rawData.data);
    }
  };

  return (
    <div>
      <div className="search-area">
        <div className="search-button">
          <Space>
            <Button type="primary" onClick={handleReturn}>
              返回
            </Button>
          </Space>
        </div>
      </div>
      <div ref={phase_count_ref} style = { {  width: 1200, height: 600 }}> hello world ... </div>
    </div>
  );
};
