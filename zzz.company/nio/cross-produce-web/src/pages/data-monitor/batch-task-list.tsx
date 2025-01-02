import {Button, Form, Space, Table, message, Tooltip, DatePicker, Select, Card} from 'antd';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {convertTimestampTupleToDayTuple, removeEmptyValue} from '../../utils';
import {includes, omit} from 'lodash';
import {ProjectProgressInList, GetCityCrossNumQuery} from '../../models';
import {useNavigate} from 'react-router-dom';
import {BatchProgressSelect} from './batch-progress-search';
type SearchParams = GetCityCrossNumQuery;

/**
 * 批次任务量统计
 */
export const BatchTaskList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProjectProgressInList[]>([]); // 项目列表
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();
  const [activeTabKey1, setActiveTabKey1] = useState<string>('10068');

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  useEffect(() => {
    //传入后端
    let params: SearchParams = {};
    //写回查询参数
    let searchParams: SearchParams = {};
    let typeSearch = 'search';
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
      } else if (['typeSearch'].includes(key)) {
        typeSearch = value;
        // @ts-ignore
      } else {
        // @ts-ignore
        params[key] = value ? value : undefined;
        // @ts-ignore
        searchParams[key] = value ? value : undefined;
      }
    });

    params = removeEmptyValue(params);

    if (params.bizType) {
      setActiveTabKey1(params.bizType + '');
    }

    //  @ts-ignore
    var timestampEnd = Date.parse(new Date(params.endTime));
    let endTime = convertTimestampTupleToDayTuple([timestampEnd, timestampEnd]);
    form.setFieldsValue({
      ...omit(searchParams, ['endTime']),
      endTime: endTime[1],
    });
    setSerachParams(searchParams);
    getList(params, typeSearch);
  }, [query.toString(), activeTabKey1]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let Time = '';
    if (values.endTime) Time = getDate(values.endTime);

    changeHistory({
      ...omit(values, ['endTime']),
      endTime: Time,
      typeSearch: 'search',
    });
  };

  const getList = async (params: SearchParams, typeSearch: string) => {
    try {
      if (typeSearch == 'search') {
        setLoading(true);
      }
      const ret = await cpmService.retrieveCrossList({
        ...params,
        projectId: Number(activeTabKey1),
      });
      if (typeSearch == 'search') {
        ret.data.sort((a: any, b: any) => {
          const order = ['资料采集', '点云建图', '模型建图', '推理', '数据检查', '数据融合'];
          return order.indexOf(a.processName) - order.indexOf(b.processName);
        });
        setList(ret.data);
      } else if (typeSearch == 'upload') {
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
      title: '数据生产环节',
      dataIndex: 'processName',
    },
    {
      title: '创建实体数',
      dataIndex: 'batchCrossNum',
    },
    {
      title: '已采集实体数',
      dataIndex: 'collectCrossNum',
    },
    {
      title: '生产实体数',
      dataIndex: 'crossNum',
    },
    {
      title: '处理成功实体数',
      dataIndex: 'successCrossNum',
    },
    // {
    //   title: '失败路口数',
    //   dataIndex: 'failureCrossNum',
    // },
    {
      title: '有效实体数',
      dataIndex: 'validCrossNum',
    },
    {
      title: '实体交付比例',
      dataIndex: '',
      render: (taxt, record) => {
        const {validCrossNum, collectCrossNum} = record;
        // @ts-ignore
        let result = validCrossNum / collectCrossNum;
        if (collectCrossNum == 0) {
          return '-';
        }
        return (result * 100).toFixed(2) + '%';
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

  //转换时间方法 标准时间 转 YYYY-MM-DD
  function getDate(date: any) {
    let dateTimeString = date.$d;
    let dateObject = new Date(dateTimeString);
    // 将 Date 对象转换为 "YYYY-MM-DD" 格式
    let formattedDate = dateObject.toISOString().split('T')[0];
    return formattedDate;
  }
  const handleDownload = async () => {
    const values = form.getFieldsValue();
    let Time = '';
    if (values.endTime) Time = getDate(values.endTime);

    changeHistory({
      ...omit(values, ['endTime']),
      endTime: Time,
      typeSearch: 'upload',
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
    changeHistory({bizType: key});
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
              {/* <Form.Item label="截止时间" name="endTime">
              <DatePicker style={{width: '200px'}} format="YYYY-MM-DD"></DatePicker>
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
              <Button
                type="primary"
                onClick={() => {
                  let href = window.location.href;
                  let search = href.split('?');
                  if (search[1] != undefined) {
                    navigate(`/data-monitor/submitTable?&page=cross&${search[1]}&processKey=INFERENCE`);
                  } else {
                    navigate(`/data-monitor/submitTable?&page=cross&bizType=1&processKey=INFERENCE`);
                  }
                }}
              >
                分城市明细
              </Button>
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
