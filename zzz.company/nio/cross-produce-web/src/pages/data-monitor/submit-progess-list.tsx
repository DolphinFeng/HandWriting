import {Button, Form, Space, Table, message, Tooltip, Select, DatePicker, Spin, Card} from 'antd';
import {useEffect, useState, useRef} from 'react';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {convertMomentTupleToTimestampTuple, removeEmptyValue, convertTimestampTupleToDayTuple} from '../../utils';
import {includes, omit, size} from 'lodash';
import {ProjectProgressListQuery} from '../../models';
import {initChart, lineChart, createPieChart, submitPieChart, wishPieChart, wishSubmitPieChart} from './submit-charts';
import {useNavigate} from 'react-router-dom';
import * as echarts from 'echarts';

type SearchParams = ProjectProgressListQuery;

/**
 * 任务列表
 */
export const SubmitProgressList = () => {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]); // 项目列表
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();
  const [serach_params, setSerachParams] = useState({});
  const [cityName, setCityName] = useState();
  const [Name, setName] = useState('推理');
  const [processKeyQuery, setProcessKeyQuery] = useState('INFERENCE');
  const phase_count_ref = useRef<HTMLDivElement>(null);
  const phase_pie1_ref = useRef<HTMLDivElement>(null);
  const phase_pie2_ref = useRef<HTMLDivElement>(null);
  const phase_pie3_ref = useRef<HTMLDivElement>(null);
  const phase_pie4_ref = useRef<HTMLDivElement>(null);
  const [barLoading, setBarLoading] = useState(false);
  const [activeTabKey1, setActiveTabKey1] = useState<string>('10068');
  const [taskTiTle, setTaskTiTle] = useState<string>('路口');
  useEffect(() => {
    // changeHistory({
    //   bizType: activeTabKey1,
    // });
    ProcessKeyTable({ processKey: 'INFERENCE', projectId: activeTabKey1 });
    //获取城市接口
    handleCityList();
    selectTaskTile();
  }, [activeTabKey1]);
  useEffect(() => {
    if (phase_count_ref.current) {
      let chart = echarts.getInstanceByDom(phase_count_ref.current);
      if (chart === undefined) {
        //建图交付进度-柱状图
        getTotalCrossNum({ projectId: activeTabKey1 });
      }
    }
    // //建图进度趋势-折线图
    // crossProcessLine({});
  }, [phase_count_ref, activeTabKey1]);

  useEffect(() => {
    // if (phase_pie1_ref.current && phase_pie2_ref.current && phase_pie3_ref.current && phase_pie4_ref.current) {
    //   let chart1 = echarts.getInstanceByDom(phase_pie1_ref.current);
    //   let chart2 = echarts.getInstanceByDom(phase_pie2_ref.current);
    //   let chart3 = echarts.getInstanceByDom(phase_pie3_ref.current);
    //   let chart4 = echarts.getInstanceByDom(phase_pie4_ref.current);
    //   if (chart1 === undefined && chart2 === undefined && chart3 === undefined && chart4 === undefined) {
    //

    CrossByCityLevel();

    //   }
    // }
  }, [activeTabKey1]);
  useEffect(() => {
    let paramsList = queryChange();

    //建图交付进度-柱状图
    getTotalCrossNum(paramsList[0]);
    let paramsList1 = paramsList[0];
    //@ts-ignore 将上一次查询的processkey传入 点击时才会切换processKey
    paramsList1.processKey = processKeyQuery;
    ProcessKeyTable(paramsList1);
    let formSearch = {};
    formSearch = paramsList[1];
    form.setFieldsValue({
      ...omit(formSearch, ['endTime']),
    });
  }, [query.toString(), activeTabKey1]);

  function queryChange() {
    //传入后端
    let params: SearchParams = {};
    //写回查询参数
    let searchParams: SearchParams = {};
    query.forEach((value, key) => {
      if (['pageNo', 'pageSize', 'projectId', 'cityLevel', 'bizType'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;

        // @ts-ignore
        searchParams[key] = value ? Number(value) : undefined;
      } else if (['batchIdList'].includes(key)) {
        var matches: any;
        let arr: any;
        // @ts-ignore
        if (value) {
          // @ts-ignore
          matches = value?.match(/\d+/g).filter(function (val) {
            return val !== '%2C';
          });
          arr = matches.map(Number);
        }
        // @ts-ignore
        params[key] = value ? value : undefined;
        //@ts-ignore
        searchParams[key] = value ? arr : undefined;
      } else if (['cityNameList'].includes(key)) {
        let newStr = value.split(',');
        // @ts-ignore
        params[key] = value ? value : undefined;

        // @ts-ignore
        searchParams[key] = value ? newStr : undefined;
      } else {
        // @ts-ignore
        params[key] = value ? value : undefined;
        // @ts-ignore
        searchParams[key] = value ? value : undefined;
      }
    });
    if (!params.projectId) {
      params.projectId = 10068;
    } else {
      setActiveTabKey1(params.projectId + '');
    }

    //  @ts-ignore
    var timestampEnd = Date.parse(new Date(searchParams.endTime));
    let endTime = convertTimestampTupleToDayTuple([timestampEnd, timestampEnd]);
    form.setFieldsValue({
      ...omit(searchParams, ['endTime']),
      endTime: endTime[1],
    });

    params = removeEmptyValue(params);

    //params是传入后端的格式  searchParams是回显到前端查询条件格式
    let paramsList = [params, searchParams];
    return paramsList;
  }

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let Time = '';
    if (values.endTime) Time = getDate(values.endTime);
    changeHistory({
      ...omit(values, ['endTime']),
      endTime: Time,
      projectId: activeTabKey1,
    });
  };

  //转换时间方法 时间戳 转 YYYY-MM-DD
  function getDatTime(date: any) {
    var time = new Date(date);
    var year = time.getFullYear(); //年
    var month = ('0' + (time.getMonth() + 1)).slice(-2); //月
    var day = ('0' + time.getDate()).slice(-2); //日
    var mydate = year + '-' + month + '-' + day;
    return mydate;
  }

  //转换时间方法 标准时间 转 YYYY-MM-DD
  function getDate(date: any) {
    let dateTimeString = date.$d;
    let dateObject = new Date(dateTimeString);
    // 将 Date 对象转换为 "YYYY-MM-DD" 格式
    let formattedDate = dateObject.toISOString().split('T')[0];
    return formattedDate;
  }

  const CrossByCityLevel = async () => {
    try {
      setLoading(true);
      const ret: any = await cpmService.retrieveCrossByCityLevel({ projectId: Number(activeTabKey1) });
      let createData = {},
        mergeData = {},
        wishCreateData = {},
        wishMergeData = {};
      if (ret.data) {
        createData = ret.data.tOTAL.map((item: any) => ({
          name: item.cityLevel,
          value: item.createCrossNum,
        }));
        mergeData = ret.data.tOTAL.map((item: any) => ({
          name: item.cityLevel,
          value: item.mergeCrossNum,
        }));

        // wishCreateData = ret.data.wISH.map((item: any) => ({
        //   name: item.cityLevel,
        //   value: item.createCrossNum,
        // }));

        // wishMergeData = ret.data.wISH.map((item: any) => ({
        //   name: item.cityLevel,
        //   value: item.mergeCrossNum,
        // }));
      }
      createPieChart(createData);
      submitPieChart(mergeData);
      // if (activeTabKey1 === '1') {
      //   wishPieChart(wishCreateData);
      //   wishSubmitPieChart(wishMergeData);
      // }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCrossNum = async (paramsSelect: any) => {
    try {
      setBarLoading(true);
      const ret: any = await cpmService.retrieveTotalCrossNum(paramsSelect);
      let result = ret.data;
      let resTemp = [
        {
          title: '任务下发',
          dataIndex: result.collectCrossNum,
        },
        {
          title: '资料采集',
          dataIndex: result.collectedCrossNum,
        },
        {
          title: '点云建图',
          dataIndex: result.perceptionCrossNum,
        },
        {
          title: '模型建图',
          dataIndex: result.modelCrossNum,
        },
        {
          title: '推理',
          dataIndex: result.inferenceCrossNum,
        },
        {
          title: '数据检查',
          dataIndex: result.checkCrossNum,
        },
        {
          title: '数据融合',
          dataIndex: result.mergeCrossNum,
        },
      ];
      let barData = resTemp.sort((a, b) => a.dataIndex - b.dataIndex);
      let barTiTle: string[] = [];
      let batYData: any[] = [];
      barData.forEach((item) => {
        if (item.dataIndex != 0) {
          barTiTle.push(item.title);
          batYData.push(item.dataIndex);
        }
      });
      let paramsList = queryChange();
      // let paramsTable = {};
      // paramsTable = paramsList[0];
      let myChart = initChart(batYData, barTiTle);

      let paramsKey = 'INFERENCE';
      myChart.off('click');
      myChart.on('click', function (params) {
        paramsKey = params.name;
        if (params.name == '任务下发' || params.name == '资料采集') {
          message.warning('请点击点云建图、模型建图、推理、数据检查、数据融合');
        } else {
          let processRes = '';
          processKey.forEach((item) => {
            if (paramsKey.includes(item.title)) {
              processRes = item.value;
            }
          });
          setName(params.name);
          setProcessKeyQuery(processRes);
          //@ts-ignore  向paramsTable添加processKey 字段
          paramsSelect.processKey = processRes;
          // changeHistory({
          //   ...paramsTable,
          //   processKey: processRes,
          // });
          console.log(activeTabKey1);
          paramsSelect.projectId = Number(activeTabKey1);
          ProcessKeyTable(paramsSelect);
        }
      });
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    } finally {
      setBarLoading(false);
    }
  };

  const ProcessKeyTable = async (params: any) => {
    try {
      let resultlist: any = [];
      const result = await cpmService.retrieveCrossList(params);
      if (result.data.length > 0) {
        let taskNum = result.data[0].taskNum;
        if (taskNum) {
          let taskPrecent = '';
          let crossNum = result.data[0].crossNum;
          let crossPrecent = '';
          resultlist.push({
            title: '处理任务量',
            taskNum: taskNum,
            taskPrecent: '',
            crossNum: crossNum,
            crossPrecent: '',
          });
          let failureTaskNum = result.data[0].failureTaskNum;
          //@ts-ignore
          taskPrecent = ((failureTaskNum / taskNum) * 100).toFixed(2) + '%';
          let failureCrossNum = result.data[0].failureCrossNum;
          //@ts-ignore
          crossPrecent = ((failureCrossNum / crossNum) * 100).toFixed(2) + '%';
          resultlist.push({
            title: '执行失败任务量',
            taskNum: failureTaskNum,
            taskPrecent: taskPrecent,
            crossNum: failureCrossNum,
            crossPrecent: crossPrecent,
          });

          let invalidTaskNum = result.data[0].invalidTaskNum;
          //@ts-ignore
          taskPrecent = ((invalidTaskNum / taskNum) * 100).toFixed(2) + '%';
          let invalidCrossNum = result.data[0].invalidCrossNum;
          //@ts-ignore
          crossPrecent = ((invalidCrossNum / crossNum) * 100).toFixed(2) + '%';
          resultlist.push({
            title: '执行后结果无效任务量',
            taskNum: invalidTaskNum,
            taskPrecent: taskPrecent,
            crossNum: invalidCrossNum,
            crossPrecent: crossPrecent,
          });
        }
        setList(resultlist);
      } else {
        setList([]);
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };
  const columns = [
    {
      title: '',
      dataIndex: 'title',
    },
    {
      title: '任务量',
      dataIndex: 'taskNum',
    },
    {
      title: '比例',
      dataIndex: 'taskPrecent',
    },
    {
      title: '涉及路口',
      dataIndex: 'crossNum',
    },
    {
      title: '比例',
      dataIndex: 'crossPrecent',
    },
  ];

  const processKey = [
    {
      title: '资料采集',
      value: 'COLLECT',
    },
    {
      title: '点云建图',
      value: 'PERCEPTION',
    },
    {
      title: '模型建图',
      value: 'MODEL',
    },
    {
      title: '推理',
      value: 'INFERENCE',
    },
    {
      title: '数据检查',
      value: 'CHECK',
    },
    {
      title: '数据融合',
      value: 'MERGE',
    },
  ];

  const crossProcessLine = async (params: any) => {
    try {
      // const result: any = await cpmService.retrieveDimCity();
      // lineChart();
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    changeHistory({
      ...serach_params,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const cityLevel = [
    {
      value: 1,
      label: 'TOP30城市',
    },
    {
      value: 2,
      label: 'TOP30-50城市',
    },
    {
      value: 3,
      label: 'TOP50-100城市',
    },
    {
      value: 4,
      label: '其他城市',
    },
  ];

  const handleCityList = async () => {
    try {
      const result: any = await cpmService.retrieveDimCity();

      let city = result.data.filter((obj: any, index: any) => {
        return result.data.findIndex((item: any) => item.cityName === obj.cityName) === index;
      });

      let cityList = city
        .map((obj: {cityOrder: string}) => ({
          ...obj,
          cityOrder: parseInt(obj.cityOrder),
        }))
        .sort((a: any, b: any) => a.cityOrder - b.cityOrder);

      setCityName(
        cityList.map((item: any) => ({
          label: item.cityName + '-' + item.provName,
          value: item.cityName,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const filterCityOption = (input: string, option?: {label: string; value: string}) =>
    (option?.label ?? '').includes(input);

  const onTabChange = (key: string) => {
    setActiveTabKey1(key);
    changeHistory({
      projectId: key,
    });
    form.resetFields();
  };

  const selectTaskTile = () => {
    tabList.forEach((item) => {
      if (item.key === activeTabKey1) {
        setTaskTiTle(item.tab);
      }
    });
  };

  const tabList = [
    {
      key: '10068',
      tab: '路口',
    },
    {
      key: '10069',
      tab: '匝道',
    },
    {
      key: '10071',
      tab: 'PN',
    },
    {
      key: '10072',
      tab: 'PSP',
    },
  ];

  return (
    <div>
      <Card style={{width: '100%'}} tabList={tabList} activeTabKey={activeTabKey1} onTabChange={onTabChange}>
        <div style={{fontSize: '20px', color: '#1677FF', background: '#fff'}}>建图任务概览</div>
        <div>
          <div style={{display: 'flex', width: '100%', marginTop: '20px', background: '#fff'}}>
            <div style={{width: '50%', height: '400px'}}>
              <div style={{textAlign: 'left', fontSize: '18px', margin: '25px', lineHeight: '32px'}}>
                创建建图{taskTiTle}量
              </div>
              <div id="createPieChart" style={{width: '100%', height: '380px'}} ref={phase_pie1_ref}></div>
            </div>
            <div style={{width: '50%', height: '400px'}}>
              <div style={{margin: '25px', display: 'flex', justifyContent: 'space-between'}}>
                <span style={{fontSize: '18px'}}>建图交付{taskTiTle}量</span>
                <Button
                  type="primary"
                  onClick={() => {
                    navigate('/data-monitor/submitBarLine', { state: { projectId: activeTabKey1 } });
                  }}
                >
                  分城市明细
                </Button>
              </div>

              <div style={{textAlign: 'left', fontSize: '18px', margin: '20px'}}></div>

              <div id="submitPieChart" style={{width: '100%', height: '380px'}} ref={phase_pie2_ref}></div>
            </div>
          </div>

          {/* {activeTabKey1 == '1' && (
            <div style={{display: 'flex', justifyContent: 'space-between', background: '#fff'}}>
              <div style={{width: '50%', height: '450px'}}>
                <div style={{textAlign: 'left', fontSize: '18px', margin: '20px'}}>心愿单关联路口量</div>
                <div style={{textAlign: 'left', fontSize: '18px', margin: '20px'}}></div>

                <div id="wishPieChart" style={{width: '100%', height: '380px'}} ref={phase_pie3_ref}></div>
              </div>
              <div style={{width: '50%', height: '450px'}}>
                <div style={{textAlign: 'left', fontSize: '18px', margin: '25px'}}>心愿单交付路口量</div>
                <div style={{textAlign: 'left', fontSize: '18px', marginTop: '20px', marginBottom: '10px'}}></div>

                <div id="wishSubmitPieChart" style={{width: '100%', height: '380px'}} ref={phase_pie4_ref}></div>
              </div>
            </div>
          )} */}
        </div>
        <div style={{fontSize: '20px', color: '#1677FF', background: '#fff', marginTop: '20px'}}>建图转化分布</div>
        <div style={{background: '#fff', marginTop: '20px'}} id="taskTotal">
          <div className="search-area" style={{padding: '20px'}}>
            <div className="search-form">
              <Form layout="inline" form={form}>
                <Form.Item label="城市" name="cityNameList">
                  <Select
                    mode="multiple"
                    showSearch
                    options={cityName}
                    placeholder="请选择"
                    allowClear
                    filterOption={filterCityOption}
                    style={{width: '200px'}}
                  ></Select>
                </Form.Item>
                <Form.Item label="TOP城市" name="cityLevel">
                  <Select
                    showSearch
                    options={cityLevel}
                    placeholder="请选择"
                    allowClear
                    style={{width: '200px'}}
                  ></Select>
                </Form.Item>
                {/* <Form.Item label="截止时间" name="endTime">
                  <DatePicker format="YYYY-MM-DD" style={{width: '200px'}}></DatePicker>
                </Form.Item> */}
              </Form>
            </div>

            <div className="search-button">
              <Space>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    let href = window.location.href;
                    let search = href.split('?');
                    if (search[1] != undefined) {
                      if (search[1].includes('processKey')) {
                        navigate(`/data-monitor/submitTable?&page=submit&${search[1]}`);
                      } else {
                        navigate(`/data-monitor/submitTable?&page=submit&processKey=INFERENCE&${search[1]} `);
                      }
                    } else {
                      navigate(`/data-monitor/submitTable?&page=submit&processKey=INFERENCE&projectId=${activeTabKey1}`);
                    }
                  }}
                >
                  分城市明细
                </Button>
              </Space>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
            <div style={{textAlign: 'left', fontSize: '18px', margin: '10px'}}>
              <div>众包{taskTiTle}建图交付各环节转化</div>
              <Spin spinning={barLoading}>
                <div id="chart1" style={{width: '800px', height: '400px'}} ref={phase_count_ref}></div>
              </Spin>
            </div>

            <div style={{width: '50%', height: '600px'}}>
              <div style={{textAlign: 'left', fontSize: '18px', margin: '20px'}}>
                众包{taskTiTle}建图交付各环节转化损失分布-{Name}
              </div>
              <Spin spinning={barLoading}>
                <Table
                  rowKey="title"
                  columns={columns}
                  dataSource={list}
                  pagination={false}
                  loading={loading}
                  onChange={handleTableChange}
                ></Table>
              </Spin>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
