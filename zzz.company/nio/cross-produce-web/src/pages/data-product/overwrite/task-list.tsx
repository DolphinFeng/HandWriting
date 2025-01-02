import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from '../../project/create-modal';
import {useEditState, usePageFns, useQuery} from '../../../hooks';
import {cpmService} from '../../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
} from '../../../utils';
import {omit} from 'lodash';
import {
  OVERWRITE_TASK_STATUS_DESCRIPTIONS,
  OVERWRITE_TASK_STATUS_OPTIONS,
  OVERWRITE_TASK_STATUS,
  OverWriteTaskInList,
  OverWriteTaskQuery,
} from '../../../models';
import {useNavigate} from 'react-router-dom';
import {BusinessType} from '../../business-type';

type SearchParams = OverWriteTaskQuery;
/**
 * 任务列表
 */
export const OverWriteTaskList = ({}: {}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<OverWriteTaskInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    if (values.businessType) {
      changeHistory({
        ...omit(values, ['createTime']),
        startCreateTime: createTime[0],
        endCreateTime: createTime[1],
        pageNo: 1,
        pageSize: pagination.pageSize,
      });
    } else {
      message.error('请选择产线');
    }
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await cpmService.retrieveOverWriteTaskList({
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

  const columns: ColumnsType<OverWriteTaskInList> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '批次编号',
      dataIndex: 'batchId',
    },
    {
      title: '路口编号',
      dataIndex: 'crossId',
    },
    {
      title: '路口任务编号',
      dataIndex: 'crossTaskId',
    },
    {
      title: '刷库任务编号',
      dataIndex: 'batchMappingTaskId',
    },
    {
      title: '刷库任务类型',
      dataIndex: 'batchMappingTaskType',
    },
    {
      title: '路口类型',
      dataIndex: 'crossType',
    },
    {
      title: '创建时间',
      dataIndex: 'startTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '路径总数',
      dataIndex: 'routeTotalCount',
    },
    {
      title: '输入覆盖路径总数',
      dataIndex: 'inputRouteNum',
    },
    {
      title: '状态',
      dataIndex: 'crossTaskStatus',
      render: (x, record) => {
        const {crossTaskStatus} = record;
        return (
          <span>
            {crossTaskStatus ? OVERWRITE_TASK_STATUS_DESCRIPTIONS[crossTaskStatus as OVERWRITE_TASK_STATUS] : '-'}
          </span>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        const {aipTaskUrl} = record;

        return (
          <>
            <Button type="link" href={record.aipTaskUrl} target="_blank">
              链接
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
    if (!params.businessType) {
      params.businessType = 1;
    }
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
            <BusinessType businessModel={false} city={false}></BusinessType>
            <Form.Item label="项目名称" name="projectName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="批次编号" name="batchId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="批次名称" name="batchName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="路口编号" name="crossId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="路口任务编号" name="crossTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="刷库任务编号" name="batchMappingTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="状态" name="crossTaskStatus">
              <Select
                style={{width: '180px'}}
                placeholder="请选择"
                allowClear
                options={OVERWRITE_TASK_STATUS_OPTIONS}
              ></Select>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{format: 'HH:mm:ss'}}
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
                const values = form.getFieldsValue();
                if (values.batchId !== undefined) {
                  navigate('/data-monitor/batch?batchId=' + values.batchId);
                } else {
                  navigate('/data-monitor/batch');
                }
              }}
            >
              生产进度
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="crossTaskId"
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
