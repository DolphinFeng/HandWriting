import {Button, DatePicker, Form, Input, Select, Space, Table, message, Tooltip} from 'antd';
import {DefaultPagination} from '../../../constants';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../../hooks';
import {cpmService} from '../../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {removeEmptyValue} from '../../../utils';
import {omit} from 'lodash';
import {
  MERGE_TASK_CROSS_STATUS_OPTIONS,
  MergeTaskInList,
  OverWriteBatchInList,
  MERGE_TASK_CROSS_STATUS_DESCRIPTIONS,
} from '../../../models';
import {CreateModal} from './components/cross-merge-modal';
import {MergeBusinessType} from '../../merge-business-type';

type SearchParams = MergeTaskInList;

export const CrossMergeDetail = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<OverWriteBatchInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const [cityName, setCityName] = useState();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const handleSearch = () => {
    const values = form.getFieldsValue();
    if (values.businessType) {
      changeHistory({
        ...omit(values, ['createTime']),
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

      let cityListStr = params['cityList'] + '';
      let cityList = cityListStr.split(',');

      setLoading(true);
      const ret = await cpmService.retrieveMergeSubTaskCrossList({
        ...omit(params, 'pageNo', 'pageSize', 'cityList'),
        cityList: params['cityList'] ? cityList : undefined,
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
      title: '路口ID',
      dataIndex: 'crossId',
      width: 100,
      align: 'center',
      fixed: 'left',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '批次ID',
      dataIndex: 'batchId',
      width: 100,
      align: 'center',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '变化源ID',
      dataIndex: 'diffSourceId',
      width: 200,
      align: 'center',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '融合任务ID',
      dataIndex: 'mergeSubtaskId',
      width: 100,
      align: 'center',
    },
    {
      title: '融合批次名称',
      dataIndex: 'taskName',
      width: 100,
      align: 'center',
    },
    {
      title: '产品库名称',
      dataIndex: 'productName',
      width: 100,
      align: 'center',
    },
    {
      title: '产品库分支',
      dataIndex: 'branchName',
      width: 100,
      align: 'center',
    },
    {
      title: '是否启用推理排序',
      dataIndex: 'useCompare',
      width: 100,
      align: 'center',
    },
    // {
    //   title: '是否启用准出回退替换',
    //   dataIndex: 'startTime',
    //   width: 100,
    //   align: 'center',
    // },
    {
      title: '融合版本',
      dataIndex: 'mergeTaskType',
      width: 100,
      align: 'center',
    },
    {
      title: '路口类型',
      dataIndex: 'crossType',
      width: 100,
      align: 'center',
    },
    {
      title: '推理算法版本量',
      dataIndex: 'inferAlgVsn',
      width: 100,
      align: 'center',
    },
    {
      title: '推理打分算法版本',
      dataIndex: 'evalAlgVsn',
      width: 100,
      align: 'center',
    },
    {
      title: 'TMS任务ID',
      dataIndex: 'tmsTaskId',
      width: 150,
      align: 'center',
    },
    {
      title: '融合状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (x, record) => {
        const {status} = record;
        return <span>{status ? MERGE_TASK_CROSS_STATUS_DESCRIPTIONS[status] : '-'}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        const {aipTaskUrl, batchMappingTaskId, batchId} = record;
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                const {subtaskId} = record;
                if (subtaskId) {
                  //triggerMergeTask(subtaskId);
                }
              }}
            >
              回退融合
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
      if (['startCreateTime', 'endCreateTime', 'pageNo', 'pageSize', 'subtaskId', 'businessType'].includes(key)) {
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
    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime']),
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  useEffect(() => {
    //获取城市接口
    handleCityList();
  }, []);

  const handleCityList = async () => {
    try {
      const result: any = await cpmService.retrieveDimCity();

      let city = result.data.filter((obj: any, index: any) => {
        return result.data.findIndex((item: any) => item.cityName === obj.cityName) === index;
      });

      let cityList = city
        .map((obj: {cityOrder: string}) => ({
          ...obj,
          cityOrder: parseInt(obj.cityOrder),
        }))
        .sort((a: any, b: any) => a.cityOrder - b.cityOrder);

      setCityName(
        cityList.map((item: any) => ({
          label: item.cityName + '-' + item.provName,
          value: item.cityName,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const filterCityOption = (input: string, option?: {label: string; value: string}) =>
    (option?.label ?? '').includes(input);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <MergeBusinessType businessModel={false} city={false}></MergeBusinessType>
            <Form.Item label="城市" name="cityList">
              <Select
                mode="multiple"
                showSearch
                options={cityName}
                placeholder="请选择"
                allowClear
                filterOption={filterCityOption}
                style={{width: '200px'}}
              ></Select>
            </Form.Item>
            <Form.Item label="批次ID" name="batchId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="融合任务" name="subtaskName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="产品库分支" name="branchName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="路口ID" name="crossId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="融合状态" name="status">
              <Select
                style={{width: '200px'}}
                placeholder="请选择"
                options={MERGE_TASK_CROSS_STATUS_OPTIONS}
                allowClear
              ></Select>
            </Form.Item>
            <Form.Item label="融合任务ID" name="subtaskId">
              <Input placeholder="请输入" allowClear></Input>
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
      <div style={{width: '1600px'}}>
        <Table
          rowKey="produceTaskId"
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
        title={'创建回退融合任务'}
        visible={create_state.visible}
        disabled={true}
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
