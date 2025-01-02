import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {
  COLLECT_TASK_STATUS_OPTIONS,
  DataDetailQuery,
  DataDetailInList,
  CreateMapByPointCloudPayload,
} from '../../models';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import {useLocation, useNavigate} from 'react-router-dom';
import {BatchSearchSelect} from '../project/batch-search-select';
import {ProjectSearchSelect} from '../project/project-search-select';
import {CreateMapByPointCloud} from './data-list/create-map-by-point-cloud';

type SearchParams = DataDetailQuery;

/**
 * 资料采集
 */
export const DataDetailInManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<DataDetailInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();

  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const create_map_by_point_state = useEditState<Partial<CreateMapByPointCloudPayload>>();
  const [changeBusiness, setChangeBusiness] = useState<number | undefined>();
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);

    changeHistory({
      ...omit(values, ['createTime']),
      startTime: createTime[0],
      endTime: createTime[1],
      page: 1,
      pageSize: pagination.pageSize,
    });
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await cpmService.retriveDataDetailList({
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

  const columns: ColumnsType<DataDetailInList> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '批次编号',
      dataIndex: 'batchId',
    },
    {
      title: '路径编号',
      dataIndex: 'routeId',
    },
    {
      title: '任务编号',
      dataIndex: 'collectTaskId',
    },
    {
      title: '资料编号',
      dataIndex: 'materialId',
    },
    {
      title: '会话编号',
      dataIndex: 'eventGroupId',
    },
    {
      title: 'uuid',
      dataIndex: 'uuid',
    },
    {
      title: '数据分段',
      dataIndex: 'section',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
    },
    {
      title: '资料状态',
      dataIndex: 'status',
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
      if (['startTime', 'endTime', 'pageNo', 'pageSize', 'projectId', 'batchId', 'changeBusiness'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);

    const createTime = convertTimestampTupleToMomentTuple([params.startTime, params.endTime]);

    form.setFieldsValue({
      ...omit(params, ['startTime', 'endTime']),
      createTime: createTime,
    });

    setSerachParams(params);
    setChangeBusiness(params.changeBusiness);
    getList(params);
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <BatchSearchSelect changeBusiness={changeBusiness}></BatchSearchSelect>
            <Form.Item label="路口编号" name="crossId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="路径编号" name="routeId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="任务编号" name="collectTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="资料编号" name="materialId">
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
              <DatePicker.RangePicker placeholder={['起始时间', '结束时间']}></DatePicker.RangePicker>
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
            <Button
              type="primary"
              onClick={() => {
                navigate('/data-management/collect');
              }}
            >
              返回资料采集
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="batchId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
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
