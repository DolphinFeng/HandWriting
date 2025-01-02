import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from './project/create-modal';
import {useEditState, usePageFns, useQuery} from '../hooks';
import {cpmService} from '../services/cpw-service';
import {ProjectInList} from '../models';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  getQueryOffset,
  humanizeTime,
  removeEmptyValue,
} from '../utils';
import {omit} from 'lodash';
import {BusinessType} from './business-type';

interface SearchParams {
  businessType: number;
  projectId?: number;
  projectName?: string;
  startTime?: number;
  endTime?: number;
  page?: number;
  pageSize?: number;
}

/**
 * 项目列表页面
 */
export const ProjectList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProjectInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    if (values.businessType) {
      const createTime = convertMomentTupleToTimestampTuple(values.createTime);

      changeHistory({
        ...omit(values, ['createTime']),
        startTime: createTime[0],
        endTime: createTime[1],
        page: 1,
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
      const page = params.page ?? DefaultPagination.current;

      const startIndex = getQueryOffset(page, pageSize);

      setLoading(true);
      const ret = await cpmService.retrieveProjectList({
        ...omit(params, 'page', 'pageSize'),
        startIndex,
        pageSize,
      });

      setList(ret.data);
      setPagination({
        ...pagination,
        total: ret.totalCount,
        current: page,
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

  const columns: ColumnsType<ProjectInList> = [
    {
      title: '项目编号',
      dataIndex: 'projectId',
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '项目创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '操作员',
      dataIndex: 'operator',
    },
    // {
    //   title: '执行状态',
    //   dataIndex: 'status',
    // },
    {
      title: '项目详情',
      dataIndex: 'detail',
      render: (text, record) => {
        const {projectId} = record;
        return (
          <>
            <Button type="link" href={`/#/project-management/batch/list?projectId=${projectId}`} target="_blank">
              详情
            </Button>
            <Button type="link" href={`/#/data-monitor/project?projectId=${projectId}`} target="_blank">
              统计
            </Button>
          </>
        );
      },
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    changeHistory({
      ...serach_params,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  useEffect(() => {
    let params: any = {};

    query.forEach((value, key) => {
      if (['startTime', 'endTime', 'page', 'pageSize', 'projectId', 'businessType'].includes(key)) {
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
    const createTime = convertTimestampTupleToDayTuple([params.startTime, params.endTime]);

    form.setFieldsValue({
      ...omit(params, ['startTime', 'endTime']),
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
            <Form.Item label="项目编号" name="projectId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="项目名称" name="projectName">
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
              创建项目
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="projectId"
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
          handleSearch();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateModal>
    </div>
  );
};
