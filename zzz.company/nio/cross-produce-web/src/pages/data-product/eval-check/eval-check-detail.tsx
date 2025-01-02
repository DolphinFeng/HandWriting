import { Button, DatePicker, Form, Input, Select, Space, Table, Tooltip, message } from 'antd';
import { DefaultPagination } from '../../../constants';
import { useEffect, useState } from 'react';
import { CreateModal } from './components/create-task-modal';
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
import JsonViewDlg from '../../json-view';


interface SearchParams {
  batchInferEvalTaskId?: number;
  crossId?: string;
  endCreateTime?: string;
  inferAlgVsn?: string;
  orderBy?: string;
  pageNo?: number;
  pageSize?: number;
  startCreateTime?: string;
}


/**
 * 打分任务明细
 */
export const EvalCheckDetail = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const { changeHistory } = usePageFns();
  const navigate = useNavigate();
  const [inferAlgVsnOp, setInferAlgVsnOp] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [record, setRecord] = useState();

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
      const ret: any = await cpmService.queryEvalTaskDetail({
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

  const columns: ColumnsType<any> = [
    {
      title: '记录ID',
      dataIndex: 'id',
      width: 150,
      align: 'center',
    },
    {
      title: '刷库任务编号',
      dataIndex: 'batchInferEvalTaskId',
      width: 150,
      align: 'center',
    },
    {
      title: '建图实体编号',
      dataIndex: 'crossId',
      width: 200,
      align: 'center',
    },
    {
      title: '变化源编号',
      dataIndex: 'diffId',
      width: 200,
      align: 'center',
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
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
      width: 200,
      align: 'center',
    },
    {
      title: '打分通过路径',
      dataIndex: 'validRoute',
      width: 200,
      align: 'center',
      render: (text) => (
        <Tooltip placement="top" title={text}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: '打分结果',
      dataIndex: 'inferEvalDetail',
      width: 200,
      align: 'center',
        render: (text, record) => {
          if (record.validRoute) {
            return (
              <>
                <Button onClick={() => showContent(JSON.parse(text))}>查看</Button>
              </>
            );
          } else {
            return (
              '-'
            )
          }
          
        }
    },
    // {
    //   title: '操作',
    //   dataIndex: 'detail',
    //   render: (text, record) => {
    //     const { batchInferEvalTaskId } = record;

    //     return (
    //       <>
    //         <Button
    //           type="link"
    //           href={`/#/data-product/eval-check/result?batchInferEvalTaskId=${batchInferEvalTaskId}`}
    //           target="_blank"
    //         >
    //           详情
    //         </Button>
    //       </>
    //     );
    //   },
    // },
  ];

  const showContent = (content: any) => {
    setRecord(content);
    setIsModalOpen(true);
  };

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


  useEffect(() => {
    handleInferAlgVsnList();
  }, []);
  
  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="推理算法版本" name="inferAlgVsn">
              <Select style={{ width: '200px' }} options={inferAlgVsnOp} placeholder="请选择" allowClear></Select>
            </Form.Item>
            <Form.Item label="打分刷库任务编号" name="batchInferEvalTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="建图实体编号" name="crossId">
              <Input placeholder="请输入" allowClear></Input>
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
      <JsonViewDlg visible={isModalOpen} closeDialog={() => setIsModalOpen(false)} content={record}></JsonViewDlg>
    </div>
  );
};
