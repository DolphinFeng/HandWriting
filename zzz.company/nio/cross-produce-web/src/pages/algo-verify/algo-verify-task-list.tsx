import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateAlgoTaskDlg} from './create-algo-verify-task-dlg';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {algoService} from '../../services/algo-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import {components} from '../../models/openapi-alg';
import {AlgoInfoSelect} from './algo-info';

type SearchParams = components['schemas']['EvalTaskQuery'];
type EvalTaskVo = components['schemas']['EvalTaskVo'];

export const AlgoVerifyTaskList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<EvalTaskVo[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();

  const create_state = useEditState();
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

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await algoService.queryAlgoVerifyTaskList({
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

  const columns: ColumnsType<EvalTaskVo> = [
    {
      title: '任务编号',
      dataIndex: 'taskId',
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
    },
    {
      title: '算法类型',
      dataIndex: 'algTypeDesc',
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
      title: '评测样本数',
      dataIndex: 'sampleNum',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
    },

    {
      title: '任务创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '任务结束时间',
      dataIndex: 'endTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '执行状态',
      dataIndex: 'status',
    },
    {
      title: '操作',
      dataIndex: 'taskDesc',
      render: (text, record) => {
        const {setId, taskId, algType} = record;
        return (
          <>
            <Button type="link" href={`/#/algo-verify/eva-statistic?setId=${setId}&algType=${algType}&taskId=${taskId}`} target="_blank">
              评测结果
            </Button>
            <Button type="link" href={`/#/algo-verify/task-detail?taskId=${taskId}`} target="_blank">
              任务明细
            </Button>
            <Button
              onClick={() => {
                handleRerunTask(record);
              }}
              type="primary"
            >
              重跑评测
            </Button>
          </>
        );
      },
    },
  ];

  const handleRerunTask = async (record: any) => {
    try {
      let ret = await algoService.rerunVerifyTask(record.taskId);
      message.success('执行成功');
    } catch (error) {
      message.error(error + '');
    }
  };

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
                create_state.show();
                handleSearch();
              }}
            >
              创建评测任务
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="taskId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
      <CreateAlgoTaskDlg
        visible={create_state.visible}
        onSuccess={() => {
          handleCloseCreateModel();
          handleSearch();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateAlgoTaskDlg>
    </div>
  );
};
