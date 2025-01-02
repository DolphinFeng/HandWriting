import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateAlgoDlg} from './create-algo-dlg';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {algoService} from '../../services/algo-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToDayTuple,
  getQueryOffset,
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import {components} from '../../models/openapi-alg';

type SearchParams = components['schemas']['AlgInfoQuery'];
type AlgInfoVo = components['schemas']['AlgInfoVo'];

export const AlgoList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<AlgInfoVo[]>([]); // 项目列表
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

  const [bizTypeOption, setBizTypeOption] = useState<
    {value: number; label: string; algoTypeOption: {label: string; value: number}[]}[]
  >([]);
  const [algoTypeOption, setAlgoTypeOption] = useState<{label: string; value: number}[]>([]);

  const getBizAlgoType = async () => {
    try {
      const ret = await algoService.queryBizAndAlgoType();
      let bizTypeOption: any = ret.data.map((item) => {
        let algoTypeOption = item.bizTypeAlgTypeList.map((subItem) => {
          return {
            label: subItem.algTypeDesc,
            value: subItem.algTypeValue,
          };
        });

        return {
          label: item.bizTypeDesc,
          value: item.bizTypeValue,
          algoTypeOption: algoTypeOption,
        };
      });

      setBizTypeOption(bizTypeOption);
    } catch (error) {
      message.error(error + '');
    }
  };

  useEffect(() => {
    getBizAlgoType();
  }, []);

  const handleChangeBisType = (e: any) => {
    for (let item of bizTypeOption) {
      if (item.value == e) {
        setAlgoTypeOption(item.algoTypeOption);
        break;
      }
    }
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await algoService.queryAlgoList({
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

  const columns: ColumnsType<AlgInfoVo> = [
    {
      title: '算法编号',
      dataIndex: 'algId',
    },
    {
      title: '产线',
      dataIndex: 'bizTypeDesc',
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
      title: '评测workflow',
      dataIndex: 'evalWorkflow',
    },
    {
      title: '生产workflow',
      dataIndex: 'prodWorkflow',
    },
    {
      title: '创建人',
      dataIndex: 'operator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'taskDesc',
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
      if (['startTime', 'endTime', 'pageNo', 'pageSize', 'setId', 'taskId', 'algType'].includes(key)) {
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
            <Form.Item label="生产模式" name="algId">
              <Select
                placeholder="请选择"
                onChange={handleChangeBisType}
                style={{width: '200px'}}
                allowClear
                options={bizTypeOption}
              ></Select>
            </Form.Item>
            <Form.Item label="算法类型" name="algType">
              <Select placeholder="请选择" style={{width: '200px'}} allowClear options={algoTypeOption}></Select>
            </Form.Item>
            <Form.Item label="算法名称" name="algName">
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
              创建算法
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="algId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
      <CreateAlgoDlg
        visible={create_state.visible}
        onSuccess={() => {
          handleCloseCreateModel();
          handleSearch();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateAlgoDlg>
    </div>
  );
};
