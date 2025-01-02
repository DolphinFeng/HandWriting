import {Button, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
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
  PRODUCE_TASK_STATUS_DESCRIPTIONS,
  ProduceTaskInList,
  ProduceTaskQuery,
  TASK_TYPE,
} from '../../models';
import JsonViewDlg from '../json-view';
import { components } from '../../models/openapi-build-map';
import { capitalizeOptions } from '../../libs/client/util';

type SearchParams = components['schemas']['DemandDetailQuery']; 
type DemandDetailVo = components['schemas']['DemandDetailVo'];

/**
 * 需求明细
 */
export const BuildMapDemandDetail = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<DemandDetailVo[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const [business, setBusiness] = useState(1);
  const [demandTypes, setDemandTypes] = useState<{ label: string; value: number; }[]>([]);
  const [demandStatus, setDemandStatus] = useState<{ label: string; value: number; }[]>([]);
  const [businessType, setBusinessType] = useState<{ label: string; value: number; }[]>([]); // 新增业务类型状态
  const [selectedBusinessType, setSelectedBusinessType] = useState<number>(); // 新增选中的业务类型状态

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const bizTypeRes = await buildMapService.getBizType(); // 获取业务类型
        const businessTypes = bizTypeRes.data ? Object.entries(bizTypeRes.data).map(([label, value]) => ({ 
          label, 
          value: Number(value) 
        })) : [];
        setBusinessType(capitalizeOptions(businessTypes));
      } catch (error) {
        console.error('Failed to fetch business types:', error);
      }
    };

    fetchBusinessTypes();
  }, []);

  useEffect(() => {
    const fetchDemandTypes = async () => {
      try {
        if (selectedBusinessType !== undefined) {
          const demandTypeRes = await buildMapService.getDemandType(selectedBusinessType); // 使用选中的业务类型
          const createOptions = (data: any) => 
            data ? Object.entries(data).map(([label, value]) => ({ 
              label, 
              value: Number(value) 
            })) : [];
          setDemandTypes(capitalizeOptions(createOptions(demandTypeRes.data)));
        }
      } catch (error) {
        console.error('Failed to fetch demand types:', error);
      }
    };

    fetchDemandTypes();
  }, [selectedBusinessType]);

  useEffect(() => {
    const fetchDemandStatus = async () => {
      try {
        const statusRes = await buildMapService.getDemandDetailStatusUsingGET();
        const statusOptions = statusRes.data ? Object.entries(statusRes.data).map(([label, value]) => ({
          label,
          value: Number(value)
        })) : [];
        setDemandStatus(capitalizeOptions(statusOptions));
      } catch (error) {
        console.error('Failed to fetch demand status:', error);
      }
    };

    fetchDemandStatus();
  }, []);

  const handleBusinessTypeChange = (value: number) => {
    setSelectedBusinessType(value);
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const searchParams = {
      ...omit(values, []),
      pageNo: 1,
      pageSize: pagination.pageSize,
    };
    
    console.log('Search Params:', searchParams);
    changeHistory(removeEmptyValue(searchParams));
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await buildMapService.queryDetail({
        ...omit(params, 'pageNo', 'pageSize'),
        pageNo,
        pageSize,
      });

      setList(ret.data ?? []);
      setPagination({
        ...pagination,
        total: ret.totalCount,
        current: pageNo,
        pageSize,
      });
    } catch (error: any) {
      console.error('Error fetching detail:', error);
      message.error(error.message);

      setList([]);
      setPagination(pagination);
    } finally {
      setLoading(false);
    }
  };

  const businessTypeMap: Record<number, string> = {
    1: 'PNPSP',
    4: 'PNV',
    0: 'MAP',
    3: 'FDM',
    2: 'P2P',
  };

  const statusMap: Record<number, string> = {
    0: 'READY',
    1: 'WORKING',
    2: 'DELETED',
    3: 'FAILURE',
  };

  const columns: ColumnsType<DemandDetailVo> = [
    {
      title: '需求编号',
      dataIndex: 'demandId',
    },
    {
      title: '业务类型',
      dataIndex: 'bizType',
      render: (x) => <span>{businessTypeMap[x]}</span>,
    },
    {
      title: '场景编号',
      dataIndex: 'siteId',
    },
    {
      title: '目标路径',
      dataIndex: 'targetRoutes',
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      render: (x) => <span>{statusMap[x]}</span>,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (x) => <span>{humanizeTime(x)}</span>,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      render: (x) => <span>{humanizeTime(x)}</span>,
    },
  ];

  const showContent = (content: any) => {
    setContent(content);
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
      if (
        ['bizType', 'pageNo', 'pageSize', 'projectId', 'businessType', 'batchMode', 'demandId'].includes(
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

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime', 'cityNameList']),
    });

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
        const result = await buildMapService.queryDetail({
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
          demandId,
          bizType,
          siteId,
          targetRoutes,
          status,
          operator,
          createTime,
          updateTime
        }: any) => ({
          需求编号: demandId,
          业务类型: bizType,
          场景编号: siteId,
          目标路径: targetRoutes,
          执行状态: status,
          操作员: operator,
          创建时间: createTime,
          更新时间: updateTime
        }));
        const data = jsonToCsv(dataList);
        downloadFile('需求明细.csv', data);
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
            <Form.Item label="需求编号" name="demandId">
              <Input placeholder="请输入" allowClear style={{width: '200px'}}></Input>
            </Form.Item>
            <Form.Item label="业务类型" name="bizType">
              <Select 
                placeholder="请选择" 
                style={{ width: '200px' }} 
                options={businessType} 
                onChange={handleBusinessTypeChange} 
              />
            </Form.Item>
            <Form.Item label="需求类型" name="demandTypeDesc">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={demandTypes}
              ></Select>
            </Form.Item>
            <Form.Item label="场景编号" name="siteId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="执行状态" name="status">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={demandStatus}
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
        rowKey={(record) => record.demandId || `key-${Math.random()}`}
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
      <JsonViewDlg visible={isModalOpen} closeDialog={() => setIsModalOpen(false)} content={content}></JsonViewDlg>
    </div>
  );
};
