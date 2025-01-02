import { Button, DatePicker, Form, Input, Select, Space, Table, message } from 'antd';
import { DefaultPagination } from '../../../constants';
import { useEffect, useState } from 'react';
import { CreateModal } from './components/create-compare-task-modal';
import { useEditState, usePageFns, useQuery } from '../../../hooks';
import { cpmService } from '../../../services/cpw-service';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
} from '../../../utils';
import { omit } from 'lodash';
import {
  OVERWRITE_TASK_STATUS_DESCRIPTIONS,
  OVERWRITE_TASK_STATUS_OPTIONS,
  OVERWRITE_TASK_STATUS,
  OverWriteTaskInList,
  OverWriteTaskQuery,
} from '../../../models';
import { useNavigate } from 'react-router-dom';
import { BusinessType } from '../../business-type';
import { CitySelectCityParam } from '../../../components/city-select-cityParam';

interface SearchParams {
  cityName?: string;
  endCreateTime?: string;
  evalAlgVsn?: string;
  inferEvalCompareTaskId?: number;
  newInferAlgVsn?: string;
  newMergeSubtaskId?: number;
  oldInferAlgVsn?: string;
  oldMergeSubtaskId?: number;
  orderBy?: string;
  pageNo?: number;
  pageSize?: number;
  startCreateTime?: string;
}

/**
 * 打分结果查询
 */
export const EvalCheckResult = ({ }: {}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const { changeHistory } = usePageFns();
  const navigate = useNavigate();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const [evalAlgVsnOp, setEvalAlgVsnOp] = useState();
  const [inferAlgVsnOp, setInferAlgVsnOp] = useState();
  const [mergeTaskOp, setMergeTaskOp] = useState();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    
    changeHistory({
      ...omit(values, ['createTime']),
      startCreateTime: createTime[0],
      endCreateTime: createTime[1],
      pageNo: 1,
      pageSize: pagination.pageSize,
    });
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret: any = await cpmService.queryEvalTaskResult({
        ...omit(params, 'pageNo', 'pageSize'),
        pageSize,
        pageNo,
      });
      setList(ret.data);
      setPagination({
        ...pagination,
        total: ret.totalCount,
        current: pageNo,
        pageSize,
      });
    } catch (error: any) {
      console.error(error);
      message.error(error.message);

      setList([]);
      setPagination(pagination);
    } finally {
      setLoading(false);
    }
  };

  //删除对象中的属性
  // function deleteProperties(target: any, properties: any) {
  //   properties.forEach((item: any) => {
  //     delete target[item];
  //   })
  // }

  // 全部下载
  const handleDownload = async () => {
    let values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);

    let filteredObj = Object.keys(values)
      .filter((key) => key !== 'createTime')
      .reduce((result: any, key) => {
        result[key] = values[key];
        return result;
      }, {});
    filteredObj.startTime = createTime[0];
    filteredObj.endTime = createTime[1];
    try {
      const pageSize = 2000;
      let ret: any = [];
      for (let i = 1; i <= 10; i++) {
        const pageNo = i;
        let result: any = await cpmService.queryEvalTaskResult({
          ...omit(filteredObj, 'pageNo', 'pageSize'),
          pageNo,
          pageSize,
        });
        ret = [...ret, ...result.data];

        //删除对象中的属性
        // for(let j = 0; j < ret.length; j++){
        //   deleteProperties(ret[j], ["detialFileDownloadUrl", "detialFileKey"]);
        // }

        if (result.data.length == 0 || result.data.length < pageSize) {
          break;
        }
      }
      if (ret.length == 20000) {
        message.warning('只能下载前两万条');
      }
      if (ret.length > 0) {
        const data = jsonToCsv(ret);
        downloadFile('打分结果下载.csv', data);
      } else {
        return message.warning('没有可下载的内容');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };

  function jsonToCsv(jsonData: any) {
    const csvRows = [];
    // const headers = Object.keys(jsonData[0]);
    // 调整表头顺序
    const headers = ["inferEvalCompareTaskId", "cityName", "oldRouteNum", "oldRouteValidNum", "newRouteValidNum", "routeNumUnchange", "routeNum4UnchangePer", "routeNumBetter", "routeNum4BetterPer",
      "routeNumBad", "routeNum4BadPer", "routeNumDrop", "routeNum4DropPer", "routeNumAdd", "routeNum4AddPer", "routeNumUnknow", "createTime"]
    csvRows.push(headers.join(','));

    for (const row of jsonData) {
      const values = headers.map((header, index) => {
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

  const columns: ColumnsType<any> = [
    {
      title: '任务编号',
      dataIndex: 'inferEvalCompareTaskId',
    },
    {
      title: '城市',
      dataIndex: 'cityName',
    },
    {
      title: '旧版本routing总数',
      dataIndex: 'oldRouteNum',
    },
    {
      title: '旧版准出通过的routing总数',
      dataIndex: 'oldRouteValidNum',
    },
    {
      title: '新版准出通过的routing总数',
      dataIndex: 'newRouteValidNum',
    },
    {
      title: '未变化routing数量',
      dataIndex: 'routeNumUnchange',
    },
    {
      title: '未变化routing占比',
      dataIndex: 'routeNum4UnchangePer',
    },
    {
      title: '变好routing数量',
      dataIndex: 'routeNumBetter',
    },
    {
      title: '变好routing占比',
      dataIndex: 'routeNum4BetterPer',
    },
    {
      title: '变差routing数量',
      dataIndex: 'routeNumBad',
    },
    {
      title: '变差routing占比',
      dataIndex: 'routeNum4BadPer',
    },
    {
      title: '丢失routing数量',
      dataIndex: 'routeNumDrop',
    },
    {
      title: '丢失routing占比',
      dataIndex: 'routeNum4DropPer',
    },
    {
      title: '新增routing数量',
      dataIndex: 'routeNumAdd',
    },
    {
      title: '新增routing占比',
      dataIndex: 'routeNum4AddPer',
    },
    {
      title: 'unknown数量',
      dataIndex: 'routeNumUnknow',
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        return (
          <>
            <a href={record.detialFileDownloadUrl} target='_blank'>
              下载详情
            </a>
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

  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (['startCreateTime', 'endCreateTime', 'pageNo', 'pageSize', 'projectId', 'businessType'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);
    // if (!params.businessType) {
    //   params.businessType = 1;
    // }
    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime']),
      createTime: createTime,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);


  //获取推理算法版本列表
  const handleInferAlgVsnList = async () => {
    try {
      const result: any = await cpmService.retrieveInferAlgVsnList();
      setInferAlgVsnOp(
        result.data.map((item: any) => ({
          label: item,
          value: item,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  //获取融合任务列表
  const handleMergeTaskList = async () => {
    try {
      const result: any = await cpmService.retrieveTaskNameList();
      setMergeTaskOp(
        result.data.map((item: any) => ({
          label: item.subtaskName,
          value: item.subtaskId.toString(),
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  //获取推理打分算法版本列表（旧接口-retrieveEvalAlgVsnList）
  const handleEvalAlgVsnList = async () => {
    try {
      const result: any = await cpmService.retrieveEvalAlgVsnList();
      setEvalAlgVsnOp(
        result.data.map((item: any) => ({
          label: item,
          value: item,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  useEffect(() => {
    handleInferAlgVsnList();
    handleMergeTaskList();
    handleEvalAlgVsnList();
  }, []);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="任务编号" name="inferEvalCompareTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="旧版融合任务" name="oldMergeSubtaskId">
              <Select options={mergeTaskOp} placeholder="请选择" allowClear style={{ width: '200px' }}></Select>
            </Form.Item>
            <Form.Item label="新版融合任务" name="newMergeSubtaskId">
              <Select options={mergeTaskOp} placeholder="请选择" allowClear style={{ width: '200px' }}></Select>
            </Form.Item>
            <Form.Item label="推理打分算法" name="evalAlgVsn">
              <Select options={evalAlgVsnOp} placeholder="请选择" allowClear style={{width: '200px'}}></Select>
            </Form.Item>
            <Form.Item label="旧版推理算法" name="oldInferAlgVsn">
              <Select options={inferAlgVsnOp} placeholder="请选择" allowClear style={{ width: '200px' }}></Select>
            </Form.Item>
            <Form.Item label="新版推理算法" name="newInferAlgVsn">
              <Select options={inferAlgVsnOp} placeholder="请选择" allowClear style={{ width: '200px' }}></Select>
            </Form.Item>
            <Form.Item label="城市名称" name="cityName">
              <CitySelectCityParam style={{ width: '200px' }}></CitySelectCityParam>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['起始时间', '结束时间']}
              ></DatePicker.RangePicker>
            </Form.Item>
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
                create_state.show();
              }}
            >
              打分对比
            </Button>
            <Button
              type="primary"
              onClick={handleDownload}
            >
              下载
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="id"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
      <CreateModal
        visible={create_state.visible}
        onSuccess={() => {
          handleCloseCreateModel();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateModal>
    </div>
  );
};
