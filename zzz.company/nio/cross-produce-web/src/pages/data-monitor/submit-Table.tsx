import {MutableRefObject, useEffect, useRef, useState} from 'react';
import {Button, Form, Space, Table, message, Tooltip, Radio, RadioChangeEvent, TablePaginationConfig} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';
import {cpmService} from '../../services/cpw-service';
import {GetCityCrossNumList, GetCityCrossNumQuery} from '../../models';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {omit} from 'lodash';
import {SorterResult} from 'antd/es/table/interface';
import React from 'react';
export const SubmitTable = () => {
  const navigate = useNavigate();

  const [cityList, setcityList] = useState<GetCityCrossNumList[]>([]); // 项目列表
  const [list, setList] = useState<GetCityCrossNumList[]>([]); // 项目列表
  const [loading, setLoading] = useState(false);
  const query = useQuery();
  const [pageType, setPageType] = useState('');
  const [clickTitle, setClickTitle] = useState('');
  const [clickKey, setClickKey] = useState('');
  const [searchParams, setSerachParams] = useState({});
  const {changeHistory} = usePageFns();
  const [sortedColumn, setSortedColumn] = useState('');
  type SearchParams = GetCityCrossNumQuery;

  // const [bizType,setBizType] = useState()

  const lossTable = useRef<HTMLDivElement>(null);
  useEffect(() => {
    //传入后端 获取数据
    let params = {};
    query.forEach((value, key) => {
      if (['pageNo', 'pageSize', 'projectId', 'cityLevel', 'bizType'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else if (['page'].includes(key)) {
        setPageType(value);
      } else if (['processKey'].includes(key)) {
        let processRes = 'PERCEPTION';
        resTemp.forEach((item) => {
          if (value.includes(item.dataIndex)) {
            processRes = item.title;
          }
        });
        setClickTitle(processRes);
        // @ts-ignore
        params[key] = value ? value : undefined;
      } else {
        // @ts-ignore
        params[key] = value ? value : undefined;
      }
    });
    const paramslist = {...omit(params, ['type'])};
    setSerachParams(paramslist);

    let paramsListOne = {...omit(paramslist, ['processKey'])};
    getList(paramsListOne);

    getCityCrossNumByProcess(paramslist);
  }, [query.toString()]);

  const resTemp = [
    {
      title: '任务下发',
      dataIndex: 'collectCrossNum',
    },
    {
      title: '资料采集',
      dataIndex: 'COLLECT',
    },
    {
      title: '点云建图',
      dataIndex: 'PERCEPTION',
    },
    {
      title: '模型建图',
      dataIndex: 'MODEL',
    },
    {
      title: '推理',
      dataIndex: 'INFERENCE',
    },
    {
      title: '数据检查',
      dataIndex: 'CHECK',
    },
    {
      title: '数据融合',
      dataIndex: 'MERGE',
    },
  ];
  // 自定义按钮点击事件
  const handleButtonClick = (event: any, title: string, key: string) => {
    event.stopPropagation(); // 阻止事件冒泡

    setClickTitle(title);
    changeHistory({
      ...omit(searchParams, ['processKey']),
      processKey: key,
    });

    if (lossTable.current) {
      window.scrollTo(0, lossTable.current.offsetTop || 0);
    }
  };

  const columns = [
    {
      title: '城市',
      dataIndex: 'cityName',
    },
    {
      title: '下发任务',
      dataIndex: 'collectCrossNum',
      sorter: (a: any, b: any) => a.collectCrossNum - b.collectCrossNum,
    },
    {
      title: '资料采集',
      dataIndex: 'collectedCrossNum',
      key: 'COLLECT',
      sorter: (a: any, b: any) => a.collectedCrossNum - b.collectedCrossNum,
    },
    {
      title: (
        <div>
          <span>点云建图</span>
          <Button
            size="small"
            style={{marginLeft: 8, fontSize: '10px'}}
            onClick={(e) => handleButtonClick(e, '点云建图', 'PERCEPTION')}
          >
            损失分布
          </Button>
        </div>
      ),
      dataIndex: 'perceptionCrossNum',
      key: 'PERCEPTION',
      sorter: (a: any, b: any) => a.perceptionCrossNum - b.perceptionCrossNum,
    },
    {
      title: (
        <div>
          <span>模型建图</span>
          <Button
            size="small"
            style={{marginLeft: 8, fontSize: '10px'}}
            onClick={(e) => handleButtonClick(e, '模型建图', 'MODEL')}
          >
            损失分布
          </Button>
        </div>
      ),
      dataIndex: 'modelCrossNum',
      key: 'MODEL',
      sorter: (a: any, b: any) => a.modelCrossNum - b.modelCrossNum,
    },
    {
      title: (
        <div>
          <span>推理</span>
          <Button
            size="small"
            style={{marginLeft: 8, fontSize: '10px'}}
            onClick={(e) => handleButtonClick(e, '推理', 'INFERENCE')}
          >
            损失分布
          </Button>
        </div>
      ),
      dataIndex: 'inferenceCrossNum',
      key: 'INFERENCE',
      sorter: (a: any, b: any) => a.inferenceCrossNum - b.inferenceCrossNum,
    },
    {
      title: (
        <div>
          <span>数据检查</span>
          <Button
            size="small"
            style={{marginLeft: 8, fontSize: '10px'}}
            onClick={(e) => handleButtonClick(e, '数据检查', 'CHECK')}
          >
            损失分布
          </Button>
        </div>
      ),
      dataIndex: 'checkCrossNum',
      key: 'CHECK',
      sorter: (a: any, b: any) => a.checkCrossNum - b.checkCrossNum,
    },
    {
      title: (
        <div>
          <span>数据融合</span>
          <Button
            size="small"
            style={{marginLeft: 8, fontSize: '10px'}}
            onClick={(e) => handleButtonClick(e, '数据融合', 'MERGE')}
          >
            损失分布
          </Button>
        </div>
      ),
      dataIndex: 'mergeCrossNum',
      key: 'MERGE',
      sorter: (a: any, b: any) => a.mergeCrossNum - b.mergeCrossNum,
    },
  ];

  const lossesColumns = [
    {
      title: '城市',
      dataIndex: 'cityName',
    },
    {
      title: '处理任务量',
      dataIndex: 'taskNum',
      sorter: (a: any, b: any) => a.taskNum - b.taskNum,
    },
    {
      title: '执行失败任务量',
      dataIndex: 'failureTaskNum',
      sorter: (a: any, b: any) => a.failureTaskNum - b.failureTaskNum,
    },
    {
      title: '执行后结果无效任务量',
      dataIndex: 'invalidTaskNum',
      sorter: (a: any, b: any) => a.invalidTaskNum - b.invalidTaskNum,
    },
    {
      title: '处理实体量',
      dataIndex: 'crossNum',
      sorter: (a: any, b: any) => a.crossNum - b.crossNum,
    },
    {
      title: '执行失败实体量',
      dataIndex: 'failureCrossNum',
      sorter: (a: any, b: any) => a.failureCrossNum - b.failureCrossNum,
    },
    {
      title: '执行后结果无效实体量',
      dataIndex: 'invalidCrossNum',
      sorter: (a: any, b: any) => a.invalidCrossNum - b.invalidCrossNum,
    },
  ];

  const getList = async (params: GetCityCrossNumQuery) => {
    try {
      const ret = await cpmService.retrieveGetCityCrossNum({
        ...params,
      });
      setcityList(ret.data);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);

      setcityList([]);
    } finally {
    }
  };
  const getCityCrossNumByProcess = async (params: GetCityCrossNumQuery) => {
    try {
      setLoading(true);
      const res = await cpmService.retrieveGetCityCrossNumByProcess({
        ...params,
      });

      //@ts-ignore
      setList(res.data);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);

      setList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{textAlign: 'right', marginBottom: '10px'}}>
        <Button
          type="primary"
          onClick={() => {
            let href = window.location.href;
            let search = href.split('?');
            let searchList = search[1].split('&');
            let filteredArray = searchList.filter((item) => item.indexOf('page') === -1);
            filteredArray = filteredArray.filter((item) => item.indexOf('processKey') === -1);
            //删除数组空余项
            for (var i = 0; i < filteredArray.length; i++) {
              if (filteredArray[i] == '') {
                filteredArray.splice(i, 1);
                i = i - 1;
              }
            }

            if (search[1] != undefined) {
              if (pageType == 'cross') {
                navigate('/data-monitor/batchLask?&' + filteredArray.join('&'));
              } else {
                navigate('/data-monitor/submitProgress?&' + filteredArray.join('&'));
              }
            } else {
              if (pageType == 'cross') {
                navigate('/data-monitor/batchLask');
              } else {
                navigate('/data-monitor/submitProgress');
              }
            }
          }}
        >
          返回
        </Button>
      </div>
      <div style={{fontSize: '20px', color: '#1677FF', background: '#fff', marginBottom: '20px'}}>
        分城市生产转化分布
      </div>
      <Table
        columns={columns}
        dataSource={cityList}
        pagination={false}
        scroll={{y: 600}}
        showSorterTooltip={false}
      ></Table>
      <div style={{fontSize: '20px', color: '#1677FF', background: '#fff', margin: '20px 0'}} ref={lossTable}>
        生产各环节损失分布-{clickTitle}
      </div>
      <Table columns={lossesColumns} dataSource={list} pagination={false} loading={loading} scroll={{y: 600}}></Table>
    </div>
  );
};
