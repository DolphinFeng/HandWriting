import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateSamplesetDlg} from './create-sampleset-dlg';
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

type SearchParams = components['schemas']['SampleSetQuery'];
type SampleSet = components['schemas']['SampleSet'];

export const SamplesetList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<SampleSet[]>([]); // 项目列表
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

  const [algoTypeOption, setAlgoTypeOption] = useState<{label: string; value: number}[]>([]);

  const getAlgoType = async () => {
    try {
      const options = await algoService.queryAlgoTypeOptions();
      setAlgoTypeOption(options);
    } catch (error) {
      message.error(error + '');
    }
  };

  useEffect(() => {
    getAlgoType();
  }, []);

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await algoService.querySamplesetList({
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

  const columns: ColumnsType<SampleSet> = [
    // {
    //   title: '产线',
    //   dataIndex: 'bizTypeDesc',
    // },
    {
      title: '评测集编号',
      dataIndex: 'setId',
    },
    {
      title: '算法类型',
      dataIndex: 'algTypeDesc',
    },
    {
      title: '评测集名称',
      dataIndex: 'setName',
    },
    {
      title: '评测集描述',
      dataIndex: 'setDesc',
    },
    // {
    //   title: '样本标签',
    //   dataIndex: 'sampleDesc',
    // },
    {
      title: '样本数量',
      dataIndex: 'sampleNum',
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
      render: (text, record) => {
        return (
          <>
            <Button
              onClick={() => {
                handleAddSample(record);
              }}
            >
              添加样本
            </Button>
          </>
        );
      },
    },
  ];

  const handleAddSample = (record: any) => {
    create_state.setItem({
      setId: record.setId,
      sampleList: record.sampleList,
      algType: record.algType,
      setName: record.setName,
      setDesc: record.setDesc,
    });
    create_state.show();
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
            {/* <Form.Item label="生产模式" name="algId">
              <Select
                placeholder="请选择"
                onChange={handleChangeBisType}
                style={{width: '200px'}}
                allowClear
                options={bizTypeOption}
              ></Select>
            </Form.Item> */}
            <Form.Item label="算法类型" name="algType">
              <Select placeholder="请选择" style={{width: '200px'}} allowClear options={algoTypeOption}></Select>
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
              创建评测集
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="setId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
      <CreateSamplesetDlg
        visible={create_state.visible}
        state={create_state}
        onSuccess={() => {
          handleCloseCreateModel();
          handleSearch();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateSamplesetDlg>
    </div>
  );
};