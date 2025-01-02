import {Button, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from '../project/create-modal';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {buildMapService} from '../../services/build-map-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import { components } from '../../models/openapi-build-map';
import { TASK_TYPE } from '../../models';
import JsonViewDlg from '../json-view';
import {CreateSceneList} from '../project/create-scene-list';
import { useLocation } from 'react-router-dom';

type SearchParams = components['schemas']['SiteOptLogQuery'];
type SiteOptLog = components['schemas']['SiteOptLog'];

// Assuming SiteInfo is the correct type for items in siteInfoList
type SiteInfo = {
  locationWkt?: string;
};

/**
 * 任务明细
 */
export const BuildMapTaskDetail = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<SiteOptLog[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const {changeHistory} = usePageFns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyData, setVerifyData] = useState<any>(null);
  const [verifyForm] = Form.useForm();

  const [sceneModalVisible, setSceneModalVisible] = useState(false);
  const [sceneModalTitle, setSceneModalTitle] = useState('');
  const [sceneCoordinates, setSceneCoordinates] = useState('');

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const demandId = query.get('demandId');

  const [processedRecords, setProcessedRecords] = useState<Set<number>>(new Set());

  const STORAGE_KEY = 'siteInfoOptRecords';

  const saveSiteInfoOptToStorage = (logId: number, data: any) => {
    const stored = localStorage.getItem(STORAGE_KEY) || '{}';
    const storedData = JSON.parse(stored);
    storedData[logId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    setProcessedRecords(prev => new Set(prev).add(logId));
  };

  useEffect(() => {
    if (demandId) {
      console.log('demandId', demandId);
      form.setFieldsValue({ batchId: demandId });
      handleSearch(); // 自动执行查询
      console.log('查询完毕');
    }
  }, [demandId]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    console.log('values.demandId', values.demandId);
    const searchValues = {
      ...values,
      status: values.status ? statusValueMap[values.status] : undefined,
    };
    
    changeHistory({
      ...omit(searchValues),
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
      const ret = await buildMapService.queryOptLog({
        ...omit(params, 'pageNo', 'pageSize'),
        pageNo,
        pageSize,
        demandType: 0,
      });

      setList(ret.data ?? []);
      setPagination({
        ...pagination,
        total: ret.totalCount,
        current: pageNo,
        pageSize,
      });
    } catch (error: any) {
      console.error('Error fetching task details:', error);
      message.error(error.message);

      setList([]);
      setPagination(pagination);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (record: SiteOptLog) => {
    try {
      const logId = record.id;
      if (!logId) {
        message.error('logId 不存在');
        return;
      }
      const response = await buildMapService.getSiteOptLogUsingGET(logId);
      setVerifyData({
        ...response.data,
        id: logId
      });

      setSceneCoordinates('');

      const siteInfoList = response.data?.siteInfoList ? response.data.siteInfoList as SiteInfo[] : [];
      const locationWkt = siteInfoList?.[0]?.locationWkt;
      if (locationWkt) {
        const match = locationWkt.match(/POINT \(([^)]+)\)/);
        if (match) {
          const coordinates = match[1].split(' ').map(Number);
          const formattedCoordinates = `POINT(${coordinates[0]} ${coordinates[1]})`;
          setSceneCoordinates(formattedCoordinates);
          console.log('设置新的坐标:', formattedCoordinates);
        } else {
          console.warn('坐标格式不匹配:', locationWkt);
        }
      } else {
        console.warn('未找到位置信息');
      }

      setSceneModalTitle('场景信息');
      setVerifyModalVisible(true);
      setSceneModalVisible(true);
    } catch (error) {
      console.error('Error fetching verification data:', error);
      message.error('获取核实信息失败');
    }
  };

  const handleVerifySubmit = async () => {
    try {
      const values = verifyForm.getFieldsValue();
      await buildMapService.checkOptLogUsingPOST({
        ...values,
        taskId: verifyData.taskId,
      });
      message.success('核实提交成功');
      setVerifyModalVisible(false);
    } catch (error) {
      console.error('Error submitting verification:', error);
      message.error('核实提交失败');
    }
  };

  const handleSceneModalOpen = () => {
    console.log('Opening scene modal');
    setSceneModalTitle('场景信息');
    setSceneModalVisible(true);
  };

  const statusOptions = [
    { label: '未核实', value: '未核实' },
    { label: '已核实', value: '已核实' },
  ];

  const statusValueMap: Record<string, number> = {
    '未核实': 0,
    '已核实': 4,
  };

  const columns: ColumnsType<SiteOptLog> = [
    {
      title: '记录编号',
      dataIndex: 'id',
    },
    {
      title: '任务编号',
      dataIndex: 'demandId',
    },
    {
      title: '场站ID',
      dataIndex: 'siteId',
    },
    {
      title: '问题类型',
      dataIndex: 'optType',
    },
    {
      title: '问题描述',
      dataIndex: 'params',
      render: (params) => {
        try {
          const parsedParams = typeof params === 'string' ? JSON.parse(params) : params;
          return parsedParams?.optDesc || '无描述';
        } catch (error) {
          console.error('解析 params 失败:', error);
          return '解析失败';
        }
      },
    },
    {
      title: '核实状态',
      dataIndex: 'status',
      render: (status) => {
        return status === 0 ? '未核实' : status === 4 ? '已核实' : '未知状态';
      },
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
    {
      title: '操作',
      dataIndex: 'detail',
      width: '400px',
      render: (text, record) => (
        <Button type="link" key={record.id} onClick={() => handleVerify(record)}>
          核实
        </Button>
      ),
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
    let params = {} as Record<string, any>;  // 临时使用 any 类型收集参数

    query.forEach((value, key) => {
      if (key === 'status') {
        params[key] = Number(value);
      } else if (['pageNo', 'pageSize', 'projectId', 'businessType', 'batchMode'].includes(key)) {
        params[key] = value ? Number(value) : undefined;
      } else if (['cityNameList'].includes(key)) {
        params[key] = (value ? decodeURI(value) : undefined)?.split(',');
      } else {
        params[key] = value;
      }
    });

    // 最后转换为正确的类型
    const typedParams = removeEmptyValue(params) as SearchParams;
    
    form.setFieldsValue({
      ...omit(typedParams, ['startTime', 'endTime', 'cityNameList']),
      status: typedParams.status === 0 ? '未核实' : typedParams.status === 4 ? '已核实' : undefined,
    });

    setSerachParams(typedParams);
    getList(typedParams);
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="任务编号" name="demandId">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="记录编号" name="id">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
            <Form.Item label="核实状态" name="status">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={statusOptions}
              />
            </Form.Item>
            <Form.Item label="操作员" name="operator">
              <Input placeholder="请输入" allowClear />
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
        rowKey="taskId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
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
      <CreateSceneList
        visible={sceneModalVisible}
        onSuccess={() => {
          setSceneModalVisible(false);
        }}
        onCancel={() => {
          setSceneModalVisible(false);
        }}
        title={sceneModalTitle}
        initialCoordinates={sceneCoordinates}
        showChangeInfoModal={verifyModalVisible}
        changeInfoData={verifyData}
        onChangeInfoSubmit={handleVerifySubmit}
        fromTaskDetail={true}
        fromVerify={true}
        saveSiteInfoOptToStorage={saveSiteInfoOptToStorage}
      />
    </div>
  );
};

