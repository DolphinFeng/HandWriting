import { Button, DatePicker, Form, Input, Select, Space, Table, message, Tooltip } from 'antd';
import { DefaultPagination } from '../../../constants';
import { useEffect, useState } from 'react';
import { useEditState, usePageFns, useQuery } from '../../../hooks';
import { cpmService } from '../../../services/cpw-service';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  getQueryOffset,
  humanizeTime,
  removeEmptyValue,
} from '../../../utils';
import { omit } from 'lodash';
import {
  EVAL_TASK_STATUS_OPTIONS,
  EVAL_TASK_STATUS_DESCRIPTIONS,
} from '../../../models';
import { CreateModal } from './components/create-task-modal';
import { ProjectSelect } from '../../project/project-select';
import { ignore } from 'antd/es/theme/useToken';


interface SearchParams {
  batchInferEvalTaskId?: number;
  endCreateTime?: string;
  inferAlgVsn?: string;
  orderBy?: string;
  pageNo?: number;
  pageSize?: number;
  projectId?: number;
  startCreateTime?: string;
  status?: string;
  tmsTaskId?: string;
}

/**
 * 创建打分任务
 */
export const EvalCheckCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const { changeHistory } = usePageFns();
  const [changeBusiness, setChangeBusiness] = useState();
  const [inferAlgVsnOp, setInferAlgVsnOp] = useState();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

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
      const ret: any = await cpmService.queryEvalTask({
        ...omit(params, 'pageNo', 'pageSize'),
        pageNo,
        pageSize,
      });
      console.log(ret)
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

  const columns: ColumnsType<any> = [
    {
      title: '刷库任务编号',
      dataIndex: 'batchInferEvalTaskId',
      width: 150,
      align: 'center',
      fixed: 'left',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '任务描述',
      dataIndex: 'batchInferEvalTaskDesc',
      width: 200,
      align: 'center',
      render: (text) => (
        <Tooltip placement="top" title={text} overlayStyle={{ maxWidth: 700 }}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: '融合项目',
      dataIndex: 'mergeSubtaskId',
      width: 200,
      align: 'center',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '推理算法版本',
      dataIndex: 'inferAlgVsn',
      width: 200,
      align: 'center',
    },
    {
      title: '打分算法版本',
      dataIndex: 'evalAlgVsn',
      width: 200,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 200,
      align: 'center',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '变化源数量',
      dataIndex: 'diffNumAll',
      width: 200,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 200,
      align: 'center',
      render: (x, record) => {
        const { status } = record;
        // @ts-ignore
        return <span>{status ? EVAL_TASK_STATUS_DESCRIPTIONS[status] : '-'}</span>;
      },
    },
    {
      title: 'tms任务号',
      dataIndex: 'tmsTaskId',
      width: 200,
      align: 'center',
    },
    {
      title: '创建人',
      dataIndex: 'operator',
      width: 200,
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        const { batchInferEvalTaskId, inferAlgVsn } = record;
        return (
          <>
            <Button
              type="link"
              href={`/#/data-product/eval-check/detail?batchInferEvalTaskId=${batchInferEvalTaskId}`}
              target="_blank"
            >
              详情
            </Button>
          </>
        );
      },
      width: 200,
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

    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

    //进入页面 默认产线为cross
    // if (!params.businessType) {
    //   params.businessType = 1;
    // }

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


  useEffect(() => {
    handleInferAlgVsnList();
  }, []);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <ProjectSelect changeBusiness={changeBusiness}></ProjectSelect>
            <Form.Item label="推理算法版本" name="inferAlgVsn">
              <Select style={{ width: '200px' }} options={inferAlgVsnOp} placeholder="请选择" allowClear></Select>
            </Form.Item>
            <Form.Item label="打分任务编号" name="batchInferEvalTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="执行状态" name="status">
              <Select
                style={{ width: '200px' }}
                placeholder="请选择"
                options={EVAL_TASK_STATUS_OPTIONS}
                allowClear
              ></Select>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{ format: 'YYYY-MM-DD HH:mm:ss' }}
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
              创建任务
            </Button>
          </Space>
        </div>
      </div>
      <div>
        <Table
          rowKey="batchInferEvalTaskId"
          className="page-table"
          columns={columns}
          dataSource={list}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
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
