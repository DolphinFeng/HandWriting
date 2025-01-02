import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {usePageFns, useQuery} from '../../hooks';
import {algoService} from '../../services/algo-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {convertMomentTupleToTimestampTuple, convertTimestampTupleToDayTuple, removeEmptyValue} from '../../utils';
import {omit} from 'lodash';
import {components} from '../../models/openapi-alg';
import {AlgoInfoSelect} from './algo-info';

type SearchParams = components['schemas']['EvalSubTaskQuery'];
type EvalAlgSubtaskVo = components['schemas']['EvalSubtaskVo'];

export const AlgoVerifyTaskDetailList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<EvalAlgSubtaskVo[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();

  const [serach_params, setSerachParams] = useState<SearchParams>();

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

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await algoService.queryAlgoVerifyTaskDetailList({
        ...omit(params, 'pageNo', 'pageSize'),
        pageNo,
        pageSize,
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

  const columns: ColumnsType<EvalAlgSubtaskVo> = [
    {
      title: '任务编号',
      dataIndex: 'taskId',
    },
    {
      title: '子任务编号',
      dataIndex: 'subtaskId',
    },
    {
      title: '子任务类型',
      dataIndex: 'subtaskType',
    },
    {
      title: '实体ID',
      dataIndex: 'crossId',
    },
    {
      title: '算法名称',
      dataIndex: 'algName',
    },
    {
      title: '算法版本号',
      dataIndex: 'algVsn',
    },
    {
      title: '评测集编号',
      dataIndex: 'setId',
    },
    {
      title: '样本编号',
      dataIndex: 'sampleId',
    },
    {
      title: 'AIP任务ID',
      dataIndex: 'aipTaskId',
      render: (text, record) => {
        const {aipTaskUrl, aipTaskId} = record;
        return (
          <>
            <Button href={aipTaskUrl} type="link" target="_blank">
              {aipTaskId}
            </Button>
          </>
        );
      },
    },
    {
      title: '数据集名',
      dataIndex: 'datasetName',
    },
    {
      title: '数据集clip',
      dataIndex: 'datasetClip',
    },
    {
      title: '执行状态',
      dataIndex: 'status',
    },
    {
      title: '指标文件存储地址',
      dataIndex: 'metricFile',
    },
    {
      title: '操作',
      dataIndex: 'taskId',
      render: (text, record) => {
        const {taskId} = record;
        return (
          <>
            {/* href={`/#/data-monitor/project?projectId=${taskId}`} */}
            <Button type="link" target="_blank">
              指标明细
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

  useEffect(() => {
    let params: any = {};
    query.forEach((value, key) => {
      if (['startTime', 'endTime', 'pageNo', 'pageSize', 'setId', 'taskId', 'algType', 'algVsnId'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);
    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime']),
      createTime: createTime,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <AlgoInfoSelect visible={true} useRule={false}></AlgoInfoSelect>
            <Form.Item label="任务编号" name="taskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="评测集编号" name="setId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="执行状态" name="status">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="样本编号" name="sampleId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="AIP任务ID" name="aipTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{format: 'HH:mm:ss'}}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['起始时间', '结束时间']}
                allowClear
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
                // create_state.show();
                // handleSearch();
              }}
            >
              下载
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="subtaskId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
    </div>
  );
};
