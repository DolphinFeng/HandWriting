import {Button, Form, Space, Table, message, Tooltip, DatePicker, Tabs, Card} from 'antd';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {convertMomentTupleToTimestampTuple, removeEmptyValue, convertTimestampTupleToDayTuple} from '../../utils';
import {omit} from 'lodash';
import {ProjectProgressInList, ProjectProgressListQuery} from '../../models';
import {BatchProgressSelect} from './batch-progress-search';
import {useNavigate} from 'react-router-dom';

type SearchParams = ProjectProgressListQuery;

/**
 * 任务列表
 */
export const BatchProgressList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProjectProgressInList[]>([]); // 项目列表
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();

  // const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const [activeTabKey1, setActiveTabKey1] = useState<string>('10068');
  useEffect(() => {
    //传入后端
    let params: SearchParams = {};
    let typeFrom = 'search';
    //写回查询参数
    let searchParams: SearchParams = {};
    query.forEach((value, key) => {
      if (['pageNo', 'pageSize', 'projectId', 'cityLevel'].includes(key)) {
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
      } else if (['type'].includes(key)) {
        typeFrom = value;

        // @ts-ignore
      } else {
        // @ts-ignore
        params[key] = value ? value : undefined;
        // @ts-ignore
        searchParams[key] = value ? value : undefined;
      }
    });

    params = removeEmptyValue(params);
    //  @ts-ignore
    var timestampStart = Date.parse(new Date(searchParams.startTime));
    //  @ts-ignore
    var timestampEnd = Date.parse(new Date(searchParams.endTime));
    let createTime = convertTimestampTupleToDayTuple([timestampStart, timestampEnd]);
    form.setFieldsValue({
      ...omit(searchParams, ['startTime', 'endTime']),
      createTime: createTime,
    });
    setSerachParams(searchParams);

    getList(params, typeFrom);
  }, [query.toString(), activeTabKey1]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    let startTime = '';
    let endTime = '';
    if (createTime.length > 0) {
      startTime = getDate(createTime[0]);
      endTime = getDate(createTime[1]);
    }

    changeHistory({
      ...omit(values, ['createTime']),
      startTime: startTime,
      endTime: endTime,
      type: 'search',
    });
  };
  //转换时间方法 时间戳 转 YYYY-MM-DD
  function getDate(date: any) {
    var time = new Date(date);
    var year = time.getFullYear(); //年
    var month = ('0' + (time.getMonth() + 1)).slice(-2); //月
    var day = ('0' + time.getDate()).slice(-2); //日
    var mydate = year + '-' + month + '-' + day;
    return mydate;
  }

  const getList = async (params: SearchParams, typeFrom: string) => {
    try {
      if (typeFrom == 'search') {
        setLoading(true);
      }
      const ret = await cpmService.retrieveProjectProgressList({
        ...params,
        projectId: Number(activeTabKey1),
      });

      if (typeFrom == 'search') {
        ret.data.sort((a: any, b: any) => {
          const order = ['资料采集', '点云建图', '模型建图', '推理', '数据检查', '数据融合'];
          return order.indexOf(a.processName) - order.indexOf(b.processName);
        });
        setList(ret.data);
      } else if (typeFrom == 'upload') {
        let uploadList = ret.data;
        if (uploadList.length == 20000) {
          message.warning('只能下载前两万条');
        }
        if (uploadList.length > 0) {
          const data = jsonToCsv(uploadList);
          downloadFile('生产建图进度下载.csv', data);
        } else {
          message.warning('没有可下载的内容');
        }
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);

      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProjectProgressInList> = [
    {
      title: '生产环节',
      dataIndex: 'processName',
    },
    {
      title: <Tooltip title={'批次创建时的实体数'}>批次实体数</Tooltip>,
      dataIndex: 'batchCrossNum',
    },
    {
      title: <Tooltip title={'生产实体数：每个环节流入的实体数；'}>生产实体数</Tooltip>,
      dataIndex: 'crossNum',
    },
    {
      title: <Tooltip title={'任务数：每个环节产生的实际任务数（包括补采集、增量任务）'}>生产任务数</Tooltip>,
      dataIndex: 'taskNum',
    },
    {
      title: <Tooltip title={'成功任务数：实际成功的任务数（有完整数据回来）'}>成功任务数</Tooltip>,
      dataIndex: 'successTaskNum',
    },
    {
      title: (
        <Tooltip title={'失败任务数：系统反馈失败任务数（无数据、无完整数据返回、fllow反馈失败）'}>失败任务数</Tooltip>
      ),
      dataIndex: 'failureTaskNum',
    },
    {
      title: <Tooltip title={'执行中任务数：系统反馈执行中任务数'}>执行中任务数</Tooltip>,
      dataIndex: 'runningTaskNum',
    },
    {
      title: <Tooltip title={'有效任务数'}>有效任务数</Tooltip>,
      dataIndex: 'validTaskNum',
    },
    {
      title: <Tooltip title={'任务完成率：（成功任务数+失败任务数）/生产任务数'}>任务完成率</Tooltip>,
      render: (text, record) => {
        const {successTaskNum, failureTaskNum, taskNum} = record;
        // @ts-ignore
        let result = (successTaskNum + failureTaskNum) / taskNum;
        if (taskNum == 0) {
          return '-';
        }
        return (result * 100).toFixed(2) + '%';
      },
    },
    {
      title: <Tooltip title={'任务有效率：有效任务数 / 成功任务数'}>任务有效率</Tooltip>,
      dataIndex: '',
      render: (text, record) => {
        const {validTaskNum, successTaskNum} = record;
        let result: number;
        if (successTaskNum != 0) {
          // @ts-ignore
          result = validTaskNum / successTaskNum;
          return (result * 100).toFixed(2) + '%';
        }
        if (successTaskNum == 0) {
          return '-';
        }
      },
    },
    {
      title: '操作',
      dataIndex: 'processName',
      render: (text, record) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                let href = window.location.href;
                let search = href.split('?');
                if (search[1] != undefined) {
                  navigate('/data-monitor/charts?' + 'projectId=' + activeTabKey1 + '&processKey=' + record.processKey + '&' + search[1]);
                } else {
                  navigate('/data-monitor/charts?' + 'projectId=' + activeTabKey1 + '&processKey=' + record.processKey);
                }
              }}
            >
              详情
            </Button>
          </>
        );
      },
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    changeHistory({
      ...serach_params,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const handleDownload = async () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    let startTime = '';
    let endTime = '';
    if (createTime.length > 0) {
      startTime = getDate(createTime[0]);
      endTime = getDate(createTime[1]);
    }

    changeHistory({
      ...omit(values, ['createTime']),
      startTime: startTime,
      endTime: endTime,
      type: 'upload',
    });
  };
  function jsonToCsv(jsonData: any) {
    const csvRows = [];
    const headers = Object.keys(jsonData[0]);

    csvRows.push(headers.join(','));
    for (const row of jsonData) {
      const values = headers.map((header: any) => {
        if (typeof row[header] === 'object') {
          let rowValue = JSON.stringify(row[header]).replace(/,/g, '，');
          return `"${rowValue}"`;
        } else if (Array.isArray(row[header])) {
          // 如果该字段是数组，我们将其转换为CSV格式的字符串
          let Value = row[header].map((value: any) => {
            return JSON.stringify(value).replace(/,/g, '，');
          });
          return `"${Value}"`;
        } else {
          // 对于非数组字段，我们只需将值转换为字符串
          return `${('' + row[header]).replace(/,/g, '，')}`;
        }
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
  function downloadFile(fileName: any, data: any) {
    // 保存 string 到 文本文件
    //创建一个a链接，用于触发下载事件的载体
    let aLink = document.createElement('a');
    //将实参字符串转二进制对象，如果不是文本可以通过添加第二个参数指定编码
    let blob = new Blob([data]);
    //指定要下载的文件名(浏览器下载时，会根据文件后缀名指定解码)
    aLink.download = fileName;
    //给a链接配置href指向刚才的二进制对象
    aLink.href = URL.createObjectURL(blob);
    //触发事件
    aLink.click();
  }
  const onTabChange = (key: string) => {
    setActiveTabKey1(key);
    console.log(key);
    form.resetFields();
    changeHistory({});
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
        <div className="search-area">
          <div className="search-form">
            <Form form={form} layout="inline">
              <BatchProgressSelect changeProjectId={Number(activeTabKey1)}></BatchProgressSelect>
              {/* <Form.Item label="路口创建时间" name="createTime">
                <DatePicker.RangePicker placeholder={['起始时间', '结束时间']}></DatePicker.RangePicker>
              </Form.Item> */}
            </Form>
          </div>
          <div className="search-button">
            <Space>
              <Button type="primary" onClick={handleDownload}>
                下载
              </Button>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              {/* <Button
              type="primary"
              onClick={() => {
                create_state.show();
              }}
            >
              创建项目
            </Button> */}
            </Space>
          </div>
        </div>

        <Table
          rowKey="processName"
          className="page-table"
          columns={columns}
          dataSource={list}
          pagination={false}
          loading={loading}
          onChange={handleTableChange}
        ></Table>
      </Card>
    </div>
  );
};
