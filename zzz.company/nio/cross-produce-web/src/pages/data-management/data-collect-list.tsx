import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from '../project/create-modal';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {
  COLLECT_TASK_STATUS_DESCRIPTIONS,
  COLLECT_TASK_STATUS_OPTIONS,
  CollectTaskInList,
  CollectTaskQuery,
  CreateMapByPointCloudPayload,
} from '../../models';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
  convertCityForm,
} from '../../utils';
import {omit} from 'lodash';
import {useNavigate} from 'react-router-dom';
import {BatchSearchSelect} from '../project/batch-search-select';
import {ProjectSearchSelect} from '../project/project-search-select';
import {CreateMapByPointCloud} from './data-list/create-map-by-point-cloud';
import {BusinessType} from '../business-type';

type SearchParams = CollectTaskQuery;

/**
 * 资料采集
 */
export const DataCollectInManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<CollectTaskInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const create_map_by_point_state = useEditState<Partial<CreateMapByPointCloudPayload>>();

  const [changeBusiness, setChangeBusiness] = useState(1);
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    const cityList = convertCityForm(values.cityNameList);
    changeHistory({
      ...omit(values, ['createTime', 'cityNameList']),
      startTime: createTime[0],
      endTime: createTime[1],
      page: 1,
      pageSize: pagination.pageSize,
      cityNameList: cityList,
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
      const ret = await cpmService.retrieveCollectTaskList({
        ...omit(params, 'page', 'pageSize'),
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

  const columns: ColumnsType<CollectTaskInList> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
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
      title: '路口类型',
      dataIndex: 'crossTypeDesc',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '路径总数',
      dataIndex: 'collectRouteNum',
    },
    {
      title: '采集完成路径数',
      dataIndex: 'collectedRouteNum',
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      render(value, record, index) {
        const {status} = record;
        //@ts-ignore
        return <span>{status ? COLLECT_TASK_STATUS_DESCRIPTIONS[status] : '--'}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        const {crossId} = record;
        return (
          <>
            <Button type="link" href={record.collectUrl} target="_blank">
              链接
            </Button>
            {(changeBusiness == 1 || changeBusiness == 2) && (
              <Button
                type="link"
                onClick={() => {
                  navigate(`/data-management/data-detail/?changeBusiness=${changeBusiness}&crossId=${crossId}`);
                }}
              >
                资料详情
              </Button>
            )}

            <Button type="link">路口详情</Button>
            <Button
              type="link"
              onClick={() => {
                create_map_by_point_state.setItem({
                  projectId: record.projectId,
                  batchId: record.batchId,
                  crossId: record.crossId,
                  materialIds: record.id ? [record.id] : [],
                });

                create_map_by_point_state.show();
              }}
            >
              点云建图
            </Button>
          </>
        );
      },
    },
  ];

  const columns2: ColumnsType<CollectTaskInList> = [
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
      title: '采集资料数',
      dataIndex: 'collectMaterialNum',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      render(value, record, index) {
        const {status} = record;
        //@ts-ignore
        return <span>{status ? COLLECT_TASK_STATUS_DESCRIPTIONS[status] : '--'}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        const {crossId} = record;
        return (
          <>
            <Button type="link" href={record.collectUrl} target="_blank">
              链接
            </Button>
            <Button type="link">路口详情</Button>
            <Button
              type="link"
              onClick={() => {
                create_map_by_point_state.setItem({
                  projectId: record.projectId,
                  batchId: record.batchId,
                  crossId: record.crossId,
                  materialIds: record.id ? [record.id] : [],
                });

                create_map_by_point_state.show();
              }}
            >
              点云建图
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

  const onChangeBusiness = (e: any) => {
    setChangeBusiness(e);
    form.setFieldValue('batchMode', undefined);
  };

  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (
        ['startTime', 'endTime', 'pageNo', 'pageSize', 'projectId', 'batchId', 'businessType', 'batchMode'].includes(
          key,
        )
      ) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else if (['cityNameList'].includes(key)) {
        //@ts-ignore
        params[key] = (value ? decodeURI(value) : undefined)?.split(',');
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);
    //进入页面默认选中Cross产线
    if (!params.businessType) {
      params.businessType = 1;
    }
    const createTime = convertTimestampTupleToDayTuple([params.startTime, params.endTime]);

    form.setFieldsValue({
      ...omit(params, ['startTime', 'endTime', 'cityNameList']),
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
            {/* <ProjectSearchSelect></ProjectSearchSelect> */}
            <BusinessType
              businessModel={true}
              city={true}
              changeBusiness={onChangeBusiness}
              modeDisabledType={'vector'}
            ></BusinessType>
            <BatchSearchSelect changeBusiness={changeBusiness}></BatchSearchSelect>
            <Form.Item label="路口编号" name="crossId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="执行状态" name="status">
              <Select
                placeholder="请选择"
                options={COLLECT_TASK_STATUS_OPTIONS}
                style={{width: '200px'}}
                allowClear
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
      {(changeBusiness == 1 || changeBusiness == 2) && (
        <Table
          rowKey="id"
          className="page-table"
          columns={columns}
          dataSource={list}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        ></Table>
      )}

      {(changeBusiness == 3 || changeBusiness == 4) && (
        <Table
          rowKey="batchId"
          className="page-table"
          columns={columns2}
          dataSource={list}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        ></Table>
      )}

      <CreateMapByPointCloud
        state={create_map_by_point_state}
        visible={create_map_by_point_state.visible}
        onSuccess={() => {
          create_map_by_point_state.hide();
        }}
        onCancel={() => {
          create_map_by_point_state.hide();
        }}
      ></CreateMapByPointCloud>
    </div>
  );
};
