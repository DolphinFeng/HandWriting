import {Button, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {CreateModal} from '../project/create-modal';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {buildMapService} from '../../services/build-map-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
  convertCityForm,
} from '../../utils';
import {omit} from 'lodash';
import {
  PRODUCE_TASK_STATUS,
  PRODUCE_TASK_STATUS_DESCRIPTIONS,
  ProduceTaskInList,
  ProduceTaskQuery,
  TASK_STATUS_DESCRIPTIONS,
  TASK_TYPE,
} from '../../models';
import JsonViewDlg from '../json-view';
import { components } from '../../models/openapi-build-map';
import { downloadFile } from '../../utils/downloadUtils';
import { capitalizeOptions } from '../../libs/client/util';

type SearchParams = components['schemas']['RouteInfoQuery'] & {
  pageSize?: number; 
  pageNo?: number;  
};

type RouteInfo = components['schemas']['RouteInfo'];
type PageVoRouteInfo = components['schemas']['PageVo«RouteInfo»'];

const routeDirectionMap: Record<number, string> = {
  5: '调头',
  8: '右前斜行',
  7: '右转',
  1: '直行',
  2: '左前斜行',
  6: '右后斜行',
  3: '左转',
  4: '左后斜行',
};

/**
 * 路径列表
 */
export const BuildMapTaskDetailList = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<RouteInfo[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const {changeHistory} = usePageFns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const [business, setBusiness] = useState(1);
  const [businessType, setBusinessType] = useState();
  const [siteStatus, setSiteStatus] = useState<{ label: string; value: number; }[]>([]);
  const [routeDirections, setRouteDirections] = useState<{ label: string; value: number; }[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const siteStatusRes = await buildMapService.getSiteStatus(); // Fetch site status options
        const createOptions = (data: any) => 
          data ? Object.entries(data).map(([label, value]) => ({ 
            label, 
            value: Number(value) 
          })) : [];
        setSiteStatus(capitalizeOptions(createOptions(siteStatusRes.data))); // Set site status options

        const routeDirectionRes = await buildMapService.getRouteDirection(); // Fetch route direction options
        setRouteDirections(createOptions(routeDirectionRes.data)); // Set route direction options
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const siteId = query.get('siteId');
    if (siteId) {
      form.setFieldsValue({ siteId });
      handleSearch(); // 只在初始加载时调用
    }
  }, []); // 确保只在组件挂载时执行

  const isTargetPathOptions = [
    { label: '是', value: 1 },
    { label: '不是', value: 0 },
  ];

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const searchParams = {
      siteId: values.siteId ? values.siteId : undefined,
      direction: values.pathDirection,
      isRequired: values.isTargetPath,
      status: values.status,
      pageNo: 1,
      pageSize: pagination.pageSize,
    };

    getList(searchParams);
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);

      const siteIdList = params.siteIdList && params.siteIdList.length > 0 ? params.siteIdList : undefined;
      const pathPidList = params.pathPidList && params.pathPidList.length > 0 ? params.pathPidList : undefined;

      const requestBody = {
        ...omit(params, []),
        direction: typeof params.direction === 'number' ? params.direction : undefined,
        isRequired: typeof params.isRequired === 'number' ? params.isRequired : undefined,
        pathPidList: pathPidList,
        routeId: typeof params.routeId === 'number' ? params.routeId : undefined,
        siteId: params.siteId && params.siteId.length > 0 ? params.siteId : undefined,
        siteIdList: siteIdList,
        pageNo,
        pageSize,
      };

      if (!Object.values(requestBody).some(value => value !== undefined)) {
        throw new Error("Request body is empty. Please provide valid parameters.");
      }

      const ret = await buildMapService.queryRoute(requestBody);

      setList(ret.data ?? []);
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

  const columns: ColumnsType<ProduceTaskInList> = [
    {
      title: '需求路径编号',
      dataIndex: 'pathPid',
    },
    {
      title: '建图路径编号',
      dataIndex: 'routeId',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '场景编号',
      dataIndex: 'siteId',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '路径方向',
      dataIndex: 'direction',
      render: (x, record) => {
        return <span>{routeDirectionMap[x]}</span>;
      },
    },
    {
      title: '路径标签',
      dataIndex: 'tag',
    },
    {
      title: '生产状态',
      dataIndex: 'status',
      render: (x, record) => {
        return <>{TASK_STATUS_DESCRIPTIONS[x as keyof typeof TASK_STATUS_DESCRIPTIONS]}</>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'startTime',
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
  ];

  const showContent = (content: any) => {
    setContent(content);
    setIsModalOpen(true);
  };
  const handleTableChange = (pagination: TablePaginationConfig) => {
    getList({
      ...serach_params,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (
        ['startCreateTime', 'endCreateTime', 'pageNo', 'pageSize', 'projectId', 'businessType', 'batchMode'].includes(
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

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const params = { /* 这里可以添加需要的参数 */ };

      const pageSize = 2000;
      let ret: any = [];
      for (let i = 1; i <= 10; i++) {
        const pageNo = i;
        const result = await buildMapService.queryRoute({
          ...params,
          pageNo,
          pageSize,
        });
        ret = [...ret, ...(result.data ?? [])];
        if (!result.data?.length || result.data.length < pageSize) {
          break;
        }
      }

      let downloadList: any = ret;
      if (downloadList.length == 20000) {
        message.warning('只能下载前两万条');
      }

      if (downloadList.length > 0) {
        let dataList = downloadList.map(({
          pathPid,
          routeId,
          siteId,
          direction,
          tag,
          isRequired,
          status,
          startTime,
          updateTime
        }: any) => ({
          需求路径编号: pathPid,
          建图路径编号: routeId,
          场景编号: siteId,
          路径方向: direction,
          路径标签: tag,
          是否为目标路径: isRequired,
          生产状态: status,
          创建时间: startTime,
          更新时间: updateTime
        }));
        const data = jsonToCsv(dataList);
        downloadFile('路径列表.csv', data);
      } else {
        message.warning('没有可下载的内容');
      }
    } catch (error: any) {
      console.error('下载失败:', error);
      message.error('下载失败');
    } finally {
      setDownloading(false);
    }
  };

  function jsonToCsv(jsonData: any) {
    const csvRows = [];
    const headers = Object.keys(jsonData[0]);
    csvRows.push(headers.join(','));
    for (const row of jsonData) {
      const values = headers.map((header) => {
        if (typeof row[header] === 'object') {
          let rowValue = JSON.stringify(row[header]).replace(/,/g, '，');
          return `"${rowValue}"`;
        } else if (Array.isArray(row[header])) {
          let Value = row[header].map((value: any) => {
            return JSON.stringify(value).replace(/,/g, '，');
          });
          return `"${Value}"`;
        } else {
          return `${('' + row[header]).replace(/,/g, '，')}`;
        }
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }

  function downloadFile(fileName: any, data: any) {
    let aLink = document.createElement('a');
    let blob = new Blob([data]);
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
  }

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="场景编号" name="siteId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="路径方向" name="pathDirection">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={routeDirections}
              ></Select>
            </Form.Item>
            <Form.Item label="生产状态" name="status">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={siteStatus}
              ></Select>
            </Form.Item>
          </Form>
        </div>
        <div className="search-button">
          <Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button type="primary" onClick={handleDownload} loading={downloading}>
              下载
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="id"
        className="page-table"
        columns={columns as ColumnsType<RouteInfo>}
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
      <JsonViewDlg visible={isModalOpen} closeDialog={() => setIsModalOpen(false)} content={content}></JsonViewDlg>
    </div>
  );
};
