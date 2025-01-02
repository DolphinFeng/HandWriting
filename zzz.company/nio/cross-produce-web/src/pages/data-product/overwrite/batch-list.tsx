import {Button, DatePicker, Form, Input, Select, Space, Table, message, Tooltip, Modal} from 'antd';
import {DefaultPagination} from '../../../constants';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../../hooks';
import {cpmService} from '../../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  getQueryOffset,
  humanizeTime,
  removeEmptyValue,
} from '../../../utils';
import {omit} from 'lodash';
import {
  OverWriteBatchQuery,
  TASK_TYPE,
  OVERWRITE_BATCH_TASK_STATUS_OPTIONS,
  OVERWRITE_BATCH_TASK_STATUS_DESCRIPTIONS,
  OverWriteBatchInList,
} from '../../../models';
import {CreateModal} from './components/create-batch-modal';
import {BusinessType} from '../../business-type';
type SearchParams = OverWriteBatchQuery;

/**
 * 刷库-批次列表
 */
export const OverWriteBatchList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<OverWriteBatchInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();

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
      const ret = await cpmService.retrieveOverWriteBatchList({
        ...omit(params, 'pageNo', 'pageSize'),
        pageNo,
        pageSize,
      });

      setList(ret.data as OverWriteBatchInList[]);
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

  const columns: ColumnsType<OverWriteBatchInList> = [
    {
      title: '批次名称',
      dataIndex: 'batchName',
      width: 100,
      align: 'center',
      fixed: 'left',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '批次编号',
      dataIndex: 'batchId',
      width: 130,
      align: 'center',
      render: (text) => (
        <Tooltip placement="top" title={text} overlayStyle={{maxWidth: 700}}>
          <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: '刷库任务编号',
      dataIndex: 'batchMappingTaskId',
      width: 200,
      align: 'center',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '任务描述',
      dataIndex: 'batchMappingTaskDesc',
      width: 100,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'startTime',
      width: 200,
      align: 'center',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '任务路口数',
      dataIndex: 'crossNum',
      width: 150,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (x, record) => {
        const {status} = record;
        return <span>{status ? OVERWRITE_BATCH_TASK_STATUS_DESCRIPTIONS[status] : '-'}</span>;
      },
    },
    {
      title: '任务类型',
      dataIndex: 'batchMappingTaskType',
      width: 120,
      align: 'center',
    },
    {
      title: '任务参数',
      dataIndex: 'taskParams',
      width: 200,
      align: 'center',
      render: (text) => (
        <Tooltip placement="top" title={text}>
          <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'operator',
      width: 150,
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        const {aipTaskUrl, batchMappingTaskId, batchId, businessType} = record;
        return (
          <>
            <Button
              type="link"
              href={`/#/data-product/overwrite/task/list?batchMappingTaskId=${batchMappingTaskId}&businessType=${businessType}`}
              target="_blank"
            >
              详情
            </Button>{' '}
            <Button type="link" href={`/#/data-monitor/batch?batchId=${batchId}`} target="_blank">
              生产进度
            </Button>
            <Button
              type="link"
              onClick={() => {
                const { batchMappingTaskId } = record;
                if (batchMappingTaskId) {
                  handleRetry(batchMappingTaskId);
                }
              }}
            >
              批量原地重试
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

  // 批量原地重试
  const handleRetry = (batchMappingTaskId: any) => {
    Modal.confirm({
      title: '提示',
      content: '确认要对该刷库任务中目前所有失败任务触发原地重试吗？',
      onOk: () => {
        handleOK(batchMappingTaskId)
      },
      onCancel: () => {
        Modal.destroyAll();
      }
    })
  }

  const handleOK = async (batchMappingTaskId: any) => {
    try {
      const ret: any = await cpmService.retryFailedInplace({
        batchMappingTaskId: batchMappingTaskId
      });
      if (ret.code != 0) {
        message.error(ret.data);
      } else {
        message.success(ret.data);
        setTimeout(() => {
          // eslint-disable-next-line no-restricted-globals
          location.reload();
        }, 1000);
      }
    } catch (error) {
      message.error(error + '');
    }
  }

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

    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

    //进入页面 默认产线为cross
    if (!params.businessType) {
      params.businessType = 1;
    }

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
            <Form.Item label="批次名称" name="batchName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="批次编号" name="batchId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select placeholder="请选择" options={OVERWRITE_BATCH_TASK_STATUS_OPTIONS} allowClear></Select>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{format: 'YYYY-MM-DD HH:mm:ss'}}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['起始时间', '结束时间']}
              ></DatePicker.RangePicker>
            </Form.Item>
            <Form.Item label="刷库任务编号" name="batchMappingTaskId">
              <Input placeholder="请输入" allowClear></Input>
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
              创建任务
            </Button>
          </Space>
        </div>
      </div>
      <div style={{width: '1600px'}}>
        <Table
          rowKey="batchMappingTaskId"
          className="page-table"
          columns={columns}
          dataSource={list}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{x: 1000}}
        ></Table>
      </div>
      <CreateModal
        visible={create_state.visible}
        onSuccess={() => {
          handleCloseCreateModel();
          handleSearch();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateModal>
    </div>
  );
};
